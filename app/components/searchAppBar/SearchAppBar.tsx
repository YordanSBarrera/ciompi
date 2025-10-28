'use client';
import { MouseEvent, useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import LogoApp from '../LogoApp';
import { azulBase } from '@/lib/color';
import {
  Divider,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import { routes } from '@/lib/rutas';
import MenuItemFormatted from './MenuItemFormatted';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

// const MenuItemFormatted = (
//   title: string,
//   href: string,
//   onHandleClose: () => void
// ) => {
//   return (
//     <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
//       <MenuItem
//         onClick={onHandleClose}
//         sx={{
//           color: '#ffffff',
//           '&:hover': {
//             backgroundColor: '#333333',
//             color: '#ffffff',
//           },
//           '&:focus': {
//             backgroundColor: '#444444',
//           },
//           py: 1.5,
//           px: 2,
//         }}
//       >
//         {title}
//       </MenuItem>
//     </Link>
//   );
// };

export default function SearchAppBar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: azulBase }}>
        <Toolbar>
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
            <MenuItemFormatted
              title="Operaciones"
              href={`/${routes.operaciones}`}
              onHandleClose={handleClose}
            />
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
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            <LogoApp widthProps={120} />
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          {/* <AccountMenu /> */}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
