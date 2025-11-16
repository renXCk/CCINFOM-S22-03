package com.dbapp.demo.services;

import com.dbapp.demo.model.Driver;
import com.dbapp.demo.dao.DriverDAO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {
    private final DriverDAO dao = new DriverDAO();
    private String licensePattern = "^[A-Za-z]\\d{2}-\\d{2}-\\d{6}$";
    private String phonePattern = "^09\\d{2}-\\d{3}-\\d{4}$";
    private String emailPattern = "^[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,}$";

    public boolean addDriver(Driver d) {

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

        return dao.createDriver(d);

    }

    public List<Driver> getAllDrivers() {
        return dao.readDrivers();
    }

    public boolean updateDriver(Driver d) {

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

        return dao.updateDriver(d);

    }

    public boolean deleteDriver(int id) {
        return dao.deleteDriver(id);
    }
}
