import {
  People as PeopleIcon,
  Business as BusinessIcon,
  DirectionsCar as DirectionsCarIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { routes } from './rutas';
import { azulBase, azulClaro, azulOscuro, naranja, turquesa } from './color';

export interface AppSubmenuItem {
  title: string;
  href: string;
  icon: SvgIconComponent;
  iconColor: string;
}

export interface AppModule {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: SvgIconComponent;
  color: string;
  submenu?: AppSubmenuItem[];
}

export const homeModule: AppModule = {
  id: 'home',
  title: 'Panel de Control',
  description: 'Volver al panel principal de la aplicación.',
  href: `/${routes.home}`,
  icon: DashboardIcon,
  color: azulBase,
};

export const appModules: AppModule[] = [
  {
    id: 'clientes',
    title: 'Clientes',
    description:
      'Gestiona la información de tus clientes, consulta historiales y administra sus datos de contacto.',
    href: `/${routes.clientes}`,
    icon: PeopleIcon,
    color: azulBase,
  },
  {
    id: 'empresas',
    title: 'Empresas',
    description:
      'Administra las empresas asociadas y su información corporativa de manera centralizada.',
    href: `/${routes.empresas}`,
    icon: BusinessIcon,
    color: azulClaro,
  },
  {
    id: 'vehiculos',
    title: 'Vehículos',
    description:
      'Consulta y gestiona el inventario de vehículos, sus características y estado actual.',
    href: `/${routes.vehiculos}`,
    icon: DirectionsCarIcon,
    color: turquesa,
  },
  {
    id: 'financiamientos',
    title: 'Financiamientos',
    description:
      'Controla los financiamientos activos, pagos, cuotas y estados de cuenta de tus clientes.',
    href: `/${routes.financiamiento}`,
    icon: AccountBalanceIcon,
    color: naranja,
  },
  {
    id: 'operaciones',
    title: 'Operaciones',
    description:
      'Accede a las operaciones del sistema, reportes y herramientas de gestión avanzada.',
    href: `/${routes.operaciones}`,
    icon: AssignmentIcon,
    color: azulClaro,
    submenu: [
      {
        title: 'Buscar Clientes',
        href: `/${routes.operaciones}?tab=buscar`,
        icon: SearchIcon,
        iconColor: '#ffffff',
      },
      {
        title: 'Financiamientos Atrasados',
        href: `/${routes.operaciones}?tab=financiamientos-atrasados`,
        icon: WarningIcon,
        iconColor: '#ff9800',
      },
      {
        title: 'Pagos Atrasados',
        href: `/${routes.operaciones}?tab=pagos-atrasados`,
        icon: WarningIcon,
        iconColor: '#ff9800',
      },
      {
        title: 'Estado de Cuenta',
        href: `/${routes.operaciones}?tab=estado-cuenta`,
        icon: AccountBalanceIcon,
        iconColor: '#2196f3',
      },
      {
        title: 'Vencimientos',
        href: `/${routes.operaciones}?tab=vencimientos`,
        icon: EventIcon,
        iconColor: '#4caf50',
      },
    ],
  },
  {
    id: 'datosGenerales',
    title: 'Datos Generales',
    description:
      'Consulta indicadores consolidados, resúmenes y datos generales del sistema.',
    href: `/${routes.datosGenerales}`,
    icon: AssessmentIcon,
    color: azulOscuro,
  },
  {
    id: 'usuarios',
    title: 'Usuarios',
    description:
      'Administra los usuarios del sistema, sus permisos y configuraciones de acceso.',
    href: `/${routes.usuarios}`,
    icon: PersonIcon,
    color: azulOscuro,
  },
];
