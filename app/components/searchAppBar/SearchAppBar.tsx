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
            <Link
              href={`/${routes.clientes}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem
                onClick={handleClose}
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
                Clientes
              </MenuItem>
            </Link>
            <Link
              href={`/${routes.empresas}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem
                onClick={handleClose}
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
                Empresas
              </MenuItem>
            </Link>
            <Link
              href={`/${routes.vehiculos}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem
                onClick={handleClose}
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
                Vehículos
              </MenuItem>
            </Link>
            <Link
              href={`/${routes.operaciones}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem
                onClick={handleClose}
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
              </MenuItem>
            </Link>
            <Link
              href={`/${routes.datosGenerales}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem
                onClick={handleClose}
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
                Datos Generales
              </MenuItem>
            </Link>
            <Link
              href={`/${routes.utilitarios}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem
                onClick={handleClose}
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
                Utilitarios
              </MenuItem>
            </Link>
            <Link
              href={`/${routes.vehiculos}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem
                onClick={handleClose}
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
                Vehículos
              </MenuItem>
            </Link>

            <Divider sx={{ backgroundColor: '#444444', my: 1 }} />
            <Link
              href={`/${routes.usuario}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem
                onClick={handleClose}
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
                Usuario
              </MenuItem>
            </Link>
            <Link
              href={`/${routes.nuevoUsuario}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem
                onClick={handleClose}
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
                Nuevo Usuario
              </MenuItem>
            </Link>
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
