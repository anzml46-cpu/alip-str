"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Gamepad2 } from "lucide-react";
import { useCartContext } from "./CartProvider";

const NAV = [
  { label: "Beranda", href: "/" },
  { label: "Semua Produk", href: "/products" },
  { label: "Tentang Kami", href: "/#tentang" },
  { label: "Kontak", href: "/#kontak" },
];

export default function Header() {
  const { totalItems } = useCartContext();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-base/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="p-1.5 rounded-lg bg-accent text-base group-hover:bg-accent-dark transition-colors duration-200">
            <Gamepad2 size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display font-700 text-lg tracking-tight">
            ALIP <span className="text-accent">STORE</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted hover:text-white transition-colors duration-150"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Cart + Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative p-2 rounded-lg hover:bg-surface transition-colors duration-150"
            aria-label={`Keranjang — ${totalItems} produk`}
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-base text-xs font-600 px-1">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors duration-150"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-surface">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-3 text-sm text-muted hover:text-white hover:bg-surface-2 transition-colors duration-150"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
