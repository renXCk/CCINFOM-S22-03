package com.dbapp.demo.services;

import com.dbapp.demo.dao.MaintenanceLogDAO;
import com.dbapp.demo.dao.MaintenancePartDAO;
import com.dbapp.demo.model.MaintenanceLog;
import com.dbapp.demo.model.MaintenancePart;
import com.dbapp.demo.model.Vehicle;
import com.dbapp.demo.model.Part;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class MaintenanceLogService {

    private final MaintenanceLogDAO dao;
    private final MaintenancePartDAO maintenancePartDAO;
    private final VehicleService vehicleService;
    private final PartService partService;

    private final List<String> allowedStatus = List.of("Ongoing", "Completed", "Cancelled");
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public MaintenanceLogService(MaintenanceLogDAO maintenanceLogDAO,
                                 MaintenancePartDAO maintenancePartDAO,
                                 VehicleService vehicleService,
                                 PartService partService) {
        this.dao = maintenanceLogDAO;
        this.maintenancePartDAO = maintenancePartDAO;
        this.vehicleService = vehicleService;
        this.partService = partService;
    }

    public boolean addMaintenanceLog(MaintenanceLog log, List<MaintenancePart> parts) {

        if (vehicleService.getVehicleById(log.getVehicleId()) == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        if (isDateInFuture(log.getDateTimeStart())) {
            System.err.println("Maintenance start date cannot be in the future");
            return false;
        }

        Vehicle vehicle = vehicleService.getVehicleById(log.getVehicleId());
        if (!"available".equalsIgnoreCase(vehicle.getStatus())) {
            System.err.println("Vehicle must be 'available' to schedule maintenance. Current status: " + vehicle.getStatus());
            return false;
        }

        if (dao.hasActiveMaintenance(log.getVehicleId())) {
            System.err.println("Vehicle already has an active maintenance log");
            return false;
        }

        if (parts != null && !parts.isEmpty()) {
            for (MaintenancePart mp : parts) {
                Integer partId = mp.getPartId();
                Integer quantityNeeded = mp.getQuantityUsed();

                if (partId == null || quantityNeeded == null) {
                    continue;
                }

                Part part = partService.getPartById(partId);
                if (part == null) {
                    System.err.println("Part with ID " + partId + " does not exist");
                    return false;
                }

                if (part.isPendingDelivery()) {
                    System.err.println("Part " + partId + " (" + part.getPartName() + ") is pending delivery");
                    return false;
                }

                if (part.getStockQty() < quantityNeeded) {
                    System.err.println("Insufficient quantity for part " + partId +
                            " (" + part.getPartName() + "). Available: " + part.getStockQty() + ", Needed: " + quantityNeeded);
                    return false;
                }

                mp.setCostPerPart(part.getCost());
            }
        }

        if (!allowedStatus.contains(log.getStatus())) {
            System.err.println("Invalid status. Allowed values: " + allowedStatus);
            return false;
        }

        List<MaintenancePart> partsToInsert = parts;
        if (parts == null || parts.isEmpty()) {
            partsToInsert = new ArrayList<>();
            MaintenancePart nullPart = new MaintenancePart();
            nullPart.setPartId(null);
            nullPart.setQuantityUsed(null);
            nullPart.setCostPerPart(null);
            partsToInsert.add(nullPart);
        }

        boolean created = dao.createMaintenanceLog(log, partsToInsert);

        if (!created) {
            System.err.println("Failed to create maintenance log");
            return false;
        }

        vehicleService.updateVehicleStatus(log.getVehicleId(), "on maintenance");

        if (parts != null && !parts.isEmpty()) {
            for (MaintenancePart mp : parts) {
                Integer partId = mp.getPartId();
                Integer quantity = mp.getQuantityUsed();

                if (partId != null && quantity != null) {
                    partService.decreaseStock(partId, quantity);
                }
            }
        }

        return true;
    }

    public List<MaintenanceLog> getAllMaintenanceLogs() {
        return dao.readMaintenanceLogs();
    }

    public MaintenanceLog getMaintenanceLogById(int id) {
        return dao.getMaintenanceLogById(id);
    }

    public boolean updateMaintenanceLog(MaintenanceLog log) {
        MaintenanceLog existing = dao.getMaintenanceLogById(log.getMaintenanceId());
        if (existing == null) {
            System.err.println("Maintenance log does not exist");
            return false;
        }

        if ("Completed".equals(log.getStatus())) {
            if (log.getDateTimeCompleted() == null || log.getDateTimeCompleted().trim().isEmpty()) {
                System.err.println("Completion date is required when status is 'Completed'");
                return false;
            }
        }

        if ("Cancelled".equals(log.getStatus())) {
            if ("Completed".equals(existing.getStatus())) {
                System.err.println("Cannot cancel a completed maintenance");
                return false;
            }
        }

        if (!allowedStatus.contains(log.getStatus())) {
            System.err.println("Invalid status. Allowed values: " + allowedStatus);
            return false;
        }

        return dao.updateMaintenanceLog(log);
    }

    public boolean completeMaintenance(int maintenanceId, String dateTimeCompleted) {
        MaintenanceLog maintenance = dao.getMaintenanceLogById(maintenanceId);

        if (maintenance == null) {
            System.err.println("Maintenance log does not exist");
            return false;
        }

        if (!"Ongoing".equalsIgnoreCase(maintenance.getStatus())) {
            System.err.println("Can only complete maintenance that is 'Ongoing'");
            return false;
        }

        if (isDateInFuture(dateTimeCompleted)) {
            System.err.println("Completion date cannot be in the future");
            return false;
        }

        maintenance.setDateTimeCompleted(dateTimeCompleted);
        maintenance.setStatus("Completed");
        dao.updateMaintenanceLog(maintenance);

        vehicleService.updateVehicleStatus(maintenance.getVehicleId(), "available");

        return true;
    }

    public boolean cancelMaintenance(int maintenanceId) {
        MaintenanceLog maintenance = dao.getMaintenanceLogById(maintenanceId);

        if (maintenance == null) {
            System.err.println("Maintenance log not found");
            return false;
        }

        if ("Completed".equalsIgnoreCase(maintenance.getStatus())) {
            System.err.println("Cannot cancel a completed maintenance");
            return false;
        }

        List<MaintenancePart> parts = maintenancePartDAO.readByMaintenanceId(maintenanceId);

        for (MaintenancePart mp : parts) {
            Integer partId = mp.getPartId();
            Integer quantity = mp.getQuantityUsed();

            if (partId != null && quantity != null) {
                partService.increaseStock(partId, quantity);
            }
        }

        vehicleService.updateVehicleStatus(maintenance.getVehicleId(), "available");

        maintenance.setStatus("Cancelled");
        dao.updateMaintenanceLog(maintenance);

        return true;
    }

    public double calculateMaintenanceCost(int maintenanceId) {
        List<MaintenancePart> parts = maintenancePartDAO.readByMaintenanceId(maintenanceId);
        double totalCost = 0.0;

        for (MaintenancePart part : parts) {
            if (part.getCostPerPart() != null && part.getQuantityUsed() != null) {
                totalCost += part.getCostPerPart() * part.getQuantityUsed();
            }
        }

        return totalCost >= 0 ? totalCost : 0.0;
    }

    public List<MaintenancePart> getMaintenanceParts(int maintenanceId) {
        return maintenancePartDAO.readByMaintenanceId(maintenanceId);
    }

    public boolean deleteMaintenance(int id) {
        return dao.deleteMaintenanceLog(id);
    }

    private boolean isDateInFuture(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty()) {
            return false;
        }
        try {
            LocalDateTime dateTime = LocalDateTime.parse(dateTimeStr, formatter);
            return dateTime.isAfter(LocalDateTime.now());
        } catch (Exception e) {
            System.err.println("Invalid date format. Expected: yyyy-MM-dd HH:mm:ss");
            return false;
        }
    }
//
//    @Transactional
//    public boolean addPartToMaintenance(int maintenanceId, MaintenancePart part) {
//        MaintenanceLog log = dao.getMaintenanceLogById(maintenanceId);
//
//        if (log == null) {
//            System.err.println("Maintenance log not found");
//            return false;
//        }
//
//        if (!"Ongoing".equals(log.getStatus())) {
//            System.err.println("Can only add parts to ongoing maintenance");
//            return false;
//        }
//
//        // Validate part availability
//        Part p = partService.getPartById(part.getPartId());
//        if (p == null || p.getStockQty() < part.getQuantityUsed()) {
//            System.err.println("Insufficient stock");
//            return false;
//        }
//
//        part.setMaintenanceId(maintenanceId);
//        part.setCostPerPart(p.getCost());
//
//        boolean added = maintenancePartDAO.createMaintenancePart(part);
//        if (added) {
//            partService.decreaseStock(part.getPartId(), part.getQuantityUsed());
//        }
//
//        return added;
//    }
}