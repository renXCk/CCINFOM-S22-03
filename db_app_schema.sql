-- =====================================================
-- Database Application Project - Group 3 (S22)
-- Schema & Data Population
-- =====================================================

USE deliveryshipment;

-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 						DROP TABLES 
-- =====================================================

DROP VIEW IF EXISTS VehicleView;
DROP VIEW IF EXISTS DriverView;

DROP TABLE IF EXISTS MaintenancePart;
DROP TABLE IF EXISTS TripLog;
DROP TABLE IF EXISTS FuelLog;
DROP TABLE IF EXISTS IncidentLog;
DROP TABLE IF EXISTS MaintenanceLog;
DROP TABLE IF EXISTS Vehicle;
DROP TABLE IF EXISTS Driver;
DROP TABLE IF EXISTS Client;
DROP TABLE IF EXISTS Parts;

-- =====================================================
-- 						CREATE TABLES 
-- =====================================================

-- Vehicle (Ren)
CREATE TABLE IF NOT EXISTS Vehicle (
    vehicle_id      INT AUTO_INCREMENT NOT NULL,
    plate_number    VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type    ENUM('motorcycle','sedan','van','truck'),
    model           VARCHAR(50) NOT NULL,
    status          ENUM('available','on_trip','maintenance','inactive') DEFAULT 'available',
    fuel_type       ENUM('diesel', 'gasoline') NOT NULL DEFAULT 'diesel',
    mileage         INT DEFAULT 0,
    CONSTRAINT Vehicle_PK PRIMARY KEY (vehicle_id)
);

-- Client (Kenn)
CREATE TABLE IF NOT EXISTS Client (
    client_id       INT AUTO_INCREMENT NOT NULL,
    client_type     VARCHAR(20),
    name            VARCHAR(30) NOT NULL,
    contact_person  VARCHAR(30),
    phone           VARCHAR(20),
    email           VARCHAR(30),
    address         VARCHAR(255),
    priority_flag   BOOLEAN DEFAULT 0,
    status          ENUM('active','inactive','suspended') DEFAULT 'inactive',
    completed_orders    INT DEFAULT 0,
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
    driver_id       INT AUTO_INCREMENT NOT NULL,
    first_name      VARCHAR(20) NOT NULL,
    last_name       VARCHAR(20) NOT NULL,
    license_num     VARCHAR(20) NOT NULL UNIQUE,
    contact_num     VARCHAR(20) NOT NULL,
    email           VARCHAR(30) NOT NULL,
    status          ENUM('active','inactive','suspended') DEFAULT 'active',
    completed_trips INT DEFAULT 0,
    CONSTRAINT Driver_PK PRIMARY KEY (driver_id)
);

-- Fuel Log (Ren)
CREATE TABLE IF NOT EXISTS FuelLog (
    fuel_id          INT AUTO_INCREMENT,
    vehicle_id       INT NOT NULL,
    driver_id        INT NOT NULL,
    fuel_date        DATETIME NOT NULL,
    fuel_type        ENUM('diesel', 'gasoline') NOT NULL,
    liters_filled    DECIMAL(8,2) NOT NULL CHECK (liters_filled > 0),
    price_per_liter  DECIMAL(8,2) NOT NULL CHECK (price_per_liter > 0),
    reimbursed       BOOLEAN DEFAULT FALSE,
    CONSTRAINT Fuel_Log_PK PRIMARY KEY (fuel_id),
    CONSTRAINT FK_Fuel_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id),
    CONSTRAINT FK_Fuel_Driver FOREIGN KEY (driver_id) REFERENCES Driver(driver_id)
);

