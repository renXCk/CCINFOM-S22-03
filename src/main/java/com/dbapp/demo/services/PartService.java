package com.dbapp.demo.services;

import com.dbapp.demo.model.Part;
import com.dbapp.demo.dao.PartDAO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PartService {
    private final PartDAO dao;

    public PartService(PartDAO partDAO) {
        this.dao = partDAO;
    }

    public boolean addPart(Part part) {
        if (part.getPartName() == null || part.getPartName().trim().isEmpty()) {
            System.err.println("Part name cannot be empty");
            return false;
        }

        if (part.getSupplier() == null || part.getSupplier().trim().isEmpty()) {
            System.err.println("Supplier cannot be empty");
            return false;
        }

        if (part.getStockQty() < 0) {
            System.err.println("Stock quantity cannot be negative");
            return false;
        }

        if (part.getCost() < 0) {
            System.err.println("Cost cannot be negative");
            return false;
        }

        List<Part> existingParts = dao.readPart();
        boolean duplicateExists = existingParts.stream()
                .anyMatch(p -> p.getPartName().equalsIgnoreCase(part.getPartName()) &&
                        p.getSupplier().equalsIgnoreCase(part.getSupplier()));

        if (duplicateExists) {
            System.err.println("A part with name '" + part.getPartName() +
                    "' from supplier '" + part.getSupplier() + "' already exists");
            return false;
        }

        return dao.createPart(part);
    }

    public List<Part> getAllParts() {
        return dao.readPart();
    }

    public List<Part> getActiveParts() {
        List<Part> allParts = dao.readPart();
        return allParts.stream()
                .filter(part -> part.getStockQty() > 0 || part.isPendingDelivery())
                .collect(Collectors.toList());
    }

    public List<Part> getInactiveParts() {
        List<Part> allParts = dao.readPart();
        return allParts.stream()
                .filter(part -> part.getStockQty() == 0 && !part.isPendingDelivery())
                .collect(Collectors.toList());
    }

    public List<Part> getOutOfStockParts() {
        List<Part> allParts = dao.readPart();
        return allParts.stream()
                .filter(part -> part.getStockQty() == 0)
                .collect(Collectors.toList());
    }

    public Part getPartById(int partId) {
        return dao.getPartById(partId);
    }

    public boolean updatePart(Part part) {
        Part existingPart = dao.getPartById(part.getPartId());
        if (existingPart == null) {
            System.err.println("Part does not exist");
            return false;
        }

        if (part.getPartName() == null || part.getPartName().trim().isEmpty()) {
            System.err.println("Part name cannot be empty");
            return false;
        }

        if (part.getSupplier() == null || part.getSupplier().trim().isEmpty()) {
            System.err.println("Supplier cannot be empty");
            return false;
        }

        if (part.getStockQty() < 0) {
            System.err.println("Stock quantity cannot be negative");
            return false;
        }

        if (part.getCost() < 0) {
            System.err.println("Cost cannot be negative");
            return false;
        }

        List<Part> existingParts = dao.readPart();
        boolean duplicateExists = existingParts.stream()
                .anyMatch(p -> p.getPartId() != part.getPartId() &&
                        p.getPartName().equalsIgnoreCase(part.getPartName()) &&
                        p.getSupplier().equalsIgnoreCase(part.getSupplier()));

        if (duplicateExists) {
            System.err.println("Another part with name '" + part.getPartName() +
                    "' from supplier '" + part.getSupplier() + "' already exists");
            return false;
        }

        if (existingPart.isPendingDelivery() &&
                part.getStockQty() != existingPart.getStockQty() &&
                part.isPendingDelivery()) {
            System.err.println("Cannot update stock quantity while delivery is pending. Complete delivery first.");
            return false;
        }

        if (isPartInactive(part.getPartId())) {
            System.out.println("Warning: Editing an inactive part. This will not affect historical maintenance records.");
        }

        return dao.updatePart(part);
    }

    public boolean requestShipment(int partId) {
        Part part = dao.getPartById(partId);
        if (part == null) {
            System.err.println("Part does not exist");
            return false;
        }

        if (part.isPendingDelivery()) {
            System.err.println("Part already has a pending delivery. Complete the current delivery before requesting another.");
            return false;
        }

        part.setPendingDelivery(true);
        return dao.updatePart(part);
    }

    public boolean completeDelivery(int partId, int quantityReceived) {
        Part part = dao.getPartById(partId);
        if (part == null) {
            System.err.println("Part does not exist");
            return false;
        }

        if (!part.isPendingDelivery()) {
            System.err.println("Part has no pending delivery");
            return false;
        }

        if (quantityReceived <= 0) {
            System.err.println("Quantity received must be greater than 0");
            return false;
        }

        part.setStockQty(part.getStockQty() + quantityReceived);
        part.setPendingDelivery(false);

        return dao.updatePart(part);
    }

    public boolean decreaseStock(int partId, int quantity) {
        Part part = dao.getPartById(partId);
        if (part == null) {
            System.err.println("Part does not exist");
            return false;
        }

        if (quantity <= 0) {
            System.err.println("Quantity must be greater than 0");
            return false;
        }

        int newStock = part.getStockQty() - quantity;

        if (newStock < 0) {
            System.err.println("Insufficient stock. Available: " + part.getStockQty() +
                    ", Requested: " + quantity);
            return false;
        }

        part.setStockQty(newStock);

        return dao.updatePart(part);
    }

    public boolean increaseStock(int partId, int quantity) {
        Part part = dao.getPartById(partId);
        if (part == null) {
            System.err.println("Part does not exist");
            return false;
        }

        if (quantity <= 0) {
            System.err.println("Quantity must be greater than 0");
            return false;
        }

        part.setStockQty(part.getStockQty() + quantity);
        return dao.updatePart(part);
    }

    public boolean isPartAvailable(int partId) {
        Part part = dao.getPartById(partId);
        if (part == null) {
            return false;
        }
        return part.getStockQty() > 0 && !part.isPendingDelivery();
    }

    public boolean hasSufficientStock(int partId, int requiredQuantity) {
        Part part = dao.getPartById(partId);
        if (part == null) {
            return false;
        }
        return part.getStockQty() >= requiredQuantity;
    }

    public List<Part> getPartsBySupplier(String supplier) {
        List<Part> allParts = dao.readPart();
        return allParts.stream()
                .filter(part -> part.getSupplier().equalsIgnoreCase(supplier))
                .collect(Collectors.toList());
    }

    public boolean isPartInactive(int partId) {
        Part part = dao.getPartById(partId);
        if (part == null) {
            return false;
        }
        return part.getStockQty() == 0 && !part.isPendingDelivery();
    }

    public boolean deletePart(int partId) {
        Part part = dao.getPartById(partId);
        if (part == null) {
            System.err.println("Part does not exist");
            return false;
        }

        part.setStockQty(0);
        part.setPendingDelivery(false);

        return dao.updatePart(part);
    }

    public boolean reactivatePart(int partId) {
        Part part = dao.getPartById(partId);
        if (part == null) {
            System.err.println("Part does not exist");
            return false;
        }

        if (!isPartInactive(partId)) {
            System.err.println("Only inactive parts can be reactivated");
            return false;
        }

        return requestShipment(partId);
    }
}