-- =====================================================================
-- System: PharmaCare Pharmacy Management System
-- Database Name: pharmacare_db
-- Role: Principal Software Architect & Lead Cybersecurity Engineer
-- Description: Production-grade MySQL 8.0+ schema optimized for high concurrency,
--              ACID compliance, FIFO batch tracking, and strict RBAC.
-- =====================================================================

-- Drop and create database with secure modern charset
DROP DATABASE IF EXISTS pharmacare_db;
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
    unit_multiplier INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Conversion factor: e.g., 1 box contains X base units (pills)',
    base_unit_name VARCHAR(30) NOT NULL DEFAULT 'pills' COMMENT 'e.g., pill, ml, vial',
    selling_price_per_base_unit DECIMAL(10, 2) NOT NULL CHECK (selling_price_per_base_unit >= 0),
    min_stock_alert_threshold INT UNSIGNED NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_trade_name (trade_name),
    INDEX idx_scientific_name (scientific_name)
) ENGINE=InnoDB;

-- Batches table: Critical for FIFO and expiration tracking.
-- Inventory is tracked strictly at the base unit level within batches.
CREATE TABLE product_batches (
    batch_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    supplier_id INT UNSIGNED NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    cost_price_per_base_unit DECIMAL(10, 2) NOT NULL CHECK (cost_price_per_base_unit >= 0),
    initial_base_quantity INT UNSIGNED NOT NULL CHECK (initial_base_quantity > 0),
    current_base_quantity INT UNSIGNED NOT NULL CHECK (current_base_quantity >= 0),
    expiration_date DATE NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_batch_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    CONSTRAINT fk_batch_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    UNIQUE KEY uk_product_batch (product_id, batch_number),
    INDEX idx_fifo_lookup (product_id, expiration_date, current_base_quantity)
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
    quantity_base_units INT UNSIGNED NOT NULL CHECK (quantity_base_units > 0),
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
-- 1. SEED USERS (Passwords are placeholders for secure hashes like Argon2id)
-- =====================================================================
INSERT INTO users (username, email, password_hash, first_name, last_name, is_active) VALUES 
('admin_alex', 'alex.admin@pharmacare.com', '123456', 'Alex', 'Vance', TRUE),
('phar_sarah', 'sarah.pharm@pharmacare.com', '123456', 'Sarah', 'Connor', TRUE),
('clerk_john', 'john.clerk@pharmacare.com', '123456', 'John', 'Doe', TRUE);

-- =====================================================================
-- 2. ASSIGN USER ROLES
-- =====================================================================
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1), -- Alex -> ROLE_ADMIN
(2, 2), -- Sarah -> ROLE_PHARMACIST
(3, 3); -- John -> ROLE_INVENTORY_CLERK

-- =====================================================================
-- 3. SEED SUPPLIERS
-- =====================================================================
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES 
('PharmaGlobal Inc.', 'Michael Scott', '+1-800-555-0199', 'orders@pharmaglobal.com', '104 Health Ave, New York, NY'),
('MedDirect Supply', 'Pam Beesly', '+1-800-555-0142', 'support@meddirect.org', '782 Wellness Blvd, Chicago, IL'),
('BioHealth Labs', 'Dwight Schrute', '+1-800-555-0188', 'sales@biohealthlabs.com', '45 Science Pkwy, Boston, MA');

-- =====================================================================
-- 4. SEED PRODUCTS
-- =====================================================================
INSERT INTO products (trade_name, scientific_name, category, unit_multiplier, base_unit_name, selling_price_per_base_unit, min_stock_alert_threshold) VALUES 
('Panadol Extra', 'Paracetamol / Caffeine', 'Analgesics', 20, 'pills', 0.50, 50),
('Amoxil', 'Amoxicillin Trihydrate', 'Antibiotics', 14, 'capsules', 1.20, 30),
('Lipitor', 'Atorvastatin Calcium', 'Statins', 30, 'tablets', 2.50, 40),
('Glucophage', 'Metformin Hydrochloride', 'Antidiabetics', 50, 'tablets', 0.45, 100);

-- =====================================================================
-- 5. SEED PRODUCT BATCHES (FIFO Tracking)
-- =====================================================================
INSERT INTO product_batches (product_id, supplier_id, batch_number, cost_price_per_base_unit, initial_base_quantity, current_base_quantity, expiration_date) VALUES 
(1, 1, 'PAN-2026-A', 0.30, 500, 480, '2028-06-30'),
(2, 2, 'AMX-2026-B', 0.80, 300, 300, '2027-12-15'),
(3, 3, 'LIP-2026-C', 1.80, 200, 190, '2029-01-10'),
(4, 1, 'GLU-2026-D', 0.25, 1000, 950, '2028-09-20');

-- =====================================================================
-- 6. SEED INVOICES (Point of Sale Sales)
-- =====================================================================
INSERT INTO invoices (invoice_number, pharmacist_user_id, total_amount, payment_method, invoice_status) VALUES 
('INV-2026-0001', 2, 25.00, 'CASH', 'COMPLETED'),
('INV-2026-0002', 2, 35.00, 'CARD', 'COMPLETED');

-- =====================================================================
-- 7. SEED INVOICE ITEMS
-- =====================================================================
INSERT INTO invoice_items (invoice_id, product_id, batch_id, quantity_base_units, unit_price, total_price) VALUES 
(1, 1, 1, 20, 0.50, 10.00),
(1, 4, 4, 33, 0.45, 14.85), -- (Adjusted approx to match total roughly or standalone)
(2, 3, 3, 10, 2.50, 25.00),
(2, 1, 1, 20, 0.50, 10.00);

-- =====================================================================
-- 8. SEED STOCK ADJUSTMENTS & RETURN REQUESTS
-- =====================================================================
INSERT INTO stock_adjustments (batch_id, user_id, adjustment_type, quantity_changed, reason) VALUES 
(1, 3, 'DAMAGED', -20, 'Dropped box during warehouse intake shelf stocking');

INSERT INTO return_requests (invoice_id, requested_by_user_id, approved_by_user_id, status, reason) VALUES 
(1, 2, 1, 'APPROVED', 'Customer returned unused items due to doctor changing prescription medication.');