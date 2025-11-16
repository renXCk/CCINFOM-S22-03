package Data.dao;

import Business.model.Driver;
import Business.model.Vehicle;
import Business.model.IncidentLog;
import Data.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class IncidentLogDAO {

    public boolean createIncidentLog(IncidentLog incidentLog) {
        String query = "INSERT INTO IncidentLog (vehicle_id, driver_id, incident_type, incident_date_time, incident_location, incident_severity) VALUES (?, ?, ?, NOW(), ?, ?)";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)){

            statement.setInt(1, incidentLog.getVehicleId());
            statement.setInt(2, incidentLog.getDriverId());
            statement.setString(3, incidentLog.getIncidentType());
            statement.setString(4, incidentLog.getIncidentLocation());
            statement.setString(5, incidentLog.getIncidentSeverity());

            int rowsInserted = statement.executeUpdate();
            //return true if we inserted a row
            return rowsInserted > 0;

        } catch (Exception e) {
            System.err.println("Error inserting Incident Log: " + e.getMessage());
            return false;
        }
    }


    public List<IncidentLog> readIncidentLogs() {
        List<IncidentLog> incidentLogList = new ArrayList<>();
        String query = "SELECT * FROM IncidentLog ORDER BY incident_id";

        try (Connection connection = DBConnection.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(query)) {

            while (resultSet.next()) {
                IncidentLog incidentLog = new IncidentLog();
                incidentLog.setIncidentId(resultSet.getInt("incident_id"));
                incidentLog.setDriverId(resultSet.getInt("driver_id"));
                incidentLog.setVehicleId(resultSet.getInt("vehicle_id"));
                incidentLog.setIncidentType(resultSet.getString("incident_type"));
                incidentLog.setIncidentDateTime(resultSet.getTimestamp("incident_date_time"));
                incidentLog.setIncidentLocation(resultSet.getString("incident_location"));
                incidentLog.setIncidentSeverity(resultSet.getString("incident_severity"));

                incidentLogList.add(incidentLog);
            }

        } catch (SQLException e) {
            System.err.println("Error reading incidentLogs: " + e.getMessage());
        }

        return incidentLogList;
    }

    public boolean updateIncidentLog(IncidentLog incidentLog) {
        String query = "UPDATE IncidentLog SET driver_id=?, vehicle_id=?, incident_type=?, incident_date_time=?, incident_location=?, incident_severity=? WHERE incident_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, incidentLog.getDriverId());
            statement.setInt(2, incidentLog.getVehicleId());
            statement.setString(3, incidentLog.getIncidentType());
            statement.setString(3, incidentLog.getIncidentDateTime());
            statement.setString(5, incidentLog.getIncidentLocation());
            statement.setString(6, incidentLog.getIncidentSeverity());
            statement.setInt(7, incidentLog.getIncidentId());

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating Incident Log: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteIncidentLog(int incidentId) {
        String query = "DELETE FROM IncidentLog WHERE incident_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, incidentId);
            int rowsDeleted = statement.executeUpdate();
            return rowsDeleted > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting Incident log: " + e.getMessage());
            return false;
        }
    }

}

