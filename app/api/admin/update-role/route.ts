import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, newRole } = await request.json();
    
    console.log("[update-role] Request received:", { userId, newRole });
    
    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "Missing userId or newRole" },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // First verify the current user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log("[update-role] Auth user:", user?.id, user?.email);
    
    if (authError || !user) {
      console.log("[update-role] Auth error:", authError);
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Get current user's profile to check if they're admin
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("job_title")
      .eq("id", user.id);
    
    console.log("[update-role] Profile check:", profileData, profileError);
    
    if (profileError || !profileData || profileData.length === 0) {
      return NextResponse.json(
        { error: "Could not verify admin status" },
        { status: 403 }
      );
    }
    
    const currentProfile = profileData[0];
    
    if (currentProfile.job_title?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update user roles" },
        { status: 403 }
      );
    }
    
    console.log("[update-role] Admin verified, performing update...");
    
    // Now perform the update - use RPC or direct update
    const { data, error, count } = await supabase
      .from("profiles")
      .update({ job_title: newRole })
      .eq("id", userId)
      .select();
    
    console.log("[update-role] Update result:", { data, error, count });
    
    if (error) {
      console.error("[update-role] Update error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update role" },
        { status: 500 }
      );
    }
    
    // If RLS is blocking, data will be empty but no error
    // In this case, we need to inform the user about the RLS policy
    if (!data || data.length === 0) {
      console.error("[update-role] Update blocked by RLS - no rows returned");
      return NextResponse.json(
        { 
          error: "Update blocked by database security policy. Please add an RLS policy allowing admins to update profiles.",
          details: "Go to Supabase Dashboard > Table Editor > profiles > RLS Policies > Add policy for UPDATE"
        },
        { status: 403 }
      );
    }
    
    console.log(`[update-role] ✅ Admin ${user.id} updated user ${userId} role to ${newRole}`);
    
    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: `User role updated to ${newRole}` 
    });
    
  } catch (error: any) {
    console.error("[update-role] API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
