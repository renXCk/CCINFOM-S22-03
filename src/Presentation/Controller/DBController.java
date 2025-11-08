package Presentation.Controller;

import Data.util.DBConnection;
import Presentation.View.DBView;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class DBController implements ActionListener {
    private final DBView view;
    private String currentTable;

    public DBController(DBView v){
        new DBConnection();
        view = v;
        init();
    }

    public void init(){
        view.getVehicleBtn().addActionListener(this);
        view.getClientBtn().addActionListener(this);
        view.getPartsBtn().addActionListener(this);
        view.getDriverBtn().addActionListener(this);
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
    public void actionPerformed(ActionEvent e) {
        Object src = e.getSource();

        if (src == view.getVehicleBtn()) {
            JOptionPane.showMessageDialog(view, "Vehicle Module");
        }
        else if (src == view.getClientBtn()) {
            JOptionPane.showMessageDialog(view, "Client module");
        }
        else if (src == view.getPartsBtn()) {
            JOptionPane.showMessageDialog(view, "Parts module");
        }
        else if (src == view.getDriverBtn()) {
            JOptionPane.showMessageDialog(view, "Driver module");
        }
    }
}
