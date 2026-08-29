import Link from "next/link";

const footerLinks = {
  Produk: [
    { label: "Fitur", href: "#features" },
    { label: "AI", href: "#ai" },
    { label: "Roadmap", href: "#" },
  ],
  Sumber: [
    { label: "Dokumentasi", href: "#" },
    { label: "Panduan", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Legal: [
    { label: "Privasi", href: "#" },
    { label: "Ketentuan", href: "#" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-bold text-xs">
                N
              </div>
              <span className="text-base font-bold tracking-tight text-[var(--color-text)]">
                NeLK
              </span>
            </Link>
            <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-[var(--color-text-muted)]">
              Learn. Plan. Grow.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {category}
              </p>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6">
          <p className="text-xs text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} NeLK (NextLink). Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