-- Trip Log (Kenn)
CREATE TABLE IF NOT EXISTS TripLog (
    trip_id         INT AUTO_INCREMENT NOT NULL,
    client_id       INT NOT NULL,
    vehicle_id      INT NOT NULL,
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
    status              ENUM('Pending','Ongoing','Completed','Cancelled'),  
    CONSTRAINT Maintenance_Log_PK PRIMARY KEY (maintenance_id),
    CONSTRAINT FK_Maintenance_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- Junction Table for Maintenance Log & Parts
CREATE TABLE MaintenancePart (
    maintenance_id INT NOT NULL,
    part_id       INT, 
    quantity_used INT, 
    cost_per_part DECIMAL(10,2),
    CONSTRAINT PK_MaintenancePart PRIMARY KEY (maintenance_id, part_id),
    CONSTRAINT FK_MaintenancePart_Maintenance FOREIGN KEY (maintenance_id) REFERENCES MaintenanceLog(maintenance_id),
    CONSTRAINT FK_MaintenancePart_Part FOREIGN KEY (part_id) REFERENCES Parts(part_id)
);

-- Incident Log (Leelancze)
CREATE TABLE IF NOT EXISTS IncidentLog (
    incident_id     INT AUTO_INCREMENT,
    driver_id       INT NOT NULL,
    vehicle_id      INT NOT NULL,
    incident_type   VARCHAR(50) NOT NULL,
    incident_date_time  DATETIME NOT NULL,
    incident_location   VARCHAR(50) NOT NULL,
    incident_severity   ENUM('Minor', 'Moderate', 'Major'),
    CONSTRAINT Incident_Log_PK PRIMARY KEY (incident_id),
    CONSTRAINT FK_Incident_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id),
    CONSTRAINT FK_Incident_Driver FOREIGN KEY (driver_id) REFERENCES Driver(driver_id)
);

-- =====================================================
-- 						VIEWS
-- =====================================================

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

-- =====================================================
-- 						POPULATE DATA
-- =====================================================

-- 1. Vehicles (20 Records)
INSERT INTO Vehicle (plate_number, vehicle_type, model, status, fuel_type, mileage) VALUES
('AB 12345', 'motorcycle', 'Honda Wave', 'available', 'gasoline', 1200),
('DEF 456', 'sedan', 'Toyota Corolla', 'on_trip', 'gasoline', 45000),
('GHI 789', 'van', 'Nissan NV200', 'maintenance', 'diesel', 80000),
('JKL 4567', 'truck', 'Isuzu D-Max', 'available', 'diesel', 12000),
('MNO 345', 'sedan', 'Honda Civic', 'inactive', 'gasoline', 60000),
('PQR 678', 'motorcycle', 'Yamaha NMAX', 'available', 'gasoline', 5000),
('STU 901', 'sedan', 'Toyota Vios', 'available', 'gasoline', 25000),
('VWX 2345', 'truck', 'Mitsubishi Canter', 'available', 'diesel', 100000),
('YZ 67890', 'motorcycle', 'Honda Click', 'on_trip', 'gasoline', 3000),
('ABC 111', 'van', 'Toyota HiAce', 'available', 'diesel', 50),
('DEF 2222', 'truck', 'Ford Ranger', 'maintenance', 'diesel', 35000),
('GHI 333', 'sedan', 'Nissan Almera', 'available', 'gasoline', 40000),
('JKL 444', 'motorcycle', 'Kawasaki Barako', 'inactive', 'gasoline', 15000),
('MNO 5555', 'van', 'Hyundai Starex', 'available', 'diesel', 95000),
('PQR 666', 'sedan', 'Mazda 3', 'on_trip', 'gasoline', 120),
('ST 77777', 'motorcycle', 'Suzuki Raider', 'available', 'gasoline', 800),
('VWX 888', 'truck', 'Isuzu Elf', 'available', 'diesel', 150000),
('YZ 9999', 'sedan', 'Honda City', 'available', 'gasoline', 32000),
('ABC 000', 'van', 'L300', 'maintenance', 'diesel', 200000),
('DEF 123', 'motorcycle', 'Honda PCX', 'available', 'gasoline', 4500);

