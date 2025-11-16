package com.dbapp.demo.services;

import com.dbapp.demo.dao.ClientDAO;
import com.dbapp.demo.model.Client;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    private final ClientDAO dao;

    public ClientService(ClientDAO clientDAO) {
        this.dao = clientDAO;
    }

    public boolean addClient(Client c) {
        return dao.createClient(c);
    }

    public List<Client> getAllClients() {
        return dao.readClients();
    }

    public boolean updateClient(Client c) {
        return dao.updateClient(c);
    }

    public boolean deleteClient(int id) {
        return dao.deleteClient(id);
    }

}

