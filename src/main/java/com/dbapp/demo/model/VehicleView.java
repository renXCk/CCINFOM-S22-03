package com.dbapp.demo.model;

import java.sql.Timestamp;

// This class models the result set from your SQL 'VehicleView'
public class VehicleView {

    // Vehicle Details
    private int vehicleId;
    private String plateNumber;
    private String model;

    // Trip Details
    private int tripId;
    private Timestamp dateTimeStart;
    private Timestamp dateTimeCompleted;
    private String tripStatus;

    // Driver Details
    private int driverId;
    private String driverName;
    private String licenseNum;

    // Client Details
    private int clientId;
    private String clientName;
    private String clientType;

    // --- Getters and Setters ---

    public int getVehicleId() { return vehicleId; }
    public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getTripId() { return tripId; }
    public void setTripId(int tripId) { this.tripId = tripId; }

    public Timestamp getDateTimeStart() { return dateTimeStart; }
    public void setDateTimeStart(Timestamp dateTimeStart) { this.dateTimeStart = dateTimeStart; }

    public Timestamp getDateTimeCompleted() { return dateTimeCompleted; }
    public void setDateTimeCompleted(Timestamp dateTimeCompleted) { this.dateTimeCompleted = dateTimeCompleted; }

    public String getTripStatus() { return tripStatus; }
    public void setTripStatus(String tripStatus) { this.tripStatus = tripStatus; }

    public int getDriverId() { return driverId; }
    public void setDriverId(int driverId) { this.driverId = driverId; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getLicenseNum() { return licenseNum; }
    public void setLicenseNum(String licenseNum) { this.licenseNum = licenseNum; }

    public int getClientId() { return clientId; }
    public void setClientId(int clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientType() { return clientType; }
    public void setClientType(String clientType) { this.clientType = clientType; }
}