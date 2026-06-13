export interface ProductRecord {
  id: string;
  farmer_id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  description?: string | null;
  location?: string | null;
  image_url?: string | null;
  stock_quantity: number;
  is_available: boolean;
  harvest_date?: string | null;
  rating: number;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  // joined
  farmer?: string | null;
  farmer_location?: string | null;
}

// ─── Request bodies ───────────────────────────────────────────────────────────

export interface ProductCreateRequest {
  name: string;
  price: number;
  unit: string;
  category: string;
  description?: string;
  location?: string;
  image_url?: string;
  stock_quantity: number;
  is_available?: boolean;
  harvest_date?: string;
}

export interface ProductUpdateRequest {
  name?: string;
  price?: number;
  unit?: string;
  category?: string;
  description?: string;
  location?: string;
  image_url?: string;
  stock_quantity?: number;
  is_available?: boolean;
  harvest_date?: string;
}

export interface ProductListQuery {
  search?: string;
  category?: string;
  farmer?: string;
  sortBy?: 'recent' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  perPage?: number;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItemAddRequest {
  product_id: string;
  quantity: number;
}

export interface CartItemUpdateRequest {
  quantity: number;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface ReviewCreateRequest {
  product_id: string;
  rating: number;
  comment?: string;
}
