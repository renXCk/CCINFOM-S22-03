package com.dbapp.demo.dao;

import com.dbapp.demo.model.DriverView;
import com.dbapp.demo.util.DBConnection;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class DriverViewDAO {

    public List<DriverView> getVehiclesByDriver(int driverId) {
        List<DriverView> details = new ArrayList<>();

        String query = "SELECT * FROM DriverView WHERE driver_id = ? ORDER BY model";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement stmt = connection.prepareStatement(query)) {

            stmt.setInt(1, driverId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    DriverView detail = new DriverView();

                    detail.setDriverId(rs.getInt("driver_id"));
                    detail.setDriverName(rs.getString("driver_name"));
                    detail.setLicenseNum(rs.getString("license_num"));

                    detail.setVehicleId(rs.getInt("vehicle_id"));
                    detail.setPlateNumber(rs.getString("plate_number"));
                    detail.setModel(rs.getString("model"));
                    detail.setVehicleType(rs.getString("vehicle_type"));

                    details.add(detail);
                }
            }

        } catch (SQLException e) {
            System.err.println("Error reading DriverView: " + e.getMessage());
        }
        return details;
    }
}