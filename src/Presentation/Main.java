package Presentation;

import Presentation.Controller.DBController;
import Presentation.View.DBView;
import javafx.application.Application;
import javafx.stage.Stage;

public class Main extends Application {

    @Override
    public void start(Stage primaryStage) {
        DBView view = new DBView();
        new DBController(view);
    }

    public static void main(String[] args) {
        launch(args);
    }
}
