package Presentation.View;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;

public class DBView extends JFrame {
    JButton vehicleBtn = new JButton("Vehicle");
    JButton clientBtn = new JButton("Client");
    JButton partsBtn = new JButton("Parts");
    JButton driverBtn = new JButton("Driver");
    JPanel welcomePanel;
    JPanel crudPanel;
    JScrollPane sp;
    JButton crudAdd = new JButton("Add");
    JButton crudDel = new JButton("Delete");
    JPanel crudAddPanel;
    JTextField fNameTF;
    JTextField lNameTF;
    JTextField licNumTF;
    JTextField pNumTF;
    JTextField emailTF;
    JButton insertBtn = new JButton("Insert");

    public DBView(){
        super("Sample DB App");
        initialize(); // for WindowBuilder
    }

    private void initialize() {
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(800, 600);
        getContentPane().setLayout(new BorderLayout());
        mainScreen();
    }


    // Getters for buttons
    public JButton getVehicleBtn() {
        return vehicleBtn;
    }
    public JButton getClientBtn() {
        return clientBtn;
    }
    public JButton getPartsBtn() {
        return partsBtn;
    }
    public JButton getDriverBtn() {
        return driverBtn;
    }

    public void mainScreen(){
        JPanel panel = new JPanel();
        panel.setBackground(Color.DARK_GRAY);
        getContentPane().setLayout(new BorderLayout());
        getContentPane().add(panel, BorderLayout.WEST);
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        vehicleBtn.addActionListener(new ActionListener() {
        	public void actionPerformed(ActionEvent e) {
        	}
        });
        vehicleBtn.setForeground(Color.WHITE);

        vehicleBtn.setContentAreaFilled(false);
        panel.add(vehicleBtn);
        clientBtn.setForeground(Color.WHITE);
        clientBtn.setContentAreaFilled(false);
        clientBtn.setBorderPainted(false);
        panel.add(clientBtn);
        partsBtn.setForeground(Color.WHITE);
        partsBtn.setContentAreaFilled(false);
        partsBtn.setBorderPainted(false);
        panel.add(partsBtn);
        driverBtn.setForeground(Color.WHITE);
        driverBtn.setContentAreaFilled(false);
        driverBtn.setBorderPainted(false);
        panel.add(driverBtn);

        welcomePanel = new JPanel();
        getContentPane().add(welcomePanel, BorderLayout.CENTER);
        welcomePanel.setLayout(null);

        JLabel welcomeText = new JLabel("Welcome to the Delivery Shipment App!");
        welcomeText.setHorizontalAlignment(SwingConstants.CENTER);
        welcomeText.setBounds(10, 11, 399, 31);
        welcomePanel.add(welcomeText);

        JLabel descText = new JLabel("Select any option from the sidebar to start.");
        descText.setHorizontalAlignment(SwingConstants.CENTER);
        descText.setBounds(10, 53, 399, 38);
        welcomePanel.add(descText);

        setResizable(false);
    }

    public void updateTable(String[][] entries, String[] labels){
        remove(welcomePanel);
        if(crudPanel != null)
            remove(crudPanel);
        if(crudAddPanel != null)
            remove(crudAddPanel);
        crudPanel = new JPanel();
        getContentPane().add(crudPanel, BorderLayout.CENTER);
        crudPanel.setLayout(new BorderLayout(0, 0));
        JTable table = new JTable(entries, labels);
        sp = new JScrollPane(table);
        JPanel crudButtonPanel = new JPanel();
        crudPanel.add(sp, BorderLayout.CENTER);
        crudPanel.add(crudButtonPanel, BorderLayout.NORTH);
        crudButtonPanel.add(crudAdd);
        crudButtonPanel.add(crudDel);
        setResizable(true);
        pack();
        revalidate();
        repaint();
    }

    public void addPanel(){
        remove(crudPanel);
        crudAddPanel = new JPanel();
        getContentPane().add(crudAddPanel, BorderLayout.CENTER);
        crudAddPanel.setLayout(null);

        fNameTF = new JTextField();
        lNameTF = new JTextField();
        licNumTF = new JTextField();
        pNumTF = new JTextField();
        emailTF = new JTextField();

        fNameTF.setBounds(222, 141, 86, 20);
        crudAddPanel.add(fNameTF);
        fNameTF.setColumns(10);

        JLabel fNameLbl = new JLabel("First name:");
        JLabel lNameLbl = new JLabel("Last name:");
        JLabel licNumLbl = new JLabel("License Number:");
        JLabel pNumLbl = new JLabel("Contact Number:");
        JLabel emailLbl = new JLabel("Email:");

        fNameLbl.setBounds(123, 144, 68, 14);
        crudAddPanel.add(fNameLbl);

        lNameTF.setColumns(10);
        lNameTF.setBounds(222, 172, 86, 20);
        crudAddPanel.add(lNameTF);
        lNameLbl.setBounds(123, 175, 68, 14);
        crudAddPanel.add(lNameLbl);

        licNumTF.setColumns(10);
        licNumTF.setBounds(222, 203, 86, 20);
        crudAddPanel.add(licNumTF);
        licNumLbl.setBounds(123, 206, 104, 14);
        crudAddPanel.add(licNumLbl);

        pNumTF.setColumns(10);
        pNumTF.setBounds(222, 234, 86, 20);
        crudAddPanel.add(pNumTF);
        pNumLbl.setBounds(123, 237, 104, 14);
        crudAddPanel.add(pNumLbl);

        emailTF.setColumns(10);
        emailTF.setBounds(222, 265, 86, 20);
        crudAddPanel.add(emailTF);
        emailLbl.setBounds(123, 268, 94, 14);
        crudAddPanel.add(emailLbl);

        insertBtn.setBounds(320, 427, 89, 23);
        crudAddPanel.add(insertBtn);
        getContentPane().add(crudAddPanel);
        setSize(500,500);
        setResizable(false);
        revalidate();
        repaint();
    }

    public void setMainPanel(JPanel panel) {
        getContentPane().removeAll();
        getContentPane().add(panel, BorderLayout.CENTER);
        revalidate();
        repaint();
    }
}