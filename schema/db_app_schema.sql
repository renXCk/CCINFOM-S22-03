-- =====================================================
-- Database Application Project - Group 3 (S22)
-- Schema Template
-- =====================================================

-- =====================================================
-- 						CORE TABLES 
-- =====================================================

-- Vehicle (Ren)
CREATE TABLE Vehicle (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    status ENUM('available','on_trip','maintenance','inactive') DEFAULT 'available',
    mileage INT DEFAULT 0
);


-- Client (Ken)

-- Parts (Duncan)

-- Driver (Leelancze)