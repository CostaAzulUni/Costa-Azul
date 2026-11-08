import { Navigate, Route, Routes } from "react-router-dom";
import { Dashboard } from "../features/company/dashboard/Dashboard";
import { Login } from "../features/login/Login";
import { Vessel } from "../features/company/vessel/pages/Vessel";
import { Trips } from "../features/company/trips/Trips";
import { Crew } from "../features/company/crew/Crew";
import { Finance } from "../features/company/financial/Finance";
import { Settings } from "../features/company/settings/Settings";
import { Relatorios } from "../features/company/relatorios/Relatorios";
import { VesselCreate } from "../features/company/vessel/pages/VesselCreate";
import { VesselDetails } from "../features/company/vessel/pages/VesselDetails";
import { CompanyLayout } from "../features/company/CompanyLayout";




export function AppRoutes() {
    return(
        <Routes>
            <Route path="/dev" element={<Navigate to="/dashboard" />} />
             <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            
            <Route element={ <CompanyLayout /> }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vessel" element={<Vessel />} />
                <Route path="/vessel/create" element={<VesselCreate />} />
                <Route path="/vessel/:id" element={<VesselDetails />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/crew" element={<Crew />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/settings" element={<Settings />} />
                <Route path= "/relatorios" element={<Relatorios />} />
            </Route >
        </Routes>
    );
}