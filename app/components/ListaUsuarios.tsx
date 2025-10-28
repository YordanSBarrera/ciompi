'use client';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Box,
  Typography,
  Stack,
  InputAdornment,
  TextField,
  Tooltip,
  MenuItem,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Usuario } from '@/lib/types';
import { useEliminarUsuario } from '@/app/hook/useEliminarUsuario';
import {
  azulBase,
  azulClaro,
  azulOscuro,
  blanco,
  grisClaro,
  grisMedio,
  grisOscuro,
  grisTexto,
  naranja,
  turquesa,
} from '@/lib/color';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useRouter } from 'next/navigation';

interface ListaUsuariosProps {
  usuarios: Usuario[];
  onUsuarioEliminado?: () => void;
  onAgregarUsuario?: () => void;
}

interface MenuState {
  anchorEl: HTMLElement | null;
  usuarioId: string | null;
}

export default function ListaUsuarios({
  usuarios,
  onUsuarioEliminado,
  onAgregarUsuario,
}: ListaUsuariosProps) {
  const [filter, setFilter] = React.useState('');
  const [menuState, setMenuState] = React.useState<MenuState>({
    anchorEl: null,
    usuarioId: null,
  });

  // Hook personalizado para eliminar usuario
  const {
    confirmDialog,
    loading,
    snackbar,
    handleClickEliminar,
    handleConfirmEliminar,
    handleCancelEliminar,
    handleCloseSnackbar,
  } = useEliminarUsuario({ onUsuarioEliminado });

  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const emptyData = '-';

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 10): string => {
    if (!text || text.length <= maxLength) return text;
    if (typeof text !== 'string') return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper function to check if text is truncated
  const isTruncated = (text: string, maxLength: number = 10): boolean => {
    return Boolean(text && text.length > maxLength);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    usuarioId: string
  ) => {
    setMenuState({
      anchorEl: event.currentTarget,
      usuarioId,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      usuarioId: null,
    });
  };

  const handleClickVerDetalles = (id: string) => {
    handleMenuClose();
    router.push(`/ciompi/usuario/${id}`);
  };

  const handleClickEditar = (id: string) => {
    handleMenuClose();
    router.push(`/ciompi/usuario/${id}/editar`);
  };

  // Wrapper para handleClickEliminar que también cierra el menú
  const handleClickEliminarWrapper = (id: string, nombre: string) => {
    handleMenuClose();
    handleClickEliminar(id, nombre);
  };

  const filteredUsuarios = usuarios.filter(
    usuario =>
      usuario.nombre.toLowerCase().includes(filter.toLowerCase()) ||
      usuario.usuario.toLowerCase().includes(filter.toLowerCase()) ||
      usuario.email.toLowerCase().includes(filter.toLowerCase()) ||
      usuario.cargo?.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusColor = (index: number) => {
    return index % 2 === 0 ? blanco : grisClaro;
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'error';
      case 'Administrativo':
        return 'warning';
      case 'Usuario':
        return 'info';
      default:
        return 'default';
    }
  };

  const getEstadoColor = (estado: string) => {
    return estado === 'activo' ? 'success' : 'error';
  };

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: azulOscuro,
            fontWeight: 600,
          }}
        >
          Gestión de Usuarios
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`${filteredUsuarios.length} usuarios`}
            variant="outlined"
            sx={{
              borderColor: turquesa,
              color: azulOscuro,
              fontWeight: 600,
            }}
          />

          {onAgregarUsuario && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAgregarUsuario}
              sx={{
                backgroundColor: azulBase,
                background: `linear-gradient(135deg, ${azulBase} 0%, ${azulOscuro} 100%)`,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: azulOscuro,
                  background: `linear-gradient(135deg, ${azulOscuro} 0%, ${azulBase} 100%)`,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                },
              }}
            >
              Agregar Usuario
            </Button>
          )}
        </Box>
      </Box>

      {/* Barra de búsqueda */}
      <TextField
        placeholder="Buscar usuario por nombre, usuario, email o cargo..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        sx={{
          maxWidth: 500,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: azulClaro,
            },
            '&.Mui-focused fieldset': {
              borderColor: azulBase,
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: grisTexto }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Tabla de usuarios */}
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'auto',
          maxHeight: '70vh',
          position: 'relative',
          '&::-webkit-scrollbar': {
            height: 8,
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: grisClaro,
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: grisMedio,
            borderRadius: 4,
            '&:hover': {
              backgroundColor: grisOscuro,
            },
          },
        }}
      >
        <Table
          sx={{
            minWidth: isMobile ? 800 : 650,
            '& .MuiTableCell-root': {
              whiteSpace: 'nowrap',
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: azulBase }}>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  minWidth: 50,
                  width: 50,
                }}
              >
                #
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  minWidth: 50,
                  width: 50,
                }}
              >
                Avatar
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 120 : 150,
                }}
              >
                Usuario
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 120 : 150,
                }}
              >
                Nombre
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 120 : 150,
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 100 : 120,
                }}
              >
                Rol
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 100 : 120,
                }}
              >
                Estado
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 120 : 150,
                }}
              >
                Cargo
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: 100,
                  width: 100,
                  position: 'sticky',
                  right: 0,
                  backgroundColor: azulBase,
                  zIndex: 10,
                  borderLeft: `2px solid ${azulClaro}`,
                }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsuarios.map((usuario, index) => (
              <TableRow
                key={usuario._id}
                sx={{
                  backgroundColor: getStatusColor(index),
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: grisMedio,
                    transform: 'translateY(-1px)',
                    boxShadow: 1,
                    '& .sticky-actions-cell': {
                      backgroundColor: grisMedio,
                    },
                  },
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: azulBase,
                      fontSize: '0.875rem',
                    }}
                  >
                    {usuario.nombre?.charAt(0) || <PersonIcon />}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Tooltip title={usuario.usuario} placement="top" arrow>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: grisOscuro,
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          isMobile && isTruncated(usuario.usuario, 15)
                            ? 0.8
                            : 1,
                      }}
                    >
                      {isMobile
                        ? truncateText(usuario.usuario, 15)
                        : usuario.usuario}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={usuario.nombre} placement="top" arrow>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        color: grisOscuro,
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          isMobile && isTruncated(usuario.nombre, 15) ? 0.8 : 1,
                      }}
                    >
                      {isMobile
                        ? truncateText(usuario.nombre, 15)
                        : usuario.nombre}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={usuario.email} placement="top" arrow>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          usuario.email && isTruncated(usuario.email, 15)
                            ? 0.8
                            : 1,
                      }}
                    >
                      {usuario.email
                        ? truncateText(usuario.email, 15)
                        : emptyData}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={usuario.rol}
                    color={getRolColor(usuario.rol)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={usuario.estado}
                    color={getEstadoColor(usuario.estado)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip
                    title={usuario.cargo || 'Sin cargo'}
                    placement="top"
                    arrow
                  >
                    <Typography
                      sx={{
                        color: usuario.cargo
                          ? 'text.primary'
                          : 'text.secondary',
                        fontStyle: usuario.cargo ? 'normal' : 'italic',
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          usuario.cargo && isTruncated(usuario.cargo, 15)
                            ? 0.8
                            : 1,
                      }}
                    >
                      {usuario.cargo
                        ? truncateText(usuario.cargo, 15)
                        : emptyData}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell
                  className="sticky-actions-cell"
                  sx={{
                    position: 'sticky',
                    right: 0,
                    backgroundColor: getStatusColor(index),
                    zIndex: 10,
                    minWidth: 100,
                    width: 100,
                    borderLeft: `2px solid ${grisMedio}`,
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Stack alignItems="flex-end">
                    <Tooltip title="Acciones" placement="top">
                      <IconButton
                        onClick={event => handleMenuOpen(event, usuario._id!)}
                        size="small"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuState.anchorEl}
                      open={Boolean(
                        menuState.anchorEl &&
                          menuState.usuarioId === usuario._id
                      )}
                      onClose={handleMenuClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      sx={{
                        '& .MuiPaper-root': {
                          borderRadius: '8px !important',
                          border: `1px solid ${grisClaro} !important`,
                          boxShadow: '0px 4px 12px rgba(0,0,0,0.15) !important',
                          minWidth: '140px !important',
                          outline: 'none !important',
                          zIndex: 1300,
                        },
                        '& .MuiMenu-list': {
                          padding: '4px 0 !important',
                        },
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          minHeight: '36px',
                          '&:hover': {
                            backgroundColor: grisClaro,
                          },
                        },
                      }}
                    >
                      <MenuItem
                        onClick={() => handleClickVerDetalles(usuario._id!)}
                      >
                        <ViewIcon
                          sx={{ fontSize: 18, mr: 1, color: azulBase }}
                        />
                        Ver Detalles
                      </MenuItem>
                      <MenuItem onClick={() => handleClickEditar(usuario._id!)}>
                        <EditIcon
                          sx={{ fontSize: 18, mr: 1, color: azulBase }}
                        />
                        Editar
                      </MenuItem>
                      <MenuItem
                        onClick={() =>
                          handleClickEliminarWrapper(
                            usuario._id!,
                            usuario.nombre
                          )
                        }
                      >
                        <DeleteIcon
                          sx={{ fontSize: 18, mr: 1, color: 'error.main' }}
                        />
                        <Typography variant="body2" color="error.main">
                          Eliminar
                        </Typography>
                      </MenuItem>
                    </Menu>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Mensaje cuando no hay resultados */}
        {filteredUsuarios.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color={grisTexto}>
              {filter
                ? 'No se encontraron usuarios que coincidan con la búsqueda'
                : 'No hay usuarios registrados'}
            </Typography>
          </Box>
        )}
      </TableContainer>

      {/* Footer informativo */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" color={grisTexto}>
          Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
        </Typography>

        {filter && (
          <Typography variant="caption" color={naranja}>
            Filtro activo: "{filter}"
          </Typography>
        )}
      </Box>

      {/* Diálogo de confirmación */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelEliminar}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar al usuario "
            {confirmDialog.usuarioNombre}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEliminar} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmEliminar}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
