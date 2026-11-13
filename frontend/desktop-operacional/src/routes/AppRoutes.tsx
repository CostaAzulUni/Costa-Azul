
import { Navigate, Route, Routes } from "react-router-dom";

import { Dashboard} from "../features/company/dashboard/Dashboard";
import { Vessel } from "../features/company/vessel/pages/Vessel";
import { VesselCreate } from "../features/company/vessel/pages/VesselCreate";
import { VesselDetails } from "../features/company/vessel/pages/VesselDetails";
import { Trips } from "../features/company/trips/Trips";
import { Crew } from "../features/company/crew/Crew";
import { Finance } from "../features/company/financial/Finance";
import { Settings } from "../features/company/settings/Settings";
import { Relatorios } from "../features/company/relatorios/Relatorios";
import { CompanyLayout } from "../features/company/CompanyLayout";

import { AuthLayout } from "../features/login/AuthLayout";
import { Login } from "../features/login/pages/Login";
import { RecoverAccess } from "../features/login/pages/RecoverAccess";
import { VerifyEmail } from "../features/login/pages/VerifyEmail";
import { CreatePassword } from "../features/login/pages/CreatePassword";
import { UpdatePassword } from "../features/login/pages/UpdatePassword";
import {
    AccessDenied,
    AccountBlocked,
    AccountDisabled,
    LinkExpired,
    PasswordResetSuccess,
    SessionExpired,
} from "../features/login/pages/StatusPages";

import { RequireAuth } from "./RequireAuth";
import { AUTH_PATHS } from "./paths";
import { DevLogin } from "../dev/DevLogin";


export function AppRoutes() {
    return (
        <Routes>
            
            <Route path="/" element={<Navigate to={AUTH_PATHS.login} replace />} />
            {import.meta.env.DEV && (
                <Route path="/dev" element={<DevLogin />} />
            )}

            {/* Autenticação */}
            <Route element={<AuthLayout />}>
                <Route path={AUTH_PATHS.login} element={<Login />} />
                <Route path={AUTH_PATHS.recoverAccess} element={<RecoverAccess />} />
                <Route path={AUTH_PATHS.verifyEmail} element={<VerifyEmail />} />
                <Route path={AUTH_PATHS.createPassword} element={<CreatePassword />} />
                <Route path={AUTH_PATHS.passwordResetSuccess} element={<PasswordResetSuccess />} />
                <Route path={AUTH_PATHS.updatePassword} element={<UpdatePassword />} />
                <Route path={AUTH_PATHS.linkExpired} element={<LinkExpired />} />
                <Route path={AUTH_PATHS.accountBlocked} element={<AccountBlocked />} />
                <Route path={AUTH_PATHS.accountDisabled} element={<AccountDisabled />} />
                <Route path={AUTH_PATHS.accessDenied} element={<AccessDenied />} />
                <Route path={AUTH_PATHS.sessionExpired} element={<SessionExpired />} />
            </Route>

            {/* Área logada */}
            <Route element={<RequireAuth />}>
                <Route element={<CompanyLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/vessel" element={<Vessel />} />
                    <Route path="/vessel/create" element={<VesselCreate />} />
                    <Route path="/vessel/:id" element={<VesselDetails />} />
                    <Route path="/trips" element={<Trips />} />
                    <Route path="/crew" element={<Crew />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to={AUTH_PATHS.login} replace />} />
        </Routes>
    );
}
