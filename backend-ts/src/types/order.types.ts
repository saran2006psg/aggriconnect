export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type OrderStatusInput =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export const STATUS_MAP: Record<OrderStatusInput, OrderStatus> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface CreateOrderRequest {
  delivery_type: 'Delivery' | 'Pickup';
  delivery_address_id?: string;
  promo_code?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

// ─── Bulk Orders ──────────────────────────────────────────────────────────────

export interface BulkOrderItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
}

export interface BulkOrderCreateRequest {
  business_name: string;
  business_type: string;
  business_location: string;
  budget_min: number;
  budget_max: number;
  items: BulkOrderItem[];
}

export interface BulkOrderRespondRequest {
  message: string;
  quoted_price: number;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export interface SubscriptionItem {
  product_id: string;
  quantity: number;
}

export interface SubscriptionCreateRequest {
  frequency: 'Weekly' | 'Monthly';
  items: SubscriptionItem[];
}
