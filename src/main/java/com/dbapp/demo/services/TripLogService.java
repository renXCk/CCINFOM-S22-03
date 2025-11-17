package com.dbapp.demo.services;

import com.dbapp.demo.dao.TripLogDAO;
import com.dbapp.demo.services.ClientService;
import com.dbapp.demo.model.Client;
import com.dbapp.demo.model.TripLog;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class TripLogService {

    private final TripLogDAO dao;
    private final ClientService clientService;
    private final DriverService driverService;
    private final VehicleService vehicleService;

    private final List<String> allowedStatus = List.of("Pending", "Ongoing", "Completed", "Cancelled", "Archive");

    public TripLogService(TripLogDAO tripLogDAO, ClientService clientService, DriverService driverService, VehicleService vehicleService) {
        this.dao = tripLogDAO;
        this.clientService = clientService;
        this.driverService = driverService;
        this.vehicleService = vehicleService;
    }

    public boolean addTripLog(TripLog t) {

        // A trip log must reference an existing client, driver, and vehicle.
        if (clientService.getClientById(t.getClientId()) == null) {
            System.err.println("Client does not exist");
            return false;
        }

//        if (driverService.getDriverById(t.getDriverId()) == null) {
//            System.err.println("Driver does not exist");
//            return false;
//        }
//
//        if (vehicleService.getVehicleById(t.getVehicleId()) == null) {
//            System.err.println("Vehicle does not exist");
//            return false;
//        }

        // Trip information, such as pick-up location and drop-off location, must not be null.
        if (t.getPickUpLocation() == null || t.getPickUpLocation().trim().isEmpty()) {
            System.err.println("Pickup location cannot be empty");
            return false;
        }
        if (t.getDropOffLocation() == null || t.getDropOffLocation().trim().isEmpty()) {
            System.err.println("Drop-off location cannot be empty");
            return false;
        }

        // The start date/time must occur before the completed date/time.
//        if (t.getStartTime() != null && t.getCompleteTime() != null) {
//            if (t.getStartTime().isAfter(t.getCompleteTime())) {
//                System.err.println("Start time must be before end time");
//                return false;
//            }
//        }
        // will write parsing later

        // The trip_cost must be greater than or equal to 0.
        if (t.getTripCost() < 0) {
            System.err.println("Trip cost cannot be negative.");
            return false;
        }

        // allowed status
        if (!allowedStatus.contains(t.getStatus())) {
            System.err.println("Invalid status. Allowed values: " + allowedStatus);
            return false;
        }


        return dao.createTripLog(t);
    }

    public List<TripLog> getAllTripLogs() {
        return dao.readTripLogs();
    }

    public TripLog getTripLogByID(int id) {
        return dao.readTripLogById(id);
    }

    public boolean updateTripLog(TripLog t) {

        // A trip can only be cancelled if it has not yet been completed.
        if (t.getStatus().equals("Cancelled")) {
            TripLog old = dao.readTripLogById(t.getTripId());
            if (old != null && "Completed".equals(old.getStatus())) {
                System.err.println("Cannot cancel a completed trip.");
                return false;
            }
        }

        return dao.updateTripLog(t);
    }

    // actual: soft deletes in dao
    public boolean deleteTripLog(int id) {
        return dao.deleteTripLog(id);
    }

}
