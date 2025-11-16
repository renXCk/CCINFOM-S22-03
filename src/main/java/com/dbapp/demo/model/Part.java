package com.dbapp.demo.model;

public class Part {
    private int partId;
    private String partName;
    private String description;
    private int stockQty;
    private double cost;
    private String supplier;
    private boolean pendingDelivery;

    public Part() {}


    public Part(int partId, String partName, String description, int stockQty, double cost, String supplier, boolean pendingDelivery) {
        this.partId = partId;
        this.partName = partName;
        this.description = description;
        this.stockQty = stockQty;
        this.cost = cost;
        this.supplier = supplier;
        this.pendingDelivery = pendingDelivery;
    }

    // Getters and Setters
    public int getPartId() { return partId; }
    public void setPartId(int partId) { this.partId = partId; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getStockQty() { return stockQty; }
    public void setStockQty(int stockQty) { this.stockQty = stockQty; }

    public double getCost() { return cost; }
    public void setCost(double cost) { this.cost = cost; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public boolean isPendingDelivery() { return pendingDelivery; }
    public void setPendingDelivery(boolean pendingDelivery) { this.pendingDelivery = pendingDelivery; }
}

