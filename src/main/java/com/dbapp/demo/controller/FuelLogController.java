package com.dbapp.demo.controller;

import com.dbapp.demo.model.FuelLog;
import com.dbapp.demo.services.FuelLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuellogs")
@CrossOrigin("http://localhost:3000")
public class FuelLogController {

    private final FuelLogService fuelLogService;

    public FuelLogController(FuelLogService fuelLogService) {
        this.fuelLogService = fuelLogService;
    }

    @PostMapping("/add")
    public boolean createFuelLog(@RequestBody FuelLog fuelLog) {
        return fuelLogService.addFuelLog(fuelLog);
    }

    @GetMapping("/all")
    public List<FuelLog> getAllFuelLogs() {
        return fuelLogService.getAllFuelLogs();
    }

    @GetMapping("/{id}")
    public FuelLog getFuelLogById(@PathVariable int id) {
        return fuelLogService.getFuelLogById(id);
    }

    @GetMapping("/vehicle/{vehicleId}")
    public List<FuelLog> getFuelLogsByVehicle(@PathVariable int vehicleId) {
        return fuelLogService.getFuelLogsByVehicle(vehicleId);
    }

    @PutMapping("/update")
    public boolean updateFuelLog(@RequestBody FuelLog fuelLog) {
        return fuelLogService.updateFuelLog(fuelLog);
    }

    @PutMapping("/reimburse/{id}")
    public boolean markAsReimbursed(@PathVariable int id) {
        return fuelLogService.markAsReimbursed(id);
    }

    @DeleteMapping("/delete/{id}")
    public boolean deleteFuelLog(@PathVariable int id) {
        return fuelLogService.deleteFuelLog(id);
    }
}