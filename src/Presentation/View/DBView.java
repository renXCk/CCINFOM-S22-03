package Presentation.View;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.stage.Stage;

public class DBView {
    private Stage stage;
    private BorderPane root;
    private VBox sidebar;
    private Label titleLabel;
    private Label subtitleLabel;

    // Sidebar buttons
    private Button vehicleBtn;
    private Button clientBtn;
    private Button partsBtn;
    private Button driverBtn;

    public DBView() {
        stage = new Stage();
        stage.setTitle("Delivery Shipment Management System");
        initialize();
    }

    private void initialize() {
        root = new BorderPane();
        root.setPrefSize(900, 600);

        // Sidebar setup
        sidebar = new VBox(15);
        sidebar.setPadding(new Insets(20));
        sidebar.setStyle("-fx-background-color: #f2f2f2;");
        sidebar.setAlignment(Pos.TOP_CENTER);

        vehicleBtn = createNavButton("Vehicles");
        clientBtn = createNavButton("Clients");
        partsBtn = createNavButton("Parts");
        driverBtn = createNavButton("Drivers");

        Label menuLabel = new Label("Main Menu");
        menuLabel.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #333333;");

        sidebar.getChildren().addAll(menuLabel, vehicleBtn, clientBtn, partsBtn, driverBtn);
        root.setLeft(sidebar);

        // Center Welcome Panel
        VBox welcomePanel = new VBox(10);
        welcomePanel.setAlignment(Pos.CENTER);
        welcomePanel.setPadding(new Insets(20));
        titleLabel = new Label("Welcome to the Delivery Shipment App!");
        titleLabel.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #2c3e50;");

        subtitleLabel = new Label("Select an option from the sidebar to begin.");
        subtitleLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: #555555;");

        welcomePanel.getChildren().addAll(titleLabel, subtitleLabel);
        root.setCenter(welcomePanel);

        Scene scene = new Scene(root);
        stage.setScene(scene);
        stage.show();
    }

    private Button createNavButton(String text) {
        Button btn = new Button(text);
        btn.setPrefWidth(150);
        btn.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-border-color: #cccccc;" +
                        "-fx-border-radius: 5;" +
                        "-fx-background-radius: 5;" +
                        "-fx-font-size: 14px;" +
                        "-fx-text-fill: #333333;"
        );

        btn.setOnMouseEntered(e -> btn.setStyle(
                "-fx-background-color: #e0e0e0;" +
                        "-fx-border-color: #cccccc;" +
                        "-fx-border-radius: 5;" +
                        "-fx-background-radius: 5;" +
                        "-fx-font-size: 14px;" +
                        "-fx-text-fill: #000000;"
        ));

        btn.setOnMouseExited(e -> btn.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-border-color: #cccccc;" +
                        "-fx-border-radius: 5;" +
                        "-fx-background-radius: 5;" +
                        "-fx-font-size: 14px;" +
                        "-fx-text-fill: #333333;"
        ));

        return btn;
    }

    public Stage getStage() {
        return stage;
    }

    public Button getVehicleBtn() {
        return vehicleBtn;
    }

    public Button getClientBtn() {
        return clientBtn;
    }

    public Button getPartsBtn() {
        return partsBtn;
    }

    public Button getDriverBtn() {
        return driverBtn;
    }
}
