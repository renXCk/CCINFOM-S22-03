package com.dbapp.demo.dao;

import com.dbapp.demo.model.Vehicle;
import com.dbapp.demo.util.DBConnection;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class VehicleDAO {

    public boolean createVehicle(Vehicle vehicle) {
        String query = "INSERT INTO Vehicle (plate_number, vehicle_type, model, fuel_type, status, mileage) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, vehicle.getPlateNumber());
            statement.setString(2, vehicle.getVehicleType());
            statement.setString(3, vehicle.getModel());
            statement.setString(4, vehicle.getFuelType());
            statement.setString(5, vehicle.getStatus());
            statement.setInt(6, vehicle.getMileage());

            int rowsInserted = statement.executeUpdate();
            return rowsInserted > 0;

        } catch (SQLException e) {
            System.err.println("Error inserting vehicle: " + e.getMessage());
            return false;
        }
    }

    // Read all vehicles
    public List<Vehicle> readVehicles() {
        List<Vehicle> vehicleList = new ArrayList<>();
        String query = "SELECT * FROM Vehicle ORDER BY vehicle_id";

        try (Connection connection = DBConnection.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(query)) {

            while (resultSet.next()) {
                Vehicle vehicle = new Vehicle();
                vehicle.setVehicleId(resultSet.getInt("vehicle_id"));
                vehicle.setPlateNumber(resultSet.getString("plate_number"));
                vehicle.setVehicleType(resultSet.getString("vehicle_type"));
                vehicle.setModel(resultSet.getString("model"));
                vehicle.setFuelType(resultSet.getString("fuel_type"));
                vehicle.setStatus(resultSet.getString("status"));
                vehicle.setMileage(resultSet.getInt("mileage"));
                vehicleList.add(vehicle);
            }

        } catch (SQLException e) {
            System.err.println("Error reading vehicles: " + e.getMessage());
        }

        return vehicleList;
    }

    // Get only active vehicles (excludes inactive)
    public List<Vehicle> readActiveVehicles() {
        List<Vehicle> vehicleList = new ArrayList<>();
        String query = "SELECT * FROM Vehicle WHERE status != 'inactive' ORDER BY vehicle_id";

        try (Connection connection = DBConnection.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(query)) {

            while (resultSet.next()) {
                Vehicle vehicle = new Vehicle();
                vehicle.setVehicleId(resultSet.getInt("vehicle_id"));
                vehicle.setPlateNumber(resultSet.getString("plate_number"));
                vehicle.setVehicleType(resultSet.getString("vehicle_type"));
                vehicle.setModel(resultSet.getString("model"));
                vehicle.setFuelType(resultSet.getString("fuel_type"));
                vehicle.setStatus(resultSet.getString("status"));
                vehicle.setMileage(resultSet.getInt("mileage"));
                vehicleList.add(vehicle);
            }

        } catch (SQLException e) {
            System.err.println("Error reading active vehicles: " + e.getMessage());
        }

        return vehicleList;
    }

    // Get single vehicle by ID
    public Vehicle getVehicleById(int vehicleId) {
        String query = "SELECT * FROM Vehicle WHERE vehicle_id = ?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, vehicleId);
            ResultSet resultSet = statement.executeQuery();

            if (resultSet.next()) {
                Vehicle vehicle = new Vehicle();
                vehicle.setVehicleId(resultSet.getInt("vehicle_id"));
                vehicle.setPlateNumber(resultSet.getString("plate_number"));
                vehicle.setVehicleType(resultSet.getString("vehicle_type"));
                vehicle.setModel(resultSet.getString("model"));
                vehicle.setFuelType(resultSet.getString("fuel_type"));
                vehicle.setStatus(resultSet.getString("status"));
                vehicle.setMileage(resultSet.getInt("mileage"));
                return vehicle;
            }

        } catch (SQLException e) {
            System.err.println("Error getting vehicle by ID: " + e.getMessage());
        }

        return null;
    }

    public boolean updateVehicle(Vehicle vehicle) {
        String query = "UPDATE Vehicle SET vehicle_type=?, model=?, fuel_type=?, status=?, mileage=? WHERE vehicle_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, vehicle.getVehicleType());
            statement.setString(2, vehicle.getModel());
            statement.setString(3, vehicle.getFuelType());
            statement.setString(4, vehicle.getStatus());
            statement.setInt(5, vehicle.getMileage());
            statement.setInt(6, vehicle.getVehicleId());

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating vehicle: " + e.getMessage());
            return false;
        }
    }

    // Update only vehicle status
    public boolean updateVehicleStatus(int vehicleId, String status) {
        String query = "UPDATE Vehicle SET status=? WHERE vehicle_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, status);
            statement.setInt(2, vehicleId);

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating vehicle status: " + e.getMessage());
            return false;
        }
    }

    // Update only vehicle mileage
    public boolean updateVehicleMileage(int vehicleId, int mileage) {
        String query = "UPDATE Vehicle SET mileage=? WHERE vehicle_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, mileage);
            statement.setInt(2, vehicleId);

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating vehicle mileage: " + e.getMessage());
            return false;
        }
    }

    // Soft delete lng
    public boolean deleteVehicle(int vehicleId) {
        String query = "UPDATE Vehicle SET status='inactive' WHERE vehicle_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, vehicleId);
            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            return false;
        }
    }

    public boolean reactivateVehicle(int vehicleId) {
        String query = "UPDATE Vehicle SET status='available' WHERE vehicle_id=? AND status='inactive'";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, vehicleId);
            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error reactivating vehicle: " + e.getMessage());
            return false;
        }
    }
}