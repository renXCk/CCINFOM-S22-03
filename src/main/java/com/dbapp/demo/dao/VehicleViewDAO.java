package com.dbapp.demo.dao;

import com.dbapp.demo.model.VehicleView;
import com.dbapp.demo.model.VehicleView;
import com.dbapp.demo.util.DBConnection;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class VehicleViewDAO {

    public List<VehicleView> getAllVehicleViews() {
        List<VehicleView> details = new ArrayList<>();
        // Query should match the view name exactly
        String query = "SELECT * FROM VehicleView ORDER BY vehicle_id, date_time_start DESC";

        try (Connection connection = DBConnection.getConnection();
             Statement statement = connection.createStatement();
             ResultSet rs = statement.executeQuery(query)) {

            while (rs.next()) {
                VehicleView detail = new VehicleView();

                // Vehicle
                detail.setVehicleId(rs.getInt("vehicle_id"));
                detail.setPlateNumber(rs.getString("plate_number"));
                detail.setModel(rs.getString("model"));

                // Trip
                detail.setTripId(rs.getInt("trip_id"));
                detail.setDateTimeStart(rs.getTimestamp("date_time_start"));
                detail.setDateTimeCompleted(rs.getTimestamp("date_time_completed"));
                detail.setTripStatus(rs.getString("trip_status"));

                // Driver
                detail.setDriverId(rs.getInt("driver_id"));
                detail.setDriverName(rs.getString("driver_name"));
                detail.setLicenseNum(rs.getString("license_num"));

                // Client
                detail.setClientId(rs.getInt("client_id"));
                detail.setClientName(rs.getString("client_name"));
                detail.setClientType(rs.getString("client_type"));

                details.add(detail);
            }

        } catch (SQLException e) {
            System.err.println("Error reading VehicleView: " + e.getMessage());
        }
        return details;
    }
}