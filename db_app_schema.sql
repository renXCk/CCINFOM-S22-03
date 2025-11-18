-- =====================================================
-- Database Application Project - Group 3 (S22)
-- Schema Template
-- =====================================================

-- =====================================================
-- 						CORE TABLES 
-- =====================================================

USE deliveryshipment;

-- Vehicle (Ren)
CREATE TABLE IF NOT EXISTS Vehicle (
    vehicle_id 		INT AUTO_INCREMENT NOT NULL,
    plate_number 	VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type 	ENUM('motorcycle','sedan','van','truck') NOT NULL,
    model 			VARCHAR(50) NOT NULL,
    status 			ENUM('available','on_trip','maintenance','inactive') DEFAULT 'available',
    fuel_type 		ENUM('diesel', 'gasoline') NOT NULL DEFAULT 'diesel',
    mileage 		INT DEFAULT 0,
    CONSTRAINT Vehicle_PK PRIMARY KEY (vehicle_id)
);

-- Client (Kenn)
CREATE TABLE IF NOT EXISTS Client (
	client_id		INT AUTO_INCREMENT NOT NULL,
    client_type		VARCHAR(20),
    name			VARCHAR(30) NOT NULL,
	contact_person	VARCHAR(30),
    phone			VARCHAR(20),
    email			VARCHAR(30),
    address         VARCHAR(255),
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
    supplier        VARCHAR(50) NOT NULL,
    pending_delivery    BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT PARTS_PK PRIMARY KEY (part_id)
);

-- Driver (Leelancze)
CREATE TABLE IF NOT EXISTS Driver (
	driver_id		INT AUTO_INCREMENT NOT NULL,
	first_name 		VARCHAR(20) NOT NULL,
	last_name 		VARCHAR(20) NOT NULL,
	license_num 	VARCHAR(20) NOT NULL UNIQUE,
	contact_num		VARCHAR(20) NOT NULL,
	email			VARCHAR(30) NOT NULL,
	status			ENUM('active','inactive','suspended') DEFAULT 'active',
	completed_trips INT DEFAULT 0,
	CONSTRAINT Driver_PK PRIMARY KEY (driver_id)
);

-- =====================================================
--                  TRANSACTION TABLES
-- =====================================================

-- Fuel Log (Ren)
CREATE TABLE IF NOT EXISTS FuelLog (
    fuel_id          INT AUTO_INCREMENT,
    vehicle_id       INT NOT NULL,
    driver_id        INT NOT NULL,
    fuel_date        DATETIME NOT NULL,
    fuel_type        ENUM('diesel', 'gasoline') NOT NULL,
    liters_filled    DECIMAL(8,2) NOT NULL CHECK (liters_filled > 0),
    price_per_liter  DECIMAL(8,2) NOT NULL CHECK (price_per_liter > 0),
    reimbursed       BOOLEAN DEFAULT FALSE, -- TRUE when paid back
	CONSTRAINT Fuel_Log_PK PRIMARY KEY (fuel_id),
    CONSTRAINT FK_Fuel_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id),
    CONSTRAINT FK_Fuel_Driver FOREIGN KEY (driver_id) REFERENCES Driver(driver_id)
);

-- Trip Log (Kenn)
CREATE TABLE IF NOT EXISTS TripLog (
    trip_id         INT AUTO_INCREMENT NOT NULL,
    client_id       INT NOT NULL,
    vehicle_id		INT NOT NULL,
    driver_id       INT NOT NULL,
    pick_up_loc     VARCHAR(255),
    drop_off_loc    VARCHAR(255),
    date_time_start DATETIME,
    date_time_completed     DATETIME,
    trip_cost       INT,
    status          ENUM('Pending','Ongoing','Completed','Cancelled'),
    CONSTRAINT Trip_Log_PK PRIMARY KEY (trip_id),
    CONSTRAINT FK_Trip_Client FOREIGN KEY (client_id) REFERENCES Client(client_id),
    CONSTRAINT FK_Trip_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id),
    CONSTRAINT FK_Trip_Driver FOREIGN KEY (driver_id) REFERENCES Driver(driver_id)
);

-- Maintenance Log (Duncan)
CREATE TABLE IF NOT EXISTS MaintenanceLog (
    maintenance_id      INT AUTO_INCREMENT,
    vehicle_id          INT NOT NULL,
    date_time_start     DATETIME,
    date_time_completed DATETIME,
    status              ENUM('Pending','Ongoing','Completed','Cancelled'),  
    CONSTRAINT Maintenance_Log_PK PRIMARY KEY (maintenance_id),
    CONSTRAINT FK_Maintenance_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- Junction Table for Maintenance Log & Parts
CREATE TABLE IF NOT EXISTS MaintenancePart (
    maintenance_id INT NOT NULL,
    part_id       INT, -- removed not null
    quantity_used INT, -- removed not null
    cost_per_part DECIMAL(10,2),
    CONSTRAINT PK_MaintenancePart PRIMARY KEY (maintenance_id, part_id),
    CONSTRAINT FK_MaintenancePart_Maintenance FOREIGN KEY (maintenance_id) REFERENCES MaintenanceLog(maintenance_id),
    CONSTRAINT FK_MaintenancePart_Part FOREIGN KEY (part_id) REFERENCES Parts(part_id)
);

-- Incident Log (Leelancze)
CREATE TABLE IF NOT EXISTS IncidentLog (
	incident_id		INT AUTO_INCREMENT,
	driver_id		INT NOT NULL,
	vehicle_id		INT NOT NULL,
	incident_type	VARCHAR(50) NOT NULL,
	incident_date_time	DATETIME NOT NULL,
	incident_location	VARCHAR(50) NOT NULL,
	incident_severity	ENUM('Minor', 'Moderate', 'Major'),
    CONSTRAINT Incident_Log_PK PRIMARY KEY (incident_id),
	CONSTRAINT FK_Incident_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id),
    CONSTRAINT FK_Incident_Driver FOREIGN KEY (driver_id) REFERENCES Driver(driver_id)
);

	
	
