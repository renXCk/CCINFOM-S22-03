package com.dbapp.demo.services;

import com.dbapp.demo.dao.ClientDAO;
import com.dbapp.demo.model.Client;
import com.dbapp.demo.model.ClientView;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    private final ClientDAO dao;
    private String phonePattern = "^09\\d{2}-\\d{3}-\\d{4}$";
    private String emailPattern = "^[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,}$";

    private final List<String> allowedTypes = List.of("Individual", "Company", "Government");
    private final List<String> allowedStatus = List.of("Active", "Inactive", "Blacklisted");

    public ClientService(ClientDAO clientDAO) {
        this.dao = clientDAO;
    }

    public boolean addClient(Client c) {

        // phone format
        if (!c.getPhone().matches(phonePattern)) {
            System.err.println("Invalid phone number format! Expected 09XX-XXX-XXXX.");
            return false;
        }

        // email format
        if (!c.getEmail().matches(emailPattern)) {
            System.err.println("Invalid email address format!");
            return false;
        }

        // required not null fields
        if (c.getName() == null || c.getName().isEmpty() ||
                c.getClientType() == null ||
                c.getContactPerson() == null || c.getContactPerson().isEmpty() ||
                c.getAddress() == null || c.getAddress().isEmpty())
        {
            System.err.println("Missing required client information!");
            return false;
        }

        // valid client type
        if (!allowedTypes.contains(c.getClientType())) {
            System.err.println("Invalid client type! Must be Individual, Company, or Government.");
            return false;
        }

        // valid client status
        if (!allowedStatus.contains(c.getStatus())) {
            System.err.println("Invalid client status!");
            return false;
        }

        // set priority upon completing 100 orders
        if (c.getCompletedOrders() > 100) {
            c.setPriorityFlag('1');
        } else if (c.getCompletedOrders() < 100) {
            c.setPriorityFlag('0');
        }

        return dao.createClient(c);
    }

    public List<Client> getAllClients() {
        return dao.readClients();
    }

    public List<ClientView> getClientView() {
        return dao.getAllClientView();
    }

    public Client getClientById(int id) { return dao.readClientById(id); }

    public boolean updateClient(Client c) {
        return dao.updateClient(c);
    }

    public boolean deleteClient(int id) {
        return dao.deleteClient(id);
    } // will change to soft block later

}

