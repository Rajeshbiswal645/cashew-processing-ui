export interface RcnBatch {
  rcn_id: string;
  supplier?: string;
  weight: number;
  date?: string;
  status?: string;
}

export interface BoilingBatch {
  boiling_id: string;
  rcn_id: string;
  input_weight: number;
  start_time?: string;
  end_time?: string;
  temp?: number;
  operator_id?: string;
}

export interface CuttingBatch {
  cutting_id: string;
  boiling_id: string;
  machine_id?: string;
  input_weight: number;
  kernel_weight: number;
  shell_weight: number;
  uncut_weight: number;
  type: 'MACHINE' | 'MANUAL';
  operator_id?: string;
}

export interface KernelBatch {
  kernel_batch_id: string;
  cutting_id: string;
  input_weight: number;
  after_borma_weight: number;
  after_humid_weight: number;
  status?: string;
}

export interface PeelingBatch {
  peeling_id: string;
  kernel_batch_id: string;
  input_weight: number;
  cat1_weight: number;
  cat6_weight: number;
  husk_weight: number;
  operator_id?: string;
}

export interface SortingBatch {
  sorting_id: string;
  peeling_id: string;
  input_weight: number;
  category_weights: { [key: string]: number };
  operator_id?: string;
}

export interface PackingBatch {
  packing_id: string;
  sorting_id: string;
  packed_weight: number;
  category: string;
  packaging_type: string;
  packing_date: string; // or Date if preferred
  lot_id: string;
  operator_id: string; // ✅ add this field
}

export interface SalesOrder {
  so_id: string;
  buyer_id: string;
  order_date: string;
  status: string;
  total_qty: number;
  price_per_kg: number;
}
