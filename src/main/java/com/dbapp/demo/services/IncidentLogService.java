package com.dbapp.demo.services;

import com.dbapp.demo.model.Driver;
import com.dbapp.demo.model.Vehicle;
import com.dbapp.demo.dao.DriverDAO;
import com.dbapp.demo.dao.VehicleDAO;
import com.dbapp.demo.model.IncidentLog;
import com.dbapp.demo.dao.IncidentLogDAO;

import java.util.List;
import java.sql.Timestamp;

public class IncidentLogService {
    private final IncidentLogDAO incidentLogDAO = new IncidentLogDAO();
    private final VehicleDAO vehicleDAO = new VehicleDAO();
    private final DriverDAO driverDAO = new DriverDAO();

    public boolean addIncidentLog(IncidentLog i) {
        Vehicle vehicle = vehicleDAO.getVehicleById(i.getVehicleId());
        if (vehicle == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        String vehicleStatus = vehicle.getStatus();
        if (!vehicleStatus.equals("on_trip")) {
            System.err.println("Vehicle status must be 'on_trip'. Current status: " + vehicleStatus);
            return false;
        }

        Driver driver = driverDAO.getDriverById(i.getDriverId());
        if (driver == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        String driverStatus = driver.getStatus();
        if (!driverStatus.equals("active")) {
            System.err.println("Driver status must be 'active'. Current status: " + driverStatus);
            return false;
        }

        Timestamp now = new Timestamp(System.currentTimeMillis());
        if (i.getIncidentDateTime().after(now)) {
            System.err.println("Incident date cannot be in the future");
            return false;
        }

        if(!i.getIncidentSeverity().equals("Minor") &&
                !i.getIncidentSeverity().equals("Moderate") &&
                !i.getIncidentSeverity().equals("Major")){
            System.err.println("Invalid status entered.");
            return false;
        }

        return incidentLogDAO.createIncidentLog(i);
    }

    public List<IncidentLog> getAllIncidents() {
        return incidentLogDAO.readIncidentLogs();
    }

    public boolean updateIncidentLog(IncidentLog i) {
        Vehicle vehicle = vehicleDAO.getVehicleById(i.getVehicleId());
        if (vehicle == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        String vehicleStatus = vehicle.getStatus();
        if (!vehicleStatus.equals("on_trip")) {
            System.err.println("Vehicle status must be 'on_trip'. Current status: " + vehicleStatus);
            return false;
        }

        Driver driver = driverDAO.getDriverById(i.getDriverId());
        if (driver == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        String driverStatus = driver.getStatus();
        if (!driverStatus.equals("active")) {
            System.err.println("Driver status must be 'active'. Current status: " + vehicleStatus);
            return false;
        }

        Timestamp now = new Timestamp(System.currentTimeMillis());
        if (i.getIncidentDateTime().after(now)) {
            System.err.println("Incident date cannot be in the future");
            return false;
        }

        return incidentLogDAO.updateIncidentLog(i);
    }

    public boolean updateIncidentType(int incidentId, String type){ return incidentLogDAO.updateIncidentType(incidentId, type); }

    public boolean updateIncidentSeverity(int incidentId, String severity){
        if(!severity.equals("Minor") &&
                !severity.equals("Moderate") &&
                !severity.equals("Major")){
            System.err.println("Invalid severity entered.");
            return false;
        }

        return incidentLogDAO.updateIncidentType(incidentId, severity);
    }

    public boolean deleteIncidentLog(int id) {
        return incidentLogDAO.deleteIncidentLog(id);
    }
}
