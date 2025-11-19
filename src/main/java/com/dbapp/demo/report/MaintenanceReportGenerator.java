package com.dbapp.demo.report;

import com.dbapp.demo.model.MaintenanceLog;
import com.dbapp.demo.model.MaintenancePart;
import com.dbapp.demo.model.Vehicle;
import com.dbapp.demo.model.Part;
import com.dbapp.demo.dao.MaintenanceLogDAO;
import com.dbapp.demo.dao.MaintenancePartDAO;
import com.dbapp.demo.dao.VehicleDAO;
import com.dbapp.demo.dao.PartDAO;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class MaintenanceReportGenerator {
    private final MaintenanceLogDAO maintenanceLogDAO;
    private final MaintenancePartDAO maintenancePartDAO;
    private final VehicleDAO vehicleDAO;
    private final PartDAO partDAO;
    private final DateTimeFormatter formatter;

    public MaintenanceReportGenerator(MaintenanceLogDAO maintenanceLogDAO,
                                      MaintenancePartDAO maintenancePartDAO,
                                      VehicleDAO vehicleDAO,
                                      PartDAO partDAO) {
        this.maintenanceLogDAO = maintenanceLogDAO;
        this.maintenancePartDAO = maintenancePartDAO;
        this.vehicleDAO = vehicleDAO;
        this.partDAO = partDAO;
        this.formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    }

    public MaintenanceReport generateAnnualReport(int year) {
        List<MaintenanceLog> allLogs = maintenanceLogDAO.readMaintenanceLogs();

        List<MaintenanceLog> yearLogs = allLogs.stream()
                .filter(log -> isInYear(log.getDateTimeStart(), year))
                .collect(Collectors.toList());

        MaintenanceReport report = new MaintenanceReport();
        report.setYear(year);
        report.setTotalMaintenanceCount(yearLogs.size());

        double totalPartsCost = 0.0;
        int totalPartsUsed = 0;
        Map<Integer, VehicleMaintenanceSummary> vehicleSummaries = new HashMap<>();
        Map<String, Double> partCostBreakdown = new HashMap<>();

        for (MaintenanceLog log : yearLogs) {
            List<MaintenancePart> parts = maintenancePartDAO.readByMaintenanceId(log.getMaintenanceId());

            double maintenanceCost = 0.0;
            for (MaintenancePart mp : parts) {
                if (mp.getPartId() != null && mp.getQuantityUsed() != null && mp.getCostPerPart() != null) {
                    double partCost = mp.getCostPerPart() * mp.getQuantityUsed();
                    maintenanceCost += partCost;
                    totalPartsUsed += mp.getQuantityUsed();

                    Part part = partDAO.getPartById(mp.getPartId());
                    if (part != null) {
                        String partName = part.getPartName();
                        partCostBreakdown.put(partName,
                                partCostBreakdown.getOrDefault(partName, 0.0) + partCost);
                    }
                }
            }

            totalPartsCost += maintenanceCost;

            int vehicleId = log.getVehicleId();
            if (!vehicleSummaries.containsKey(vehicleId)) {
                Vehicle vehicle = vehicleDAO.getVehicleById(vehicleId);
                VehicleMaintenanceSummary summary = new VehicleMaintenanceSummary();
                summary.setVehicleId(vehicleId);
                summary.setPlateNumber(vehicle != null ? vehicle.getPlateNumber() : "Unknown");
                summary.setModel(vehicle != null ? vehicle.getModel() : "Unknown");
                vehicleSummaries.put(vehicleId, summary);
            }

            VehicleMaintenanceSummary summary = vehicleSummaries.get(vehicleId);
            summary.setMaintenanceCount(summary.getMaintenanceCount() + 1);
            summary.setTotalCost(summary.getTotalCost() + maintenanceCost);
            summary.getMaintenanceLogs().add(log);
        }

        report.setTotalPartsCost(totalPartsCost);
        report.setTotalPartsUsed(totalPartsUsed);
        report.setVehicleSummaries(new ArrayList<>(vehicleSummaries.values()));
        report.setPartCostBreakdown(partCostBreakdown);

        return report;
    }

    public VehicleMaintenanceReport generateVehicleReport(int vehicleId, int year) {
        Vehicle vehicle = vehicleDAO.getVehicleById(vehicleId);
        if (vehicle == null) {
            throw new IllegalArgumentException("Vehicle not found");
        }

        List<MaintenanceLog> allLogs = maintenanceLogDAO.readMaintenanceLogs();
        List<MaintenanceLog> vehicleLogs = allLogs.stream()
                .filter(log -> log.getVehicleId() == vehicleId && isInYear(log.getDateTimeStart(), year))
                .collect(Collectors.toList());

        VehicleMaintenanceReport report = new VehicleMaintenanceReport();
        report.setVehicleId(vehicleId);
        report.setPlateNumber(vehicle.getPlateNumber());
        report.setModel(vehicle.getModel());
        report.setVehicleType(vehicle.getVehicleType());
        report.setYear(year);
        report.setMaintenanceCount(vehicleLogs.size());

        List<MaintenanceDetail> details = new ArrayList<>();
        double totalCost = 0.0;

        for (MaintenanceLog log : vehicleLogs) {
            MaintenanceDetail detail = new MaintenanceDetail();
            detail.setMaintenanceId(log.getMaintenanceId());
            detail.setDateTimeStart(log.getDateTimeStart());
            detail.setDateTimeCompleted(log.getDateTimeCompleted());
            detail.setStatus(log.getStatus());

            List<MaintenancePart> parts = maintenancePartDAO.readByMaintenanceId(log.getMaintenanceId());
            List<PartUsageDetail> partDetails = new ArrayList<>();
            double maintenanceCost = 0.0;

            for (MaintenancePart mp : parts) {
                if (mp.getPartId() != null && mp.getQuantityUsed() != null && mp.getCostPerPart() != null) {
                    PartUsageDetail pud = new PartUsageDetail();
                    Part part = partDAO.getPartById(mp.getPartId());

                    pud.setPartId(mp.getPartId());
                    pud.setPartName(part != null ? part.getPartName() : "Unknown");
                    pud.setQuantityUsed(mp.getQuantityUsed());
                    pud.setCostPerPart(mp.getCostPerPart());
                    pud.setTotalCost(mp.getCostPerPart() * mp.getQuantityUsed());

                    partDetails.add(pud);
                    maintenanceCost += pud.getTotalCost();
                }
            }

            detail.setPartsUsed(partDetails);
            detail.setTotalCost(maintenanceCost);
            details.add(detail);
            totalCost += maintenanceCost;
        }

        report.setMaintenanceDetails(details);
        report.setTotalCost(totalCost);

        return report;
    }

    public Map<String, Object> generateSummaryStatistics(int year) {
        MaintenanceReport report = generateAnnualReport(year);
        Map<String, Object> stats = new HashMap<>();

        stats.put("year", year);
        stats.put("totalMaintenanceCount", report.getTotalMaintenanceCount());
        stats.put("totalPartsCost", String.format("%.2f", report.getTotalPartsCost()));
        stats.put("totalPartsUsed", report.getTotalPartsUsed());
        stats.put("vehiclesServiced", report.getVehicleSummaries().size());

        if (!report.getVehicleSummaries().isEmpty()) {
            double avgCostPerVehicle = report.getTotalPartsCost() / report.getVehicleSummaries().size();
            stats.put("averageCostPerVehicle", String.format("%.2f", avgCostPerVehicle));

            double avgMaintenancePerVehicle = (double) report.getTotalMaintenanceCount() / report.getVehicleSummaries().size();
            stats.put("averageMaintenancePerVehicle", String.format("%.2f", avgMaintenancePerVehicle));
        }

        double maxCost = 0.0;
        String mostExpensiveVehicle = "";
        for (VehicleMaintenanceSummary vms : report.getVehicleSummaries()) {
            if (vms.getTotalCost() > maxCost) {
                maxCost = vms.getTotalCost();
                mostExpensiveVehicle = vms.getPlateNumber();
            }
        }
        stats.put("mostExpensiveVehicle", mostExpensiveVehicle);
        stats.put("highestMaintenanceCost", String.format("%.2f", maxCost));

        return stats;
    }

    private boolean isInYear(String dateTimeStr, int year) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty()) {
            return false;
        }
        try {
            LocalDateTime dateTime = LocalDateTime.parse(dateTimeStr, formatter);
            return dateTime.getYear() == year;
        } catch (Exception e) {
            return false;
        }
    }

    public static class MaintenanceReport {
        private int year;
        private int totalMaintenanceCount;
        private double totalPartsCost;
        private int totalPartsUsed;
        private List<VehicleMaintenanceSummary> vehicleSummaries;
        private Map<String, Double> partCostBreakdown;

        public MaintenanceReport() {
            this.vehicleSummaries = new ArrayList<>();
            this.partCostBreakdown = new HashMap<>();
        }

        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }

        public int getTotalMaintenanceCount() { return totalMaintenanceCount; }
        public void setTotalMaintenanceCount(int totalMaintenanceCount) {
            this.totalMaintenanceCount = totalMaintenanceCount;
        }

        public double getTotalPartsCost() { return totalPartsCost; }
        public void setTotalPartsCost(double totalPartsCost) {
            this.totalPartsCost = totalPartsCost;
        }

        public int getTotalPartsUsed() { return totalPartsUsed; }
        public void setTotalPartsUsed(int totalPartsUsed) {
            this.totalPartsUsed = totalPartsUsed;
        }

        public List<VehicleMaintenanceSummary> getVehicleSummaries() {
            return vehicleSummaries;
        }
        public void setVehicleSummaries(List<VehicleMaintenanceSummary> vehicleSummaries) {
            this.vehicleSummaries = vehicleSummaries;
        }

        public Map<String, Double> getPartCostBreakdown() { return partCostBreakdown; }
        public void setPartCostBreakdown(Map<String, Double> partCostBreakdown) {
            this.partCostBreakdown = partCostBreakdown;
        }
    }

    public static class VehicleMaintenanceSummary {
        private int vehicleId;
        private String plateNumber;
        private String model;
        private int maintenanceCount;
        private double totalCost;
        private List<MaintenanceLog> maintenanceLogs;

        public VehicleMaintenanceSummary() {
            this.maintenanceCount = 0;
            this.totalCost = 0.0;
            this.maintenanceLogs = new ArrayList<>();
        }

        public int getVehicleId() { return vehicleId; }
        public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

        public String getPlateNumber() { return plateNumber; }
        public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }

        public int getMaintenanceCount() { return maintenanceCount; }
        public void setMaintenanceCount(int maintenanceCount) {
            this.maintenanceCount = maintenanceCount;
        }

        public double getTotalCost() { return totalCost; }
        public void setTotalCost(double totalCost) { this.totalCost = totalCost; }

        public List<MaintenanceLog> getMaintenanceLogs() { return maintenanceLogs; }
        public void setMaintenanceLogs(List<MaintenanceLog> maintenanceLogs) {
            this.maintenanceLogs = maintenanceLogs;
        }
    }

    public static class VehicleMaintenanceReport {
        private int vehicleId;
        private String plateNumber;
        private String model;
        private String vehicleType;
        private int year;
        private int maintenanceCount;
        private double totalCost;
        private List<MaintenanceDetail> maintenanceDetails;

        public VehicleMaintenanceReport() {
            this.maintenanceDetails = new ArrayList<>();
        }

        public int getVehicleId() { return vehicleId; }
        public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

        public String getPlateNumber() { return plateNumber; }
        public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }

        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }

        public int getMaintenanceCount() { return maintenanceCount; }
        public void setMaintenanceCount(int maintenanceCount) {
            this.maintenanceCount = maintenanceCount;
        }

        public double getTotalCost() { return totalCost; }
        public void setTotalCost(double totalCost) { this.totalCost = totalCost; }

        public List<MaintenanceDetail> getMaintenanceDetails() { return maintenanceDetails; }
        public void setMaintenanceDetails(List<MaintenanceDetail> maintenanceDetails) {
            this.maintenanceDetails = maintenanceDetails;
        }
    }

    public static class MaintenanceDetail {
        private int maintenanceId;
        private String dateTimeStart;
        private String dateTimeCompleted;
        private String status;
        private List<PartUsageDetail> partsUsed;
        private double totalCost;

        public MaintenanceDetail() {
            this.partsUsed = new ArrayList<>();
        }

        public int getMaintenanceId() { return maintenanceId; }
        public void setMaintenanceId(int maintenanceId) { this.maintenanceId = maintenanceId; }

        public String getDateTimeStart() { return dateTimeStart; }
        public void setDateTimeStart(String dateTimeStart) {
            this.dateTimeStart = dateTimeStart;
        }

        public String getDateTimeCompleted() { return dateTimeCompleted; }
        public void setDateTimeCompleted(String dateTimeCompleted) {
            this.dateTimeCompleted = dateTimeCompleted;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public List<PartUsageDetail> getPartsUsed() { return partsUsed; }
        public void setPartsUsed(List<PartUsageDetail> partsUsed) {
            this.partsUsed = partsUsed;
        }

        public double getTotalCost() { return totalCost; }
        public void setTotalCost(double totalCost) { this.totalCost = totalCost; }
    }

    public static class PartUsageDetail {
        private int partId;
        private String partName;
        private int quantityUsed;
        private double costPerPart;
        private double totalCost;

        public int getPartId() { return partId; }
        public void setPartId(int partId) { this.partId = partId; }

        public String getPartName() { return partName; }
        public void setPartName(String partName) { this.partName = partName; }

        public int getQuantityUsed() { return quantityUsed; }
        public void setQuantityUsed(int quantityUsed) { this.quantityUsed = quantityUsed; }

        public double getCostPerPart() { return costPerPart; }
        public void setCostPerPart(double costPerPart) { this.costPerPart = costPerPart; }

        public double getTotalCost() { return totalCost; }
        public void setTotalCost(double totalCost) { this.totalCost = totalCost; }
    }
}