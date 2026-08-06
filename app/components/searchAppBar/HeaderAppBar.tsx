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
import { useRouter } from 'next/navigation';
import { homeModule, appModules } from '@/lib/modules';
import MenuItemFormatted from './MenuItemFormatted';
import { getCurrentUser } from '@/lib/utils';
import AccountMenu from './AccountMenu';

export default function HeaderAppBar() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [operacionesAnchorEl, setOperacionesAnchorEl] =
    useState<null | HTMLElement>(null);
  const [user, setUser] = useState<any>(null);
  const openMainMenu = Boolean(anchorEl);
  const operacionesMenuOpen = Boolean(operacionesAnchorEl);
  const operacionesModule = appModules.find(module => module.submenu);
  const submenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    return () => clearSubmenuTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSubmenuTimer = () => {
    if (submenuCloseTimerRef.current) {
      clearTimeout(submenuCloseTimerRef.current);
      submenuCloseTimerRef.current = null;
    }
  };

  const openSubmenu = (event: MouseEvent<HTMLElement>) => {
    clearSubmenuTimer();
    setOperacionesAnchorEl(event.currentTarget);
  };

  const scheduleCloseSubmenu = () => {
    clearSubmenuTimer();
    submenuCloseTimerRef.current = setTimeout(() => {
      setOperacionesAnchorEl(null);
      submenuCloseTimerRef.current = null;
    }, 180);
  };

  const closeSubmenu = () => {
    clearSubmenuTimer();
    setOperacionesAnchorEl(null);
  };

  const toggleSubmenu = (event: MouseEvent<HTMLElement>) => {
    if (operacionesAnchorEl === event.currentTarget) {
      closeSubmenu();
    } else {
      openSubmenu(event);
    }
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    clearSubmenuTimer();
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
    // Redirigir al login y refrescar el navegador para que tome efecto el cambio de usuario
    window.location.href = '/login';
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
                  onMouseLeave: scheduleCloseSubmenu,
                }}
                MenuListProps={{
                  sx: {
                    py: 1,
                  },
                }}
              >
                <MenuItemFormatted
                  title={homeModule.title}
                  href={homeModule.href}
                  onHandleClose={handleClose}
                  icon={
                    <homeModule.icon
                      fontSize="small"
                      sx={{ color: '#ffffff' }}
                    />
                  }
                />
                <Divider sx={{ backgroundColor: '#444444', my: 1 }} />
                {appModules.map(module =>
                  module.submenu ? (
                    <MenuItem
                      key={module.id}
                      onMouseEnter={openSubmenu}
                      onMouseLeave={scheduleCloseSubmenu}
                      onClick={toggleSubmenu}
                      sx={{
                        color: '#ffffff',
                        backgroundColor: operacionesMenuOpen
                          ? '#333333'
                          : undefined,
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
                      <ListItemIcon>
                        <module.icon
                          fontSize="small"
                          sx={{ color: module.color }}
                        />
                      </ListItemIcon>
                      {module.title}
                      <ChevronRightIcon sx={{ ml: 'auto' }} />
                    </MenuItem>
                  ) : (
                    <MenuItemFormatted
                      key={module.id}
                      title={module.title}
                      href={module.href}
                      onHandleClose={handleClose}
                      onMouseEnter={closeSubmenu}
                      icon={
                        <module.icon
                          fontSize="small"
                          sx={{ color: module.color }}
                        />
                      }
                    />
                  )
                )}
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
                  onMouseEnter: clearSubmenuTimer,
                  onMouseLeave: scheduleCloseSubmenu,
                }}
                disableAutoFocusItem
                disableEnforceFocus
              >
                {operacionesModule?.submenu?.map(item => (
                  <MenuItemFormatted
                    key={item.title}
                    title={item.title}
                    icon={
                      <item.icon
                        fontSize="small"
                        sx={{ color: item.iconColor }}
                      />
                    }
                    href={item.href}
                    onHandleClose={handleClose}
                  />
                ))}
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