-- 2. Clients (15 Records)
INSERT INTO Client (client_type, name, contact_person, phone, email, address, priority_flag, status, completed_orders) VALUES
('Corporate', 'Acme Corp', 'John Doe', '0917-111-2222', 'contact@acme.com', '123 Business Rd, Makati', 1, 'active', 120),
('Individual', 'Jane Smith', 'Jane Smith', '0918-333-4444', 'jane.smith@gmail.com', '456 Residential St, QC', 0, 'active', 5),
('Retail', 'SuperMart', 'Manager Mike', '0919-555-6666', 'supply@supermart.com', '789 Market Ave, Taguig', 1, 'active', 50),
('Corporate', 'Tech Solutions', 'Sarah Lee', '0920-777-8888', 'admin@techsol.com', '101 Tech Park, Pasig', 0, 'inactive', 10),
('Retail', 'Hardware Haven', 'Peter Pan', '0921-888-9999', 'orders@hhaven.com', '55 Industrial Ave, Valenzuela', 1, 'active', 75),
('Corporate', 'Logistics Pro', 'Mary Grace', '0922-777-6666', 'support@logipro.com', '88 Cargo Lane, Paranaque', 1, 'active', 200),
('Individual', 'Carlos Garcia', 'Carlos Garcia', '0923-555-4444', 'carlos.g@yahoo.com', '12 Village Rd, Las Pinas', 0, 'active', 2),
('Retail', 'Gadget Corner', 'Alex Tan', '0924-333-2222', 'alex@gcorner.com', '34 Cyberzone, Mandaluyong', 1, 'active', 45),
('Corporate', 'Food Express', 'Chef Tony', '0925-111-0000', 'orders@foodex.com', '90 Culinary St, San Juan', 1, 'active', 150),
('Individual', 'Linda Cruz', 'Linda Cruz', '0926-999-8888', 'linda.c@gmail.com', '78 Sampaguita St, Manila', 0, 'inactive', 0),
('Retail', 'Fashion Forward', 'Bella Swan', '0927-777-5555', 'contact@ffwd.com', '23 High St, BGC', 0, 'active', 20),
('Corporate', 'Build Rite', 'Engr. Santos', '0928-555-3333', 'procure@buildrite.com', '67 Const Ave, QC', 1, 'active', 90),
('Individual', 'Marky Polo', 'Marky Polo', '0929-333-1111', 'marky@gmail.com', '45 Condo Unit, Pasig', 0, 'active', 8),
('Retail', 'Pet Pals', 'Doc Vet', '0930-111-9999', 'info@petpals.com', '12 Animal Lane, Marikina', 0, 'active', 15),
('Corporate', 'Office Depot', 'Admin Alice', '0931-999-7777', 'supply@odepot.com', '56 Office Tower, Makati', 1, 'active', 110);

-- 3. Parts (15 Records)
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
('Coolant', 'Engine Coolant 1L', 60, 300.00, 'CoolTech', 0),
('Alternator', '12V 90A Alternator', 5, 8500.00, 'ElectroParts', 1),
('Starter Motor', 'Heavy Duty Starter', 8, 7500.00, 'ElectroParts', 0),
('Radiator', 'Aluminum Radiator', 6, 5500.00, 'CoolTech', 0),
('Clutch Kit', 'Complete Clutch Set', 10, 4500.00, 'GearHeads', 1),
('Fuel Pump', 'Electric Fuel Pump', 15, 3500.00, 'FuelSys', 0);

-- 4. Drivers (15 Records)
INSERT INTO Driver (first_name, last_name, license_num, contact_num, email, status, completed_trips) VALUES
('Juan', 'Dela Cruz', 'N01-99-123456', '0917-123-4567', 'juan.dc@email.com', 'active', 45),
('Pedro', 'Penduko', 'N02-88-654321', '0918-234-5678', 'pedro.p@email.com', 'active', 32),
('Maria', 'Clara', 'N03-77-987654', '0919-345-6789', 'maria.c@email.com', 'active', 15),
('Jose', 'Rizal', 'N04-66-112233', '0920-456-7890', 'jose.r@email.com', 'suspended', 10),
('Andres', 'Bonifacio', 'N05-55-445566', '0921-567-8901', 'andres.b@email.com', 'inactive', 60),
('Emilio', 'Aguinaldo', 'N06-44-112233', '0922-111-2222', 'emilio.a@email.com', 'active', 25),
('Apolinario', 'Mabini', 'N07-33-445566', '0923-333-4444', 'apol.m@email.com', 'inactive', 5),
('Melchora', 'Aquino', 'N08-22-778899', '0924-555-6666', 'melchora.a@email.com', 'active', 80),
('Gabriela', 'Silang', 'N09-11-009988', '0925-777-8888', 'gab.s@email.com', 'active', 40),
('Antonio', 'Luna', 'N10-00-110022', '0926-999-0000', 'antonio.l@email.com', 'suspended', 12),
('Gregorio', 'Del Pilar', 'N11-99-223344', '0927-222-3333', 'greg.dp@email.com', 'active', 28),
('Marcelo', 'Del Pilar', 'N12-88-556677', '0928-444-5555', 'marcelo.dp@email.com', 'active', 35),
('Graciano', 'Lopez Jaena', 'N13-77-889900', '0929-666-7777', 'graciano.lj@email.com', 'inactive', 0),
('Juan', 'Luna', 'N14-66-123123', '0930-888-9999', 'juan.l@email.com', 'active', 55),
('Diego', 'Silang', 'N15-55-456456', '0931-000-1111', 'diego.s@email.com', 'active', 22);

