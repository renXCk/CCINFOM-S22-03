package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
        private static final String url = "jdbc:mysql://localhost:3306/dbshipment";
        private static final String user = "root";
        private static final String password = "password";

        public static Connection getConnection() throws SQLException{
                return DriverManager.getConnection(url, user, password);
        }

        public static void main(String[] args) {
                try (Connection conn = getConnection()) {
                        System.out.println("Database connected successfully!");
                } catch (SQLException e) {
                        System.out.println("Connection failed!");
                        e.printStackTrace();
                }
        }

}
