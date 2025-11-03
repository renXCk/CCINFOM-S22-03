package Presentation.Controller;

import Data.util.DBConnection;
import Presentation.View.DBView;

import java.awt.event.*;
import java.sql.*;
import java.util.*;

public class DBController implements ActionListener {
    private final DBView view;
    private String currentTable;

    public DBController(DBView v){
        new DBConnection();
        view = v;
        init();
    }

    public void init(){
        view.vehicleBtn.addActionListener(this);
        view.clientBtn.addActionListener(this);
        view.partsBtn.addActionListener(this);
        view.driverBtn.addActionListener(this);
        view.crudAdd.addActionListener(this);
        view.insertBtn.addActionListener(this);
    }

    public void refreshTable(){
        try {
            PreparedStatement ps = DBConnection.conn.prepareCall("SELECT * FROM " + currentTable);
            ResultSet rs = ps.executeQuery();
            ArrayList<String[]> rel = new ArrayList<>();
            switch(currentTable) {
                case "Vehicle" -> {
                    while (rs.next()) {
                        String id = rs.getString("vehicle_id");
                        String plateNo = rs.getString("plate_number");
                        String type = rs.getString("vehicle_type");
                        String model = rs.getString("model");
                        String status = rs.getString("status");
                        String mileage = rs.getString("mileage");
                        String[] row = {id, plateNo, type, model, status, mileage};
                        rel.add(row);
                    }
                    String[] labels = {"vehicle_id", "plate_number", "vehicle_type", "model", "status", "mileage"};
                    view.updateTable(rel.toArray(new String[0][]), labels);
                }
                case "Client" -> {
                    while (rs.next()) {
                        String id = rs.getString("client_id");
                        String type = rs.getString("client_type");
                        String name = rs.getString("name");
                        String conPerson = rs.getString("contact_person");
                        String pNum = rs.getString("phone");
                        String email = rs.getString("email");
                        String prioFlag = rs.getString("priority_flag");
                        String status = rs.getString("status");
                        String numOrders = rs.getString("completed_orders");
                        String[] row = {id, type, name, conPerson, pNum, email, prioFlag, status, numOrders};
                        rel.add(row);
                    }
                    String[] labels = {"client_id", "client_type", "name", "contact_person", "phone", "email", "priority_flag", "status", "completed_trips"};
                    view.updateTable(rel.toArray(new String[0][]), labels);
                }
                case "Driver" -> {
                    while (rs.next()) {
                        String id = rs.getString("driver_id");
                        String fName = rs.getString("first_name");
                        String lName = rs.getString("last_name");
                        String liNum = rs.getString("license_num");
                        String pNum = rs.getString("contact_num");
                        String email = rs.getString("email");
                        String status = rs.getString("status");
                        String numTrips = rs.getString("completed_trips");
                        String[] row = {id, fName, lName, liNum, pNum, email, status, numTrips};
                        rel.add(row);
                    }
                    String[] labels = {"driver_id", "first_name", "last_name", "license_num", "contact_num", "email", "status", "completed_trips"};
                    view.updateTable(rel.toArray(new String[0][]), labels);
                }
            }
            rs.close();
            ps.close();
            //DBConnection.conn.close();
        } catch(SQLException ex){
            System.out.println(ex.getMessage());
        }
    }
    @Override
    public void actionPerformed(ActionEvent e){
        if(e.getSource() == view.vehicleBtn){
            currentTable = "Vehicle";
            refreshTable();
        }
        else if(e.getSource() == view.clientBtn){
            currentTable = "Client";
            refreshTable();
        }
        else if(e.getSource() == view.partsBtn){
            System.out.println("Parts button pressed");
        }
        else if(e.getSource() == view.driverBtn){
            currentTable = "Driver";
            refreshTable();
        }
        else if(e.getSource() == view.crudAdd){
            view.addPanel();
        }
        else if(e.getSource() == view.insertBtn){
            try {
                PreparedStatement ps = DBConnection.conn.prepareCall("INSERT INTO " + currentTable + " (first_name, last_name, license_num, contact_num, email) " +
                        "VALUES ('"+view.fNameTF.getText()+"','"+view.lNameTF.getText()+"','"+view.licNumTF.getText()+"','"+view.pNumTF.getText()+"','"+view.emailTF.getText()+"')");
                ps.executeUpdate();
                ps.close();
                refreshTable();
            } catch(SQLException ex){
                System.out.println(ex.getMessage());
            }
        }
    }
}
