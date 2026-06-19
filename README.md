# BNWEMS Web Frontend

Web application for the **Binh Nguyen Wedding Event Management System (BNWEMS)** for Admin and Manager roles. Built with Next.js 16 (App Router) + TypeScript + TailwindCSS v4 + Axios.

## Tech Stack

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Framework   | Next.js 16 (App Router)                 |
| Language    | TypeScript 5.x                          |
| Styling     | TailwindCSS v4                          |
| HTTP Client | Axios (with JWT interceptors)           |
| State       | React Context (AuthContext)             |
| Testing     | Jest + React Testing Library + jest-dom |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and set the backend API URL
cp .env.example .env.local

# 3. Start development server
npm run dev
```

The app will run at `http://localhost:3000`.

## Available Scripts

| Script                  | Description                      |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Start Next.js development server |
| `npm run build`         | Build for production             |
| `npm start`             | Run production build             |
| `npm run test`          | Run all Jest tests               |
| `npm run test:coverage` | Run tests with coverage report   |

## Project Structure

````
web-frontend/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── src/
│
│   ├── app/
│   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │
│   │   ├── admin/
│   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │
│   │   │   ├── orders_audit/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   └── [id]/
│   │   │
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── equipments/
│   │   │   │   ├── stock-status/
│   │   │   │   └── maintenance/
│   │   │
│   │   │   ├── suppliers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │
│   │   │   ├── procurement/
│   │   │   │   ├── page.tsx
│   │   │   │   └── requests/
│   │   │
│   │   │   ├── staff/
│   │   │   │   ├── page.tsx
│   │   │   │   └── assignments/
│   │   │
│   │   │   ├── schedule/
│   │   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │
│   │   │   ├── payments/
│   │   │   │   ├── deposits/
│   │   │   │   ├── settlements/
│   │   │   │   └── transactions/
│   │   │
│   │   │   ├── debts/
│   │   │   │   ├── suppliers/
│   │   │   │   └── staff/
│   │   │
│   │   │   ├── reports/
│   │   │   │   ├── revenue/
│   │   │   │   ├── inventory/
│   │   │   │   └── debts/
│   │   │
│   │   │   └── settings/
│   │   │       ├── users/
│   │   │       ├── roles/
│   │   │       └── system/
│   │
│   │   └── manager/
│   │       │
│   │       ├── dashboard/
│   │       ├── orders/
│   │       ├── inventory/
│   │       ├── procurement/
│   │       ├── schedule/
│   │       └── reports/
│   │
│   │
│   ├── components/
│   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Pagination.tsx
│   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │
│   │   ├── orders/
│   │   │   ├── OrderForm.tsx
│   │   │   ├── OrderTable.tsx
│   │   │   ├── OrderStatusBadge.tsx
│   │   │   └── FinalQuotation.tsx
│   │
│   │   ├── inventory/
│   │   │   ├── EquipmentTable.tsx
│   │   │   ├── StockWarning.tsx
│   │   │   └── MaintenanceHistory.tsx
│   │
│   │   ├── suppliers/
│   │   │   ├── SupplierTable.tsx
│   │   │   └── ProcurementRequestForm.tsx
│   │
│   │   ├── schedule/
│   │   │   ├── CalendarView.tsx
│   │   │   └── AssignmentModal.tsx
│   │
│   │   └── reports/
│   │       ├── RevenueChart.tsx
│   │       ├── DebtChart.tsx
│   │       └── DashboardStats.tsx
│   │
│   │
│   ├── services/
│   │
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── order.service.ts
│   │   ├── customer.service.ts
│   │   ├── inventory.service.ts
│   │   ├── supplier.service.ts
│   │   ├── procurement.service.ts
│   │   ├── payment.service.ts
│   │   ├── staff.service.ts
│   │   ├── debt.service.ts
│   │   └── report.service.ts
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── PermissionContext.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePagination.ts
│   │   ├── useDebounce.ts
│   │   └── usePermission.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── order.ts
│   │   ├── customer.ts
│   │   ├── inventory.ts
│   │   ├── supplier.ts
│   │   ├── payment.ts
│   │   └── report.ts
│   │
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── order-status.ts
│   │   └── permissions.ts
│   │
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   ├── formatDate.ts
│   │   └── exportExcel.ts
│   │
│   └── proxy.ts
│
├── __tests__/
│   ├── components/
│   ├── services/
│   └── hooks/
│
├── .env.local
├── package.json
├── tsconfig.json
└── next.config.js
....

## Running Tests

```bash
npm run test
````
