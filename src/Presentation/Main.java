package Presentation;

public class Main {
    public static void main(String[] args){
        DBView view = new DBView();
        DBController cont = new DBController(view);
    }
}
