"use client";

import Link from "next/link";
import { ArrowRight, GoogleLogo } from "@phosphor-icons/react";
import { useActionState, useState } from "react";
import { registerUser } from "@/lib/actions";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    async (prevState: string | undefined, formData: FormData) => {
      const result = await registerUser(formData);
      if (result !== "Success") {
        return result;
      }
      return undefined;
    },
    undefined
  );
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/app" });
    } catch (err: any) {
      toast.error(err.message || "Gagal mendaftar dengan akun Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--color-text)]">Buat Akun Baru</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Mulai atur kehidupan akademik dan semester perkuliahanmu sekarang.
        </p>
      </div>

      <form className="space-y-5" action={formAction}>
        <div>
          <label htmlFor="name" className="block text-xs font-semibold mb-2 text-[var(--color-text)]">
            Nama Lengkap
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Ahmad Fauzi"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-sm transition-all placeholder:text-[var(--color-text-muted)] text-[var(--color-text)]"
            required
          />
        </div>

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
          <label htmlFor="password" className="block text-xs font-semibold mb-2 text-[var(--color-text)]">
            Password (Minimal 8 Karakter)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Minimal 8 karakter kuat"
            minLength={8}
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
          {isPending ? "Mendaftarkan Akun..." : "Daftar Akun"}
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
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading}
        className="mt-6 w-full py-3 px-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl font-semibold text-xs text-[var(--color-text)] flex items-center justify-center gap-3 hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50 shadow-sm"
      >
        <GoogleLogo weight="bold" className="text-lg text-[var(--color-primary)]" />
        {isGoogleLoading ? "Menghubungkan ke Google..." : "Daftar dengan Akun Google"}
      </button>

      <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
        Sudah memiliki akun?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
