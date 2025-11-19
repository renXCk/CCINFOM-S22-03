package com.dbapp.demo.report;

import com.dbapp.demo.util.DBConnection;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("http://localhost:3000")
public class ClientReportGenerator {

    public static class ClientReportEntry {
        private int clientId;
        private String clientName;
        private long totalShipmentsBooked;
        private long completedShipments;
        private String vehiclesUsed;

        public int getClientId() { return clientId; }
        public void setClientId(int clientId) { this.clientId = clientId; }

        public String getClientName() { return clientName; }
        public void setClientName(String clientName) { this.clientName = clientName; }

        public long getTotalShipmentsBooked() { return totalShipmentsBooked; }
        public void setTotalShipmentsBooked(long totalShipmentsBooked) { this.totalShipmentsBooked = totalShipmentsBooked; }

        public long getCompletedShipments() { return completedShipments; }
        public void setCompletedShipments(long completedShipments) { this.completedShipments = completedShipments; }

        public String getVehiclesUsed() { return vehiclesUsed; }
        public void setVehiclesUsed(String vehiclesUsed) { this.vehiclesUsed = vehiclesUsed; }
    }

    @GetMapping("/clients")
    public List<ClientReportEntry> getClientReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        int targetMonth = (month != null) ? month : LocalDate.now().getMonthValue();

        System.out.println("Generating Client Report for: " + targetMonth + "/" + targetYear);
        return generateReport(targetYear, targetMonth);
    }

    public List<ClientReportEntry> generateReport(int year, int month) {
        List<ClientReportEntry> report = new ArrayList<>();

        String query =
                "SELECT " +
                        "    c.client_id, " +
                        "    c.name AS client_name, " +
                        "    COUNT(t.trip_id) AS total_shipments_booked, " +
                        "    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_shipments, " +
                        "    GROUP_CONCAT( " +
                        "        DISTINCT CONCAT(v.plate_number, ' - ', v.model, ' (', v.vehicle_type, ')') " +
                        "        SEPARATOR ', ' " +
                        "    ) AS vehicles_used " +
                        "FROM " +
                        "    Client c " +
                        "LEFT JOIN " +
                        "    TripLog t ON c.client_id = t.client_id " +
                        "    AND YEAR(t.date_time_start) = ? " +
                        "    AND MONTH(t.date_time_start) = ? " +
                        "LEFT JOIN " +
                        "    Vehicle v ON t.vehicle_id = v.vehicle_id " +
                        "GROUP BY " +
                        "    c.client_id, c.name " +
                        "ORDER BY " +
                        "    total_shipments_booked DESC";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement stmt = connection.prepareStatement(query)) {

            stmt.setInt(1, year);
            stmt.setInt(2, month);

            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                ClientReportEntry entry = new ClientReportEntry();
                entry.setClientId(rs.getInt("client_id"));
                entry.setClientName(rs.getString("client_name"));
                entry.setTotalShipmentsBooked(rs.getLong("total_shipments_booked"));
                entry.setCompletedShipments(rs.getLong("completed_shipments"));

                String vehicles = rs.getString("vehicles_used");
                entry.setVehiclesUsed(vehicles != null ? vehicles : "None");

                report.add(entry);
            }
        } catch (SQLException e) {
            System.err.println("Database Error during Client Report Generation: " + e.getMessage());
            e.printStackTrace();
        }
        return report;
    }
}