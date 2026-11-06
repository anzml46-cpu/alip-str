import { supabase } from "@/lib/supabase";
import { Product, Category } from "@/types/database";
import HeroSection from "@/components/user/HeroSection";
import ProductCard from "@/components/user/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*, categories(id, name, image_url, created_at)")
    .eq("is_active", true)
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

async function getBestSellers(): Promise<Product[]> {
  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity");

  if (!items || items.length === 0) return [];

  const count: Record<string, number> = {};
  for (const item of items) {
    count[item.product_id] = (count[item.product_id] ?? 0) + item.quantity;
  }
  const topIds = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id]) => id);

  if (topIds.length === 0) return [];

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(id, name, image_url, created_at)")
    .in("id", topIds)
    .eq("is_active", true)
    .gt("stock", 0);

  if (!products) return [];
  return topIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];
}

async function getCategories(): Promise<Category[]> {
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
}

export default async function HomePage() {
  const [featured, bestSellers, categories] = await Promise.all([
    getFeaturedProducts(),
    getBestSellers(),
    getCategories(),
  ]);

  return (
    <>
      <HeroSection />
      <div className="max-w-6xl mx-auto px-4 space-y-16 py-12">
        {categories.length > 0 && (
          <section>
            <h2 className="font-display font-700 text-xl mb-6">Kategori</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="px-4 py-2 rounded-full bg-surface border border-border hover:border-accent/40 hover:text-accent text-sm transition-colors duration-150"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-xl">Produk Terbaru</h2>
              <Link href="/products" className="flex items-center gap-1 text-sm text-accent hover:text-accent-dark transition-colors duration-150">
                Lihat semua <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {bestSellers.length > 0 && (
          <section>
            <h2 className="font-display font-700 text-xl mb-6 accent-dot">Terlaris</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {featured.length === 0 && (
          <div className="text-center py-24">
            <span className="text-5xl mb-4 block">🎮</span>
            <p className="text-muted">Produk segera hadir. Pantau terus ya!</p>
          </div>
        )}

        <section id="tentang" className="bg-surface rounded-2xl p-6 sm:p-10 border border-border">
          <h2 className="font-display font-700 text-xl mb-4">Tentang ALIP STORE</h2>
          <p className="text-muted leading-relaxed max-w-2xl">
            ALIP STORE adalah toko akun game terpercaya yang menyediakan berbagai pilihan akun game dengan harga terbaik. Proses cepat, pelayanan ramah, transaksi aman via WhatsApp.
          </p>
          <a
            href="https://wa.me/6285840840520"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-accent text-base text-sm font-600 hover:bg-accent-dark transition-colors duration-150"
          >
            Hubungi kami
          </a>
        </section>
      </div>
    </>
  );
}
