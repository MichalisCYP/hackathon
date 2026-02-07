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
          <div className="flex flex-col items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Loading" 
              className="w-20 h-20 object-contain animate-pulse"
            />
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthenticatedFeed />
    </Suspense>
  );
}
