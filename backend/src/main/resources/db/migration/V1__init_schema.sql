-- ===============================================================
-- Smart Lost & Found Recovery Platform - V1 Initial Schema
-- ===============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255),
    icon VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Item Reports Table
CREATE TABLE IF NOT EXISTS item_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'LOST', 'FOUND'
    category_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    distinguishing_characteristics TEXT,
    city VARCHAR(100) NOT NULL,
    location_address VARCHAR(255) NOT NULL,
    incident_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'CLAIM_PENDING', 'RESOLVED', 'WITHDRAWN'
    moderation_status VARCHAR(30) NOT NULL DEFAULT 'APPROVED', -- 'APPROVED', 'PENDING_MODERATION', 'REJECTED'
    contact_email VARCHAR(150),
    contact_phone VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_item_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_item_type_status ON item_reports (type, status);
CREATE INDEX idx_item_category ON item_reports (category_id);
CREATE INDEX idx_item_city ON item_reports (city);
CREATE INDEX idx_item_incident_date ON item_reports (incident_date);
CREATE INDEX idx_item_user ON item_reports (user_id);

-- 4. Item Images Table
CREATE TABLE IF NOT EXISTS item_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_report_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    storage_file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_image_item FOREIGN KEY (item_report_id) REFERENCES item_reports (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_image_item_report ON item_images (item_report_id);

-- 5. Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_report_id BIGINT NOT NULL,
    claimant_id BIGINT NOT NULL,
    proof_description TEXT NOT NULL,
    secret_identifiers TEXT, -- Private verification detail
    contact_phone VARCHAR(30),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'
    reviewer_id BIGINT,
    reviewer_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_claim_item FOREIGN KEY (item_report_id) REFERENCES item_reports (id),
    CONSTRAINT fk_claim_claimant FOREIGN KEY (claimant_id) REFERENCES users (id),
    CONSTRAINT fk_claim_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_claim_item ON claims (item_report_id);
CREATE INDEX idx_claim_claimant ON claims (claimant_id);
CREATE INDEX idx_claim_status ON claims (status);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id BIGINT,
    reference_type VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notification_user ON notifications (user_id, is_read);

-- 7. Moderation Reports Table
CREATE TABLE IF NOT EXISTS moderation_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_report_id BIGINT NOT NULL,
    reporter_id BIGINT NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'DISMISSED', 'ACTIONED'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_moderation_item FOREIGN KEY (item_report_id) REFERENCES item_reports (id) ON DELETE CASCADE,
    CONSTRAINT fk_moderation_reporter FOREIGN KEY (reporter_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_moderation_item ON moderation_reports (item_report_id);
CREATE INDEX idx_moderation_status ON moderation_reports (status);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    performed_by VARCHAR(150) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_entity ON audit_logs (entity_name, entity_id);
CREATE INDEX idx_audit_action ON audit_logs (action);
