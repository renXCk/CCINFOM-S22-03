package com.dbapp.demo.model;

import java.sql.Timestamp;

public class IncidentLog {
    private int incidentId;
    private int driverId;
    private int vehicleId;
    private String incidentType;
    private Timestamp incidentDateTime;
    private String incidentLocation;
    private String incidentSeverity;

    public IncidentLog() {}

    public IncidentLog(int driverId, int vehicleId, String incidentType, String incidentLocation, String incidentSeverity) {
        this.driverId = driverId;
        this.vehicleId = vehicleId;
        this.incidentType = incidentType;
        this.incidentLocation = incidentLocation;
        this.incidentSeverity = incidentSeverity;
    }

    // Getters and setters
    public int getIncidentId() { return incidentId; }
    public void setIncidentId(int incidentId) { this.incidentId = incidentId; }

    public int getDriverId() { return driverId; }
    public void setDriverId(int driverId) { this.driverId = driverId; }

    public int getVehicleId() { return vehicleId; }
    public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

    public String getIncidentType() { return incidentType; }
    public void setIncidentType(String incidentType) { this.incidentType = incidentType; }

    public Timestamp getIncidentDateTime() { return incidentDateTime; }
    public void setIncidentDateTime(Timestamp incidentDateTime) { this.incidentDateTime = incidentDateTime; }

    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }

    public String getIncidentSeverity() { return incidentSeverity; }
    public void setIncidentSeverity(String incidentSeverity) { this.incidentSeverity = incidentSeverity; }
}
