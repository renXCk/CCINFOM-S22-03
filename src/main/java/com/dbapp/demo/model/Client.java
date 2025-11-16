package com.dbapp.demo.model;

public class Client {
    private int clientId;
    private String clientType;
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private char priorityFlag;
    private String status;
    private int completedOrders;

    public Client(){}

    public Client(String clientType, String name, String contactPerson, String phone, String email, String address, String status) {
        this.clientType = clientType;
        this.name = name;
        this.contactPerson = contactPerson;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.status = status;
    }

    // Getters and Setters
    public int getClientId() { return clientId; }
    public void setClientId(int clientId) { this.clientId = clientId; }

    public String getClientType() { return clientType; }
    public void setClientType(String clientType) { this.clientType = clientType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public char getPriorityFlag() { return priorityFlag; }
    public void setPriorityFlag(char priorityFlag) { this.priorityFlag = priorityFlag; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(int completedOrders) { this.completedOrders = completedOrders; }

}
