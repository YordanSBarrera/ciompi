import React from 'react';
import { MouseEvent, useState } from 'react';
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';

interface AccountMenuProps {
  user: any;
  handleLogout: () => void;
}

const AccountMenu = ({ user, handleLogout }: AccountMenuProps) => {
  const router = useRouter();
  const [accountAnchorEl, setAccountAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const accountMenuOpen = Boolean(accountAnchorEl);

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

  return (
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
  );
};

export default AccountMenu;
