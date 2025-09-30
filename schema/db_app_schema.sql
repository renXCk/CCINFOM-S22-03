-- =====================================================
-- Database Application Project - Group 3 (S22)
-- Schema Template
-- =====================================================

-- =====================================================
-- 						CORE TABLES 
-- =====================================================

-- Vehicle (Ren)
CREATE TABLE Vehicle (
    vehicle_id 		INT AUTO_INCREMENT PRIMARY KEY,
    plate_number 	VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type 	VARCHAR(50) NOT NULL,
    model 			VARCHAR(50) NOT NULL,
    status 			ENUM('available','on_trip','maintenance','inactive') DEFAULT 'available',
    mileage 		INT DEFAULT 0
);

-- Client (Ken)
CREATE TABLE IF NOT EXISTS client (
	client_id		INT AUTO_INCREMENT NOT NULL,
    client_type		VARCHAR(20),
    name			VARCHAR(30) NOT NULL,
	contact_person	VARCHAR(30),
    phone			VARCHAR(20),
    email			VARCHAR(30),
    priority_flag	BOOLEAN,
    status			ENUM('active','inactive','suspended') DEFAULT 'active',
    completed_orders 	INT DEFAULT 0,
    CONSTRAINT Client_PK PRIMARY KEY (client_id)
);

-- Parts (Duncan)

-- Driver (Leelancze)