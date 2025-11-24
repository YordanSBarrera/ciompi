'use client';
import { MouseEvent, useState, useEffect, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import LogoApp from '../LogoApp';
import { azulBase } from '@/lib/color';
import {
  Avatar,
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
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/rutas';
import MenuItemFormatted from './MenuItemFormatted';
import { getCurrentUser } from '@/lib/utils';

export default function SearchAppBar() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [operacionesAnchorEl, setOperacionesAnchorEl] =
    useState<null | HTMLElement>(null);
  const operacionesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseOverSubmenuRef = useRef<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const open = Boolean(anchorEl);
  const accountMenuOpen = Boolean(accountAnchorEl);
  const operacionesMenuOpen = Boolean(operacionesAnchorEl);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
    };

    // Escuchar evento personalizado de cambio de usuario
    window.addEventListener('storage', handleStorageChange);

    // Escuchar eventos personalizados para cambios internos
    window.addEventListener('userChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChange', handleStorageChange);
      // Limpiar timeout al desmontar
      if (operacionesTimeoutRef.current) {
        clearTimeout(operacionesTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAccountClick = (event: MouseEvent<HTMLElement>) => {
    setAccountAnchorEl(event.currentTarget);
  };
  const handleAccountClose = () => {
    setAccountAnchorEl(null);
  };

  const handleDetalles = () => {
    if (user?.id) {
      router.push(`/ciompi/usuario/${user.id}`);
    }
    handleAccountClose();
  };

  const handleLogout = () => {
    // Cerrar todos los menús abiertos
    handleClose();
    handleOperacionesClose();
    handleAccountClose();
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

  const handleOperacionesMouseEnter = (event: MouseEvent<HTMLElement>) => {
    // Limpiar cualquier timeout pendiente
    if (operacionesTimeoutRef.current) {
      clearTimeout(operacionesTimeoutRef.current);
      operacionesTimeoutRef.current = null;
    }
    isMouseOverSubmenuRef.current = false;
    setOperacionesAnchorEl(event.currentTarget);
  };

  const handleOperacionesMouseLeave = () => {
    // No cerrar inmediatamente - esperar a ver si el mouse entra al submenú
    // El submenú cancelará este timeout si el mouse entra
    operacionesTimeoutRef.current = setTimeout(() => {
      console.log(
        'isMouseOverSubmenuRef.current',
        isMouseOverSubmenuRef.current
      );
      // Solo cerrar si el mouse no está sobre el submenú
      if (!isMouseOverSubmenuRef.current) {
        setOperacionesAnchorEl(null);
      }
    }, 400);
  };

  const handleOperacionesClose = () => {
    if (operacionesTimeoutRef.current) {
      clearTimeout(operacionesTimeoutRef.current);
      operacionesTimeoutRef.current = null;
    }
    isMouseOverSubmenuRef.current = false;
    setOperacionesAnchorEl(null);
  };

  const handleSubmenuMouseEnter = () => {
    // Marcar que el mouse está sobre el submenú
    isMouseOverSubmenuRef.current = true;
    // Limpiar timeout cuando el mouse entra al submenú
    if (operacionesTimeoutRef.current) {
      clearTimeout(operacionesTimeoutRef.current);
      operacionesTimeoutRef.current = null;
    }
  };

  const handleSubmenuMouseLeave = () => {
    // Marcar que el mouse salió del submenú
    isMouseOverSubmenuRef.current = false;
    // Cerrar el submenú cuando el mouse sale completamente
    operacionesTimeoutRef.current = setTimeout(() => {
      if (!isMouseOverSubmenuRef.current) {
        setOperacionesAnchorEl(null);
      }
    }, 300);
  };

  const handleOperacionesItemClick = (href: string) => {
    router.push(href);
    handleOperacionesClose();
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
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
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
                  onMouseEnter={handleOperacionesMouseEnter}
                  onMouseLeave={handleOperacionesMouseLeave}
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
                onClose={handleOperacionesClose}
                MenuListProps={{
                  onMouseEnter: handleSubmenuMouseEnter,
                  onMouseLeave: handleSubmenuMouseLeave,
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
                  onMouseEnter: handleSubmenuMouseEnter,
                  onMouseLeave: handleSubmenuMouseLeave,
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
                <MenuItem
                  onClick={() =>
                    handleOperacionesItemClick(
                      `/${routes.operaciones}?tab=buscar`
                    )
                  }
                  sx={{
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#333333',
                      color: '#ffffff',
                    },
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <ListItemIcon>
                    <SearchIcon fontSize="small" sx={{ color: '#ffffff' }} />
                  </ListItemIcon>
                  Buscar Clientes
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleOperacionesItemClick(
                      `/${routes.operaciones}?tab=financiamientos-atrasados`
                    )
                  }
                  sx={{
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#333333',
                      color: '#ffffff',
                    },
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <ListItemIcon>
                    <WarningIcon fontSize="small" sx={{ color: '#ff9800' }} />
                  </ListItemIcon>
                  Financiamientos Atrasados
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleOperacionesItemClick(
                      `/${routes.operaciones}?tab=pagos-atrasados`
                    )
                  }
                  sx={{
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#333333',
                      color: '#ffffff',
                    },
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <ListItemIcon>
                    <WarningIcon fontSize="small" sx={{ color: '#f44336' }} />
                  </ListItemIcon>
                  Pagos Atrasados
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleOperacionesItemClick(
                      `/${routes.operaciones}?tab=estado-cuenta`
                    )
                  }
                  sx={{
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#333333',
                      color: '#ffffff',
                    },
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <ListItemIcon>
                    <AccountBalanceIcon
                      fontSize="small"
                      sx={{ color: '#2196f3' }}
                    />
                  </ListItemIcon>
                  Estado de Cuenta
                </MenuItem>
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
          {user && (
            <>
              <Tooltip title="Mi cuenta">
                <IconButton
                  onClick={handleAccountClick}
                  size="small"
                  sx={{ mr: 3 }}
                  aria-controls={accountMenuOpen ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={accountMenuOpen ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.nombre
                      ? user.nombre.charAt(0).toUpperCase()
                      : user.usuario.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={accountAnchorEl}
                id="account-menu"
                open={accountMenuOpen}
                onClose={handleAccountClose}
                onClick={handleAccountClose}
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
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleDetalles}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" sx={{ color: '#ffffff' }} />
                  </ListItemIcon>
                  Detalles
                </MenuItem>
                <Divider sx={{ backgroundColor: '#444444', my: 1 }} />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: '#ffffff' }} />
                  </ListItemIcon>
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
