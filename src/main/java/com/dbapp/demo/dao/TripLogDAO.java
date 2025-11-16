package com.dbapp.demo.dao;

import com.dbapp.demo.model.TripLog;
import Data.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class TripLogDAO {

    public boolean createTripLog(TripLog tripLog) {
        String query = "INSERT INTO TripLog (client_id, vehicle_id, driver_id, pick_up_loc, drop_off_loc, date_time_start, date_time_completed, trip_cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)){

            statement.setInt(1, tripLog.getClientId());
            statement.setInt(2, tripLog.getVehicleId());
            statement.setInt(3, tripLog.getDriverId());
            statement.setString(4, tripLog.getPickUpLocation());
            statement.setString(5, tripLog.getDropOffLocation());
            statement.setString(6, tripLog.getStartTime());
            statement.setString(7, tripLog.getCompleteTime());
            statement.setFloat(8, tripLog.getTripCost());
            statement.setString(9, tripLog.getStatus());

            int rowsInserted = statement.executeUpdate();
            //return true if we inserted a row
            return rowsInserted > 0;

        } catch (Exception e) {
            System.err.println("Error inserting Trip Log: " + e.getMessage());
            return false;
        }
    }


    public List<TripLog> readTripLogs() {
        List<TripLog> tripLogList = new ArrayList<>();
        String query = "SELECT * FROM TripLog ORDER BY trip_id";

        try (Connection connection = DBConnection.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(query)) {

            while (resultSet.next()) {
                TripLog tripLog = new TripLog();
                tripLog.setTripId(resultSet.getInt("trip_id"));
                tripLog.setClientId(resultSet.getInt("client_id"));
                tripLog.setVehicleId(resultSet.getInt("vehicle_id"));
                tripLog.setDriverId(resultSet.getInt("driver_id"));
                tripLog.setPickUpLocation(resultSet.getString("pick_up_loc"));
                tripLog.setDropOffLocation(resultSet.getString("drop_off_loc"));
                tripLog.setStartTime(resultSet.getString("date_time_start"));
                tripLog.setCompleteTime(resultSet.getString("date_time_completed"));
                tripLog.setTripCost(resultSet.getFloat("trip_cost"));
                tripLog.setStatus(resultSet.getString("status"));

                tripLogList.add(tripLog);
            }

        } catch (SQLException e) {
            System.err.println("Error reading tripLogs: " + e.getMessage());
        }

        return tripLogList;
    }

    public boolean updateTripLog(TripLog tripLog) {
        String query = "UPDATE TripLog SET client_id=?, vehicle_id=?, driver_id=?, pick_up_loc=?, drop_off_loc=?, date_time_start=?, date_time_completed=?, trip_cost=?, status=? WHERE trip_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, tripLog.getClientId());
            statement.setInt(2, tripLog.getVehicleId());
            statement.setInt(3, tripLog.getDriverId());
            statement.setString(4, tripLog.getPickUpLocation());
            statement.setString(5, tripLog.getDropOffLocation());
            statement.setString(6, tripLog.getStartTime());
            statement.setString(7, tripLog.getCompleteTime());
            statement.setFloat(8, tripLog.getTripCost());
            statement.setString(9, tripLog.getStatus());
            statement.setInt(10, tripLog.getTripId());

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating Trip Log: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteTripLog(int tripId) {
        String query = "DELETE FROM TripLog WHERE trip_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, tripId);
            int rowsDeleted = statement.executeUpdate();
            return rowsDeleted > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting Trip log: " + e.getMessage());
            return false;
        }
    }

}

