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
  Pagination,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { ClienteType } from '@/lib/types';
import { formatCedula } from '@/lib/utils';
import { useEliminarCliente } from '@/app/hook/useEliminarCliente';
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

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ListaClientesProps {
  clientes: ClienteType[];
  pagination?: PaginationData;
  loading?: boolean;
  onClienteEliminado?: () => void;
  onAgregarCliente?: () => void;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  initialSearch?: string;
}

interface MenuState {
  anchorEl: HTMLElement | null;
  clienteId: string | null;
}

export default function ListaClientes({
  clientes,
  pagination,
  loading = false,
  onClienteEliminado,
  onAgregarCliente,
  onPageChange,
  onSearchChange,
  initialSearch = '',
}: ListaClientesProps) {
  const [filter, setFilter] = React.useState(initialSearch);
  const [menuState, setMenuState] = React.useState<MenuState>({
    anchorEl: null,
    clienteId: null,
  });
  
  // Debounce para la búsqueda
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  React.useEffect(() => {
    setFilter(initialSearch);
  }, [initialSearch]);
  
  // Hook personalizado para eliminar cliente
  const {
    confirmDialog,
    loading: deletingLoading,
    snackbar,
    handleClickEliminar,
    handleConfirmEliminar,
    handleCancelEliminar,
    handleCloseSnackbar,
  } = useEliminarCliente({ onClienteEliminado });
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
    router.push(`/ciompi/clientes/${id}`);
  };

  const handleClickEditar = (id: string) => {
    handleMenuClose();
    router.push(`/ciompi/clientes/${id}/editar`);
  };

  // Wrapper para handleClickEliminar que también cierra el menú
  const handleClickEliminarWrapper = (id: string, nombre: string) => {
    handleMenuClose();
    handleClickEliminar(id, nombre);
  };

  // Manejar cambio en el filtro de búsqueda
  const handleFilterChange = (value: string) => {
    setFilter(value);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce: esperar 500ms antes de buscar
    searchTimeoutRef.current = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(value);
      }
    }, 500);
  };
  
  // Limpiar timeout al desmontar
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  // Si hay paginación, los datos ya vienen filtrados del servidor
  const filteredClientes = clientes;

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
          Lista de Clientes
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={
              pagination
                ? `${pagination.total} clientes (página ${pagination.page} de ${pagination.pages})`
                : `${filteredClientes.length} clientes`
            }
            variant="outlined"
            sx={{
              borderColor: turquesa,
              color: azulOscuro,
              fontWeight: 600,
            }}
          />

          {onAgregarCliente && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAgregarCliente}
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
              Agregar Cliente
            </Button>
          )}
        </Box>
      </Box>

      {/* Barra de búsqueda */}
      <TextField
        placeholder="Buscar por nombre, código, dirección, teléfono, correo, profesión o cédula..."
        value={filter}
        onChange={e => handleFilterChange(e.target.value)}
        disabled={loading}
        sx={{
          maxWidth: 500,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.8)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '& fieldset': {
                borderColor: azulClaro,
              },
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255,255,255,1)',
              boxShadow: `0 0 0 2px ${azulBase}20`,
              '& fieldset': {
                borderColor: azulBase,
              },
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: azulBase }} />
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
                          handleClickEliminarWrapper(
                            cliente._id,
                            cliente.NOMBRE
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

      {/* Controles de paginación */}
      {pagination && pagination.pages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 3,
            gap: 2,
          }}
        >
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={(event, value) => {
              if (onPageChange) {
                onPageChange(value);
              }
            }}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '0.95rem',
                fontWeight: 500,
              },
            }}
          />
          <Typography variant="body2" color={grisTexto}>
            Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total}
          </Typography>
        </Box>
      )}

      {/* Indicador de carga */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 3,
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}

      {/* Footer informativo */}
      {!pagination && (
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
      )}

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
          <Button onClick={handleCancelEliminar} disabled={deletingLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmEliminar}
            color="error"
            variant="contained"
            disabled={deletingLoading}
          >
            {deletingLoading ? 'Eliminando...' : 'Eliminar'}
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
