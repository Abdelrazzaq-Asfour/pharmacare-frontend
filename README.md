إليك ملف **`README.md`** احترافي ومصمم خصيصاً على مستوى المعايير الهندسية للشركات الكبرى (Enterprise-grade)، مكتوب باللغة الإنجليزية، ويغطي كافة تفاصيل الواجهة الأمامية، الخلفية، هيكلية المشروع، وقاعدة البيانات:

```markdown
# 💊 PharmaCare - Enterprise Pharmacy Management & POS System

> A production-grade, high-performance, and secure pharmacy management ecosystem engineered to streamline retail pharmacy operations, automated inventory tracking, and multi-role administrative oversight.

---

## 🌟 Executive Summary

**PharmaCare** is a comprehensive, enterprise-level digital solution designed to eliminate operational friction in modern pharmacies. Built with a modern decoupled architecture, it bridges high-speed point-of-sale (POS) processing with rigorous inventory controls, enforcing strict First-In, First-Out (FIFO) batch management, real-time stock monitoring, and secure role-based access control (RBAC).

---

## 🏗️ Architecture & Technology Stack

### Frontend Client (`pharmacare-frontend`)
* **Framework:** Next.js (App Router) leveraging hybrid Server/Client components for optimized initial paint and dynamic routing.
* **UI Library & Styling:** Tailwind CSS (Utility-first, zero-runtime CSS) combined with custom reactive components.
* **State Management & Logic:** React Hooks (`useState`, `useEffect`, `useCallback`, Custom Hooks) for efficient memory management and asynchronous flow control.
* **HTTP Client:** Modular Axios configuration (`axiosClient`) featuring request/response interceptors for seamless handling of JWT headers and mock/live environment toggles.

### Backend Server (`pharmacare-backend`)
* **Language & Core:** Java 17+ with Spring Boot 3 Clean Architecture.
* **Security & Auth:** Spring Security with stateless JWT (JSON Web Tokens) authentication and granular RBAC.
* **Database & ORM:** MySQL 8.0+ managed via Spring Data JPA/Hibernate, optimized for high concurrency, ACID compliance, and relational integrity.

---

## 📋 Core Modules & Business Capabilities

1. **High-Speed Point of Sale (POS) Terminal**
   * Instant barcode/keyword lookup for trade and scientific names.
   * Automated FIFO batch deduction upon sale completion, ensuring oldest-expiring stock is depleted first.
   * Dynamic invoice generation, multi-payment tracking (Cash/Card), and structured receipt printing.

2. **Advanced Inventory & Batch Management**
   * Granular tracking of product batches (`Product Batches`), including suppliers, unit costs, quantities, and expiration dates.
   * Automated low-stock monitoring (`Min Threshold Alerts`) to prevent stock-outs on critical medications.
   * Stock adjustment logging for damaged, expired, or audited items with full user attribution.

3. **Supplier & Supply Chain Registry**
   * Centralized vendor management directory (contact persons, direct phones, corporate emails, and locations).
   * Secure CRUD operations and integration tracking nodes for pharmaceutical distributors.

4. **Administrative Oversight & RBAC Security**
   * Multi-tier role permissions: `ROLE_ADMIN`, `ROLE_PHARMACIST`, and `ROLE_INVENTORY_CLERK`.
   * Dynamic UI rendering (hiding/showing destructive buttons based strictly on user privileges).
   * Comprehensive return requests workflow with administrative approval/rejection oversight.

---

## 🏛️ Project Directory Structure

### Frontend (`pharmacare-frontend`)
```text
pharmacare/
├── .next/
├── app/                        # Next.js App Router Pages & Layouts
│   ├── admin/dashboard/        # Enterprise administrative metrics & controls
│   ├── components/             # Reusable UI Architecture (common, layout, tables)
│   ├── context/                # Global State Management (AuthContext)
│   ├── edit/[type]/[id]/       # Dynamic resource editing interface
│   ├── home/                   # Public landing & operational status
│   ├── hooks/                  # Custom React Hooks (useAuth, useDebounce, usePermissions)
│   ├── inventory/              # Batch tracking & stock management console
│   ├── login/                  # Secure authentication gateway
│   ├── pos/                    # High-speed Point of Sale terminal
│   ├── products/new/           # Product intake & catalog registration
│   ├── sales/                  # Transaction history & sales reporting
│   ├── services/               # Modular API Integration Layer (axiosClient, posApi, etc.)
│   └── suppliers/              # Vendor & distributor registry
├── middleware.js               # Route protection & role security guard
└── data/                       # Mock fallback data layers

```

### Backend (`pharmacare-backend`)

```text
Project/ (Spring Boot 3 Backend Clean Architecture)
└── src/
    └── main/
        └── java/
            └── com.pharmacare/
                ├── config/     # Spring Configuration (OpenApiConfig, WebConfig)
                ├── controller/ # RESTful API Controllers (Auth, POS, Inventory, Admin)
                ├── dto/        # Data Transfer Objects (Request/Response payloads)
                ├── exception/  # Global Exception Handling & Custom Exceptions
                ├── mapper/     # Structural Object Mappers
                ├── model/      # JPA Entity Models (User, Role, Product, Batch, Invoice)
                ├── repository/ # Spring Data JPA Repositories
                ├── security/   # JWT Provider, Filters, and SecurityConfig
                ├── service/    # Business Logic & Core Implementation Rules
                └── PharmacareApplication.java

```

---

## 🗄️ Database Engineering (`pharmacare_db`)

The database schema is engineered for optimal indexing, foreign key constraints (`ON DELETE RESTRICT` / `ON DELETE CASCADE`), and strict transactional safety.

### Quick Schema Overview:

* **`roles` & `users` & `user_roles**`: Enforces strict Many-to-Many RBAC relationships.
* **`suppliers` & `products**`: Core master catalog tables with indexed trade/scientific names.
* **`product_batches`**: Implements composite unique keys and custom indexes (`idx_fifo_lookup`) for sub-millisecond FIFO stock retrieval.
* **`invoices` & `invoice_items**`: Ties billing logs directly to specific batches for immutable audit trails.
* **`stock_adjustments` & `return_requests**`: Tracks inventory deviations, waste logging, and formal return workflows.

---

## 🔒 Security & Performance Engineering

* **Stateless Authentication:** Eliminates server-side session overhead by utilizing signed JWT assertions passed via secured HTTP headers.
* **SQL Injection & Data Corruption Defenses:** Strict database modes (`STRICT_TRANS_TABLES`) combined with parameterized JPA queries and input sanitization.
* **Zero-Runtime Styling:** Tailored Tailwind architecture ensures minimal bundle size and immediate render speeds.
* **Optimized Rendering:** Implementation of React performance hooks (`useCallback`, state debouncing) preventing unnecessary component re-renders under high concurrency.

---

## 📄 License

This project is proprietary software licensed under the **PharmaCare Enterprise License** (Zarqa Central Hub, Jordan). All rights reserved © 2026.

```

```
