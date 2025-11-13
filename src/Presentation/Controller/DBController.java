package Presentation.Controller;

import Presentation.View.DBView;

public class DBController {

    private DBView view;

    public DBController(DBView view) {
        this.view = view;
        attachEvents();
    }

    private void attachEvents() {
        view.getVehicleBtn().setOnAction(e -> handleVehicle());
        view.getClientBtn().setOnAction(e -> handleClient());
        view.getPartsBtn().setOnAction(e -> handleParts());
        view.getDriverBtn().setOnAction(e -> handleDriver());
    }

    private void handleVehicle() {
        System.out.println("Vehicle button clicked!");
        // Future: open Vehicle CRUD screen
    }

    private void handleClient() {
        System.out.println("Client button clicked!");
        // Future: open Client CRUD screen
    }

    private void handleParts() {
        System.out.println("Parts button clicked!");
        // Future: open Parts CRUD screen
    }

    private void handleDriver() {
        System.out.println("Driver button clicked!");
        // Future: open Driver CRUD screen
    }
}
