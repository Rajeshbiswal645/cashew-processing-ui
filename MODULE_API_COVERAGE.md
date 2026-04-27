# Cashew ERP Module API Coverage

This coverage map is based on:

- `src/app/app.module.ts`
- `src/app/app-routing.module.ts`
- active `src/app/features/**` modules and services
- current Spring Boot controllers under `java-cashew-processing-unit/src/main/java/com/in/cashew/controller`

## Current Status

### Connected To Real API

- Dashboard
  - Frontend uses `src/app/dashboard/dashboard.service.ts`
  - Backend uses `/api/dashboard/summary`
- Parties
  - Frontend uses `src/app/features/parties/parties.service.ts`
  - Backend uses `/api/parties`
- RCN Procurement
  - Frontend uses `src/app/features/batches/rcn/rcn.service.ts`
  - Backend uses `/api/rcn-batches`

### Backend Exists But Frontend Still Dummy / Not Wired

- Sales
  - Frontend dummy service: `src/app/features/sales/sales.service.ts`
  - Backend controller exists: `/api/sales-orders`
  - Gap: API contract does not yet match UI allocation, dispatch, and detail workflows
- Accounts / Invoices
  - Frontend dummy service: `src/app/features/accounts/accounts.service.ts`
  - Backend controller exists: `/api/invoices`
  - Gap: API contract does not yet match invoice line items, payments, ledger, and invoice detail screens
- Batch pipeline entities
  - Backend controllers exist for:
    - `/api/boiling-batches`
    - `/api/cutting-batch`
    - `/api/kernel-batch`
    - `/api/peeling-batch`
    - `/api/sorting-batches`
    - `/api/packing-batches`
  - Gap: active UI is not using these APIs yet, and process flow endpoints required by the UI are not aligned

### Still Dummy / Mock Driven

- Processing
  - `src/app/features/processing/processing.service.ts`
  - Uses `BehaviorSubject`, seed pipeline data, and fake transitions
- QC
  - `src/app/features/qc/qc.service.ts`
  - Uses `BehaviorSubject` mock records
- Drying
  - `src/app/features/drying/drying.service.ts`
  - Uses `BehaviorSubject` mock batches
- Inventory
  - `src/app/features/inventory/inventory.service.ts`
  - Uses in-memory records and ledger
- HRM
  - `src/app/features/hrm/hrm.service.ts`
  - Uses in-memory employees, attendance, leave, and payroll data

### Legacy / Duplicate UI Trees Present

- `src/app/parties/**`
- `src/app/batches/**`
- `src/app/invoices/**`

These appear to be older implementations referenced by `app.module.ts`, while the active routed UI uses `src/app/features/**`.

## Recommended Implementation Order

1. Sales
   - Needed by accounts and dashboard
   - Existing backend skeleton already present
2. Accounts / Invoices
   - Depends on sales and parties
   - Existing backend skeleton already present
3. Processing pipeline
   - Replace dummy transitions with real stage APIs
   - Align to boiling and cutting detail screens first
4. QC and Drying
   - Tie RCN approval and drying-required flow together
5. Inventory
   - Build read models from batch and finished goods transactions
6. HRM
   - Separate domain, can be completed after operations flow is stable

## Required Backend Work Remaining

### Sales

- Redesign `SalesOrder`, `SalesOrderDto`, `SalesOrderService`, and `SalesOrderController`
- Add fields required by UI:
  - buyer name/contact/destination
  - product category
  - quantity
  - price per kg
  - total amount
  - allocated quantity
  - dispatched quantity
  - allocations
  - dispatch payload
- Add endpoints for:
  - list
  - create
  - update
  - allocate stock
  - dispatch order
  - complete order
  - detail by id

### Accounts / Invoices

- Redesign `Invoice`, `InvoiceDto`, `InvoiceService`, and `InvoiceController`
- Add tables/entities for:
  - invoice line items
  - payments
- Add endpoints for:
  - list with filters
  - create invoice
  - get invoice detail
  - record payment
  - ledger view
  - party lookup
  - sales order lookup

### Processing

- Replace dummy `processing.service.ts` data source
- Add backend process flow endpoints aligned to UI:
  - list processes
  - get process detail
  - start boiling
  - complete boiling
  - start cutting
  - complete cutting
  - continue through kernel, peeling, sorting, packing
- Add transaction/status model connecting:
  - RCN
  - Boiling
  - Cutting
  - Kernel
  - Peeling
  - Sorting
  - Packing

### QC / Drying / Inventory / HRM

- These still need full backend domain models and API contracts based on their current UI models/services

## Source Of Truth For Active UI

Prefer these active modules over the legacy duplicates:

- `src/app/features/parties`
- `src/app/features/batches/rcn`
- `src/app/features/processing`
- `src/app/features/sales`
- `src/app/features/accounts`
- `src/app/features/qc`
- `src/app/features/drying`
- `src/app/features/inventory`
- `src/app/features/hrm`

## Build Status At Time Of Audit

- Spring Boot compile: passing
- Angular build: passing

## Next Slice

The next highest-value slice is:

1. Sales API redesign and Angular sales integration
2. Accounts / invoices API redesign and Angular accounts integration
3. Processing pipeline API integration
