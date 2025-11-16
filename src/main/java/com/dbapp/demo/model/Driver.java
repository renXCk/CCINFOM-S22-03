package com.dbapp.demo.model;

public class Driver {
    private int driverId;
    private String firstName;
    private String lastName;
    private String licenseNum;
    private String contactNum;
    private String email;
    private String status;
    private int completedTrips;

    public Driver(){}

    public Driver(String fn, String ln, String lcn, String cn, String em, String s){
        firstName = fn;
        lastName = ln;
        licenseNum = lcn;
        contactNum = cn;
        email = em;
        status = s;
    }

    public int getDriverId(){ return driverId; }
    public void setDriverId(int drvId){ driverId = drvId; }

    public String getFirstName(){ return firstName; }
    public void setFirstName(String fn){ firstName = fn; }

    public String getLastName(){ return lastName; }
    public void setLastName(String ln){ lastName = ln; }

    public String getLicenseNum(){ return licenseNum; }
    public void setLicenseNum(String lcn){ licenseNum = lcn; }

    public String getContactNum(){ return contactNum; }
    public void setContactNum(String cn){ contactNum = cn; }

    public String getEmail(){ return email; }
    public void setEmail(String em){ email = em; }

    public String getStatus(){ return status; }
    public void setStatus(String s){ status = s; }

    public int getCompletedTrips(){ return completedTrips; }
    public void setCompletedTrips(int ct){ completedTrips = ct; }

}
