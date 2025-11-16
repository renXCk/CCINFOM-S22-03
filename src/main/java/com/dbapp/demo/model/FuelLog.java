package com.dbapp.demo.model;

import java.sql.Timestamp;

public class FuelLog {
    private int fuelId;
    private int vehicleId;
    private int driverId;
    private Timestamp fuelDate;
    private String fuelType;
    private double litersFilled;
    private double pricePerLiter;
    private boolean reimbursed;

    public FuelLog() {}

    public FuelLog(int vehicleId, int driverId, Timestamp fuelDate, String fuelType,
                   double litersFilled, double pricePerLiter) {
        this.vehicleId = vehicleId;
        this.driverId = driverId;
        this.fuelDate = fuelDate;
        this.fuelType = fuelType;
        this.litersFilled = litersFilled;
        this.pricePerLiter = pricePerLiter;
        this.reimbursed = false;
    }

    // Getters and Setters
    public int getFuelId() { return fuelId; }
    public void setFuelId(int fuelId) { this.fuelId = fuelId; }

    public int getVehicleId() { return vehicleId; }
    public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

    public int getDriverId() { return driverId; }
    public void setDriverId(int driverId) { this.driverId = driverId; }

    public Timestamp getFuelDate() { return fuelDate; }
    public void setFuelDate(Timestamp fuelDate) { this.fuelDate = fuelDate; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public double getLitersFilled() { return litersFilled; }
    public void setLitersFilled(double litersFilled) { this.litersFilled = litersFilled; }

    public double getPricePerLiter() { return pricePerLiter; }
    public void setPricePerLiter(double pricePerLiter) { this.pricePerLiter = pricePerLiter; }

    public boolean isReimbursed() { return reimbursed; }
    public void setReimbursed(boolean reimbursed) { this.reimbursed = reimbursed; }

    // Computed field - total cost
    public double getTotalCost() {
        return litersFilled * pricePerLiter;
    }
}