package com.dbapp.demo.model;

public class DriverView {

    private int driverId;
    private String driverName;
    private String licenseNum;

    private int vehicleId;
    private String plateNumber;
    private String model;
    private String vehicleType;

    public int getDriverId() { return driverId; }
    public void setDriverId(int driverId) { this.driverId = driverId; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getLicenseNum() { return licenseNum; }
    public void setLicenseNum(String licenseNum) { this.licenseNum = licenseNum; }

    public int getVehicleId() { return vehicleId; }
    public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
}