"use client";

import Link from "next/link";
import { ArrowRight, GoogleLogo } from "@phosphor-icons/react";
import { useActionState } from "react";
import { authenticate } from "@/lib/actions";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
        <p className="text-nelk-text-light/60 dark:text-nelk-text-dark/60">
          Enter your details to access your account.
        </p>
      </div>

      <form className="space-y-5" action={formAction}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
          <input 
            type="email" 
            id="email"
            name="email"
            placeholder="student@university.edu"
            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-nelk-primary focus:ring-1 focus:ring-nelk-primary outline-none transition-all placeholder:text-black/30 dark:placeholder:text-white/30"
            required
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <Link href="#" className="text-sm font-medium text-nelk-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <input 
            type="password" 
            id="password"
            name="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-nelk-primary focus:ring-1 focus:ring-nelk-primary outline-none transition-all placeholder:text-black/30 dark:placeholder:text-white/30"
            required
          />
        </div>

        {errorMessage && (
          <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
        )}

        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 px-4 bg-nelk-primary hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isPending ? "Signing In..." : "Sign In"}
          {!isPending && <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        <span className="text-sm text-nelk-text-light/50 dark:text-nelk-text-dark/50 font-medium">OR</span>
        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>

      <button className="mt-8 w-full py-3.5 px-4 bg-transparent border border-black/10 dark:border-white/10 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
        <GoogleLogo weight="bold" className="text-xl" />
        Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-nelk-text-light/60 dark:text-nelk-text-dark/60">
        Don't have an account?{" "}
        <Link href="/register" className="font-semibold text-nelk-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
