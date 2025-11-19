-- =====================================================
-- Database Application Project - Group 3 (S22)
-- Schema Template
-- =====================================================

-- =====================================================
-- 						CORE TABLES 
-- =====================================================

USE deliveryshipment;

-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Truncate all tables (order does not matter here due to step 1)

TRUNCATE TABLE Vehicle;
TRUNCATE TABLE Client;
TRUNCATE TABLE Parts;
TRUNCATE TABLE Driver;
TRUNCATE TABLE FuelLog;
TRUNCATE TABLE TripLog;
TRUNCATE TABLE MaintenanceLog;
TRUNCATE TABLE MaintenancePart;
TRUNCATE TABLE IncidentLog;

-- 3. Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 						DROP TABLES (Removing Structure & Data)
-- =====================================================

-- -- Drop View first
DROP VIEW IF EXISTS VehicleView;

-- -- Drop all tables
DROP TABLE IF EXISTS MaintenancePart;
DROP TABLE IF EXISTS TripLog;
DROP TABLE IF EXISTS FuelLog;
DROP TABLE IF EXISTS IncidentLog;
DROP TABLE IF EXISTS MaintenanceLog;
DROP TABLE IF EXISTS Vehicle;
DROP TABLE IF EXISTS Driver;
DROP TABLE IF EXISTS Client;
DROP TABLE IF EXISTS Parts;

