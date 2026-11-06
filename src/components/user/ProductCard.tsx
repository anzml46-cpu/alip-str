"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/database";
import { formatRupiah, getEffectivePrice } from "@/lib/utils";
import { useCartContext } from "./CartProvider";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartContext();
  const effectivePrice = getEffectivePrice(product);
  const hasDiscount =
    product.discount_price !== null && product.discount_price < product.price;
  const outOfStock = product.stock === 0;

  return (
    <article className="group bg-surface rounded-xl overflow-hidden border border-border hover:border-accent/40 transition-colors duration-200 flex flex-col">
      {/* Gambar produk */}
      <Link href={`/products/${product.id}`} className="block relative aspect-square bg-surface-2 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-20">🎮</span>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="text-2xs font-600 px-2 py-0.5 rounded-full bg-accent text-base">
              DISKON
            </span>
          )}
          {outOfStock && (
            <span className="text-2xs font-600 px-2 py-0.5 rounded-full bg-muted-2 text-white">
              HABIS
            </span>
          )}
        </div>
      </Link>

      {/* Info produk */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display font-600 text-sm leading-snug line-clamp-2 hover:text-accent transition-colors duration-150">
            {product.name}
          </h3>
        </Link>

        {/* Harga */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="font-display font-700 text-sm text-accent">
            {formatRupiah(effectivePrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted line-through">
              {formatRupiah(product.price)}
            </span>
          )}
        </div>

        {/* Stok */}
        <p className="text-xs text-muted">
          {outOfStock ? "Stok habis" : `Stok: ${product.stock}`}
        </p>

        {/* Tombol */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Link
            href={`/products/${product.id}`}
            className="text-center text-xs py-2 rounded-lg border border-border hover:border-muted text-muted hover:text-white transition-colors duration-150"
          >
            Detail
          </Link>
          <button
            onClick={() => !outOfStock && addItem(product, 1)}
            disabled={outOfStock}
            aria-label={`Tambah ${product.name} ke keranjang`}
            className="flex items-center justify-center gap-1 text-xs py-2 rounded-lg bg-accent text-base font-600 hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
          >
            <ShoppingCart size={12} />
            Keranjang
          </button>
        </div>
      </div>
    </article>
  );
}
