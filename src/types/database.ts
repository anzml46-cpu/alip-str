export type OrderStatus =
  | "menunggu_konfirmasi"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  category_id: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  whatsapp_number: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
