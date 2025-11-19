package com.dbapp.demo.services;

import com.dbapp.demo.model.Driver;
import com.dbapp.demo.dao.DriverDAO;
import com.dbapp.demo.dao.DriverViewDAO;
import com.dbapp.demo.model.DriverView;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {
    private final DriverDAO dao = new DriverDAO();
    private final DriverViewDAO viewDAO = new DriverViewDAO();
    private final String licensePattern = "^[A-Za-z]\\d{2}-\\d{2}-\\d{6}$";
    private final String phonePattern = "^09\\d{2}-\\d{3}-\\d{4}$";
    private final String emailPattern = "^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

    public boolean addDriver(Driver d) {

        if(d.getFirstName() == null || d.getFirstName().trim().isEmpty() ||
                d.getLastName() == null || d.getLastName().trim().isEmpty() ||
                d.getLicenseNum() == null || d.getLicenseNum().trim().isEmpty() ||
                d.getContactNum() == null || d.getContactNum().trim().isEmpty() ||
                d.getEmail() == null || d.getEmail().trim().isEmpty()){
            System.err.println("Missing personal information! Please enter all fields.");

            return false;
        }

        if(!d.getLicenseNum().matches(licensePattern) ||
                !d.getContactNum().matches(phonePattern) ||
                !d.getEmail().matches(emailPattern)){
            if(!d.getLicenseNum().matches(licensePattern))
                System.err.println("Invalid license number format entered!");
            if(!d.getContactNum().matches(phonePattern))
                System.err.println("Invalid contact number format entered!");
            if(!d.getEmail().matches(emailPattern))
                System.err.println("Invalid email address format entered!");

            return false;
        }

        if(!d.getStatus().equals("active") &&
                !d.getStatus().equals("inactive") &&
                !d.getStatus().equals("suspended")){
            System.err.println("Invalid status entered.");
            return false;
        }

        return dao.createDriver(d);

    }

    public List<Driver> getAllDrivers() {
        return dao.readDrivers();
    }

    public List<DriverView> getVehiclesByDriver(int id) {
        return viewDAO.getVehiclesByDriver(id);
    }

    public Driver getDriverById(int driverId){ return dao.getDriverById(driverId); }

    public boolean updateDriver(Driver d) {

        if(d.getFirstName() == null || d.getFirstName().trim().isEmpty() ||
                d.getLastName() == null || d.getLastName().trim().isEmpty() ||
                d.getLicenseNum() == null || d.getLicenseNum().trim().isEmpty() ||
                d.getContactNum() == null || d.getContactNum().trim().isEmpty() ||
                d.getEmail() == null || d.getEmail().trim().isEmpty()){
            System.err.println("Missing personal information! Please enter all fields.");

            return false;
        }

        if(!d.getLicenseNum().matches(licensePattern) ||
                !d.getContactNum().matches(phonePattern) ||
                !d.getEmail().matches(emailPattern)){
            if(!d.getLicenseNum().matches(licensePattern))
                System.err.println("Invalid license number format entered!");
            if(!d.getContactNum().matches(phonePattern))
                System.err.println("Invalid contact number format entered!");
            if(!d.getEmail().matches(emailPattern))
                System.err.println("Invalid email address format entered!");

            return false;
        }

        if(!d.getStatus().equals("active") &&
                !d.getStatus().equals("inactive") &&
                !d.getStatus().equals("suspended")){
            System.err.println("Invalid status entered.");
            return false;
        }

        return dao.updateDriver(d);

    }

    public boolean updateDriverStatus(int driverId, String status){
        if(!status.equals("active") &&
                !status.equals("inactive") &&
                !status.equals("suspended")){
            System.err.println("Invalid status entered.");
            return false;
        }

        return dao.updateDriverStatus(driverId, status);
    }

    public boolean incrementDriverTrips(int driverId){
        Driver d = dao.getDriverById(driverId);

        if(!d.getStatus().equals("active")){
            System.err.println("Cannot increment trip count due to driver's status.");
            return false;
        }

        int ctr = d.getCompletedTrips();

        return dao.updateDriverTripCtr(driverId, ctr+1);

    }

    public boolean deleteDriver(int id) {
        return dao.deleteDriver(id);
    }
}
