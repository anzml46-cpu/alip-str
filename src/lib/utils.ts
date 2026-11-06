export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function getEffectivePrice(product: {
  price: number;
  discount_price: number | null;
}): number {
  return product.discount_price && product.discount_price < product.price
    ? product.discount_price
    : product.price;
}

export function buildWhatsAppMessage(params: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  total: number;
}): string {
  const { customerName, customerPhone, customerAddress, items, total } = params;

  const itemLines = items
    .map(
      (item) =>
        `• ${item.name}\n  Harga: ${formatRupiah(item.price)}\n  Jumlah: ${item.quantity}\n  Subtotal: ${formatRupiah(item.subtotal)}`
    )
    .join("\n\n");

  const message = `Halo ALIP STORE! 👋

Saya ingin memesan produk.

DATA PEMBELI:
Nama: ${customerName}
Nomor WhatsApp: ${customerPhone}
Alamat: ${customerAddress}

DETAIL PESANAN:
${itemLines}

TOTAL PEMBAYARAN:
${formatRupiah(total)}

Mohon konfirmasi pesanan saya.

Terima kasih.
ALIP STORE.`;

  return message;
}

export function openWhatsApp(message: string): void {
  const phone = "6285840840520";
  const encoded = encodeURIComponent(message);
  // Coba buka WhatsApp app dulu, fallback ke WhatsApp Web
  const url = `https://wa.me/${phone}?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  menunggu_konfirmasi: "text-yellow-400 bg-yellow-400/10",
  diproses: "text-blue-400 bg-blue-400/10",
  dikirim: "text-purple-400 bg-purple-400/10",
  selesai: "text-accent bg-accent/10",
  dibatalkan: "text-red-400 bg-red-400/10",
};
