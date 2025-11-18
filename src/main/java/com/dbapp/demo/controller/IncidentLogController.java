package com.dbapp.demo.controller;

import com.dbapp.demo.model.IncidentLog;
import com.dbapp.demo.services.IncidentLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidentlogs")
@CrossOrigin("http://localhost:3000")
public class IncidentLogController {

    public IncidentLogService incidentLogService;

    public IncidentLogController(IncidentLogService incidentLogService) { this.incidentLogService = incidentLogService; }

    // read all incident logs
    @GetMapping("/all")
    public List<IncidentLog> getAllIncidentLogs(){
        return incidentLogService.getAllIncidentLogs();
    }

    // get indiv incidents by id
    @GetMapping("/{id}")
    public IncidentLog getIncidentLogById(@PathVariable int id){
        return incidentLogService.getIncidentLogsById(id);
    }

    // create new incident log
    @PostMapping("/add")
    public boolean createIncidentLog(@RequestBody IncidentLog incident) {
        return incidentLogService.addIncidentLog(incident);
    }

    // update incident info
    @PutMapping("/update")
    public boolean updateIncidentLog(@RequestBody IncidentLog incident) {
        return incidentLogService.updateIncidentLog(incident);
    }

    // delete incident log
    @DeleteMapping("/delete/{id}")
    public boolean deleteIncidentLog(@PathVariable int id) { return incidentLogService.deleteIncidentLog(id); }




}
