package com.dbapp.demo.controller;

import com.dbapp.demo.model.TripLog;
import com.dbapp.demo.services.TripLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/triplogs")
public class TripLogController {

    public TripLogService tripLogService;

    public TripLogController(TripLogService tripLogService) { this.tripLogService = tripLogService; }

    // read all clients
    @GetMapping("/all")
    public List<TripLog> getAllTripLogs(){
        return tripLogService.getAllTripLogs();
    }

    // get client indiv by id
    @GetMapping("/{id}")
    public TripLog getTripLogById(@PathVariable int id){
        return tripLogService.getTripLogByID(id);
    }

    // create new client regis
    @PostMapping("/add")
    public boolean createClient(@RequestBody TripLog client) {
        return tripLogService.addTripLog(client);
    }

    // update client info
    @PutMapping("/update")
    public boolean updateClient(@RequestBody TripLog client) {
        return tripLogService.updateTripLog(client);
    }

    @DeleteMapping("/delete/{id}")
    public boolean deleteClient(@PathVariable int id) { return tripLogService.deleteTripLog(id); }




}
