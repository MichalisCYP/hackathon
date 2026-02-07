import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const SENDER_KUDOS = 1;
  const RECEIVER_KUDOS = 2;
  
  try {
    const supabase = await createClient();
    
    // Verify current user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Check admin status
    const { data: profileData } = await supabase
      .from("profiles")
      .select("job_title")
      .eq("id", user.id);
    
    if (!profileData || profileData.length === 0 || profileData[0].job_title?.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Only admins can sync kudos" }, { status: 403 });
    }
    
    console.log("[sync-kudos] Starting kudos recalculation...");
    
    // Get all approved nominations
    const { data: approvedNoms, error: nomsError } = await supabase
      .from("nominations")
      .select("sender_id, receiver_id")
      .eq("status", "approved");
    
    if (nomsError) {
      console.error("[sync-kudos] Error fetching nominations:", nomsError);
      return NextResponse.json({ error: "Failed to fetch nominations" }, { status: 500 });
    }
    
    console.log(`[sync-kudos] Found ${approvedNoms?.length || 0} approved nominations`);
    
    // Get all profiles
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, kudos_balance");
    
    if (profilesError) {
      console.error("[sync-kudos] Error fetching profiles:", profilesError);
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }
    
    console.log(`[sync-kudos] Found ${allProfiles?.length || 0} profiles`);
    
    // Calculate kudos for each user
    const kudosMap = new Map<string, number>();
    
    // Initialize all users with 0
    for (const profile of allProfiles || []) {
      kudosMap.set(profile.id, 0);
    }
    
    // Add kudos for each approved nomination
    for (const nom of approvedNoms || []) {
      // Sender gets +1
      const senderCurrent = kudosMap.get(nom.sender_id) || 0;
      kudosMap.set(nom.sender_id, senderCurrent + SENDER_KUDOS);
      
      // Receiver gets +2
      const receiverCurrent = kudosMap.get(nom.receiver_id) || 0;
      kudosMap.set(nom.receiver_id, receiverCurrent + RECEIVER_KUDOS);
    }
    
    console.log("[sync-kudos] Kudos calculation:", Object.fromEntries(kudosMap));
    
    // Update all profiles
    const results: { success: string[]; failed: string[] } = { success: [], failed: [] };
    
    for (const [userId, kudos] of kudosMap.entries()) {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ kudos_balance: kudos })
        .eq("id", userId)
        .select();
      
      const profile = allProfiles?.find(p => p.id === userId);
      
      if (updateError || !data || data.length === 0) {
        console.error(`[sync-kudos] Failed to update ${profile?.username || userId}:`, updateError);
        results.failed.push(profile?.username || userId);
      } else {
        console.log(`[sync-kudos] Updated ${profile?.username}: ${profile?.kudos_balance} -> ${kudos}`);
        results.success.push(profile?.username || userId);
      }
    }
    
    console.log(`[sync-kudos] ✅ Complete. Success: ${results.success.length}, Failed: ${results.failed.length}`);
    
    return NextResponse.json({
      success: true,
      message: `Kudos synced for ${results.success.length} users`,
      results
    });
    
  } catch (error: any) {
    console.error("[sync-kudos] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
