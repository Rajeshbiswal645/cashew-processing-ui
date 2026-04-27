import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import {
  AllocationInput,
  Buyer,
  DispatchPayload,
  FinishedGoodsStock,
  SalesOrder,
  SalesOrderDetail,
  SalesOrderFormValue
} from './sales.models';

interface SalesAllocationApiDto {
  batchId: string;
  availableQty: number;
  allocateQty: number;
  productCategory: string;
}

interface SalesDispatchApiDto {
  truckId: string;
  driverName: string;
  driverPhone: string;
  destination: string;
  actualWeight: number;
  dispatchDate: string;
}

interface BuyerApiDto {
  id: string;
  name: string;
  contactPerson: string;
  destination: string;
  phone: string;
}

interface FinishedGoodsStockApiDto {
  batchId: string;
  productCategory: string;
  availableQty: number;
  reservedQty: number;
  location: string;
}

interface SalesOrderApiDto {
  id?: number;
  buyerId: number;
  buyerName?: string;
  contactPerson: string;
  destination: string;
  productCategory: string;
  quantity: number;
  pricePerKg: number;
  totalAmount?: number;
  orderDate?: string;
  status: SalesOrder['status'];
  allocatedQuantity?: number;
  dispatchedQuantity?: number;
  allocations?: SalesAllocationApiDto[];
  dispatch?: SalesDispatchApiDto | null;
  buyer?: BuyerApiDto;
  stockOptions?: FinishedGoodsStockApiDto[];
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly endpoint = 'sales-orders';

  constructor(private readonly api: ApiService) {}

  getBuyers(): Observable<Buyer[]> {
    return this.api.get<BuyerApiDto[]>(`${this.endpoint}/buyers`).pipe(
      map((buyers) =>
        buyers.map((buyer) => ({
          id: buyer.id,
          name: buyer.name,
          contactPerson: buyer.contactPerson,
          destination: buyer.destination,
          phone: buyer.phone
        }))
      )
    );
  }

  getOrders(): Observable<SalesOrder[]> {
    return this.api.get<SalesOrderApiDto[]>(this.endpoint).pipe(map((orders) => orders.map((order) => this.toOrder(order))));
  }

  getOrderById(orderId: string): Observable<SalesOrderDetail | undefined> {
    return this.api.get<SalesOrderApiDto>(`${this.endpoint}/${orderId}`).pipe(map((order) => this.toDetail(order)));
  }

  createOrder(payload: SalesOrderFormValue): Observable<SalesOrder> {
    return this.api.post<SalesOrderApiDto>(this.endpoint, this.toPayload(payload)).pipe(map((order) => this.toOrder(order)));
  }

  updateOrder(orderId: string, payload: SalesOrderFormValue): Observable<SalesOrder> {
    return this.api.put<SalesOrderApiDto>(`${this.endpoint}/${orderId}`, this.toPayload(payload)).pipe(map((order) => this.toOrder(order)));
  }

  allocateStock(orderId: string, allocations: AllocationInput[]): Observable<SalesOrder> {
    return this.api
      .post<SalesOrderApiDto>(
        `${this.endpoint}/${orderId}/allocations`,
        allocations.map((entry) => ({
          batchId: entry.batchId,
          allocateQty: Number(entry.allocateQty),
          availableQty: 0,
          productCategory: ''
        }))
      )
      .pipe(map((order) => this.toOrder(order)));
  }

  dispatchOrder(orderId: string, payload: DispatchPayload): Observable<SalesOrder> {
    return this.api.post<SalesOrderApiDto>(`${this.endpoint}/${orderId}/dispatch`, payload).pipe(map((order) => this.toOrder(order)));
  }

  completeOrder(orderId: string): Observable<SalesOrder> {
    return this.api.post<SalesOrderApiDto>(`${this.endpoint}/${orderId}/complete`, {}).pipe(map((order) => this.toOrder(order)));
  }

  private toPayload(payload: SalesOrderFormValue): SalesOrderApiDto {
    return {
      id: payload.id ? Number(payload.id) : undefined,
      buyerId: Number(payload.buyerId),
      contactPerson: payload.contactPerson.trim(),
      destination: payload.destination.trim(),
      productCategory: payload.productCategory,
      quantity: Number(payload.quantity),
      pricePerKg: Number(payload.pricePerKg),
      status: 'PENDING'
    };
  }

  private toOrder(order: SalesOrderApiDto): SalesOrder {
    return {
      id: String(order.id ?? ''),
      buyerId: String(order.buyerId),
      buyerName: order.buyerName ?? '',
      contactPerson: order.contactPerson,
      destination: order.destination,
      productCategory: order.productCategory,
      quantity: Number(order.quantity ?? 0),
      pricePerKg: Number(order.pricePerKg ?? 0),
      totalAmount: Number(order.totalAmount ?? Number(order.quantity ?? 0) * Number(order.pricePerKg ?? 0)),
      orderDate: order.orderDate ?? '',
      status: order.status,
      allocatedQuantity: Number(order.allocatedQuantity ?? 0),
      dispatchedQuantity: Number(order.dispatchedQuantity ?? 0),
      allocations: (order.allocations ?? []).map((allocation) => ({
        batchId: allocation.batchId,
        availableQty: Number(allocation.availableQty ?? 0),
        allocateQty: Number(allocation.allocateQty ?? 0),
        productCategory: allocation.productCategory
      })),
      dispatch: order.dispatch
        ? {
            truckId: order.dispatch.truckId,
            driverName: order.dispatch.driverName,
            driverPhone: order.dispatch.driverPhone,
            destination: order.dispatch.destination,
            actualWeight: Number(order.dispatch.actualWeight ?? 0),
            dispatchDate: order.dispatch.dispatchDate
          }
        : null
    };
  }

  private toDetail(order: SalesOrderApiDto): SalesOrderDetail {
    const summary = this.toOrder(order);
    return {
      ...summary,
      buyer: order.buyer
        ? {
            id: order.buyer.id,
            name: order.buyer.name,
            contactPerson: order.buyer.contactPerson,
            destination: order.buyer.destination,
            phone: order.buyer.phone
          }
        : {
            id: summary.buyerId,
            name: summary.buyerName,
            contactPerson: summary.contactPerson,
            destination: summary.destination,
            phone: ''
          },
      stockOptions: (order.stockOptions ?? []).map((stock) => this.toStock(stock))
    };
  }

  private toStock(stock: FinishedGoodsStockApiDto): FinishedGoodsStock {
    return {
      batchId: stock.batchId,
      productCategory: stock.productCategory,
      availableQty: Number(stock.availableQty ?? 0),
      reservedQty: Number(stock.reservedQty ?? 0),
      location: stock.location
    };
  }
}
