"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Product, Category } from "@/types/database";
import ProductCard from "@/components/user/ProductCard";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") ?? ""
  );
  const [sort, setSort] = useState("newest");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select("*, categories(id, name, image_url, created_at)")
      .eq("is_active", true);

    if (categoryFilter) query = query.eq("category_id", categoryFilter);
    if (onlyAvailable) query = query.gt("stock", 0);
    if (search) query = query.ilike("name", `%${search}%`);

    if (sort === "newest") query = query.order("created_at", { ascending: false });
    else if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });

    query.then(({ data }) => {
      setProducts(data ?? []);
      setLoading(false);
    });
  }, [search, categoryFilter, sort, onlyAvailable]);

  // Realtime — produk berubah langsung update
  useEffect(() => {
    const channel = supabase
      .channel("products-catalog")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          // Re-trigger fetch
          setSort((s) => s);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeFilters =
    (categoryFilter ? 1 : 0) + (onlyAvailable ? 1 : 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display font-700 text-2xl mb-6">Semua Produk</h1>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="search"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-150"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors duration-150"
          aria-label="Urutan"
        >
          <option value="newest">Terbaru</option>
          <option value="price_asc">Harga: Murah dulu</option>
          <option value="price_desc">Harga: Mahal dulu</option>
        </select>
      </div>

      {/* Category + available filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategoryFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs transition-colors duration-150 ${
            !categoryFilter
              ? "bg-accent text-base font-600"
              : "bg-surface border border-border text-muted hover:text-white"
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id === categoryFilter ? "" : cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors duration-150 ${
              categoryFilter === cat.id
                ? "bg-accent text-base font-600"
                : "bg-surface border border-border text-muted hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
        <button
          onClick={() => setOnlyAvailable((v) => !v)}
          className={`px-3 py-1.5 rounded-full text-xs transition-colors duration-150 flex items-center gap-1 ${
            onlyAvailable
              ? "bg-accent text-base font-600"
              : "bg-surface border border-border text-muted hover:text-white"
          }`}
        >
          <SlidersHorizontal size={12} />
          Tersedia saja
        </button>
        {activeFilters > 0 && (
          <button
            onClick={() => { setCategoryFilter(""); setOnlyAvailable(false); }}
            className="px-3 py-1.5 rounded-full text-xs bg-muted-2 text-muted hover:text-white transition-colors duration-150"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-xl aspect-[3/4] animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <span className="text-4xl mb-4 block">🔍</span>
          <p className="text-muted">
            {search
              ? `Produk "${search}" tidak ditemukan`
              : "Belum ada produk yang tersedia"}
          </p>
          {(search || activeFilters > 0) && (
            <button
              onClick={() => { setSearch(""); setCategoryFilter(""); setOnlyAvailable(false); }}
              className="mt-4 text-sm text-accent hover:text-accent-dark transition-colors duration-150"
            >
              Hapus semua filter
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted mb-4">{products.length} produk ditemukan</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-8"><div className="h-8 w-48 bg-surface animate-pulse rounded" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
