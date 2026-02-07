import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const OCCASION_KUDOS = 5;
  
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // 1-12
    const todayDay = today.getDate();
    const currentYear = today.getFullYear();
    const todayStr = `${currentYear}-${String(todayMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;
    
    console.log(`[check-occasions] Checking occasions for ${todayMonth}/${todayDay}/${currentYear}`);
    console.log(`[check-occasions] Today's date string: ${todayStr}`);
    
    // Get all profiles with birthday or work_anniversary
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, department, birthday, work_anniversary, kudos_balance");
    
    if (profilesError) {
      console.error("[check-occasions] Error fetching profiles:", profilesError);
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }
    
    // Log all profile dates for debugging
    console.log("[check-occasions] Profile dates:");
    for (const p of profiles || []) {
      if (p.birthday || p.work_anniversary) {
        console.log(`  - ${p.username}: birthday=${p.birthday}, work_anniversary=${p.work_anniversary}`);
      }
    }
    
    // Check for existing occasion posts THIS YEAR to avoid duplicates (not just today)
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;
    
    const { data: existingBirthdayPosts } = await supabase
      .from("nominations")
      .select("id, receiver_id, message, created_at")
      .gte("created_at", `${yearStart}T00:00:00`)
      .lte("created_at", `${yearEnd}T23:59:59`)
      .ilike("message", "%Happy Birthday%");
    
    const { data: existingAnniversaryPosts } = await supabase
      .from("nominations")
      .select("id, receiver_id, message, created_at")
      .gte("created_at", `${yearStart}T00:00:00`)
      .lte("created_at", `${yearEnd}T23:59:59`)
      .ilike("message", "%Work Anniversary%");
    
    const birthdayReceiverIds = new Set((existingBirthdayPosts || []).map(p => p.receiver_id));
    const anniversaryReceiverIds = new Set((existingAnniversaryPosts || []).map(p => p.receiver_id));
    
    const results: { birthdays: string[]; anniversaries: string[]; errors: string[] } = {
      birthdays: [],
      anniversaries: [],
      errors: [],
    };
    
    // Get a "system" badge or use null
    const { data: badges } = await supabase.from("badges").select("id, name").limit(1);
    const defaultBadgeId = badges?.[0]?.id || null;
    
    for (const profile of profiles || []) {
      // Check birthday (match month and day)
      if (profile.birthday) {
        // Parse date string directly to avoid timezone issues
        const [year, month, day] = profile.birthday.split('-').map(Number);
        if (month === todayMonth && day === todayDay) {
          // Skip if already got birthday kudos THIS YEAR
          if (birthdayReceiverIds.has(profile.id)) {
            console.log(`[check-occasions] Already awarded birthday kudos to ${profile.username} this year`);
            continue;
          }
          
          // Award birthday kudos
          const newBalance = (profile.kudos_balance || 0) + OCCASION_KUDOS;
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ kudos_balance: newBalance })
            .eq("id", profile.id);
          
          if (updateError) {
            results.errors.push(`Failed to award birthday kudos to ${profile.username}`);
          } else {
            // Create auto-approved nomination/post for the feed
            const { error: nominationError } = await supabase
              .from("nominations")
              .insert({
                sender_id: user.id, // System/admin as sender
                receiver_id: profile.id,
                message: `🎂 Happy Birthday, ${profile.username}! Wishing you a wonderful day filled with joy and celebration!`,
                badge_id: defaultBadgeId,
                status: "approved", // Auto-approve
                kudos_awarded: OCCASION_KUDOS,
              });
            
            if (nominationError) {
              console.error(`[check-occasions] Failed to create birthday post for ${profile.username}:`, nominationError);
              results.errors.push(`Failed to create birthday post: ${nominationError.message}`);
            }
            
            results.birthdays.push(profile.username);
            console.log(`[check-occasions] 🎂 Birthday kudos awarded to ${profile.username}`);
          }
        }
      }
      
      // Check work anniversary (match month and day)
      if (profile.work_anniversary) {
        // Parse date string directly to avoid timezone issues
        const [annYear, annMonth, annDay] = profile.work_anniversary.split('-').map(Number);
        if (annMonth === todayMonth && annDay === todayDay) {
          // Calculate years of service
          const yearsOfService = currentYear - annYear;
          
          if (yearsOfService > 0) {
            // Skip if already got anniversary kudos THIS YEAR
            if (anniversaryReceiverIds.has(profile.id)) {
              console.log(`[check-occasions] Already awarded anniversary kudos to ${profile.username} this year`);
              continue;
            }
            
            // Award anniversary kudos
            const newBalance = (profile.kudos_balance || 0) + OCCASION_KUDOS;
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ kudos_balance: newBalance })
              .eq("id", profile.id);
            
            if (updateError) {
              results.errors.push(`Failed to award anniversary kudos to ${profile.username}`);
            } else {
              // Create auto-approved nomination/post for the feed
              const yearText = yearsOfService === 1 ? "year" : "years";
              const { error: nominationError } = await supabase
                .from("nominations")
                .insert({
                  sender_id: user.id, // System/admin as sender
                  receiver_id: profile.id,
                  message: `🎉 Happy Work Anniversary, ${profile.username}! Congratulations on ${yearsOfService} ${yearText} with the company! Thank you for your dedication and hard work!`,
                  badge_id: defaultBadgeId,
                  status: "approved", // Auto-approve
                  kudos_awarded: OCCASION_KUDOS,
                });
              
              if (nominationError) {
                console.error(`[check-occasions] Failed to create anniversary post for ${profile.username}:`, nominationError);
                results.errors.push(`Failed to create anniversary post: ${nominationError.message}`);
              }
              
              results.anniversaries.push(`${profile.username} (${yearsOfService} years)`);
              console.log(`[check-occasions] 🎉 Anniversary kudos awarded to ${profile.username} (${yearsOfService} years)`);
            }
          }
        }
      }
    }
    
    console.log(`[check-occasions] Complete. Birthdays: ${results.birthdays.length}, Anniversaries: ${results.anniversaries.length}`);
    
    return NextResponse.json({
      success: true,
      message: `Checked ${profiles?.length || 0} profiles`,
      results,
    });
    
  } catch (error: any) {
    console.error("[check-occasions] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
