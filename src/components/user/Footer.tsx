import Link from "next/link";
import { Gamepad2, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 rounded-lg bg-accent text-base">
                <Gamepad2 size={16} strokeWidth={2.5} />
              </span>
              <span className="font-display font-700 text-base tracking-tight">
                ALIP <span className="text-accent">STORE</span>
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-[260px]">
              Toko akun game terpercaya. Harga terbaik, proses cepat, pelayanan ramah.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-600 mb-3">Navigasi</p>
            <ul className="space-y-2">
              {[
                { label: "Beranda", href: "/" },
                { label: "Semua Produk", href: "/products" },
                { label: "Tentang Kami", href: "/#tentang" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted hover:text-white transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div id="kontak">
            <p className="text-sm font-600 mb-3">Kontak</p>
            <a
              href="https://wa.me/6285840840520"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors duration-150"
            >
              <MessageCircle size={16} className="text-accent" />
              085840840520
            </a>
            <p className="text-xs text-muted mt-4">
              Senin–Minggu, 08.00–22.00 WIB
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} ALIP STORE. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
