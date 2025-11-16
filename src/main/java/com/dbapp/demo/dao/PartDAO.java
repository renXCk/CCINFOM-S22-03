package com.dbapp.demo.dao;

import com.dbapp.demo.model.Part;
import Data.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PartDAO {

    public boolean createPart(Part part) {
        String query = "INSERT INTO Part (part_name, description, stock_qty, cost, supplier, pending_delivery) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, part.getPartName());
            statement.setString(2, part.getDescription());
            statement.setInt(3, part.getStockQty());
            statement.setDouble(4, part.getCost());
            statement.setString(5, part.getSupplier());
            statement.setBoolean(6, part.isPendingDelivery());

            int rowsInserted = statement.executeUpdate();
            //return true if we inserted a row
            return rowsInserted > 0;

        } catch (SQLException e) {
            System.err.println("Error inserting part: " + e.getMessage());
            return false;
        }
    }

    //for display
    public List<Part> readPart() {
        List<Part> PartList = new ArrayList<>();
        String query = "SELECT * FROM Part ORDER BY part_id";

        try (Connection connection = DBConnection.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(query)) {

            while (resultSet.next()) {
                Part part = new Part();
                part.setPartId(resultSet.getInt("part_id"));
                part.setPartName(resultSet.getString("part_name"));
                part.setDescription(resultSet.getString("description"));
                part.setStockQty(resultSet.getInt("stock_qty"));
                part.setCost(resultSet.getDouble("cost"));
                part.setSupplier(resultSet.getString("supplier"));
                part.setPendingDelivery(resultSet.getBoolean("pending_delivery"));
                PartList.add(part);
            }

        } catch (SQLException e) {
            System.err.println("Error reading Part: " + e.getMessage());
        }

        return PartList;
    }

    public boolean updatePart(Part part) {
        String query = "UPDATE Part SET part_name=?, description=?, stock_qty=?, cost=?, supplier=?, pending_delivery=? WHERE part_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, part.getPartName());
            statement.setString(2, part.getDescription());
            statement.setInt(3, part.getStockQty());
            statement.setDouble(4, part.getCost());
            statement.setString(5, part.getSupplier());
            statement.setBoolean(6, part.isPendingDelivery());
            statement.setInt(7, part.getPartId());

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating part: " + e.getMessage());
            return false;
        }
    }

    public boolean deletePart(int partId) {
        String query = "DELETE FROM Part WHERE part_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, partId);
            int rowsDeleted = statement.executeUpdate();
            return rowsDeleted > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting part: " + e.getMessage());
            return false;
        }
    }
}
