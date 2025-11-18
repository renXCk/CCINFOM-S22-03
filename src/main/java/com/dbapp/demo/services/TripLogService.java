package com.dbapp.demo.services;

import com.dbapp.demo.dao.TripLogDAO;
import com.dbapp.demo.services.ClientService;
import com.dbapp.demo.model.Client;
import com.dbapp.demo.model.TripLog;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeParseException;
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

        if (driverService.getDriverById(t.getDriverId()) == null) {
            System.err.println("Driver does not exist");
            return false;
        }

        if (vehicleService.getVehicleById(t.getVehicleId()) == null) {
            System.err.println("Vehicle does not exist");
            return false;
        }

        // Trip information, such as pick-up location and drop-off location, must not be null.
        if (t.getPickUpLocation() == null || t.getPickUpLocation().trim().isEmpty()) {
            System.err.println("Pickup location cannot be empty");
            return false;
        }
        if (t.getDropOffLocation() == null || t.getDropOffLocation().trim().isEmpty()) {
            System.err.println("Drop-off location cannot be empty");
            return false;
        }

        // Date/Time Validation and Parsing
        String status = t.getStatus();

        // CHECK: Complete Time (End Time) required for final states.
        if ("Completed".equals(status) || "Cancelled".equals(status) || "Archive".equals(status)) {
            // For completed, cancelled, or archived trips, there must be complete time.
            if (t.getCompleteTime() == null) {
                System.err.println("Validation Error: Complete time is mandatory for status '" + status + "'.");
                return false;
            }
        }

        // CHECK: Start Time required for ongoing or completed trips.
        if (t.getStartTime() == null) {
            if ("Ongoing".equals(status) || "Completed".equals(status)) {
                System.err.println("Validation Error: Start time is mandatory for ongoing or completed trips.");
                return false;
            }
        }

        // CHECK: Start must be before Complete (only if both are present).
        if (t.getStartTime() != null && t.getCompleteTime() != null) {

            LocalDateTime startTime;
            LocalDateTime completeTime;

            try {
                // Parse the start and complete time strings into LocalDateTime objects.
                startTime = LocalDateTime.parse(t.getStartTime());
                completeTime = LocalDateTime.parse(t.getCompleteTime());

            } catch (DateTimeParseException e) {
                // Return false if the date string is in an invalid format.
                System.err.println("Validation Error: Invalid date/time format for start or complete time. Error: " + e.getMessage());
                return false;
            }

            // The start date/time must occur before the completed date/time.
            if (startTime.isAfter(completeTime)) {
                System.err.println("Validation Error: Start time must be before end time");
                return false;
            }
        }

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
