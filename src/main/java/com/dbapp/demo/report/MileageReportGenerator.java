package com.dbapp.demo.report;

import com.dbapp.demo.util.DBConnection;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * REST Controller and Report Generator for Vehicle Mileage and Usage.
 * This class handles both the HTTP request mapping and the core logic
 * for generating the mileage report by querying the database.
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin("http://localhost:3000")
public class MileageReportGenerator {

    public static class MileageReportEntry {
        private Date reportDate;
        private String vehicleModel;
        private String plateNumber;
        private double totalDistanceTraveled;
        private int currentMileage;
        private long tripCount;

        // Getters and Setters
        public Date getReportDate() { return reportDate; }
        public void setReportDate(Date reportDate) { this.reportDate = reportDate; }

        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

        public String getPlateNumber() { return plateNumber; }
        public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

        public double getTotalDistanceTraveled() { return totalDistanceTraveled; }
        public void setTotalDistanceTraveled(double totalDistanceTraveled) { this.totalDistanceTraveled = totalDistanceTraveled; }

        public int getCurrentMileage() { return currentMileage; }
        public void setCurrentMileage(int currentMileage) { this.currentMileage = currentMileage; }

        public long getTripCount() { return tripCount; }
        public void setTripCount(long tripCount) { this.tripCount = tripCount; }
    }

    // REST CONTROLLER METHOD
    @GetMapping("/mileage")
    public List<MileageReportEntry> getMileageReport(
            @RequestParam("start") String startDate,
            @RequestParam("end") String endDate) {

        System.out.println("Generating Mileage Report from " + startDate + " to " + endDate);
        return generateReport(startDate, endDate);
    }

    // (Service/DAO equivalent)

    /**
     * Executes the core report generation logic by querying the database.
     *
     * @param startDate The start date for filtering completed trips (YYYY-MM-DD).
     * @param endDate The end date for filtering completed trips (YYYY-MM-DD).
     * @return A list of MileageReportEntry objects.
     */
    public List<MileageReportEntry> generateReport(String startDate, String endDate) {
        List<MileageReportEntry> report = new ArrayList<>();

        // SQL Query to aggregate distance and count trips, and fetch the current odometer (mileage)
        String query =
                "SELECT " +
                        "    DATE(t.date_time_completed) as report_date, " +
                        "    v.model, " +
                        "    v.plate_number, " +
                        "    v.mileage, " +
                        "    SUM(t.total_distance) as total_distance_traveled, " +
                        "    COUNT(t.trip_id) as trip_count " +
                        "FROM TripLog t " +
                        "JOIN Vehicle v ON t.vehicle_id = v.vehicle_id " +
                        "WHERE t.status = 'completed' " +
                        "  AND t.date_time_completed BETWEEN ? AND ? " +
                        "GROUP BY report_date, v.model, v.plate_number, v.mileage " +
                        "ORDER BY report_date ASC, v.model ASC";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement stmt = connection.prepareStatement(query)) {

            stmt.setString(1, startDate + " 00:00:00");
            stmt.setString(2, endDate + " 23:59:59");

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                MileageReportEntry entry = new MileageReportEntry();
                entry.setReportDate(rs.getDate("report_date"));
                entry.setVehicleModel(rs.getString("model"));
                entry.setPlateNumber(rs.getString("plate_number"));
                entry.setCurrentMileage(rs.getInt("mileage"));
                entry.setTotalDistanceTraveled(rs.getDouble("total_distance_traveled"));
                entry.setTripCount(rs.getLong("trip_count"));
                report.add(entry);
            }
        } catch (SQLException e) {
            System.err.println("Database Error during Mileage Report Generation: " + e.getMessage());
            e.printStackTrace();
        }
        return report;
    }
}