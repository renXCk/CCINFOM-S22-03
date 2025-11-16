package Business.model;

public class MaintenancePart {
    private int maintenanceId;
    private Integer partId;       // nullable
    private Integer quantityUsed; // nullable
    private Double costPerPart;   // nullable

    public MaintenancePart() {}

    public MaintenancePart(int maintenanceId, Integer partId, Integer quantityUsed, Double costPerPart) {
        this.maintenanceId = maintenanceId;
        this.partId = partId;
        this.quantityUsed = quantityUsed;
        this.costPerPart = costPerPart;
    }

    // Getters and Setters
    public int getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(int maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

    public Integer getPartId() {
        return partId;
    }

    public void setPartId(Integer partId) {
        this.partId = partId;
    }

    public Integer getQuantityUsed() {
        return quantityUsed;
    }

    public void setQuantityUsed(Integer quantityUsed) {
        this.quantityUsed = quantityUsed;
    }

    public Double getCostPerPart() {
        return costPerPart;
    }

    public void setCostPerPart(Double costPerPart) {
        this.costPerPart = costPerPart;
    }
}
