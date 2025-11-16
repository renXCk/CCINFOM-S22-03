package com.dbapp.demo.dao;

import com.dbapp.demo.model.Driver;
import Data.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;


public class DriverDAO {

    public boolean createDriver(Driver driver) {
        String query = "INSERT INTO Driver (first_name, last_name, license_num, contact_num, email, status) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, driver.getFirstName());
            statement.setString(2, driver.getLastName());
            statement.setString(3, driver.getLicenseNum());
            statement.setString(4, driver.getContactNum());
            statement.setString(5, driver.getEmail());
            statement.setString(6, driver.getStatus());

            int rowsInserted = statement.executeUpdate();
            //return true if we inserted a row
            return rowsInserted > 0;

        } catch (SQLException e) {
            System.err.println("Error inserting driver: " + e.getMessage());
            return false;
        }
    }

    //for display
    public List<Driver> readDrivers() {
        List<Driver> driverList = new ArrayList<>();
        String query = "SELECT * FROM Driver ORDER BY driver_id";

        try (Connection connection = DBConnection.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(query)) {

            while (resultSet.next()) {
                Driver driver = new Driver();
                driver.setDriverId(resultSet.getInt("driver_id"));
                driver.setFirstName(resultSet.getString("first_name"));
                driver.setLastName(resultSet.getString("last_name"));
                driver.setLicenseNum(resultSet.getString("license_num"));
                driver.setContactNum(resultSet.getString("contact_num"));
                driver.setEmail(resultSet.getString("email"));
                driver.setStatus(resultSet.getString("status"));
                driver.setCompletedTrips(resultSet.getInt("completed_trips"));
                driverList.add(driver);
            }

        } catch (SQLException e) {
            System.err.println("Error reading drivers: " + e.getMessage());
        }

        return driverList;
    }

    public boolean updateDriver(Driver driver) {
        String query = "UPDATE Driver SET first_name=?, last_name=?, license_num=?, contact_num=?, email=?, status=?, completed_trips=? WHERE driver_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, driver.getFirstName());
            statement.setString(2, driver.getLastName());
            statement.setString(3, driver.getLicenseNum());
            statement.setString(4, driver.getContactNum());
            statement.setString(5, driver.getEmail());
            statement.setString(6, driver.getStatus());
            statement.setInt(7, driver.getCompletedTrips());
            statement.setInt(8, driver.getDriverId());

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating driver: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteDriver(int driverId) {
        String query = "DELETE FROM Driver WHERE driver_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, driverId);
            int rowsDeleted = statement.executeUpdate();
            return rowsDeleted > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting driver: " + e.getMessage());
            return false;
        }
    }
}