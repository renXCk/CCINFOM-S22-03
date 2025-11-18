package com.dbapp.demo.dao;

import com.dbapp.demo.model.FuelLog;
import Data.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class FuelLogDAO {

    public boolean createFuelLog(FuelLog fuelLog) {
        String query = "INSERT INTO FuelLog (vehicle_id, driver_id, fuel_date, fuel_type, liters_filled, price_per_liter, reimbursed) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, fuelLog.getVehicleId());
            statement.setInt(2, fuelLog.getDriverId());
            statement.setTimestamp(3, fuelLog.getFuelDate());
            statement.setString(4, fuelLog.getFuelType());
            statement.setDouble(5, fuelLog.getLitersFilled());
            statement.setDouble(6, fuelLog.getPricePerLiter());
            statement.setBoolean(7, fuelLog.isReimbursed());

            int rowsInserted = statement.executeUpdate();
            return rowsInserted > 0;

        } catch (SQLException e) {
            System.err.println("Error inserting fuel log: " + e.getMessage());
            return false;
        }
    }

    // Read all fuel logs
    public List<FuelLog> readFuelLogs() {
        List<FuelLog> fuelLogList = new ArrayList<>();
        String query = "SELECT * FROM FuelLog ORDER BY fuel_date DESC";

        try (Connection connection = DBConnection.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(query)) {

            while (resultSet.next()) {
                FuelLog fuelLog = new FuelLog();
                fuelLog.setFuelId(resultSet.getInt("fuel_id"));
                fuelLog.setVehicleId(resultSet.getInt("vehicle_id"));
                fuelLog.setDriverId(resultSet.getInt("driver_id"));
                fuelLog.setFuelDate(resultSet.getTimestamp("fuel_date"));
                fuelLog.setFuelType(resultSet.getString("fuel_type"));
                fuelLog.setLitersFilled(resultSet.getDouble("liters_filled"));
                fuelLog.setPricePerLiter(resultSet.getDouble("price_per_liter"));
                fuelLog.setReimbursed(resultSet.getBoolean("reimbursed"));

                fuelLogList.add(fuelLog);
            }

        } catch (SQLException e) {
            System.err.println("Error reading fuel logs: " + e.getMessage());
        }

        return fuelLogList;
    }

    // Get fuel logs by vehicle ID
    public List<FuelLog> getFuelLogsByVehicle(int vehicleId) {
        List<FuelLog> fuelLogList = new ArrayList<>();
        String query = "SELECT * FROM FuelLog WHERE vehicle_id = ? ORDER BY fuel_date DESC";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, vehicleId);
            ResultSet resultSet = statement.executeQuery();

            while (resultSet.next()) {
                FuelLog fuelLog = new FuelLog();
                fuelLog.setFuelId(resultSet.getInt("fuel_id"));
                fuelLog.setVehicleId(resultSet.getInt("vehicle_id"));
                fuelLog.setDriverId(resultSet.getInt("driver_id"));
                fuelLog.setFuelDate(resultSet.getTimestamp("fuel_date"));
                fuelLog.setFuelType(resultSet.getString("fuel_type"));
                fuelLog.setLitersFilled(resultSet.getDouble("liters_filled"));
                fuelLog.setPricePerLiter(resultSet.getDouble("price_per_liter"));
                fuelLog.setReimbursed(resultSet.getBoolean("reimbursed"));

                fuelLogList.add(fuelLog);
            }

        } catch (SQLException e) {
            System.err.println("Error reading fuel logs by vehicle: " + e.getMessage());
        }

        return fuelLogList;
    }

    // Get fuel logs by driver ID
    public List<FuelLog> getFuelLogsByDriver(int driverId) {
        List<FuelLog> fuelLogList = new ArrayList<>();
        String query = "SELECT * FROM FuelLog WHERE driver_id = ? ORDER BY fuel_date DESC";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, driverId);
            ResultSet resultSet = statement.executeQuery();

            while (resultSet.next()) {
                FuelLog fuelLog = new FuelLog();
                fuelLog.setFuelId(resultSet.getInt("fuel_id"));
                fuelLog.setVehicleId(resultSet.getInt("vehicle_id"));
                fuelLog.setDriverId(resultSet.getInt("driver_id"));
                fuelLog.setFuelDate(resultSet.getTimestamp("fuel_date"));
                fuelLog.setFuelType(resultSet.getString("fuel_type"));
                fuelLog.setLitersFilled(resultSet.getDouble("liters_filled"));
                fuelLog.setPricePerLiter(resultSet.getDouble("price_per_liter"));
                fuelLog.setReimbursed(resultSet.getBoolean("reimbursed"));

                fuelLogList.add(fuelLog);
            }

        } catch (SQLException e) {
            System.err.println("Error reading fuel logs by driver: " + e.getMessage());
        }

        return fuelLogList;
    }

    public FuelLog getFuelLogById(int fuelId) {
        FuelLog fuelLog = null;
        String query = "SELECT * FROM FuelLog WHERE fuel_id = ?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, fuelId);
            ResultSet resultSet = statement.executeQuery();

            // Use 'if' since we only expect one result
            if (resultSet.next()) {
                fuelLog = new FuelLog();
                fuelLog.setFuelId(resultSet.getInt("fuel_id"));
                fuelLog.setVehicleId(resultSet.getInt("vehicle_id"));
                fuelLog.setDriverId(resultSet.getInt("driver_id"));
                fuelLog.setFuelDate(resultSet.getTimestamp("fuel_date"));
                fuelLog.setFuelType(resultSet.getString("fuel_type"));
                fuelLog.setLitersFilled(resultSet.getDouble("liters_filled"));
                fuelLog.setPricePerLiter(resultSet.getDouble("price_per_liter"));
                fuelLog.setReimbursed(resultSet.getBoolean("reimbursed"));
            }

        } catch (SQLException e) {
            System.err.println("Error reading fuel log by ID: " + e.getMessage());
        }

        return fuelLog; // Returns the found fuel log or null
    }

    // Update fuel log (mainly for reimbursement status)
    public boolean updateFuelLog(FuelLog fuelLog) {
        String query = "UPDATE FuelLog SET vehicle_id=?, driver_id=?, fuel_date=?, fuel_type=?, liters_filled=?, price_per_liter=?, reimbursed=? WHERE fuel_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, fuelLog.getVehicleId());
            statement.setInt(2, fuelLog.getDriverId());
            statement.setTimestamp(3, fuelLog.getFuelDate());
            statement.setString(4, fuelLog.getFuelType());
            statement.setDouble(5, fuelLog.getLitersFilled());
            statement.setDouble(6, fuelLog.getPricePerLiter());
            statement.setBoolean(7, fuelLog.isReimbursed());
            statement.setInt(8, fuelLog.getFuelId());

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating fuel log: " + e.getMessage());
            return false;
        }
    }

    // Update reimbursement status only
    public boolean updateReimbursementStatus(int fuelId, boolean reimbursed) {
        String query = "UPDATE FuelLog SET reimbursed=? WHERE fuel_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setBoolean(1, reimbursed);
            statement.setInt(2, fuelId);

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating reimbursement status: " + e.getMessage());
            return false;
        }
    }

    // Delete fuel log
    public boolean deleteFuelLog(int fuelId) {
        String query = "DELETE FROM FuelLog WHERE fuel_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, fuelId);
            int rowsDeleted = statement.executeUpdate();
            return rowsDeleted > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting fuel log: " + e.getMessage());
            return false;
        }
    }
}