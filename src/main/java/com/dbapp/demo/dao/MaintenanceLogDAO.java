package com.dbapp.demo.dao;

import com.dbapp.demo.model.MaintenanceLog;
import com.dbapp.demo.model.MaintenancePart;
import com.dbapp.demo.util.DBConnection;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class MaintenanceLogDAO {

    private final MaintenancePartDAO maintenancePartDAO;

    public MaintenanceLogDAO(MaintenancePartDAO maintenancePartDAO) {
        this.maintenancePartDAO = maintenancePartDAO;
    }

    public boolean createMaintenanceLog(MaintenanceLog log, List<MaintenancePart> parts) {
        String query = "INSERT INTO MaintenanceLog (vehicle_id, date_time_start, date_time_completed, description, status) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, log.getVehicleId());
            stmt.setString(2, log.getDateTimeStart());
            stmt.setString(3, log.getDateTimeCompleted());
            stmt.setString(4, log.getDescription());
            stmt.setString(5, log.getStatus());

            int rowsInserted = stmt.executeUpdate();
            if (rowsInserted == 0) return false;

            // Get generated maintenance_id
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                int maintenanceId = rs.getInt(1);
                log.setMaintenanceId(maintenanceId);

                // Insert associated parts
                if (parts != null) {
                    for (MaintenancePart part : parts) {
                        part.setMaintenanceId(maintenanceId);
                        maintenancePartDAO.createMaintenancePart(part);
                    }
                }
            }

            return true;

        } catch (SQLException e) {
            System.err.println("Error inserting Maintenance Log: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public List<MaintenanceLog> readMaintenanceLogs() {
        List<MaintenanceLog> list = new ArrayList<>();
        String query = "SELECT * FROM MaintenanceLog ORDER BY maintenance_id";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                list.add(extractMaintenanceLog(rs));
            }

        } catch (SQLException e) {
            System.err.println("Error reading maintenance logs: " + e.getMessage());
            e.printStackTrace();
        }

        return list;
    }

    public MaintenanceLog getMaintenanceLogById(int maintenanceId) {
        String query = "SELECT * FROM MaintenanceLog WHERE maintenance_id=?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, maintenanceId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return extractMaintenanceLog(rs);
            }

        } catch (SQLException e) {
            System.err.println("Error reading maintenance log: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    public boolean updateMaintenanceLog(MaintenanceLog log) {
        String query = "UPDATE MaintenanceLog SET vehicle_id=?, date_time_start=?, date_time_completed=?, description=?, status=? WHERE maintenance_id=?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, log.getVehicleId());
            stmt.setString(2, log.getDateTimeStart());
            stmt.setString(3, log.getDateTimeCompleted());
            stmt.setString(4, log.getDescription()); // FIX: Add this
            stmt.setString(5, log.getStatus());       // FIX: Changed from position 4 to 5
            stmt.setInt(6, log.getMaintenanceId());   // FIX: Changed from position 5 to 6

            int rowsUpdated = stmt.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating Maintenance Log: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteMaintenanceLog(int maintenanceId) {
        // Delete associated parts first
        maintenancePartDAO.deletePartsByMaintenanceId(maintenanceId);

        String query = "DELETE FROM MaintenanceLog WHERE maintenance_id=?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, maintenanceId);
            int rowsDeleted = stmt.executeUpdate();
            return rowsDeleted > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting Maintenance Log: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean hasActiveMaintenance(int vehicleId) {
        String query = "SELECT COUNT(*) AS count FROM MaintenanceLog WHERE vehicle_id=? AND status='Ongoing'";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, vehicleId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return rs.getInt("count") > 0;

        } catch (SQLException e) {
            System.err.println("Error checking active maintenance: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    private MaintenanceLog extractMaintenanceLog(ResultSet rs) throws SQLException {
        MaintenanceLog log = new MaintenanceLog();
        log.setMaintenanceId(rs.getInt("maintenance_id"));
        log.setVehicleId(rs.getInt("vehicle_id"));
        log.setDateTimeStart(rs.getString("date_time_start"));
        log.setDateTimeCompleted(rs.getString("date_time_completed"));
        log.setDescription(rs.getString("description"));
        log.setStatus(rs.getString("status"));
        return log;
    }
}