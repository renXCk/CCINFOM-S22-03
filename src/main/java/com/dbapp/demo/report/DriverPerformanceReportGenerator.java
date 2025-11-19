package com.dbapp.demo.report;

import com.dbapp.demo.util.DBConnection;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("http://localhost:3000")
public class DriverPerformanceReportGenerator {

    public static class DriverPerformanceEntry {
        private Date reportDate;
        private int driverId;
        private String name;
        private long numberOfCompletedTrips;
        private long numberOfIncidents;

        // Getters and Setters
        public Date getReportDate() { return reportDate; }
        public void setReportDate(Date reportDate) { this.reportDate = reportDate; }

        public int getDriverId() { return driverId; }
        public void setDriverId(int driverId) { this.driverId = driverId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public long getNumberOfCompletedTrips() { return numberOfCompletedTrips; }
        public void setNumberOfCompletedTrips(long numberOfCompletedTrips) { this.numberOfCompletedTrips = numberOfCompletedTrips; }

        public long getNumberOfIncidents() { return numberOfIncidents; }
        public void setNumberOfIncidents(long numberOfIncidents) { this.numberOfIncidents = numberOfIncidents; }
    }

    @GetMapping("/performance")
    public List<DriverPerformanceEntry> getDriverPerformanceReport() {
        System.out.println("Generating Driver Performance Report...");
        return generateReport();
    }

    public List<DriverPerformanceEntry> generateReport() {
        List<DriverPerformanceEntry> report = new ArrayList<>();

        String query =
                "SELECT " +
                        "    DATE(t.date_time_completed) as report_date, " +
                        "    d.driver_id, " +
                        "    CONCAT(d.first_name, ' ', d.last_name) AS name, " +
                        "    COUNT(DISTINCT t.trip_id) AS completed_trips, " +
                        "    COUNT(DISTINCT i.incident_id) AS incident_count" +
                        "FROM Driver d"+
                        "JOIN " +
                        "    TripLog t ON d.driver_id = t.driver_id " +
                        "JOIN " +
                        "    IncidentLog i ON d.driver_id = i.driver_id " +
                        "WHERE t.status = 'completed' AND t.date_time_completed BETWEEN ? AND ?" +
                        "GROUP BY " +
                        "    report_date, d.driver_id, d.first_name, d.last_name " +
                        "ORDER BY " +
                        "    report_date ASC";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement stmt = connection.prepareStatement(query)) {

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                DriverPerformanceEntry entry = new DriverPerformanceEntry();
                entry.setReportDate(rs.getDate("report_date"));
                entry.setDriverId(rs.getInt("driver_id"));
                entry.setName(rs.getString("name"));
                entry.setNumberOfCompletedTrips(rs.getLong("number_of_completed_trips"));
                entry.setNumberOfIncidents(rs.getLong("number_of_incidents"));
                report.add(entry);
            }
        } catch (SQLException e) {
            System.err.println("Database Error during Driver Performance Report Generation: " + e.getMessage());
            e.printStackTrace();
        }
        return report;
    }
}