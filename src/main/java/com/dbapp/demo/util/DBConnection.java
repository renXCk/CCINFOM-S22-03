package Data.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
        private static final String url = "jdbc:mysql://localhost:3306/deliveryshipment";
        private static final String user = "root";
        private static final String password = "Gremlin_2336<";
        public static Connection conn;

        public static Connection getConnection() throws SQLException{
            return DriverManager.getConnection(url, user, password);
        }

        public DBConnection() {
            try {
                conn = getConnection();
                System.out.println("Database connected successfully!");
            } catch (SQLException e) {
                System.out.println("Connection failed!");
                e.printStackTrace();
            }
        }

}
