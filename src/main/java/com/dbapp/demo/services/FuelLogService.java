package com.dbapp.demo.services;

import com.dbapp.demo.model.Driver;
import com.dbapp.demo.model.Vehicle;
import com.dbapp.demo.dao.DriverDAO;
import com.dbapp.demo.dao.VehicleDAO;
import com.dbapp.demo.model.FuelLog;
import com.dbapp.demo.dao.FuelLogDAO;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class FuelLogService {
    private final FuelLogDAO fuelLogDAO = new FuelLogDAO();
    private final VehicleDAO vehicleDAO = new VehicleDAO();
    private final DriverDAO driverDAO = new DriverDAO();

    public boolean addFuelLog(FuelLog fuelLog) {
        Vehicle vehicle = vehicleDAO.getVehicleById(fuelLog.getVehicleId());
        if (vehicle == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        String status = vehicle.getStatus();
        if (!status.equals("available") && !status.equals("on_trip")) {
            System.err.println("Vehicle status must be 'available' or 'on_trip'. Current status: " + status);
            return false;
        }

        List<Driver> drivers = driverDAO.readDrivers();
        boolean driverExists = drivers.stream()
                .anyMatch(d -> d.getDriverId() == fuelLog.getDriverId());
        if (!driverExists) {
            System.err.println("Driver does not exist");
            return false;
        }

        if (!fuelLog.getFuelType().equalsIgnoreCase(vehicle.getFuelType())) {
            System.err.println("Fuel type '" + fuelLog.getFuelType() +
                    "' does not match vehicle's fuel type '" + vehicle.getFuelType() + "'");
            return false;
        }

        Timestamp now = new Timestamp(System.currentTimeMillis());
        if (fuelLog.getFuelDate().after(now)) {
            System.err.println("Fuel date cannot be in the future");
            return false;
        }

        if (fuelLog.getLitersFilled() <= 0) {
            System.err.println("Liters filled must be greater than 0");
            return false;
        }
        if (fuelLog.getPricePerLiter() <= 0) {
            System.err.println("Price per liter must be greater than 0");
            return false;
        }

        return fuelLogDAO.createFuelLog(fuelLog);
    }

    public List<FuelLog> getAllFuelLogs() {
        return fuelLogDAO.readFuelLogs();
    }

    public List<FuelLog> getFuelLogsByVehicle(int vehicleId) {
        return fuelLogDAO.getFuelLogsByVehicle(vehicleId);
    }

    public List<FuelLog> getFuelLogsByDriver(int driverId) {
        return fuelLogDAO.getFuelLogsByDriver(driverId);
    }

    public boolean updateFuelLog(FuelLog fuelLog) {
        Vehicle vehicle = vehicleDAO.getVehicleById(fuelLog.getVehicleId());
        if (vehicle == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        if (!fuelLog.getFuelType().equalsIgnoreCase(vehicle.getFuelType())) {
            System.err.println("Fuel type does not match vehicle's fuel type");
            return false;
        }

        Timestamp now = new Timestamp(System.currentTimeMillis());
        if (fuelLog.getFuelDate().after(now)) {
            System.err.println("Invalid fuel date");
            return false;
        }

        if (fuelLog.getLitersFilled() <= 0 || fuelLog.getPricePerLiter() <= 0) {
            System.err.println("Liters and price must be greater than 0");
            return false;
        }

        return fuelLogDAO.updateFuelLog(fuelLog);
    }


    public boolean markAsReimbursed(int fuelId) {
        return fuelLogDAO.updateReimbursementStatus(fuelId, true);
    }
    public boolean deleteFuelLog(int fuelId) {
        return fuelLogDAO.deleteFuelLog(fuelId);
    }

    public double calculateTotalFuelCostByVehicle(int vehicleId) {
        List<FuelLog> logs = fuelLogDAO.getFuelLogsByVehicle(vehicleId);
        return logs.stream().mapToDouble(FuelLog::getTotalCost).sum();
    }

    public List<FuelLog> getUnreimbursedFuelLogs() {
        return fuelLogDAO.readFuelLogs().stream()
                .filter(log -> !log.isReimbursed())
                .toList();
    }

    public FuelLog getFuelLogById(int fuelId) {
        return fuelLogDAO.getFuelLogById(fuelId);
    }
}
