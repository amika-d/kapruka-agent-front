export interface ThinkingEvent {
  step: string;
  detail: string;
  status: "running" | "done" | "error";
  icon?: string;
  duration?: string;
}

export interface ProductCardType {
  product_id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image_url: string;
  url?: string;
  in_stock: boolean;
  currency: string;
  delivery_available?: boolean;
  badge?: string;
  subtitle?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  timestamp?: string;
  thinking?: ThinkingEvent[];
  ui?: {
    component: string;
    props: any;
  };
}
