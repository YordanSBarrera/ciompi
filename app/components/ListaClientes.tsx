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
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ClienteType } from '@/lib/types';
import { formatCedula } from '@/lib/utils';
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
import { dynamicRoutes } from '@/lib/rutas';
import { useRouter } from 'next/navigation';

interface ListaClientesProps {
  clientes: ClienteType[];
  onClienteEliminado?: () => void;
}

interface MenuState {
  anchorEl: HTMLElement | null;
  clienteId: string | null;
}

export default function ListaClientes({
  clientes,
  onClienteEliminado,
}: ListaClientesProps) {
  const [filter, setFilter] = React.useState('');
  const [menuState, setMenuState] = React.useState<MenuState>({
    anchorEl: null,
    clienteId: null,
  });
  const [confirmDialog, setConfirmDialog] = React.useState({
    open: false,
    clienteId: null as string | null,
    clienteNombre: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
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
    clienteId: string
  ) => {
    setMenuState({
      anchorEl: event.currentTarget,
      clienteId,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      clienteId: null,
    });
  };

  const handleClickVerDetalles = (id: string) => {
    handleMenuClose();
    router.push(dynamicRoutes.cliente(id));
  };

  const handleClickEditar = (id: string) => {
    handleMenuClose();
    router.push(dynamicRoutes.clienteEditar(id));
  };

  const handleClickEliminar = (id: string, nombre: string) => {
    handleMenuClose();
    console.log('Eliminando cliente:', { id, nombre }); // Debug log
    setConfirmDialog({
      open: true,
      clienteId: id,
      clienteNombre: nombre,
    });
  };

  const handleConfirmEliminar = async () => {
    if (!confirmDialog.clienteId) {
      console.error('No hay ID de cliente para eliminar');
      return;
    }

    console.log('Confirmando eliminación de cliente:', {
      id: confirmDialog.clienteId,
      nombre: confirmDialog.clienteNombre,
    });

    setLoading(true);
    try {
      const url = `/ciompi/api/clientes?id=${confirmDialog.clienteId}`;
      console.log('URL de eliminación:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(
        'Respuesta del servidor:',
        response.status,
        response.statusText
      );

      const data = await response.json();
      console.log('Datos de respuesta:', data);

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: `Cliente "${confirmDialog.clienteNombre}" eliminado exitosamente`,
          severity: 'success',
        });
        onClienteEliminado?.();
      } else {
        console.error('Error en respuesta del servidor:', data);
        setSnackbar({
          open: true,
          message: data.error || 'Error al eliminar el cliente',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      setSnackbar({
        open: true,
        message: 'Error de conexión al eliminar el cliente',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setConfirmDialog({
        open: false,
        clienteId: null,
        clienteNombre: '',
      });
    }
  };

  const handleCancelEliminar = () => {
    setConfirmDialog({
      open: false,
      clienteId: null,
      clienteNombre: '',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredClientes = clientes.filter(
    cliente =>
      cliente.NOMBRE.toLowerCase().includes(filter.toLowerCase()) ||
      cliente.CODCLI.toLowerCase().includes(filter.toLowerCase()) ||
      cliente.DIRECCION?.toLowerCase().includes(filter.toLowerCase()) ||
      cliente.TELEFONO?.includes(filter)
  );

  const getStatusColor = (index: number) => {
    return index % 2 === 0 ? blanco : grisClaro;
  };

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          Lista de Clientes
        </Typography>

        <Chip
          label={`${filteredClientes.length} clientes`}
          variant="outlined"
          sx={{
            borderColor: turquesa,
            color: azulOscuro,
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Barra de búsqueda */}
      <TextField
        placeholder="Buscar cliente por nombre, código, dirección o teléfono..."
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

      {/* Tabla de clientes */}
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
                  minWidth: 120,
                }}
              >
                Cédula
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 100 : 120,
                }}
              >
                Teléfono
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 120 : 150,
                }}
              >
                Correo
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 120 : 150,
                }}
              >
                Dirección
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 100 : 120,
                }}
              >
                Profesión
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
            {filteredClientes.map((cliente, index) => (
              <TableRow
                key={cliente._id}
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
                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: grisOscuro,
                      fontSize: '0.875rem',
                    }}
                  >
                    {index + 1}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Tooltip title={cliente.NOMBRE} placement="top" arrow>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: grisOscuro,
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          isMobile && isTruncated(cliente.NOMBRE, 15) ? 0.8 : 1,
                      }}
                    >
                      {isMobile
                        ? truncateText(cliente.NOMBRE, 15)
                        : cliente.NOMBRE}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      color: cliente.cedula ? grisOscuro : azulClaro,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    {cliente.cedula ? formatCedula(cliente.cedula) : '-'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Tooltip
                    title={cliente.TELEFONO || 'Sin teléfono'}
                    placement="top"
                    arrow
                  >
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        color: cliente.TELEFONO ? grisOscuro : 'text.secondary',
                        fontStyle: cliente.TELEFONO ? 'normal' : 'italic',
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          cliente.TELEFONO && isTruncated(cliente.TELEFONO, 10)
                            ? 0.8
                            : 1,
                      }}
                    >
                      {cliente.TELEFONO
                        ? truncateText(cliente.TELEFONO, 10)
                        : emptyData}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Tooltip
                    title={cliente.correo || 'Sin correo'}
                    placement="top"
                    arrow
                  >
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        color: cliente.correo
                          ? 'text.primary'
                          : 'text.secondary',
                        fontStyle: cliente.correo ? 'normal' : 'italic',
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          cliente.correo && isTruncated(cliente.correo, 15)
                            ? 0.8
                            : 1,
                      }}
                    >
                      {cliente.correo
                        ? truncateText(cliente.correo, 15)
                        : emptyData}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Tooltip
                    title={cliente.DIRECCION || 'Sin dirección'}
                    placement="top"
                    arrow
                  >
                    <Typography
                      sx={{
                        color: cliente.DIRECCION
                          ? 'text.primary'
                          : 'text.secondary',
                        fontStyle: cliente.DIRECCION ? 'normal' : 'italic',
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          cliente.DIRECCION &&
                          isTruncated(cliente.DIRECCION, 15)
                            ? 0.8
                            : 1,
                      }}
                    >
                      {cliente.DIRECCION
                        ? truncateText(cliente.DIRECCION, 15)
                        : emptyData}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Tooltip
                    title={cliente.profesion || 'Sin profesión'}
                    placement="top"
                    arrow
                  >
                    <Typography
                      sx={{
                        color: grisTexto,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          cliente.profesion &&
                          isTruncated(cliente.profesion, 10)
                            ? 0.8
                            : 1,
                      }}
                    >
                      {cliente.profesion
                        ? truncateText(cliente.profesion, 10)
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
                    transition: 'all 0.2s ease-in-out', // Sincronizar con la transición de la fila
                  }}
                >
                  <Stack alignItems="flex-end">
                    <Tooltip title="Acciones" placement="top">
                      <IconButton
                        onClick={event => handleMenuOpen(event, cliente._id)}
                        size="small"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuState.anchorEl}
                      open={Boolean(
                        menuState.anchorEl &&
                          menuState.clienteId === cliente._id
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
                        onClick={() => handleClickVerDetalles(cliente._id)}
                      >
                        <ViewIcon
                          sx={{ fontSize: 18, mr: 1, color: azulBase }}
                        />
                        Ver Detalles
                      </MenuItem>
                      <MenuItem onClick={() => handleClickEditar(cliente._id)}>
                        <EditIcon
                          sx={{ fontSize: 18, mr: 1, color: azulBase }}
                        />
                        Editar
                      </MenuItem>
                      <MenuItem
                        onClick={() =>
                          handleClickEliminar(cliente._id, cliente.NOMBRE)
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
        {filteredClientes.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color={grisTexto}>
              {filter
                ? 'No se encontraron clientes que coincidan con la búsqueda'
                : 'No hay clientes registrados'}
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
          Mostrando {filteredClientes.length} de {clientes.length} clientes
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
            ¿Estás seguro de que deseas eliminar al cliente "
            {confirmDialog.clienteNombre}"? Esta acción no se puede deshacer.
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
