package com.dbapp.demo.services;

import com.dbapp.demo.dao.VehicleViewDAO;
import com.dbapp.demo.model.Vehicle;
import com.dbapp.demo.dao.VehicleDAO;
import com.dbapp.demo.model.VehicleView;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class VehicleService {
    private final VehicleDAO dao = new VehicleDAO();
    private final VehicleViewDAO viewDAO = new VehicleViewDAO();

    public boolean addVehicle(Vehicle v) {
        // --- 1. Basic Null Checks ---
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
            System.err.println("Fuel Type cannot be empty");
            return false;
        }

        // --- 2. Validate Vehicle Type ---
        String vehicleType = v.getVehicleType().toLowerCase();
        if (!vehicleType.equals("motorcycle") && !vehicleType.equals("sedan") &&
                !vehicleType.equals("van") && !vehicleType.equals("truck")) {
            System.err.println("Invalid Vehicle Type");
            return false;
        }

        // --- 3. Validate Plate Format (New Rule) ---
        if (!isValidPlateFormat(v.getPlateNumber(), vehicleType)) {
            System.err.println("Invalid plate format for vehicle type: " + vehicleType);
            if (vehicleType.equals("motorcycle")) {
                System.err.println("Expected: 2 letters + 5 digits (AB 12345) or 3 letters + 3 digits (ABC 123)");
            } else {
                System.err.println("Expected: 3 letters + 3 or 4 digits (ABC 123 or ABC 1234)");
            }
            return false;
        }

        // --- 4. Validate Plate Uniqueness ---
        List<Vehicle> existingVehicles = dao.readVehicles();
        boolean plateExists = existingVehicles.stream()
                .anyMatch(vehicle -> vehicle.getPlateNumber().equalsIgnoreCase(v.getPlateNumber()));
        if (plateExists) {
            System.err.println("Plate number already exists");
            return false;
        }

        // --- 5. Validate Status, Fuel, and Mileage ---
        String status = v.getStatus().toLowerCase();
        if (!status.equals("available") && !status.equals("on_trip") &&
                !status.equals("maintenance") && !status.equals("inactive")) {
            System.err.println("Invalid Status");
            return false;
        }

        String fuelType = v.getFuelType().toLowerCase();
        if (!fuelType.equals("diesel") && !fuelType.equals("gasoline")) {
            System.err.println("Fuel type must be either diesel or gasoline");
            return false;
        }

        if (v.getMileage() < 0) {
            System.err.println("Mileage cannot be negative");
            return false;
        }

        return dao.createVehicle(v);
    }

    public List<VehicleView> getVehicleHistory() {
        return viewDAO.getAllVehicleViews();
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

        // --- 1. Validate Plate Number Presence ---
        if (v.getPlateNumber() == null || v.getPlateNumber().trim().isEmpty()) {
            System.err.println("Plate number cannot be empty");
            return false;
        }

        // --- 2. Validate Vehicle Type ---
        String vehicleType = v.getVehicleType().toLowerCase();
        if (!vehicleType.equals("motorcycle") && !vehicleType.equals("sedan") &&
                !vehicleType.equals("van") && !vehicleType.equals("truck")) {
            System.err.println("Invalid Vehicle type");
            return false;
        }

        // --- 3. Validate Plate Format (New Rule) ---
        if (!isValidPlateFormat(v.getPlateNumber(), vehicleType)) {
            System.err.println("Invalid plate format for vehicle type: " + vehicleType);
            if (vehicleType.equals("motorcycle")) {
                System.err.println("Expected: 2 letters + 5 digits (AB 12345) or 3 letters + 3 digits (ABC 123)");
            } else {
                System.err.println("Expected: 3 letters + 3 or 4 digits (ABC 123 or ABC 1234)");
            }
            return false;
        }

        // --- 4. Validate Plate Uniqueness (Excluding Self) ---
        List<Vehicle> existingVehicles = dao.readVehicles();
        boolean plateExistsOnOtherVehicle = existingVehicles.stream()
                .anyMatch(vehicle ->
                        vehicle.getPlateNumber().equalsIgnoreCase(v.getPlateNumber()) &&
                                vehicle.getVehicleId() != v.getVehicleId() // Ignore the current vehicle
                );

        if (plateExistsOnOtherVehicle) {
            System.err.println("Plate number already exists on another vehicle");
            return false;
        }

        // --- 5. Validate Mileage Logic ---
        if (v.getMileage() < existingVehicle.getMileage()) {
            System.err.println("Mileage cannot decrease. Current: " +
                    existingVehicle.getMileage() + ", New: " + v.getMileage());
            return false;
        }

        if (v.getMileage() < 0) {
            System.err.println("Mileage cannot be negative");
            return false;
        }

        // --- 6. Validate Status and Fuel ---
        String status = v.getStatus().toLowerCase();
        if (!status.equals("available") && !status.equals("on_trip") &&
                !status.equals("maintenance") && !status.equals("inactive")) {
            System.err.println("Invalid status");
            return false;
        }

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

    /**
     * Helper method to validate plate format based on vehicle type.
     */
    private boolean isValidPlateFormat(String plate, String vehicleType) {
        plate = plate.trim();

        if (vehicleType.equals("motorcycle")) {
            // Rule: 2 letters + 5 digits OR 3 letters + 3 digits
            // Regex allows optional space
            String motoRegex = "^([A-Za-z]{2}\\s?\\d{5}|[A-Za-z]{3}\\s?\\d{3})$";
            return Pattern.matches(motoRegex, plate);
        } else {
            // Rule for Sedan, Van, Truck: 3 letters + 3 or 4 digits
            String standardRegex = "^[A-Za-z]{3}\\s?\\d{3,4}$";
            return Pattern.matches(standardRegex, plate);
        }
    }
}