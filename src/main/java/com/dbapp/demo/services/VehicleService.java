package com.dbapp.demo.services;

import com.dbapp.demo.model.Vehicle;
import com.dbapp.demo.dao.VehicleDAO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {
    private final VehicleDAO dao;

    public VehicleService(VehicleDAO vehicleDAO) {
        this.dao = vehicleDAO;
    }

    public boolean addVehicle(Vehicle v) {
        return dao.createVehicle(v);
    }

    public List<Vehicle> getAllVehicles() {
        return dao.readVehicles();
    }

    public boolean updateVehicle(Vehicle v) {
        return dao.updateVehicle(v);
    }

    public boolean deleteVehicle(int id) {
        return dao.deleteVehicle(id);
    }
}
