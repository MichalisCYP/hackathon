import Link from "next/link";
import { Sparkles, Users, Trophy, Rocket, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-50/30 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Unifying Services" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-purple-700">
              Unifying Services
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-600 hover:text-purple-700 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-8">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-700 font-medium">
              Employee Recognition Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">
              Celebrate Your Team,
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 bg-clip-text text-transparent">
              Build Your Culture
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Recognize achievements, celebrate milestones, and build a culture of
            appreciation. When someone earns recognition, the whole team
            celebrates together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700 font-medium transition-all duration-300 shadow-sm"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 max-w-6xl mx-auto px-6 pb-32"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Peer Recognition
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Empower everyone to celebrate their colleagues. Nominate teammates
              for living company values and going above and beyond.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Achievement System
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Earn badges for milestones, contributions, and embodying company
              values. Track your progress and level up.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Rocket className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Team Celebrations
            </h3>
            <p className="text-gray-600 leading-relaxed">
              When someone earns recognition, announce it to Discord or
              WhatsApp. Make every win visible and meaningful.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 py-8 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Unifying Services" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-purple-700">
              Unifying Services
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Building culture, one recognition at a time.
          </p>
        </div>
      </footer>
    </main>
  );
}
