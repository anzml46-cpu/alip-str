"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { ShoppingCart, Minus, Plus, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/database";
import { formatRupiah, getEffectivePrice } from "@/lib/utils";
import { useCartContext } from "@/components/user/CartProvider";
import CheckoutModal from "@/components/user/CheckoutModal";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const { addItem } = useCartContext();

  useEffect(() => {
    supabase
      .from("products")
      .select("*, categories(id, name, image_url, created_at)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 grid sm:grid-cols-2 gap-8">
        <div className="aspect-square bg-surface animate-pulse rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-surface animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!product || !product.is_active) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-2xl mb-4">😕</p>
        <p className="text-muted mb-4">Produk tidak ditemukan</p>
        <Link href="/products" className="text-accent hover:text-accent-dark text-sm">
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  const effectivePrice = getEffectivePrice(product);
  const hasDiscount = product.discount_price !== null && product.discount_price < product.price;
  const outOfStock = product.stock === 0;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-white transition-colors duration-150 mb-6"
        >
          <ArrowLeft size={14} /> Kembali ke katalog
        </Link>

        <div className="grid sm:grid-cols-2 gap-8">
          {/* Gambar */}
          <div className="relative aspect-square bg-surface rounded-2xl overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl opacity-20">🎮</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {product.categories && (
              <span className="text-xs text-muted">
                {product.categories.name}
              </span>
            )}

            <h1 className="font-display font-700 text-xl leading-snug">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="font-display font-700 text-2xl text-accent">
                {formatRupiah(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-muted line-through text-sm">
                  {formatRupiah(product.price)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-muted leading-relaxed">
                {product.description}
              </p>
            )}

            <p className="text-sm">
              {outOfStock ? (
                <span className="text-red-400">Stok habis</span>
              ) : (
                <span className="text-muted">
                  Stok tersedia:{" "}
                  <span className="text-white font-600">{product.stock}</span>
                </span>
              )}
            </p>

            {/* Quantity picker */}
            {!outOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">Jumlah:</span>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-surface-2 transition-colors duration-150"
                    aria-label="Kurangi"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-sm font-600 min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 hover:bg-surface-2 transition-colors duration-150"
                    aria-label="Tambah"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Tombol aksi */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => setShowCheckout(true)}
                disabled={outOfStock}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-base font-display font-700 text-sm hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <MessageCircle size={18} />
                BUY SEKARANG
              </button>
              <button
                onClick={() => !outOfStock && addItem(product, quantity)}
                disabled={outOfStock}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:border-muted text-sm text-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <ShoppingCart size={16} />
                Tambah ke keranjang
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          items={[{ product, quantity }]}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
