package Business.services;

import Business.model.IncidentLog;
import Business.model.Driver;
import Business.model.Vehicle;
import Data.dao.IncidentLogDAO;

import java.util.List;

public class IncidentService {
    private final IncidentLogDAO dao = new IncidentLogDAO();

    public boolean addIncidentLog(IncidentLog i) {
        return dao.createIncidentLog(i);
    }

    public List<IncidentLog> getAllIncidents() {
        return dao.readIncidentLog();
    }

    public boolean updateIncidentLog(IncidentLog i) {
        return dao.updateIncidentLog(i);
    }

    public boolean deleteIncidentLog(int id) {
        return dao.deleteIncidentLog(id);
    }
}