-- Vehicle (Ren)
CREATE TABLE IF NOT EXISTS Vehicle (
    vehicle_id 		INT AUTO_INCREMENT NOT NULL,
    plate_number 	VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type 	ENUM('motorcycle','sedan','van','truck'),
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
    priority_flag	BOOLEAN DEFAULT 0,
    status			ENUM('active','inactive','suspended') DEFAULT 'inactive',
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
    trip_cost       INT DEFAULT 0,
    total_distance  INT DEFAULT 0,
    status          ENUM('pending','ongoing','completed','cancelled', 'archive') DEFAULT 'pending',
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
    description         VARCHAR(255),
    status              ENUM('Pending','Ongoing','Completed','Cancelled'),  
    CONSTRAINT Maintenance_Log_PK PRIMARY KEY (maintenance_id),
    CONSTRAINT FK_Maintenance_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- Junction Table for Maintenance Log & Parts
CREATE TABLE MaintenancePart (
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

CREATE OR REPLACE VIEW VehicleView AS
SELECT 
    v.vehicle_id,
    v.plate_number,
    v.model,
    t.trip_id,
    t.date_time_start,
    t.date_time_completed,
    t.status AS trip_status,
    d.driver_id,
    CONCAT(d.first_name, ' ', d.last_name) AS driver_name,
    d.license_num,
    c.client_id,
    c.name AS client_name,
    c.client_type
FROM TripLog t
JOIN Vehicle v ON t.vehicle_id = v.vehicle_id
JOIN Driver d ON t.driver_id = d.driver_id
JOIN Client c ON t.client_id = c.client_id;

CREATE OR REPLACE VIEW DriverView AS
SELECT DISTINCT
    d.driver_id,
    CONCAT(d.first_name, ' ', d.last_name) AS driver_name,
    d.license_num,
    v.vehicle_id,
    v.plate_number,
    v.model,
    v.vehicle_type
FROM TripLog t
JOIN Driver d ON t.driver_id = d.driver_id
JOIN Vehicle v ON t.vehicle_id = v.vehicle_id;


-- SAMPLE/GENERATED RECORDS 

INSERT INTO Vehicle (plate_number, vehicle_type, model, status, fuel_type, mileage) VALUES
('AB 12345', 'motorcycle', 'Honda Wave', 'available', 'gasoline', 0),
('DEF 456', 'sedan', 'Toyota Corolla', 'on_trip', 'gasoline', 0),
('GHI 789', 'van', 'Nissan NV200', 'maintenance', 'diesel', 0),
('JKL 4567', 'truck', 'Isuzu D-Max', 'available', 'diesel', 0),
('MNO 345', 'sedan', 'Honda Civic', 'inactive', 'gasoline', 0),
('PQR 678', 'motorcycle', 'Yamaha NMAX', 'available', 'gasoline', 0),
('STU 901', 'sedan', 'Toyota Vios', 'available', 'gasoline', 0),
('VWX 2345', 'truck', 'Mitsubishi Canter', 'available', 'diesel', 0),
('YZ 67890', 'motorcycle', 'Honda Click', 'on_trip', 'gasoline', 0),
('ABC 111', 'van', 'Toyota HiAce', 'available', 'diesel', 50),
('DEF 2222', 'truck', 'Ford Ranger', 'maintenance', 'diesel', 0),
('GHI 333', 'sedan', 'Nissan Almera', 'available', 'gasoline', 0),
('JKL 444', 'motorcycle', 'Kawasaki Barako', 'inactive', 'gasoline', 0),
('MNO 5555', 'van', 'Hyundai Starex', 'available', 'diesel', 0),
('PQR 666', 'sedan', 'Mazda 3', 'on_trip', 'gasoline', 120),
('ST 77777', 'motorcycle', 'Suzuki Raider', 'available', 'gasoline', 0),
('VWX 888', 'truck', 'Isuzu Elf', 'available', 'diesel', 0),
('YZ 9999', 'sedan', 'Honda City', 'available', 'gasoline', 0),
('ABC 000', 'van', 'L300', 'maintenance', 'diesel', 0),
('DEF 123', 'motorcycle', 'Honda PCX', 'available', 'gasoline', 0);

INSERT INTO Client (client_type, name, contact_person, phone, email, address, priority_flag, status, completed_orders) VALUES
('Corporate', 'Acme Corp', 'John Doe', '0917-111-2222', 'contact@acme.com', '123 Business Rd, Makati', 1, 'active', 120),
('Individual', 'Jane Smith', 'Jane Smith', '0918-333-4444', 'jane.smith@gmail.com', '456 Residential St, QC', 0, 'active', 5),
('Retail', 'SuperMart', 'Manager Mike', '0919-555-6666', 'supply@supermart.com', '789 Market Ave, Taguig', 1, 'active', 50),
('Corporate', 'Tech Solutions', 'Sarah Lee', '0920-777-8888', 'admin@techsol.com', '101 Tech Park, Pasig', 0, 'inactive', 10);

INSERT INTO Parts (part_name, description, stock_qty, cost, supplier, pending_delivery) VALUES
('Oil Filter', 'Standard Oil Filter', 50, 350.00, 'AutoSupply Co.', 0),
('Brake Pad', 'Ceramic Brake Pads', 20, 1500.00, 'Brake Masters', 1),
('Tire', 'R15 All Season', 10, 4500.00, 'Rubber World', 0),
('Headlight Bulb', 'LED H4', 30, 800.00, 'LightOne', 0),
('Air Filter', 'Cabin Air Filter', 25, 500.00, 'FilterPro', 0),
('Spark Plug', 'Standard Spark Plug', 100, 250.00, 'IgniteTech', 0),
('Battery', '12V Car Battery', 15, 6500.00, 'PowerCells', 1),
('Brake Disc', 'Front Brake Disc', 12, 3200.00, 'Brake Masters', 0),
('Windshield Wiper', 'Wiper Blade Set', 40, 400.00, 'ClearView', 0),
('Coolant', 'Engine Coolant 1L', 60, 300.00, 'CoolTech', 0);

INSERT INTO Driver (first_name, last_name, license_num, contact_num, email, status, completed_trips) VALUES
('Juan', 'Dela Cruz', 'N01-99-123456', '0917-123-4567', 'juan.dc@email.com', 'active', 45),
('Pedro', 'Penduko', 'N02-88-654321', '0918-234-5678', 'pedro.p@email.com', 'active', 32),
('Maria', 'Clara', 'N03-77-987654', '0919-345-6789', 'maria.c@email.com', 'active', 15),
('Jose', 'Rizal', 'N04-66-112233', '0920-456-7890', 'jose.r@email.com', 'suspended', 10),
('Andres', 'Bonifacio', 'N05-55-445566', '0921-567-8901', 'andres.b@email.com', 'inactive', 60);

INSERT INTO FuelLog (vehicle_id, driver_id, fuel_date, fuel_type, liters_filled, price_per_liter, reimbursed) VALUES
(1, 1, '2025-11-15 08:00:00', 'gasoline', 10.5, 75.00, FALSE),
(2, 2, '2025-11-16 09:30:00', 'gasoline', 40.0, 75.50, TRUE),
(3, 3, '2025-11-17 07:45:00', 'diesel', 60.0, 80.00, FALSE),
(4, 4, '2025-11-18 10:15:00', 'diesel', 55.0, 79.50, TRUE),
(5, 5, '2025-11-19 08:30:00', 'gasoline', 35.0, 76.00, FALSE),
(6, 6, '2025-11-19 12:00:00', 'gasoline', 12.5, 75.25, TRUE);

INSERT INTO TripLog (client_id, vehicle_id, driver_id, pick_up_loc, drop_off_loc, date_time_start, date_time_completed, trip_cost, total_distance, status) VALUES
(1, 2, 1, '123 Main St', '456 Oak St', '2025-11-15 08:00:00', '2025-11-15 09:00:00', 500, 15, 'completed'),
(2, 3, 2, '456 Oak St', '789 Pine St', '2025-11-16 10:00:00', '2025-11-16 11:15:00', 700, 25, 'completed'),
(3, 4, 3, '789 Pine St', '321 Elm St', '2025-11-17 09:30:00', NULL, 0, 0, 'ongoing'),
(4, 1, 4, '321 Elm St', '654 Cedar St', '2025-11-18 07:45:00', '2025-11-18 09:00:00', 450, 20, 'completed'),
(5, 5, 5, '654 Cedar St', '987 Spruce St', '2025-11-19 08:15:00', NULL, 0, 0, 'pending'),
(6, 6, 6, '987 Spruce St', '123 Main St', '2025-11-19 10:00:00', NULL, 0, 0, 'pending');

INSERT INTO MaintenanceLog (vehicle_id, date_time_start, date_time_completed, description, status) VALUES
(1, '2025-11-01 08:00:00', '2025-11-01 12:00:00', 'Routine 50,000 km service and oil change.', 'Completed'),
(2, '2025-11-02 09:00:00', '2025-11-02 14:00:00', 'Replaced all brake pads and rotors.', 'Completed'),
(3, '2025-11-03 07:30:00', NULL, 'Diagnosing intermittent engine stalling issue.', 'Ongoing'),
(4, '2025-11-04 10:00:00', '2025-11-04 15:30:00', 'Fixed damaged side mirror and repainted door.', 'Completed'),
(5, '2025-11-05 08:45:00', NULL, 'Waiting for new transmission fluid and filter.', 'Pending'),
(6, '2025-11-06 09:15:00', '2025-11-06 13:00:00', 'Scheduled tire rotation was cancelled by driver.', 'Cancelled'),
(7, '2025-11-07 08:00:00', '2025-11-07 11:30:00', 'Replaced faulty headlight bulb assembly.', 'Completed'),
(8, '2025-11-08 09:30:00', NULL, 'Major engine overhaul requiring parts delivery.', 'Ongoing'),
(9, '2025-11-09 10:15:00', '2025-11-09 14:00:00', 'Routine inspection and chassis lubrication.', 'Completed'),
(10, '2025-11-10 07:00:00', '2025-11-10 12:30:00', 'Checked and refilled AC coolant system.', 'Completed'),
(11, '2025-11-11 08:45:00', NULL, 'Diagnostic check requested due to unusual noise.', 'Pending'),
(12, '2025-11-12 09:20:00', '2025-11-12 15:00:00', 'Replaced two worn-out front tires.', 'Completed'),
(13, '2025-11-13 07:50:00', NULL, 'Repairing a punctured fuel line in the engine bay.', 'Ongoing'),
(14, '2025-11-14 10:10:00', '2025-11-14 13:30:00', 'Scheduled repair for minor dent was cancelled.', 'Cancelled'),
(15, '2025-11-15 08:30:00', '2025-11-15 12:00:00', 'Standard oil and filter change service.', 'Completed'),
(16, '2025-11-16 09:00:00', NULL, 'Waiting for technician availability for deep cleaning.', 'Pending'),
(17, '2025-11-17 08:15:00', '2025-11-17 11:45:00', 'Fixed loose battery terminal and cleaned contacts.', 'Completed'),
(18, '2025-11-18 09:40:00', NULL, 'Troubleshooting an electronic dash malfunction.', 'Ongoing'),
(19, '2025-11-19 07:50:00', '2025-11-19 13:00:00', 'Replaced worn wiper blades and top-up fluids.', 'Completed'),
(20, '2025-11-20 10:05:00', NULL, 'Awaiting approval for body work estimate.', 'Pending');

INSERT INTO MaintenancePart (maintenance_id, part_id, quantity_used, cost_per_part) VALUES
(1, 1, 2, 350.00),
(1, 2, 4, 1500.00),
(2, 3, 6, 4500.00),
(3, 5, 1, 500.00),
(4, 4, 1, 2500.00),
(5, 6, 2, 250.00),
(6, 2, 2, 1500.00),
(7, 1, 3, 350.00),
(7, 7, 1, 6500.00),
(8, 8, 2, 3200.00),
(9, 3, 2, 4500.00),
(10, 2, 1, 1500.00),
(10, 9, 2, 400.00),
(11, 5, 1, 500.00),
(12, 4, 1, 2500.00),
(13, 6, 2, 250.00),
(14, 8, 1, 3200.00),
(15, 1, 4, 350.00),
(16, 7, 1, 6500.00),
(17, 3, 2, 4500.00),
(18, 9, 1, 400.00),
(19, 2, 1, 1500.00),
(20, 10, 3, 300.00);

INSERT INTO IncidentLog (driver_id, vehicle_id, incident_type, incident_date_time, incident_location, incident_severity) VALUES
(1, 1, 'Minor Scratch', '2025-11-15 08:30:00', '123 Main St', 'Minor'),
(2, 2, 'Flat Tire', '2025-11-16 09:45:00', '456 Oak St', 'Moderate'),
(3, 3, 'Engine Failure', '2025-11-17 10:15:00', '789 Pine St', 'Major'),
(4, 4, 'Rear-end Collision', '2025-11-18 07:50:00', '321 Elm St', 'Moderate'),
(5, 5, 'Broken Headlight', '2025-11-19 08:45:00', '654 Cedar St', 'Minor'),
(6, 6, 'Oil Spill', '2025-11-19 11:00:00', '987 Spruce St', 'Major');