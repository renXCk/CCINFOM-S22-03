package com.dbapp.demo.report;

import com.dbapp.demo.dao.MaintenanceLogDAO;
import com.dbapp.demo.dao.MaintenancePartDAO;
import com.dbapp.demo.dao.VehicleDAO;
import com.dbapp.demo.dao.PartDAO;
import com.dbapp.demo.model.MaintenanceLog;
import com.dbapp.demo.model.MaintenancePart;
import com.dbapp.demo.model.Part;
import com.dbapp.demo.model.Vehicle;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("http://localhost:3000")
public class MaintenanceReportGenerator {

    private final MaintenanceLogDAO maintenanceLogDAO;
    private final MaintenancePartDAO maintenancePartDAO;
    private final VehicleDAO vehicleDAO;
    private final PartDAO partDAO;

    public MaintenanceReportGenerator(MaintenanceLogDAO maintenanceLogDAO,
                                      MaintenancePartDAO maintenancePartDAO,
                                      VehicleDAO vehicleDAO,
                                      PartDAO partDAO) {
        this.maintenanceLogDAO = maintenanceLogDAO;
        this.maintenancePartDAO = maintenancePartDAO;
        this.vehicleDAO = vehicleDAO;
        this.partDAO = partDAO;
    }

    @GetMapping("/maintenance")
    public List<MaintenanceDetail> getMaintenanceReport(
            @RequestParam String start,
            @RequestParam String end) {

        List<MaintenanceLog> logs = maintenanceLogDAO.readMaintenanceLogs().stream()
                .filter(log -> log.getDateTimeStart().compareTo(start) >= 0 &&
                        log.getDateTimeStart().compareTo(end) <= 0)
                .collect(Collectors.toList());

        List<MaintenanceDetail> details = new ArrayList<>();
        for (MaintenanceLog log : logs) {
            MaintenanceDetail detail = new MaintenanceDetail();
            detail.setMaintenanceId(log.getMaintenanceId());
            detail.setDateTimeStart(log.getDateTimeStart());
            detail.setDateTimeCompleted(log.getDateTimeCompleted());
            detail.setStatus(log.getStatus());

            List<MaintenancePart> parts = maintenancePartDAO.readByMaintenanceId(log.getMaintenanceId());
            List<PartUsageDetail> partDetails = new ArrayList<>();
            for (MaintenancePart mp : parts) {
                PartUsageDetail pud = new PartUsageDetail();
                Part part = partDAO.getPartById(mp.getPartId());
                pud.setPartId(mp.getPartId());
                pud.setPartName(part != null ? part.getPartName() : "Unknown");
                pud.setQuantityUsed(mp.getQuantityUsed());
                pud.setCostPerPart(mp.getCostPerPart());
                pud.setTotalCost(mp.getQuantityUsed() * mp.getCostPerPart());
                partDetails.add(pud);
            }
            detail.setPartsUsed(partDetails);
            details.add(detail);
        }
        return details;
    }

    @GetMapping("/maintenance/summary")
    public Map<String, Object> getMaintenanceSummary(@RequestParam String start,
                                                     @RequestParam String end) {
        List<MaintenanceDetail> details = getMaintenanceReport(start, end);
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalMaintenances", details.size());
        summary.put("ongoing", details.stream().filter(d -> "Ongoing".equalsIgnoreCase(d.getStatus())).count());
        summary.put("completed", details.stream().filter(d -> "Completed".equalsIgnoreCase(d.getStatus())).count());
        summary.put("cancelled", details.stream().filter(d -> "Cancelled".equalsIgnoreCase(d.getStatus())).count());
        return summary;
    }

    public static class MaintenanceDetail {
        private int maintenanceId;
        private String dateTimeStart;
        private String dateTimeCompleted;
        private String status;
        private List<PartUsageDetail> partsUsed = new ArrayList<>();

        public int getMaintenanceId() { return maintenanceId; }
        public void setMaintenanceId(int maintenanceId) { this.maintenanceId = maintenanceId; }

        public String getDateTimeStart() { return dateTimeStart; }
        public void setDateTimeStart(String dateTimeStart) { this.dateTimeStart = dateTimeStart; }

        public String getDateTimeCompleted() { return dateTimeCompleted; }
        public void setDateTimeCompleted(String dateTimeCompleted) { this.dateTimeCompleted = dateTimeCompleted; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public List<PartUsageDetail> getPartsUsed() { return partsUsed; }
        public void setPartsUsed(List<PartUsageDetail> partsUsed) { this.partsUsed = partsUsed; }
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
