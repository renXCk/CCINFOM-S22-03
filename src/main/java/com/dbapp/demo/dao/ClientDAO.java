package com.dbapp.demo.dao;

import com.dbapp.demo.model.Client;
import Data.util.DBConnection;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ClientDAO {

    public boolean createClient(Client client){

        String query = "INSERT INTO client (client_type, name, contact_person, phone, email, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, client.getClientType());
            statement.setString(2, client.getName());
            statement.setString(3, client.getContactPerson());
            statement.setString(4, client.getPhone());
            statement.setString(5, client.getEmail());
            statement.setString(6, client.getAddress());
            statement.setString(7, client.getStatus());

            int rowsInserted = statement.executeUpdate();
            //return true if inserted a row
            return rowsInserted > 0;

        } catch (SQLException e) {
            System.err.println("Error inserting client: " + e.getMessage());
            return false;
        }
    }

    public Client readClientById(int id){
        String query = "SELECT * FROM Client WHERE client_id = ?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)){

            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();

            if (rs.next()) {
                Client client = new Client();
                client.setClientId(rs.getInt("client_id"));
                client.setClientType(rs.getString("client_type"));
                client.setName(rs.getString("name"));
                client.setContactPerson(rs.getString("contact_person"));
                client.setPhone(rs.getString("phone"));
                client.setEmail(rs.getString("email"));
                client.setAddress(rs.getString("address"));
                client.setPriorityFlag(rs.getString("priority_flag").charAt(0));
                client.setStatus(rs.getString("status"));
                client.setCompletedOrders(rs.getInt("completed_orders"));
                return client;
            }

        }catch (SQLException e){
            System.err.println("Error getting client by id: " + e.getMessage());
        }

        return null;
    }


    //for display
    public List<Client> readClients() {
        List<Client> clientList = new ArrayList<>();
        String query = "SELECT * FROM Client ORDER BY client_id";

        try (Connection connection = DBConnection.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(query)) {

            while (resultSet.next()) {
                Client client = new Client();
                client.setClientId(resultSet.getInt("client_id"));
                client.setClientType(resultSet.getString("client_type"));
                client.setName(resultSet.getString("name"));
                client.setContactPerson(resultSet.getString("contact_person"));
                client.setPhone(resultSet.getString("phone"));
                client.setEmail(resultSet.getString("email"));
                client.setAddress(resultSet.getString("address"));
                client.setPriorityFlag(resultSet.getString("priority_flag").charAt(0));
                client.setStatus(resultSet.getString("status"));
                client.setCompletedOrders(resultSet.getInt("completed_orders"));

                clientList.add(client);
            }

        } catch (SQLException e) {
            System.err.println("Error reading clients: " + e.getMessage());
        }

        return clientList;
    }

    public boolean updateClient(Client client) {
        String query = "UPDATE Client SET client_type=?, name=?, contact_person=?, phone=?, email=?, address=?, priority_flag=?, status=?, completed_orders=? WHERE client_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, client.getClientType());
            statement.setString(2, client.getName());
            statement.setString(3, client.getContactPerson());
            statement.setString(4, client.getPhone());
            statement.setString(5, client.getEmail());
            statement.setString(6, client.getAddress());
            statement.setString(7, String.valueOf(client.getPriorityFlag()));
            statement.setString(8, client.getStatus());
            statement.setInt(9, client.getCompletedOrders());
            statement.setInt(10, client.getClientId());

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            System.err.println("Error updating client: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteClient(int clientId) {
        String query = "DELETE FROM Client WHERE client_id=?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, clientId);
            int rowsDeleted = statement.executeUpdate();
            return rowsDeleted > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting client: " + e.getMessage());
            return false;
        }
    }

}
