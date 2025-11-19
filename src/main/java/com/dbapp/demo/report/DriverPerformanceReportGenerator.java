package com.dbapp.demo.report;

import com.dbapp.demo.util.DBConnection;
import org.springframework.web.bind.annotation.*;

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
        private double  incidentRate;
        private double  avgTripDuration;
        private double  avgTripDistance;

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

        public double getIncidentRate() {
            return incidentRate;
        }

        public void setIncidentRate(double incidentRate) {
            this.incidentRate = incidentRate;
        }

        public double getAvgTripDuration() {
            return avgTripDuration;
        }

        public void setAvgTripDuration(double avgTripDuration) {
            this.avgTripDuration = avgTripDuration;
        }

        public double getAvgTripDistance() {
            return avgTripDistance;
        }

        public void setAvgTripDistance(double avgTripDistance) {
            this.avgTripDistance = avgTripDistance;
        }
    }

    @GetMapping("/performance")
    public List<DriverPerformanceEntry> getDriverPerformanceReport(@RequestParam("start") String startDate,
                                                                   @RequestParam("end") String endDate) {
        System.out.println("Generating Driver Performance Report...");
        return generateReport(startDate, endDate);
    }

    public List<DriverPerformanceEntry> generateReport(String startDate, String endDate) {
        List<DriverPerformanceEntry> report = new ArrayList<>();

        String query =
                "SELECT " +
                        "    DATE(t.date_time_completed) as report_date, " +
                        "    d.driver_id, " +
                        "    CONCAT(d.first_name, ' ', d.last_name) AS name, " +
                        "    COUNT(DISTINCT t.trip_id) AS completed_trips, " +
                        "    COUNT(DISTINCT i.incident_id) AS incident_count, " +
                        "    ROUND(COUNT(DISTINCT i.incident_id) / COUNT(DISTINCT t.trip_id), 2) AS incident_rate, " +
                        "    ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.date_time_start, t.date_time_completed)) / 60, 2) AS avg_trip_duration_hours, " +
                        "    ROUND(AVG(t.total_distance), 1) AS avg_trip_distance " +
                        "FROM Driver d " +
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

            stmt.setString(1, startDate + " 00:00:00");
            stmt.setString(2, endDate + " 23:59:59");

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                DriverPerformanceEntry entry = new DriverPerformanceEntry();
                entry.setReportDate(rs.getDate("report_date"));
                entry.setDriverId(rs.getInt("driver_id"));
                entry.setName(rs.getString("name"));
                entry.setNumberOfCompletedTrips(rs.getLong("completed_trips"));
                entry.setNumberOfIncidents(rs.getLong("incident_count"));
                entry.setIncidentRate(rs.getDouble("incident_rate"));
                entry.setAvgTripDuration(rs.getDouble("avg_trip_duration_hours"));
                entry.setAvgTripDistance(rs.getDouble("avg_trip_distance"));
                report.add(entry);
            }
        } catch (SQLException e) {
            System.err.println("Database Error during Driver Performance Report Generation: " + e.getMessage());
            e.printStackTrace();
        }
        return report;
    }
}