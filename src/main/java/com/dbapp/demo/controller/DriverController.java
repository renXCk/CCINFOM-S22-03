package com.dbapp.demo.controller;

import com.dbapp.demo.model.Driver;
import com.dbapp.demo.services.DriverService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    public DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    // read all driver
    @GetMapping("/all")
    public List<Driver> getAllClients(){
        return driverService.getAllDrivers();
    }

    // get indiv driver by id
    @GetMapping("/{id}")
    public Driver getClientById(@PathVariable int id){
        return driverService.getDriverById(id);
    }

    // create new driver
    @PostMapping("/add")
    public boolean createDriver(@RequestBody Driver driver) {
        return driverService.addDriver(driver);
    }

    // update driver info
    @PutMapping("/update")
    public boolean updateClient(@RequestBody Driver driver) {
        return driverService.updateDriver(driver);
    }

    // delete driver
    @DeleteMapping("/delete/{id}")
    public boolean deleteDriver(@PathVariable int id) {
        return driverService.deleteDriver(id);
    }

}
