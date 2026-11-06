/**
 * Barrel File da Fase 03 — Estrutura da Aplicação (Layout):
 * Exporta Sidebar, Topbar, Breadcrumb e WizardStepper.
 */

export {
  Sidebar,
  type SidebarProps,
  type SidebarNavGroup,
  type SidebarNavItem,
  type SidebarUser,
} from "./Sidebar/Sidebar";

export {
  Topbar,
  type TopbarProps,
  type TopbarSearch,
  type TopbarUser,
} from "./Topbar/Topbar";

export {
  Breadcrumb,
  type BreadcrumbProps,
  type BreadcrumbItem,
} from "./Breadcrumb/Breadcrumb";

export {
  WizardStepper,
  type WizardStepperProps,
  type WizardStep,
  type WizardStepState,
} from "./WizardStepper/WizardStepper";
