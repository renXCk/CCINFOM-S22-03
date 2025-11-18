package com.dbapp.demo.controller;

import com.dbapp.demo.model.Vehicle;
import com.dbapp.demo.services.VehicleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle")
@CrossOrigin("http://localhost:3000")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping("/vehicles")
    public List<Vehicle> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    @GetMapping("/{id}")
    public Vehicle getVehicleById(@PathVariable int id) {
        return vehicleService.getVehicleById(id);
    }

    @PostMapping("/add")
    public boolean createVehicle(@RequestBody Vehicle vehicle) {
        return vehicleService.addVehicle(vehicle);
    }

    @PutMapping("/update")
    public boolean updateVehicle(@RequestBody Vehicle vehicle) {
        return vehicleService.updateVehicle(vehicle);
    }

    @PutMapping("/status/{id}")
    public boolean updateVehicleStatus(@PathVariable int id, @RequestParam String status) {
        return vehicleService.updateVehicleStatus(id, status);
    }

    @PutMapping("/mileage/{id}")
    public boolean updateVehicleMileage(@PathVariable int id, @RequestParam int mileage) {
        return vehicleService.updateVehicleMileage(id, mileage);
    }

    @DeleteMapping("/delete/{id}")
    public boolean deleteVehicle(@PathVariable int id) {
        return vehicleService.deleteVehicle(id);
    }

    @PutMapping("/reactivate/{id}")
    public boolean reactivateVehicle(@PathVariable int id) {
        return vehicleService.reactivateVehicle(id);
    }




}
