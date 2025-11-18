package com.dbapp.demo.dao;

import com.dbapp.demo.model.Vehicle;
import Data.util.DBConnection;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class VehicleDAO {

    public boolean createVehicle(Vehicle vehicle) {
        String query = "INSERT INTO Vehicle (plate_number, vehicle_type, model, status, fuel_type, mileage) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, vehicle.getPlateNumber());
            statement.setString(2, vehicle.getVehicleType());
            statement.setString(3, vehicle.getModel());
            statement.setString(4, vehicle.getStatus());
            statement.setString(5, vehicle.getFuelType());
            statement.setInt(6, vehicle.getMileage());

            int rowsInserted = statement.executeUpdate();
            //return true if we inserted a row
            return rowsInserted > 0;

        } catch (SQLException e) {
            System.err.println("Error inserting vehicle: " + e.getMessage());
            return false;
        }
    }

    //for display
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
                vehicle.setStatus(resultSet.getString("status"));
                vehicle.setFuelType(resultSet.getString("fuel_type"));
                vehicle.setMileage(resultSet.getInt("mileage"));
                vehicleList.add(vehicle);
            }

        } catch (SQLException e) {
            System.err.println("Error reading vehicles: " + e.getMessage());
        }

        return vehicleList;
    }

    public boolean updateVehicle(Vehicle vehicle) {
        String query = "UPDATE Vehicle SET plate_number=?, vehicle_type=?, model=?, status=?, fuel_type=?, mileage=? WHERE vehicle_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, vehicle.getPlateNumber());
            statement.setString(2, vehicle.getVehicleType());
            statement.setString(3, vehicle.getModel());
            statement.setString(4, vehicle.getStatus());
            statement.setString(5, vehicle.getFuelType());
            statement.setInt(6, vehicle.getMileage());
            statement.setInt(7, vehicle.getVehicleId());

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating vehicle: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteVehicle(int vehicleId) {
        String query = "DELETE FROM Vehicle WHERE vehicle_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, vehicleId);
            int rowsDeleted = statement.executeUpdate();
            return rowsDeleted > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting vehicle: " + e.getMessage());
            return false;
        }
    }

    public Vehicle getVehicleById(int id) {
        String query = "SELECT * FROM Vehicle WHERE vehicle_id = ?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, id);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    Vehicle vehicle = new Vehicle();
                    vehicle.setVehicleId(resultSet.getInt("vehicle_id"));
                    vehicle.setPlateNumber(resultSet.getString("plate_number"));
                    vehicle.setVehicleType(resultSet.getString("vehicle_type"));
                    vehicle.setModel(resultSet.getString("model"));
                    vehicle.setStatus(resultSet.getString("status"));
                    vehicle.setFuelType(resultSet.getString("fuel_type"));
                    vehicle.setMileage(resultSet.getInt("mileage"));

                    return vehicle;
                }
            }

        } catch (SQLException e) {
            System.err.println("Error fetching vehicle: " + e.getMessage());
        }

        // return null if vehicle not found or error occurred
        return null;
    }

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
}