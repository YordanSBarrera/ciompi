'use client';
import { MouseEvent, useState, useEffect, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import LogoApp from '../LogoApp';
import { azulBase } from '@/lib/color';
import {
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/rutas';
import MenuItemFormatted from './MenuItemFormatted';
import { getCurrentUser } from '@/lib/utils';
import AccountMenu from './AccountMenu';

export default function HeaderAppBar() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [operacionesAnchorEl, setOperacionesAnchorEl] =
    useState<null | HTMLElement>(null);
  // const operacionesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const isMouseOverSubmenuRef = useRef<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const openMainMenu = Boolean(anchorEl);
  const operacionesMenuOpen = Boolean(operacionesAnchorEl);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
    };

    // // Escuchar evento personalizado de cambio de usuario
    // window.addEventListener('storage', handleStorageChange);

    // // Escuchar eventos personalizados para cambios internos
    // window.addEventListener('userChange', handleStorageChange);

    // return () => {
    //   window.removeEventListener('storage', handleStorageChange);
    //   window.removeEventListener('userChange', handleStorageChange);
    //   // Limpiar timeout al desmontar
    //   if (operacionesTimeoutRef.current) {
    //     clearTimeout(operacionesTimeoutRef.current);
    //   }
    // };
  }, []);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOperacionesAnchorEl(null);
  };

  const handleLogout = () => {
    // Cerrar todos los menús abiertos
    handleClose();
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Actualizar estado local
    setUser(null);
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new Event('userChange'));
    // Redirigir al login
    router.push('/login');
  };

  const handleOperacionesItemClick = (href: string) => {
    router.push(href);
    setOperacionesAnchorEl(null);
    handleClose();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: azulBase }}>
        <Toolbar>
          {/* Solo mostrar el menú principal si hay un usuario autenticado */}
          {user && (
            <>
              <Tooltip title="Menu">
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  sx={{ mr: 2 }}
                  onClick={handleClick}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={openMainMenu}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                PaperProps={{
                  sx: {
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #333333',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    mt: 1,
                    minWidth: 200,
                  },
                }}
                MenuListProps={{
                  sx: {
                    py: 1,
                  },
                }}
              >
                <MenuItemFormatted
                  title="Financiamiento"
                  href={`/${routes.financiamiento}`}
                  onHandleClose={handleClose}
                />
                <MenuItemFormatted
                  title="Clientes"
                  href={`/${routes.clientes}`}
                  onHandleClose={handleClose}
                />
                <MenuItemFormatted
                  title="Vehículos"
                  href={`/${routes.vehiculos}`}
                  onHandleClose={handleClose}
                />
                <MenuItem
                  onMouseEnter={e => setOperacionesAnchorEl(e.currentTarget)}
                  // onMouseLeave={() => setOperacionesAnchorEl(null)}
                  sx={{
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#333333',
                      color: '#ffffff',
                    },
                    '&:focus': {
                      backgroundColor: '#444444',
                    },
                    py: 1.5,
                    px: 2,
                  }}
                >
                  Operaciones
                  <ChevronRightIcon sx={{ ml: 'auto' }} />
                </MenuItem>
                <MenuItemFormatted
                  title="Datos Generales"
                  href={`/${routes.datosGenerales}`}
                  onHandleClose={handleClose}
                />
                <MenuItemFormatted
                  title="Empresas"
                  href={`/${routes.empresas}`}
                  onHandleClose={handleClose}
                />
                <Divider sx={{ backgroundColor: '#444444', my: 1 }} />
                <MenuItemFormatted
                  title="Usuarios"
                  href={`/${routes.usuarios}`}
                  onHandleClose={handleClose}
                />
              </Menu>

              {/* Submenú de Operaciones */}
              <Menu
                anchorEl={operacionesAnchorEl}
                open={operacionesMenuOpen}
                onClose={() => setOperacionesAnchorEl(null)}
                MenuListProps={{
                  sx: {
                    py: 1,
                  },
                }}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                PaperProps={{
                  sx: {
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #333333',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    mt: 0,
                    ml: -0.5, // Overlap negativo para eliminar espacio
                    minWidth: 250,
                    pointerEvents: 'auto',
                  },
                }}
                disableAutoFocusItem
                disableEnforceFocus
              >
                <MenuItemFormatted
                  title=" Buscar Clientes"
                  icon={
                    <SearchIcon fontSize="small" sx={{ color: '#ffffff' }} />
                  }
                  href={`/${routes.operaciones}?tab=buscar`}
                  onHandleClose={handleClose}
                />
                <MenuItemFormatted
                  title="Financiamientos Atrasados"
                  icon={
                    <WarningIcon fontSize="small" sx={{ color: '#ff9800' }} />
                  }
                  href={`/${routes.operaciones}?tab=financiamientos-atrasados`}
                  onHandleClose={handleClose}
                />
                <MenuItemFormatted
                  title="Pagos Atrasados"
                  icon={
                    <WarningIcon fontSize="small" sx={{ color: '#ff9800' }} />
                  }
                  href={`/${routes.operaciones}?tab=pagos-atrasados`}
                  onHandleClose={handleClose}
                />
                <MenuItemFormatted
                  title="Estado de Cuenta"
                  icon={
                    <AccountBalanceIcon
                      fontSize="small"
                      sx={{ color: '#2196f3' }}
                    />
                  }
                  href={`/${routes.operaciones}?tab=estado-cuenta`}
                  onHandleClose={handleClose}
                />
              </Menu>
            </>
          )}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            <LogoApp widthProps={120} />
          </Typography>

          {/* Account Menu */}
          {user && <AccountMenu user={user} handleLogout={handleLogout} />}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
