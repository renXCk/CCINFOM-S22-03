package Data.dao;

import Business.model.MaintenanceLog;
import Business.model.MaintenancePart;
import Data.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MaintenanceLogDAO {

    private final MaintenancePartDAO maintenancePartDAO = new MaintenancePartDAO();

    public boolean createMaintenanceLog(MaintenanceLog log, List<MaintenancePart> parts) {
        String query = "INSERT INTO MaintenanceLog (vehicle_id, date_time_start, date_time_completed, status) VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, log.getVehicleId());
            stmt.setString(2, log.getDateTimeStart());
            stmt.setString(3, log.getDateTimeCompleted());
            stmt.setString(4, log.getStatus());

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
        }

        return null;
    }

    public boolean updateMaintenanceLog(MaintenanceLog log) {
        String query = "UPDATE MaintenanceLog SET vehicle_id=?, date_time_start=?, date_time_completed=?, status=? WHERE maintenance_id=?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, log.getVehicleId());
            stmt.setString(2, log.getDateTimeStart());
            stmt.setString(3, log.getDateTimeCompleted());
            stmt.setString(4, log.getStatus());
            stmt.setInt(5, log.getMaintenanceId());

            int rowsUpdated = stmt.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating Maintenance Log: " + e.getMessage());
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
        }

        return false;
    }

    private MaintenanceLog extractMaintenanceLog(ResultSet rs) throws SQLException {
        MaintenanceLog log = new MaintenanceLog();
        log.setMaintenanceId(rs.getInt("maintenance_id"));
        log.setVehicleId(rs.getInt("vehicle_id"));
        log.setDateTimeStart(rs.getString("date_time_start"));
        log.setDateTimeCompleted(rs.getString("date_time_completed"));
        log.setStatus(rs.getString("status"));
        return log;
    }
}
