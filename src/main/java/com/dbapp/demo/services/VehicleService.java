package com.dbapp.demo.services;

import com.dbapp.demo.model.Vehicle;
import com.dbapp.demo.dao.VehicleDAO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {
    private final VehicleDAO dao = new VehicleDAO();

    public boolean addVehicle(Vehicle v) {
        if (v.getPlateNumber() == null || v.getPlateNumber().trim().isEmpty()) {
            System.err.println("Plate number cannot be empty");
            return false;
        }
        if (v.getVehicleType() == null || v.getVehicleType().trim().isEmpty()) {
            System.err.println("Vehicle type cannot be empty");
            return false;
        }
        if (v.getModel() == null || v.getModel().trim().isEmpty()) {
            System.err.println("Model cannot be empty");
            return false;
        }
        if (v.getStatus() == null || v.getStatus().trim().isEmpty()) {
            System.err.println("Status cannot be empty");
            return false;
        }
        if (v.getFuelType() == null || v.getFuelType().trim().isEmpty()) {
            System.err.println("Invalid Fuel Type");
            return false;
        }

        String vehicleType = v.getVehicleType().toLowerCase();
        if (!vehicleType.equals("motorcycle") && !vehicleType.equals("sedan") &&
                !vehicleType.equals("van") && !vehicleType.equals("truck")) {
            System.err.println("Invalid Vehicle Type");
            return false;
        }

        String status = v.getStatus().toLowerCase();
        if (!status.equals("available") && !status.equals("on_trip") &&
                !status.equals("maintenance") && !status.equals("inactive")) {
            System.err.println("Invalid Status");
            return false;
        }

        String fuelType = v.getFuelType().toLowerCase();
        if (!fuelType.equals("diesel") && !fuelType.equals("gasoline")) {
            System.err.println("VFuel type must be either diesel or gasoline");
            return false;
        }

        if (v.getMileage() < 0) {
            System.err.println("Mileage cannot be negative");
            return false;
        }

        List<Vehicle> existingVehicles = dao.readVehicles();
        boolean plateExists = existingVehicles.stream()
                .anyMatch(vehicle -> vehicle.getPlateNumber().equalsIgnoreCase(v.getPlateNumber()));
        if (plateExists) {
            System.err.println("Plate number already exists");
            return false;
        }

        return dao.createVehicle(v);
    }

    public List<Vehicle> getAllVehicles() {
        return dao.readVehicles();
    }

    public List<Vehicle> getActiveVehicles() {
        return dao.readActiveVehicles();
    }

    public Vehicle getVehicleById(int vehicleId) {
        return dao.getVehicleById(vehicleId);
    }


    public boolean updateVehicle(Vehicle v) {

        Vehicle existingVehicle = dao.getVehicleById(v.getVehicleId());
        if (existingVehicle == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        if (v.getMileage() < existingVehicle.getMileage()) {
            System.err.println("Mileage cannot decrease. Current: " +
                    existingVehicle.getMileage() + ", New: " + v.getMileage());
            return false;
        }

        if (v.getMileage() < 0) {
            System.err.println("Mileage cannot be negative");
            return false;
        }

        String vehicleType = v.getVehicleType().toLowerCase();
        if (!vehicleType.equals("motorcycle") && !vehicleType.equals("sedan") &&
                !vehicleType.equals("van") && !vehicleType.equals("truck")) {
            System.err.println("Invalid Vehicle type");
            return false;
        }

        // Validate status
        String status = v.getStatus().toLowerCase();
        if (!status.equals("available") && !status.equals("on_trip") &&
                !status.equals("maintenance") && !status.equals("inactive")) {
            System.err.println("Invalid status");
            return false;
        }

        // Validate fuel type
        String fuelType = v.getFuelType().toLowerCase();
        if (!fuelType.equals("diesel") && !fuelType.equals("gasoline")) {
            System.err.println("Invalid fuel type");
            return false;
        }

        return dao.updateVehicle(v);
    }


    public boolean deleteVehicle(int id) {
        Vehicle vehicle = dao.getVehicleById(id);
        if (vehicle == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }
        return dao.deleteVehicle(id);
    }


    public boolean reactivateVehicle(int vehicleId) {
        Vehicle vehicle = dao.getVehicleById(vehicleId);
        if (vehicle == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }
        if (!vehicle.getStatus().equalsIgnoreCase("inactive")) {
            System.err.println("Only inactive vehicles can be reactivated");
            return false;
        }
        return dao.reactivateVehicle(vehicleId);
    }

    public boolean canBeAssignedToTrip(int vehicleId) {
        Vehicle vehicle = dao.getVehicleById(vehicleId);
        if (vehicle == null) {
            return false;
        }
        return vehicle.getStatus().equalsIgnoreCase("available");
    }

    public boolean updateVehicleStatus(int vehicleId, String newStatus) {
        Vehicle vehicle = dao.getVehicleById(vehicleId);
        if (vehicle == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        String status = newStatus.toLowerCase();
        if (!status.equals("available") && !status.equals("on_trip") &&
                !status.equals("maintenance") && !status.equals("inactive")) {
            System.err.println("Invalid status");
            return false;
        }

        vehicle.setStatus(newStatus);
        return dao.updateVehicle(vehicle);
    }

    public boolean updateVehicleMileage(int vehicleId, int newMileage) {
        Vehicle vehicle = dao.getVehicleById(vehicleId);
        if (vehicle == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        if (newMileage < vehicle.getMileage()) {
            System.err.println("New mileage cannot be less than current mileage");
            return false;
        }

        if (newMileage <= 0) {
            System.err.println("Mileage must be greater than 0");
            return false;
        }

        vehicle.setMileage(newMileage);
        return dao.updateVehicle(vehicle);
    }
}
