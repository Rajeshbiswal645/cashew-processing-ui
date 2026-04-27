export type SalesOrderStatus = 'PENDING' | 'ALLOCATED' | 'DISPATCHED' | 'COMPLETED';

export interface Buyer {
  id: string;
  name: string;
  contactPerson: string;
  destination: string;
  phone: string;
}

export interface FinishedGoodsStock {
  batchId: string;
  productCategory: string;
  availableQty: number;
  reservedQty: number;
  location: string;
}

export interface SalesOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  contactPerson: string;
  destination: string;
  productCategory: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  orderDate: string;
  status: SalesOrderStatus;
  allocatedQuantity: number;
  dispatchedQuantity: number;
  allocations: SalesAllocation[];
  dispatch: DispatchInfo | null;
}

export interface SalesAllocation {
  batchId: string;
  availableQty: number;
  allocateQty: number;
  productCategory: string;
}

export interface DispatchInfo {
  truckId: string;
  driverName: string;
  driverPhone: string;
  destination: string;
  actualWeight: number;
  dispatchDate: string;
}

export interface SalesOrderFormValue {
  id?: string;
  buyerId: string;
  contactPerson: string;
  destination: string;
  productCategory: string;
  quantity: number;
  pricePerKg: number;
}

export interface SalesOrderDetail extends SalesOrder {
  buyer: Buyer;
  stockOptions: FinishedGoodsStock[];
}

export interface AllocationInput {
  batchId: string;
  allocateQty: number;
}

export interface DispatchPayload {
  truckId: string;
  driverName: string;
  driverPhone: string;
  destination: string;
  actualWeight: number;
  dispatchDate: string;
}
