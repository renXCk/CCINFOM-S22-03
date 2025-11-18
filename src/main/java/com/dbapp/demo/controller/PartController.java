package com.dbapp.demo.controller;

import com.dbapp.demo.model.Part;
import com.dbapp.demo.services.PartService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@CrossOrigin("http://localhost:3000")
public class PartController {

    private final PartService partService;

    public PartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping("/all")
    public List<Part> getAllParts() {
        return partService.getAllParts();
    }

    @GetMapping("/active")
    public List<Part> getActiveParts() {
        return partService.getActiveParts();
    }

    @GetMapping("/inactive")
    public List<Part> getInactiveParts() {
        return partService.getInactiveParts();
    }

    @GetMapping("/out-of-stock")
    public List<Part> getOutOfStockParts() {
        return partService.getOutOfStockParts();
    }

    @GetMapping("/supplier/{supplier}")
    public List<Part> getPartsBySupplier(@PathVariable String supplier) {
        return partService.getPartsBySupplier(supplier);
    }

    @GetMapping("/{id}")
    public Part getPartById(@PathVariable int id) {
        return partService.getPartById(id);
    }

    @GetMapping("/{id}/available")
    public boolean isPartAvailable(@PathVariable int id) {
        return partService.isPartAvailable(id);
    }

    @GetMapping("/{id}/sufficient/{quantity}")
    public boolean hasSufficientStock(@PathVariable int id, @PathVariable int quantity) {
        return partService.hasSufficientStock(id, quantity);
    }

    @PostMapping("/add")
    public boolean createPart(@RequestBody Part part) {
        return partService.addPart(part);
    }

    @PutMapping("/update")
    public boolean updatePart(@RequestBody Part part) {
        return partService.updatePart(part);
    }

    @PutMapping("/{id}/request-shipment")
    public boolean requestShipment(@PathVariable int id) {
        return partService.requestShipment(id);
    }

    @PutMapping("/{id}/complete-delivery")
    public boolean completeDelivery(@PathVariable int id, @RequestParam int quantityReceived) {
        return partService.completeDelivery(id, quantityReceived);
    }

    @PutMapping("/{id}/decrease-stock")
    public boolean decreaseStock(@PathVariable int id, @RequestParam int quantity) {
        return partService.decreaseStock(id, quantity);
    }

    @PutMapping("/{id}/increase-stock")
    public boolean increaseStock(@PathVariable int id, @RequestParam int quantity) {
        return partService.increaseStock(id, quantity);
    }

    @DeleteMapping("/delete/{id}")
    public boolean deletePart(@PathVariable int id) {
        return partService.deletePart(id);
    }

    @PutMapping("/{id}/reactivate")
    public boolean reactivatePart(@PathVariable int id) {
        return partService.reactivatePart(id);
    }

//    @GetMapping("/{id}/vehicles")
//    public List<Vehicle> getVehiclesByPart(@PathVariable int id) {
//        return partService.getVehiclesByPartId(id);
//    }
}