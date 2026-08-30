"use client";

import Link from "next/link";
import { ArrowRight, GoogleLogo } from "@phosphor-icons/react";
import { useActionState, useState } from "react";
import { authenticate } from "@/lib/actions";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/app" });
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk dengan akun Google.");
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info("Fitur reset password mandiri via email sedang dalam konfigurasi SMTP. Silakan hubungi admin kampus jika Anda lupa password.");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--color-text)]">Selamat Datang</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Masuk ke akun NeLK Anda untuk mengakses catatan, tugas, dan kalender.
        </p>
      </div>

      <form className="space-y-5" action={formAction}>
        <div>
          <label htmlFor="email" className="block text-xs font-semibold mb-2 text-[var(--color-text)]">
            Alamat Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="mahasiswa@universitas.ac.id"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-sm transition-all placeholder:text-[var(--color-text-muted)] text-[var(--color-text)]"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-xs font-semibold text-[var(--color-text)]">
              Password
            </label>
            <button
              onClick={handleForgotPassword}
              className="text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              Lupa password?
            </button>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-sm transition-all placeholder:text-[var(--color-text-muted)] text-[var(--color-text)]"
            required
          />
        </div>

        {errorMessage && (
          <p className="text-xs text-red-500 font-medium p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 shadow-sm"
        >
          {isPending ? "Memproses..." : "Masuk ke Akun"}
          {!isPending && <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)] font-medium">ATAU</span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="mt-6 w-full py-3 px-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl font-semibold text-xs text-[var(--color-text)] flex items-center justify-center gap-3 hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50 shadow-sm"
      >
        <GoogleLogo weight="bold" className="text-lg text-[var(--color-primary)]" />
        {isGoogleLoading ? "Menghubungkan ke Google..." : "Lanjutkan dengan Google"}
      </button>

      <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
        Belum memiliki akun?{" "}
        <Link href="/register" className="font-semibold text-[var(--color-primary)] hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
