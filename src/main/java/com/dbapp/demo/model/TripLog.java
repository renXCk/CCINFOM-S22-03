package com.dbapp.demo.model;

public class TripLog {
    private int tripId;
    private int clientId;
    private int driverId;
    private int vehicleId;
    private String pickUpLocation;
    private String dropOffLocation;
    private String startTime;
    private String completeTime;
    private float tripCost;
    private String status;

    public TripLog() {}

    public TripLog(int clientId, int vehicleId, int driverId, String pickUpLocation, String dropOffLocation, float tripCost, String status) {
        this.clientId = clientId;
        this.vehicleId = vehicleId;
        this.driverId = driverId;
        this.pickUpLocation = pickUpLocation;
        this.dropOffLocation = dropOffLocation;
        this.tripCost = tripCost;
        this.status = status;
    }

    // Getters and setters
    public int getTripId() { return tripId; }
    public void setTripId(int tripId) { this.tripId = tripId; }

    public int getClientId() { return clientId; }
    public void setClientId(int clientId) { this.clientId = clientId; }

    public int getVehicleId() { return vehicleId; }
    public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

    public int getDriverId() { return driverId; }
    public void setDriverId(int driverId) { this.driverId = driverId; }

    public String getPickUpLocation() { return pickUpLocation; }
    public void setPickUpLocation(String pickUpLocation) { this.pickUpLocation = pickUpLocation; }

    public String getDropOffLocation() { return dropOffLocation; }
    public void setDropOffLocation(String dropOffLocation) { this.dropOffLocation = dropOffLocation; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getCompleteTime() { return completeTime; }
    public void setCompleteTime(String completeTime) { this.completeTime = completeTime; }

    public float getTripCost() { return tripCost; }
    public void setTripCost(float tripCost) { this.tripCost = tripCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
