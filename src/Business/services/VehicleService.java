package Business.services;

import Business.model.Vehicle;
import Data.dao.VehicleDAO;

import java.util.List;

public class VehicleService {
    private final VehicleDAO dao = new VehicleDAO();

    public boolean addVehicle(Vehicle v) {
        return dao.createVehicle(v);
    }

    public List<Vehicle> getAllVehicles() {
        return dao.readVehicles();
    }

    public boolean updateVehicle(Vehicle v) {
        return dao.updateVehicle(v);
    }

    public boolean deleteVehicle(int id) {
        return dao.deleteVehicle(id);
    }
}
