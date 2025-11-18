package com.dbapp.demo.dao;

import com.dbapp.demo.model.MaintenancePart;
import com.dbapp.demo.util.DBConnection;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class MaintenancePartDAO {

    public boolean createMaintenancePart(MaintenancePart mp) {
        String query = "INSERT INTO MaintenancePart (maintenance_id, part_id, quantity_used, cost_per_part) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, mp.getMaintenanceId());

            if (mp.getPartId() == null) stmt.setNull(2, Types.INTEGER);
            else stmt.setInt(2, mp.getPartId());

            if (mp.getQuantityUsed() == null) stmt.setNull(3, Types.INTEGER);
            else stmt.setInt(3, mp.getQuantityUsed());

            if (mp.getCostPerPart() == null) stmt.setNull(4, Types.DOUBLE);
            else stmt.setDouble(4, mp.getCostPerPart());

            int rowsInserted = stmt.executeUpdate();
            return rowsInserted > 0;

        } catch (SQLException e) {
            System.err.println("Error inserting MaintenancePart: " + e.getMessage());
            return false;
        }
    }

    public List<MaintenancePart> readAllMaintenanceParts() {
        List<MaintenancePart> list = new ArrayList<>();
        String query = "SELECT * FROM MaintenancePart";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                list.add(extractMaintenancePart(rs));
            }

        } catch (SQLException e) {
            System.err.println("Error reading MaintenancePart: " + e.getMessage());
        }

        return list;
    }

    public List<MaintenancePart> readByMaintenanceId(int maintenanceId) {
        List<MaintenancePart> list = new ArrayList<>();
        String query = "SELECT * FROM MaintenancePart WHERE maintenance_id=?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, maintenanceId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                list.add(extractMaintenancePart(rs));
            }

        } catch (SQLException e) {
            System.err.println("Error reading MaintenancePart by maintenance_id: " + e.getMessage());
        }

        return list;
    }

    public boolean updateMaintenancePart(MaintenancePart mp) {
        String query = "UPDATE MaintenancePart SET quantity_used=?, cost_per_part=? WHERE maintenance_id=? AND part_id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            if (mp.getQuantityUsed() == null) stmt.setNull(1, Types.INTEGER);
            else stmt.setInt(1, mp.getQuantityUsed());

            if (mp.getCostPerPart() == null) stmt.setNull(2, Types.DOUBLE);
            else stmt.setDouble(2, mp.getCostPerPart());

            stmt.setInt(3, mp.getMaintenanceId());
            stmt.setInt(4, mp.getPartId());

            int rowsUpdated = stmt.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating MaintenancePart: " + e.getMessage());
            return false;
        }
    }

    public boolean deletePartsByMaintenanceId(int maintenanceId) {
        String query = "DELETE FROM MaintenancePart WHERE maintenance_id=?";

        try (Connection conn = DBConnection.getConnection();
            PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, maintenanceId);
            int rowsDeleted = stmt.executeUpdate();
            return rowsDeleted > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting MaintenancePart by maintenanceId: " + e.getMessage());
            return false;
        }
    }

    private MaintenancePart extractMaintenancePart(ResultSet rs) throws SQLException {
        MaintenancePart mp = new MaintenancePart();
        mp.setMaintenanceId(rs.getInt("maintenance_id"));

        Integer partId = rs.getInt("part_id");
        mp.setPartId(rs.wasNull() ? null : partId);

        Integer qty = rs.getInt("quantity_used");
        mp.setQuantityUsed(rs.wasNull() ? null : qty);

        Double cpp = rs.getDouble("cost_per_part");
        mp.setCostPerPart(rs.wasNull() ? null : cpp);

        return mp;
    }

//    public List<Integer> getVehicleIdsByPartId(int partId) {
//        List<Integer> vehicleIds = new ArrayList<>();
//        String query = "SELECT DISTINCT ml.vehicle_id FROM MaintenanceLog ml " +
//                "JOIN MaintenancePart mp ON ml.maintenance_id = mp.maintenance_id " +
//                "WHERE mp.part_id = ?";
//
//        try (Connection conn = DBConnection.getConnection();
//             PreparedStatement stmt = conn.prepareStatement(query)) {
//
//            stmt.setInt(1, partId);
//            try (ResultSet rs = stmt.executeQuery()) {
//                while (rs.next()) {
//                    vehicleIds.add(rs.getInt("vehicle_id"));
//                }
//            }
//        } catch (SQLException e) {
//            System.err.println("Error getting vehicles by part: " + e.getMessage());
//        }
//
//        return vehicleIds;
//    }
}
