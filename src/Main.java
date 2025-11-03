import jdk.jfr.Percentage;
import util.DBConnection;

import javax.swing.*;
import java.sql.*;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args){
        DBView view = new DBView();
        DBController cont = new DBController(view);
    }
}
