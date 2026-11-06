import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/user/CartProvider";
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";

export const metadata: Metadata = {
  title: { default: "ALIP STORE", template: "%s | ALIP STORE" },
  description: "Toko akun game terpercaya — harga terbaik, proses cepat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <CartProvider>
          <div className="flex flex-col min-h-dvh">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
