"use client";

import { useState } from "react";
import { X, MessageCircle, Loader2 } from "lucide-react";
import { CartItem } from "@/types/database";
import { formatRupiah, getEffectivePrice, buildWhatsAppMessage, openWhatsApp } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface CheckoutModalProps {
  items: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ items, onClose, onSuccess }: CheckoutModalProps) {
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const totalPrice = items.reduce(
    (sum, i) => sum + i.quantity * getEffectivePrice(i.product),
    0
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = "Nama wajib diisi";
    if (!form.customerPhone.trim()) e.customerPhone = "Nomor WhatsApp wajib diisi";
    else if (!/^[0-9+\-\s]{8,16}$/.test(form.customerPhone.trim()))
      e.customerPhone = "Format nomor tidak valid";
    if (!form.customerAddress.trim()) e.customerAddress = "Alamat wajib diisi";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      // Verifikasi stok di server sebelum checkout
      for (const item of items) {
        const { data: prod } = await supabase
          .from("products")
          .select("stock, name")
          .eq("id", item.product.id)
          .single();
        if (!prod || prod.stock < item.quantity) {
          setErrors({
            general: `Stok ${item.product.name} tidak mencukupi. Silakan perbarui keranjang.`,
          });
          setLoading(false);
          return;
        }
      }

      // Simpan pesanan ke database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: form.customerName.trim(),
          customer_phone: form.customerPhone.trim(),
          customer_address: form.customerAddress.trim(),
          total_price: totalPrice,
          status: "menunggu_konfirmasi",
        })
        .select()
        .single();

      if (orderError || !order) throw orderError;

      // Simpan order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        price: getEffectivePrice(item.product),
        quantity: item.quantity,
        subtotal: item.quantity * getEffectivePrice(item.product),
      }));

      await supabase.from("order_items").insert(orderItems);

      // Buka WhatsApp dengan pesan yang sudah terisi
      const message = buildWhatsAppMessage({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerAddress: form.customerAddress.trim(),
        items: orderItems.map((oi) => ({
          name: oi.product_name,
          price: oi.price,
          quantity: oi.quantity,
          subtotal: oi.subtotal,
        })),
        total: totalPrice,
      });

      openWhatsApp(message);
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
      aria-label="Form checkout"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl border border-border max-h-[90dvh] overflow-y-auto">
        <div className="sticky top-0 bg-surface flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-600 text-base">Checkout</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors duration-150"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Error global */}
          {errors.general && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {errors.general}
            </div>
          )}

          {/* Ringkasan pesanan */}
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

          {/* Form */}
          <div className="space-y-3">
            <Field
              label="Nama lengkap"
              id="customerName"
              value={form.customerName}
              onChange={(v) => setForm((f) => ({ ...f, customerName: v }))}
              error={errors.customerName}
              placeholder="Masukkan nama lengkap"
            />
            <Field
              label="Nomor WhatsApp"
              id="customerPhone"
              value={form.customerPhone}
              onChange={(v) => setForm((f) => ({ ...f, customerPhone: v }))}
              error={errors.customerPhone}
              placeholder="Contoh: 08123456789"
              inputMode="tel"
            />
            <div>
              <label
                htmlFor="customerAddress"
                className="block text-xs font-600 mb-1.5"
              >
                Alamat pengiriman
              </label>
              <textarea
                id="customerAddress"
                value={form.customerAddress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerAddress: e.target.value }))
                }
                placeholder="Jalan, nomor rumah, kelurahan, kecamatan, kota"
                rows={3}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-150 resize-none"
              />
              {errors.customerAddress && (
                <p className="text-xs text-red-400 mt-1">{errors.customerAddress}</p>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-base font-display font-700 text-sm hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <MessageCircle size={18} />
                Lanjutkan ke WhatsApp
              </>
            )}
          </button>

          <p className="text-xs text-muted text-center">
            Pesananmu akan dikirim ke WhatsApp{" "}
            <span className="text-white">085840840520</span>
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
