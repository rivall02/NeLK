import { ReactNode } from "react";
import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-nelk-surface-light dark:bg-nelk-surface-dark flex flex-col md:flex-row">
      {/* Left Panel: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-nelk-primary text-white flex items-center justify-center">
              <Sparkle weight="fill" className="text-xl" />
            </div>
            <span className="font-bold text-xl tracking-tight">NeLK.</span>
          </Link>
          
          {children}
        </div>
      </div>

      {/* Right Panel: Branding (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 bg-nelk-bg-light dark:bg-nelk-bg-dark border-l border-black/5 dark:border-white/5 relative p-12 lg:p-20 flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-nelk-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Master your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nelk-primary to-[#8B5CF6]">student life.</span>
          </h2>
          <p className="text-lg text-nelk-text-light/70 dark:text-nelk-text-dark/70 max-w-md">
            Join thousands of university students who use NeLK to manage tasks, schedules, and notes all in one place.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-black/5 dark:border-white/10 max-w-sm shadow-xl">
            <div className="flex gap-4 items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-nelk-primary flex items-center justify-center text-white font-bold shrink-0">
                A
              </div>
              <div>
                <p className="text-sm font-medium leading-relaxed italic">
                  "NeLK completely changed how I organize my semesters. The AI suggestions for my schedule are incredible."
                </p>
                <p className="text-xs text-nelk-text-light/50 dark:text-nelk-text-dark/50 mt-2 font-medium uppercase tracking-wider">
                  Alex, CS Major
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
