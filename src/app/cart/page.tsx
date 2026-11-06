"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartContext } from "@/components/user/CartProvider";
import { formatRupiah, getEffectivePrice } from "@/lib/utils";
import CheckoutModal from "@/components/user/CheckoutModal";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, hydrated } =
    useCartContext();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!hydrated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-surface animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingCart size={40} className="mx-auto text-muted mb-4" />
        <p className="font-display font-600 text-lg mb-2">Keranjangmu kosong</p>
        <p className="text-sm text-muted mb-6">
          Belum ada produk yang ditambahkan.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 rounded-xl bg-accent text-base text-sm font-600 hover:bg-accent-dark transition-colors duration-150"
        >
          Lihat produk
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-700 text-xl">
            Keranjang ({items.length})
          </h1>
          <button
            onClick={clearCart}
            className="text-xs text-muted hover:text-red-400 transition-colors duration-150"
          >
            Kosongkan
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {items.map((item) => {
            const price = getEffectivePrice(item.product);
            return (
              <div
                key={item.product.id}
                className="flex gap-3 bg-surface rounded-xl p-3 border border-border"
              >
                {/* Gambar */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-2 shrink-0">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xl opacity-20">
                      🎮
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-accent mt-0.5">
                    {formatRupiah(price)}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Subtotal: {formatRupiah(price * item.quantity)}
                  </p>
                </div>

                {/* Qty + hapus */}
                <div className="flex flex-col items-end justify-between shrink-0">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-muted hover:text-red-400 transition-colors duration-150"
                    aria-label={`Hapus ${item.product.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="p-1.5 hover:bg-surface-2 transition-colors duration-150"
                      aria-label="Kurangi"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-2 text-xs font-600 min-w-[1.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          Math.min(item.product.stock, item.quantity + 1)
                        )
                      }
                      className="p-1.5 hover:bg-surface-2 transition-colors duration-150"
                      aria-label="Tambah"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total + checkout */}
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex justify-between font-display font-700 text-lg mb-4">
            <span>Total</span>
            <span className="text-accent">{formatRupiah(totalPrice)}</span>
          </div>
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full py-3 rounded-xl bg-accent text-base font-display font-700 text-sm hover:bg-accent-dark transition-colors duration-150"
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          items={items}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => { setShowCheckout(false); clearCart(); }}
        />
      )}
    </>
  );
}
