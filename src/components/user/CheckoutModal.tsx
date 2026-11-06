"use client";

import { useState } from "react";
import { X, MessageCircle, Loader2 } from "lucide-react";
import { CartItem } from "@/types/database";
import { formatRupiah, getEffectivePrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface CheckoutModalProps {
  items: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ items, onClose, onSuccess }: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const totalPrice = items.reduce(
    (sum, i) => sum + i.quantity * getEffectivePrice(i.product),
    0
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.customerName = "Nama wajib diisi";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    try {
      // Verifikasi stok sebelum checkout
      for (const item of items) {
        const { data: prod } = await supabase
          .from("products")
          .select("stock, name")
          .eq("id", item.product.id)
          .single();
        if (!prod || prod.stock < item.quantity) {
          setErrors({ general: `Stok ${item.product.name} tidak mencukupi.` });
          setLoading(false);
          return;
        }
      }

      // Simpan pesanan ke database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: customerName.trim(),
          customer_phone: "-",
          customer_address: "-",
          total_price: totalPrice,
          status: "menunggu_konfirmasi",
        })
        .select()
        .single();

      if (orderError || !order) throw orderError;

      await supabase.from("order_items").insert(
        items.map((item) => ({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          price: getEffectivePrice(item.product),
          quantity: item.quantity,
          subtotal: item.quantity * getEffectivePrice(item.product),
        }))
      );

      // Buat pesan WhatsApp sesuai format
      const itemLines = items
        .map(
          (item) =>
            `Halo saya dari ${customerName.trim()} ingin membeli\nAkun ${item.product.name}\nBernominal: ${formatRupiah(getEffectivePrice(item.product))}`
        )
        .join("\n\n");

      const message = items.length === 1
        ? `Halo saya dari ${customerName.trim()} ingin membeli\nAkun ${items[0].product.name}\nBernominal: ${formatRupiah(getEffectivePrice(items[0].product))}`
        : `Halo saya dari ${customerName.trim()} ingin membeli:\n\n${itemLines}\n\nTotal: ${formatRupiah(totalPrice)}`;

      const phone = "6285840840520";
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");

      onSuccess();
    } catch {
      setErrors({ general: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl border border-border max-h-[90dvh] overflow-y-auto">
        <div className="sticky top-0 bg-surface flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-600 text-base">Beli via WhatsApp</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {errors.general && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {errors.general}
            </div>
          )}

          {/* Ringkasan */}
          <div className="bg-surface-2 rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted font-600 mb-3">Pesanan kamu</p>
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-muted line-clamp-1 flex-1 mr-2">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-600 shrink-0">
                  {formatRupiah(item.quantity * getEffectivePrice(item.product))}
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-border flex justify-between font-display font-700">
              <span>Total</span>
              <span className="text-accent">{formatRupiah(totalPrice)}</span>
            </div>
          </div>

          {/* Hanya nama */}
          <div>
            <label htmlFor="customerName" className="block text-xs font-600 mb-1.5">
              Nama kamu
            </label>
            <input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama kamu"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-150"
            />
            {errors.customerName && (
              <p className="text-xs text-red-400 mt-1">{errors.customerName}</p>
            )}
          </div>

          {/* Preview pesan */}
          {customerName.trim() && (
            <div className="bg-surface-2 rounded-xl p-3 border border-border">
              <p className="text-xs text-muted mb-2">Preview pesan WhatsApp:</p>
              <p className="text-xs leading-relaxed whitespace-pre-line">
                {`Halo saya dari ${customerName.trim()} ingin membeli\nAkun ${items[0]?.product.name}\nBernominal: ${formatRupiah(getEffectivePrice(items[0]?.product))}`}
                {items.length > 1 ? "\n..." : ""}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-base font-display font-700 text-sm hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><MessageCircle size={18} />BUY SEKARANG</>}
          </button>

          <p className="text-xs text-muted text-center">
            Pesan otomatis terkirim ke WhatsApp <span className="text-white">085840840520</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  error,
  placeholder,
  inputMode,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-600 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-150"
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
