-- =====================================================================
-- System: PharmaCare Pharmacy Management System
-- Database Name: pharmacare_db
-- Role: Principal Software Architect & Lead Cybersecurity Engineer
-- Description: Production-grade MySQL 8.0+ schema optimized for high concurrency,
--              ACID compliance, FIFO batch tracking, and strict RBAC.
-- =====================================================================

-- Drop and create database with secure modern charset
-- DROP DATABASE IF EXISTS pharmacare_db;
CREATE DATABASE pharmacare_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE pharmacare_db;

-- Enforce strict SQL modes to prevent data corruption and silent truncations
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =====================================================================
-- 1. SECURITY & ACCESS CONTROL MODULE (RBAC)
-- =====================================================================

CREATE TABLE roles (
    role_id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Pre-seed roles adhering to principle of least privilege
INSERT INTO roles (role_name, description) VALUES 
('ROLE_ADMIN', 'Full system privileges, user management, audit oversight, and return approvals'),
('ROLE_PHARMACIST', 'POS operations, prescription processing, dispensing, and inventory tracking'),
('ROLE_INVENTORY_CLERK', 'Stock intake, batch registration, supplier logging, and waste management');

CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Stored using strong hashing like Argon2id or BCrypt from application layer
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    locked_until TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB;

CREATE TABLE user_roles (
    user_id INT UNSIGNED NOT NULL,
    role_id TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================================
-- 2. SUPPLY CHAIN & CATALOG MODULE
-- =====================================================================

CREATE TABLE suppliers (
    supplier_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NULL,
    address TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_supplier_name (supplier_name)
) ENGINE=InnoDB;

CREATE TABLE products (
    product_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trade_name VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    selling_price_per_box DECIMAL(10, 2) NOT NULL CHECK (selling_price_per_box >= 0),
    min_stock_alert_threshold INT UNSIGNED NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_trade_name (trade_name),
    INDEX idx_scientific_name (scientific_name)
) ENGINE=InnoDB;

CREATE TABLE product_batches (
    batch_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    supplier_id INT UNSIGNED NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    cost_price_per_box DECIMAL(10, 2) NOT NULL CHECK (cost_price_per_box >= 0),
    initial_boxes_quantity INT UNSIGNED NOT NULL CHECK (initial_boxes_quantity > 0),
    current_boxes_quantity INT UNSIGNED NOT NULL CHECK (current_boxes_quantity >= 0),
    expiration_date DATE NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_batch_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    CONSTRAINT fk_batch_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    UNIQUE KEY uk_product_batch (product_id, batch_number),
    INDEX idx_fifo_lookup (product_id, expiration_date, current_boxes_quantity)
) ENGINE=InnoDB;
-- =====================================================================
-- 3. SALES & POINT OF SALE (POS) MODULE
-- =====================================================================

CREATE TABLE invoices (
    invoice_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    pharmacist_user_id INT UNSIGNED NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method ENUM('CASH', 'CARD') NOT NULL DEFAULT 'CASH',
    invoice_status ENUM('COMPLETED', 'PENDING_RETURN', 'RETURNED') NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_pharmacist FOREIGN KEY (pharmacist_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_created_at (created_at),
    INDEX idx_status (invoice_status)
) ENGINE=InnoDB;

-- Line items linked to specific batches to maintain strict FIFO audit trails
CREATE TABLE invoice_items (
    item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    batch_id INT UNSIGNED NOT NULL,
    quantity_boxes INT UNSIGNED NOT NULL CHECK (quantity_boxes > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12, 2) NOT NULL CHECK (total_price >= 0),
    CONSTRAINT fk_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    CONSTRAINT fk_item_batch FOREIGN KEY (batch_id) REFERENCES product_batches(batch_id) ON DELETE RESTRICT,
    INDEX idx_invoice_id (invoice_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 4. INVENTORY ADJUSTMENTS & AUDIT / RETURN WORKFLOW
-- =====================================================================

CREATE TABLE stock_adjustments (
    adjustment_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    adjustment_type ENUM('DAMAGED', 'EXPIRED', 'CORRECTION') NOT NULL,
    quantity_changed INT NOT NULL COMMENT 'Negative for loss/removal, positive for additions',
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_adj_batch FOREIGN KEY (batch_id) REFERENCES product_batches(batch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_adj_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_batch_id (batch_id)
) ENGINE=InnoDB;

CREATE TABLE return_requests (
    return_request_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT UNSIGNED NOT NULL,
    requested_by_user_id INT UNSIGNED NOT NULL,
    approved_by_user_id INT UNSIGNED NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_return_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE RESTRICT,
    CONSTRAINT fk_return_requester FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_return_approver FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_status (status)
) ENGINE=InnoDB;

USE pharmacare_db;

-- =====================================================================
-- 1. USERS MODULE (مستخدمو النظام)
-- ملاحظة: كلمة المرور المشفرة الافتراضية هنا تجريبية تمثل (Admin@123 و Pharmacist@123 و Clerk@123)
-- =====================================================================

INSERT INTO users (username, email, password_hash, first_name, last_name, is_active) VALUES 
('admin_sami', 'sami.admin@pharmacare.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sami', 'Al-Ahmad', TRUE),
('ph_layla', 'layla.ph@pharmacare.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Layla', 'Mahmoud', TRUE),
('clerk_rami', 'rami.clerk@pharmacare.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rami', 'Khaled', TRUE);

-- ربط المستخدمين بالأدوار (RBAC) بناءً على جدول roles المُسبق الإعداد
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1), -- sami -> ROLE_ADMIN
(2, 2), -- layla -> ROLE_PHARMACIST
(3, 3); -- rami -> ROLE_INVENTORY_CLERK


-- =====================================================================
-- 2. SUPPLIERS MODULE (الموردون)
-- =====================================================================

INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES 
('Alpha Pharma Distribution', 'Dr. Ziad Naji', '+962791112233', 'orders@alphapharma.jo', 'Amman, Industrial Zone, St. 4'),
('Modern Medical Supplies', 'Ahmad Yousef', '+962785556677', 'info@modernmed.jo', 'Irbid, University Street');


-- =====================================================================
-- 3. PRODUCTS CATALOG (المنتجات والأدوية)
-- =====================================================================

INSERT INTO products (trade_name, scientific_name, category, selling_price_per_box, min_stock_alert_threshold, is_active) VALUES 
('Panadol Extra', 'Paracetamol + Caffeine', 'Analgesics', 2.50, 10, TRUE),
('Augmentin 1g', 'Amoxicillin + Clavulanic Acid', 'Antibiotics', 11.75, 5, TRUE),
('Lipitor 20mg', 'Atorvastatin', 'Cholesterol', 18.00, 8, TRUE),
('Glucophage 500mg', 'Metformin Hydrochloride', 'Antidiabetic', 6.25, 6, TRUE);


-- =====================================================================
-- 4. PRODUCT BATCHES / INVENTORY / FIFO (دفعات المخزون)
-- =====================================================================

INSERT INTO product_batches (product_id, supplier_id, batch_number, cost_price_per_box, initial_boxes_quantity, current_boxes_quantity, expiration_date) VALUES 
-- دفعات البنادول (Panadol Extra)
(1, 1, 'PAN-2026-A', 1.80, 50, 45, '2027-06-30'),
(1, 2, 'PAN-2027-B', 1.85, 30, 30, '2028-12-31'),

-- دفعات أوجمنتين (Augmentin 1g)
(2, 1, 'AUG-2026-01', 9.00, 20, 12, '2026-11-15'),

-- دفعات ليبيتر (Lipitor 20mg)
(3, 2, 'LIP-2027-X', 14.00, 15, 15, '2028-03-31'),

-- دفعات جلوكوفاج (Glucophage 500mg)
(4, 1, 'GLU-2026-99', 4.50, 25, 18, '2027-09-30');


-- =====================================================================
-- 5. POS INVOICES & ITEMS (المبيعات والفواتير - نظام FIFO)
-- =====================================================================

-- الفاتورة الأولى
INSERT INTO invoices (invoice_number, pharmacist_user_id, total_amount, payment_method, invoice_status) VALUES 
('INV-2026-0001', 2, 16.75, 'CASH', 'COMPLETED');

-- تفاصيل الفاتورة الأولى (تم بيع 2 علبة بنادول من الدفعة الأولى + علبة أوجمنتين واحدة)
INSERT INTO invoice_items (invoice_id, product_id, batch_id, quantity_boxes, unit_price, total_price) VALUES 
(1, 1, 1, 2, 2.50, 5.00),
(1, 2, 3, 1, 11.75, 11.75);


-- =====================================================================
-- 6. STOCK ADJUSTMENTS & RETURNS (التعديلات والمرتجعات)
-- =====================================================================
ر
-- تسجيل تعديل مخزون (مثال: تلف علبة واحدة من الأوجمنتين)
INSERT INTO stock_adjustments (batch_id, user_id, adjustment_type, quantity_changed, reason) VALUES 
(3, 3, 'DAMAGED', -1, 'Damaged box discovered during routine shelf inspection');

-- طلب إرجاع فاتورة
INSERT INTO return_requests (invoice_id, requested_by_user_id, approved_by_user_id, status, reason) VALUES 
(1, 2, 1, 'APPROVED', 'Customer returned Augmentin due to prescribed medication change by doctor.');

