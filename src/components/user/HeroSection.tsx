import Link from "next/link";
import { Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-base border-b border-border">
      {/* Grid texture — purpose: memberi kedalaman visual tanpa foto */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)",
        }}
        aria-hidden="true"
      />

      {/* Accent glow — purpose: focal point visual di kiri */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "#00C853" }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
        <div className="max-w-xl">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Zap size={12} className="text-accent" />
            <span className="text-xs font-600 text-accent">Proses cepat · Harga terbaik</span>
          </div>

          <h1 className="font-display font-700 text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-5">
            Akun game impianmu,
            <br />
            <span className="text-accent">satu klik ke WhatsApp.</span>
          </h1>

          <p className="text-muted text-base leading-relaxed mb-8 max-w-md">
            Pilih produk, isi form singkat, dan pesananmu langsung terkirim ke admin. Tanpa ribet, tanpa registrasi.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="px-6 py-3 rounded-xl bg-accent text-base font-display font-700 text-sm hover:bg-accent-dark transition-colors duration-150"
            >
              Belanja sekarang
            </Link>
            <a
              href="https://wa.me/6285840840520"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-border hover:border-muted text-sm text-muted hover:text-white transition-colors duration-150"
            >
              Tanya dulu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
