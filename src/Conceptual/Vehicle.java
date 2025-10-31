package Conceptual;

public class Vehicle {
    private int vehicleId;
    private String plateNumber;
    private String vehicleType;
    private String model;
    private String status;
    private int mileage;

    public Vehicle(String plateNumber, String vehicleType, String model, String status, int mileage) {
        this.plateNumber = plateNumber;
        this.vehicleType = vehicleType;
        this.model = model;
        this.status = status;
        this.mileage = mileage;
    }

    // Getters and Setters
    public int getVehicleId() { return vehicleId; }
    public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getMileage() { return mileage; }
    public void setMileage(int mileage) { this.mileage = mileage; }



}
