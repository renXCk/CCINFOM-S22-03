-- =====================================================
-- Database Application Project - Group 3 (S22)
-- Schema Template
-- =====================================================

-- =====================================================
-- 						CORE TABLES 
-- =====================================================

-- Vehicle (Ren)
CREATE TABLE Vehicle (
    vehicle_id 		INT AUTO_INCREMENT NOT NULL,
    plate_number 	VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type 	VARCHAR(50) NOT NULL,
    model 			VARCHAR(50) NOT NULL,
    status 			ENUM('available','on_trip','maintenance','inactive') DEFAULT 'available',
    mileage 		INT DEFAULT 0,
    CONSTRAINT Vehicle_PK PRIMARY KEY (vehicle_id)
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
CREATE TABLE IF NOT EXISTS Parts (
    part_id         INT AUTO_INCREMENT NOT NULL,
    part_name       VARCHAR(30) NOT NULL,
    description     VARCHAR(50),
    stock_qty       INT NOT NULL DEFAULT 0,
    cost            DECIMAL(10,2) NOT NULL DEFAULT 0,
    supplier        VARCHAR(50) NTO NULL,
    pending_delivery    BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT PARTS_PK PRIMARY KEY (part_id)
);

-- Driver (Leelancze)
CREATE TABLE Driver (
	driver_id		INT AUTO_INCREMENT NOT NULL,
	first_name 		VARCHAR(20),
	last_name 		VARCHAR(20),
	license_num 	VARCHAR(20),
	contact_num		VARCHAR(20),
	email			VARCHAR(30),
	status			ENUM('active','inactive','suspended') DEFAULT 'active',
	completed_trips INT DEFAULT 0,
	CONSTRAINT Driver_PK PRIMARY KEY (driver_id)
);