-- 5. FuelLog (15 Records)
INSERT INTO FuelLog (vehicle_id, driver_id, fuel_date, fuel_type, liters_filled, price_per_liter, reimbursed) VALUES
(1, 1, '2025-11-15 08:00:00', 'gasoline', 10.5, 75.00, FALSE),
(2, 2, '2025-11-16 09:30:00', 'gasoline', 40.0, 75.50, TRUE),
(3, 3, '2025-11-17 07:45:00', 'diesel', 60.0, 80.00, FALSE),
(4, 4, '2025-11-18 10:15:00', 'diesel', 55.0, 79.50, TRUE),
(5, 5, '2025-11-19 08:30:00', 'gasoline', 35.0, 76.00, FALSE),
(6, 6, '2025-11-19 12:00:00', 'gasoline', 12.5, 75.25, TRUE),
(7, 7, '2025-11-20 07:00:00', 'gasoline', 30.0, 76.00, TRUE),
(8, 8, '2025-11-20 14:00:00', 'diesel', 70.0, 80.50, FALSE),
(9, 9, '2025-11-21 09:00:00', 'gasoline', 5.0, 75.50, TRUE),
(10, 10, '2025-11-21 11:30:00', 'diesel', 45.0, 79.00, FALSE),
(11, 11, '2025-11-22 08:15:00', 'diesel', 65.0, 81.00, TRUE),
(12, 12, '2025-11-22 15:45:00', 'gasoline', 38.0, 76.50, FALSE),
(13, 13, '2025-11-23 10:00:00', 'gasoline', 8.0, 75.00, TRUE),
(14, 14, '2025-11-23 13:30:00', 'diesel', 50.0, 79.50, FALSE),
(15, 15, '2025-11-24 09:20:00', 'gasoline', 42.0, 76.00, TRUE);

-- 6. TripLog (15 Records)
INSERT INTO TripLog (client_id, vehicle_id, driver_id, pick_up_loc, drop_off_loc, date_time_start, date_time_completed, trip_cost, total_distance, status) VALUES
(1, 2, 1, '123 Main St', '456 Oak St', '2025-11-15 08:00:00', '2025-11-15 09:00:00', 500, 15, 'completed'),
(2, 3, 2, '456 Oak St', '789 Pine St', '2025-11-16 10:00:00', '2025-11-16 11:15:00', 700, 25, 'completed'),
(3, 4, 3, '789 Pine St', '321 Elm St', '2025-11-17 09:30:00', NULL, 0, 0, 'ongoing'),
(4, 1, 4, '321 Elm St', '654 Cedar St', '2025-11-18 07:45:00', '2025-11-18 09:00:00', 450, 20, 'completed'),
(5, 5, 5, '654 Cedar St', '987 Spruce St', '2025-11-19 08:15:00', NULL, 0, 0, 'pending'),
(6, 6, 6, '987 Spruce St', '123 Main St', '2025-11-19 10:00:00', NULL, 0, 0, 'pending'),
(7, 7, 7, 'Makati Ave', 'BGC Taguig', '2025-11-20 07:30:00', '2025-11-20 08:30:00', 300, 10, 'completed'),
(8, 8, 8, 'Pasig Blvd', 'Ortigas Ctr', '2025-11-20 14:00:00', '2025-11-20 15:30:00', 1200, 40, 'completed'),
(9, 9, 9, 'Quezon Ave', 'Cubao', '2025-11-21 09:00:00', NULL, 0, 0, 'ongoing'),
(10, 10, 10, 'Alabang Zapote', 'Nuvali', '2025-11-21 11:00:00', '2025-11-21 13:00:00', 1500, 50, 'completed'),
(11, 11, 11, 'Roxas Blvd', 'Intramuros', '2025-11-22 08:00:00', NULL, 0, 0, 'pending'),
(12, 12, 12, 'Commonwealth', 'Fairview', '2025-11-22 15:00:00', '2025-11-22 16:30:00', 600, 18, 'completed'),
(13, 13, 13, 'Marikina Hts', 'Antipolo', '2025-11-23 10:00:00', NULL, 0, 0, 'cancelled'),
(14, 14, 14, 'NLEX Entry', 'Pampanga', '2025-11-23 13:00:00', '2025-11-23 16:00:00', 4500, 120, 'completed'),
(15, 15, 15, 'SLEX Entry', 'Batangas', '2025-11-24 09:00:00', NULL, 0, 0, 'pending');

