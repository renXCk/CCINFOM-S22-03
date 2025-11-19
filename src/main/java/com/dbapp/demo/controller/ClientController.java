package com.dbapp.demo.controller;

import com.dbapp.demo.model.Client;
import com.dbapp.demo.model.ClientView;
import com.dbapp.demo.services.ClientService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin("http://localhost:3000")
public class ClientController {

    public ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    // read all clients
    @GetMapping("/all")
    public List<Client> getAllClients(){
        return clientService.getAllClients();
    }

    // get client indiv by id
    @GetMapping("/{id}")
    public Client getClientById(@PathVariable int id){
        return clientService.getClientById(id);
    }

    // get all client views
    @GetMapping("/view")
    public List<ClientView> getClientViews(){ return  clientService.getClientView(); }

    // create new client regis
    @PostMapping("/add")
    public boolean createClient(@RequestBody Client client) {
        return clientService.addClient(client);
    }

    // update client info
    @PutMapping("/update")
    public boolean updateClient(@RequestBody Client client) {
        return clientService.updateClient(client);
    }

    @DeleteMapping("/delete/{id}")
    public boolean deleteClient(@PathVariable int id) {
        return clientService.deleteClient(id);
    }

}
