package Presentation;
import Presentation.Controller.DBController;
import Presentation.View.DBView;


public class Main {
    public static void main(String[] args){
        DBView view = new DBView();
        DBController cont = new DBController(view);
    }
}
