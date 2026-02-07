import { LoginForm } from "@/components/login-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
