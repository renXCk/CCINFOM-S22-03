package com.dbapp.demo.controller;

import com.dbapp.demo.model.MaintenanceLog;
import com.dbapp.demo.model.MaintenancePart;
import com.dbapp.demo.services.MaintenanceLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenancelogs")
@CrossOrigin("http://localhost:3000")
public class MaintenanceLogController {

    private final MaintenanceLogService maintenanceLogService;

    public MaintenanceLogController(MaintenanceLogService maintenanceLogService) {
        this.maintenanceLogService = maintenanceLogService;
    }

    @GetMapping("/all")
    public List<MaintenanceLog> getAllMaintenanceLogs() {
        return maintenanceLogService.getAllMaintenanceLogs();
    }

    @GetMapping("/{id}")
    public MaintenanceLog getMaintenanceLogById(@PathVariable int id) {
        return maintenanceLogService.getMaintenanceLogById(id);
    }

    @PostMapping("/add")
    public boolean createMaintenanceLog(@RequestBody Map<String, Object> request) {
        MaintenanceLog log = (MaintenanceLog) request.get("log");
        List<MaintenancePart> parts = (List<MaintenancePart>) request.get("parts");
        return maintenanceLogService.addMaintenanceLog(log, parts);
    }

    @PutMapping("/update")
    public boolean updateMaintenanceLog(@RequestBody MaintenanceLog maintenanceLog) {
        return maintenanceLogService.updateMaintenanceLog(maintenanceLog);
    }

    @PutMapping("/complete/{id}")
    public boolean completeMaintenance(@PathVariable int id, @RequestParam String dateTimeCompleted) {
        return maintenanceLogService.completeMaintenance(id, dateTimeCompleted);
    }

    @PutMapping("/cancel/{id}")
    public boolean cancelMaintenance(@PathVariable int id) {
        return maintenanceLogService.cancelMaintenance(id);
    }

    @GetMapping("/{id}/cost")
    public double calculateMaintenanceCost(@PathVariable int id) {
        return maintenanceLogService.calculateMaintenanceCost(id);
    }

    @GetMapping("/{id}/parts")
    public List<MaintenancePart> getMaintenanceParts(@PathVariable int id) {
        return maintenanceLogService.getMaintenanceParts(id);
    }

    @DeleteMapping("/delete/{id}")
    public boolean deleteMaintenance(@PathVariable int id) {
        return maintenanceLogService.deleteMaintenance(id);
    }
}