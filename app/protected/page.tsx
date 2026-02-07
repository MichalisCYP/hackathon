import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Feed } from "@/components/dashboard";
import { Suspense } from "react";

async function checkAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return data.claims;
}

async function AuthenticatedFeed() {
  await checkAuth();
  return <Feed />;
}

export default function ProtectedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }
    >
      <AuthenticatedFeed />
    </Suspense>
  );
}
