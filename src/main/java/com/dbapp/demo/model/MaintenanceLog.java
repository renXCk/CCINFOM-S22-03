package com.dbapp.demo.model;

public class MaintenanceLog {
    private int maintenanceId;
    private int vehicleId;
    private String dateTimeStart;
    private String dateTimeCompleted;
    private String description;
    private String status;

    public MaintenanceLog() {}

    public MaintenanceLog(int vehicleId, String dateTimeStart, String description, String status) {
        this.vehicleId = vehicleId;
        this.dateTimeStart = dateTimeStart;
        this.description = description;
        this.status = status;
    }

    // Getters and setters
    public int getMaintenanceId() { return maintenanceId; }
    public void setMaintenanceId(int maintenanceId) { this.maintenanceId = maintenanceId; }

    public int getVehicleId() { return vehicleId; }
    public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

    public String getDateTimeStart() { return dateTimeStart; }
    public void setDateTimeStart(String dateTimeStart) { this.dateTimeStart = dateTimeStart; }

    public String getDateTimeCompleted() { return dateTimeCompleted; }
    public void setDateTimeCompleted(String dateTimeCompleted) { this.dateTimeCompleted = dateTimeCompleted; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