-- 7. MaintenanceLog (20 Records)
INSERT INTO MaintenanceLog (vehicle_id, date_time_start, date_time_completed, status) VALUES
(1, '2025-11-01 08:00:00', '2025-11-01 12:00:00', 'Completed'),
(2, '2025-11-02 09:00:00', '2025-11-02 14:00:00', 'Completed'),
(3, '2025-11-03 07:30:00', NULL, 'Ongoing'),
(4, '2025-11-04 10:00:00', '2025-11-04 15:30:00', 'Completed'),
(5, '2025-11-05 08:45:00', NULL, 'Pending'),
(6, '2025-11-06 09:15:00', '2025-11-06 13:00:00', 'Cancelled'),
(7, '2025-11-07 08:00:00', '2025-11-07 11:30:00', 'Completed'),
(8, '2025-11-08 09:30:00', NULL, 'Ongoing'),
(9, '2025-11-09 10:15:00', '2025-11-09 14:00:00', 'Completed'),
(10, '2025-11-10 07:00:00', '2025-11-10 12:30:00', 'Completed'),
(11, '2025-11-11 08:45:00', NULL, 'Pending'),
(12, '2025-11-12 09:20:00', '2025-11-12 15:00:00', 'Completed'),
(13, '2025-11-13 07:50:00', NULL, 'Ongoing'),
(14, '2025-11-14 10:10:00', '2025-11-14 13:30:00', 'Cancelled'),
(15, '2025-11-15 08:30:00', '2025-11-15 12:00:00', 'Completed'),
(16, '2025-11-16 09:00:00', NULL, 'Pending'),
(17, '2025-11-17 08:15:00', '2025-11-17 11:45:00', 'Completed'),
(18, '2025-11-18 09:40:00', NULL, 'Ongoing'),
(19, '2025-11-19 07:50:00', '2025-11-19 13:00:00', 'Completed'),
(20, '2025-11-20 10:05:00', NULL, 'Pending');

-- 8. MaintenancePart (23 Records)
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

-- 9. IncidentLog (15 Records)
INSERT INTO IncidentLog (driver_id, vehicle_id, incident_type, incident_date_time, incident_location, incident_severity) VALUES
(1, 1, 'Minor Scratch', '2025-11-15 08:30:00', '123 Main St', 'Minor'),
(2, 2, 'Flat Tire', '2025-11-16 09:45:00', '456 Oak St', 'Moderate'),
(3, 3, 'Engine Failure', '2025-11-17 10:15:00', '789 Pine St', 'Major'),
(4, 4, 'Rear-end Collision', '2025-11-18 07:50:00', '321 Elm St', 'Moderate'),
(5, 5, 'Broken Headlight', '2025-11-19 08:45:00', '654 Cedar St', 'Minor'),
(6, 6, 'Oil Spill', '2025-11-19 11:00:00', '987 Spruce St', 'Major'),
(7, 7, 'Side Mirror Broken', '2025-11-20 07:40:00', 'Makati Ave', 'Minor'),
(8, 8, 'Bumper Dent', '2025-11-20 14:15:00', 'Pasig Blvd', 'Minor'),
(9, 9, 'Traffic Violation', '2025-11-21 09:10:00', 'Quezon Ave', 'Minor'),
(10, 10, 'Overheating', '2025-11-21 12:00:00', 'Alabang', 'Moderate'),
(11, 11, 'Flat Tire', '2025-11-22 08:10:00', 'Roxas Blvd', 'Minor'),
(12, 12, 'Brake Issue', '2025-11-22 15:30:00', 'Commonwealth', 'Major'),
(13, 13, 'Dead Battery', '2025-11-23 10:10:00', 'Marikina', 'Moderate'),
(14, 14, 'Windshield Crack', '2025-11-23 14:00:00', 'NLEX', 'Moderate'),
(15, 15, 'Minor Scratch', '2025-11-24 09:10:00', 'SLEX', 'Minor');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;