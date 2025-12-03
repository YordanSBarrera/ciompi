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
  Button,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  Pagination,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Menu, MenuItem } from '@mui/material';
import { FinanciamientoType } from '@/lib/types';
import { useEliminarFinanciamiento } from '@/app/hook/useEliminarFinanciamiento';
import {
  azulBase,
  azulClaro,
  azulOscuro,
  blanco,
  grisClaro,
  grisMedio,
  grisOscuro,
  grisTexto,
  turquesa,
} from '@/lib/color';
import { useRouter } from 'next/navigation';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ListaFinanciamientosProps {
  financiamientos: (FinanciamientoType & {
    cuotasAtrasadas?: number;
    montoAtrasado?: number;
  })[];
  pagination?: PaginationData;
  loading?: boolean;
  onFinanciamientoEliminado?: () => void;
  onAgregarFinanciamiento?: () => void;
  mostrarAtrasos?: boolean;
  onImprimir?: (id: string) => void;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  initialSearch?: string;
}

interface MenuState {
  anchorEl: HTMLElement | null;
  financiamientoId: string | null;
}

export default function ListaFinanciamientos({
  financiamientos,
  pagination,
  loading = false,
  onFinanciamientoEliminado,
  onAgregarFinanciamiento,
  mostrarAtrasos = false,
  onImprimir,
  onPageChange,
  onSearchChange,
  initialSearch = '',
}: ListaFinanciamientosProps) {
  const [filter, setFilter] = React.useState(initialSearch);
  const [menuState, setMenuState] = React.useState<MenuState>({
    anchorEl: null,
    financiamientoId: null,
  });
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Debounce para la búsqueda
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setFilter(initialSearch);
  }, [initialSearch]);

  // Hook personalizado para eliminar financiamiento
  const {
    confirmDialog,
    loading: deletingLoading,
    snackbar,
    handleClickEliminar,
    handleConfirmEliminar,
    handleCancelEliminar,
    handleCloseSnackbar,
  } = useEliminarFinanciamiento({ onFinanciamientoEliminado });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-UY');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'finalizado':
        return 'info';
      case 'cancelado':
        return 'error';
      case 'en_mora':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    financiamientoId: string
  ) => {
    setMenuState({
      anchorEl: event.currentTarget,
      financiamientoId,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      financiamientoId: null,
    });
  };

  const handleClickVerDetalles = (id: string) => {
    handleMenuClose();
    router.push(`/ciompi/financiamiento/${id}`);
  };

  const handleClickImprimir = (id: string) => {
    handleMenuClose();
    if (onImprimir) {
      onImprimir(id);
    }
  };

  // Wrapper para handleClickEliminar que también cierra el menú
  const handleClickEliminarWrapper = (id: string, nombre: string) => {
    handleMenuClose();
    handleClickEliminar(id, nombre);
  };

  // Función para obtener el nombre del financiamiento para mostrar en el diálogo
  const getFinanciamientoNombre = (fin: FinanciamientoType): string => {
    const clienteNombre =
      typeof fin.cliente === 'object' ? fin.cliente.NOMBRE : 's/n';
    const vehiculoInfo =
      typeof fin.vehiculo === 'object'
        ? `${fin.vehiculo.Marca} ${fin.vehiculo.Modelo}`
        : 's/v';
    return `${clienteNombre} - ${vehiculoInfo}`;
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
  const filteredFinanciamientos = financiamientos;

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
          Lista de Financiamientos
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={
              pagination
                ? `${pagination.total} financiamientos (página ${pagination.page} de ${pagination.pages})`
                : `${filteredFinanciamientos.length} financiamientos`
            }
            variant="outlined"
            sx={{
              borderColor: turquesa,
              color: azulOscuro,
              fontWeight: 600,
            }}
          />

          {onAgregarFinanciamiento && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAgregarFinanciamiento}
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
              Agregar Financiamiento
            </Button>
          )}
        </Box>
      </Box>

      {/* Barra de búsqueda */}
      <TextField
        placeholder="Buscar por cliente, cédula, teléfono, vehículo, empresa o estado..."
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
            minWidth: isMobile ? 1200 : 900,
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
                }}
              >
                Cliente
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Vehículo
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Costo
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Cuotas
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Estado
              </TableCell>
              {mostrarAtrasos && (
                <TableCell
                  sx={{
                    color: blanco,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Cuotas Atrasadas
                </TableCell>
              )}
              {mostrarAtrasos && (
                <TableCell
                  sx={{
                    color: blanco,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Monto Atrasado
                </TableCell>
              )}
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Fecha Venta
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
            {filteredFinanciamientos.length === 0 && (
              <TableRow>
                <TableCell colSpan={mostrarAtrasos ? 10 : 8} align="center">
                  <Typography variant="body1" color={grisTexto} sx={{ py: 4 }}>
                    {filter
                      ? 'No se encontraron financiamientos que coincidan con la búsqueda'
                      : 'No hay financiamientos registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {filteredFinanciamientos.map((fin, index) => (
              <TableRow
                key={fin._id}
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
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {typeof fin.cliente === 'object'
                        ? (fin.cliente.NOMBRE ?? 's/n')
                        : '-'}
                    </Typography>
                    {fin.cliente2 &&
                      typeof fin.cliente2 === 'object' &&
                      fin.cliente2.NOMBRE && (
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ mt: 0.5, color: grisTexto }}
                        >
                          {fin.cliente2.NOMBRE}
                        </Typography>
                      )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {typeof fin.vehiculo === 'object'
                      ? `${fin.vehiculo.Marca} ${fin.vehiculo.Modelo}`
                      : '-'}
                  </Typography>
                  <Typography variant="caption" color={grisTexto}>
                    {typeof fin.vehiculo === 'object'
                      ? fin.vehiculo.Matricula
                      : ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(fin.costoVehiculo)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {fin.cuotasPagadas || 0} / {fin.cuotas}
                  </Typography>
                  {fin.progresoFinanciamiento !== undefined && (
                    <LinearProgress
                      variant="determinate"
                      value={fin.progresoFinanciamiento}
                      sx={{
                        mt: 0.5,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: grisClaro,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={fin.estadoFinanciamiento}
                    color={getEstadoColor(fin.estadoFinanciamiento) as any}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  />
                </TableCell>
                {mostrarAtrasos && (
                  <TableCell>
                    <Chip
                      label={fin.cuotasAtrasadas || 0}
                      color="error"
                      size="small"
                      sx={{
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                )}
                {mostrarAtrasos && (
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="error.main"
                    >
                      {formatCurrency(fin.montoAtrasado || 0)}
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant="body2" color={grisTexto}>
                    {formatDate(fin.fechaVenta)}
                  </Typography>
                </TableCell>
                <TableCell
                  className="sticky-actions-cell"
                  sx={{
                    position: 'sticky',
                    right: 0,
                    backgroundColor: getStatusColor(index),
                    zIndex: 5,
                    minWidth: 100,
                    width: 100,
                    borderLeft: `2px solid ${grisMedio}`,
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Stack alignItems="flex-end">
                    <Tooltip title="Acciones" placement="top">
                      <IconButton
                        onClick={event => handleMenuOpen(event, fin._id || '')}
                        size="small"
                        sx={{
                          color: azulBase,
                          '&:hover': {
                            backgroundColor: azulBase + '20',
                          },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuState.anchorEl}
                      open={Boolean(
                        menuState.anchorEl &&
                          menuState.financiamientoId === fin._id
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
                          minWidth: '160px !important',
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
                        onClick={() => handleClickVerDetalles(fin._id || '')}
                      >
                        <ViewIcon
                          sx={{ fontSize: 18, mr: 1, color: azulBase }}
                        />
                        Ver Detalles
                      </MenuItem>
                      {onImprimir && (
                        <MenuItem
                          onClick={() => handleClickImprimir(fin._id || '')}
                        >
                          <PrintIcon
                            sx={{ fontSize: 18, mr: 1, color: azulOscuro }}
                          />
                          Imprimir
                        </MenuItem>
                      )}
                      <MenuItem
                        onClick={() =>
                          handleClickEliminarWrapper(
                            fin._id || '',
                            getFinanciamientoNombre(fin)
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
            ¿Estás seguro de que deseas eliminar el financiamiento "
            {confirmDialog.financiamientoNombre}"? Esta acción no se puede
            deshacer.
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
