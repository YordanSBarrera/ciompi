'use client';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Stack,
  InputAdornment,
  TextField,
  Tooltip,
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
  Chip,
  CircularProgress,
  MenuItem,
  Menu,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useRouter } from 'next/navigation';
import { VehiculoType } from '@/lib/types';
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
  colorMap,
} from '@/lib/color';

interface ListaVehiculosProps {
  vehiculos: VehiculoType[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onAddVehiculo: () => void;
  onEditVehiculo: (vehiculo: VehiculoType) => void;
  onViewVehiculo: (vehiculo: VehiculoType) => void;
  onDeleteVehiculo: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
}

interface MenuState {
  anchorEl: HTMLElement | null;
  vehiculoId: string | null;
}

export default function ListaVehiculos({
  vehiculos,
  loading,
  error,
  refreshing,
  onAddVehiculo,
  onEditVehiculo,
  onViewVehiculo,
  onDeleteVehiculo,
}: ListaVehiculosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuState, setMenuState] = useState<MenuState>({
    anchorEl: null,
    vehiculoId: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    vehiculo: VehiculoType | null;
  }>({ open: false, vehiculo: null });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredVehiculos = vehiculos.filter(vehiculo => {
    // Solo filtro de búsqueda general
    const matchesSearch =
      !searchTerm ||
      vehiculo.Marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleDeleteClick = (vehiculo: VehiculoType) => {
    setDeleteDialog({ open: true, vehiculo });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.vehiculo) {
      const result = await onDeleteVehiculo(deleteDialog.vehiculo._id!);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Vehículo eliminado exitosamente',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Error al eliminar vehículo',
          severity: 'error',
        });
      }
    }
    setDeleteDialog({ open: false, vehiculo: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, vehiculo: null });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    vehiculoId: string
  ) => {
    setMenuState({
      anchorEl: event.currentTarget,
      vehiculoId,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      vehiculoId: null,
    });
  };

  const handleClickVerDetalles = (vehiculo: VehiculoType) => {
    handleMenuClose();
    onViewVehiculo(vehiculo);
  };

  const handleClickEditar = (vehiculo: VehiculoType) => {
    handleMenuClose();
    onEditVehiculo(vehiculo);
  };

  const handleClickEliminar = (vehiculo: VehiculoType) => {
    handleMenuClose();
    handleDeleteClick(vehiculo);
  };

  const truncateText = (text: string, maxLength: number = 10): string => {
    if (!text || text.length <= maxLength) return text;
    if (typeof text !== 'string') return text;
    return text.substring(0, maxLength) + '...';
  };

  const isTruncated = (text: string, maxLength: number = 10): boolean => {
    return Boolean(text && text.length > maxLength);
  };

  const getStatusColor = (index: number) => {
    return index % 2 === 0 ? blanco : grisClaro;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
        gap={2}
      >
        <CircularProgress />
        <Typography>Cargando vehículos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {/* Header moderno */}
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
          Lista de Vehículos
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`${filteredVehiculos.length} vehículos`}
            variant="outlined"
            sx={{
              borderColor: azulBase,
              color: azulOscuro,
              fontWeight: 600,
            }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddVehiculo}
            disabled={refreshing}
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
            {refreshing ? 'Actualizando...' : 'Agregar Vehículo'}
          </Button>
        </Box>
      </Box>

      {/* Búsqueda mejorada */}
      <TextField
        placeholder="Buscar por marca, modelo, matrícula, color o descripción..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
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

      {/* Tabla de vehículos moderna */}
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
                  minWidth: isMobile ? 100 : 120,
                }}
              >
                Marca
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 100 : 120,
                }}
              >
                Modelo
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 100 : 120,
                }}
              >
                Matrícula
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: 80,
                }}
              >
                Año
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 100 : 120,
                }}
              >
                Color
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: 100,
                }}
              >
                Padrón
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
            {filteredVehiculos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    {searchTerm
                      ? 'No se encontraron vehículos que coincidan con la búsqueda'
                      : 'No hay vehículos registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredVehiculos.map((vehiculo, index) => (
                <TableRow
                  key={vehiculo._id}
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
                    <Tooltip title={vehiculo.Marca} placement="top" arrow>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: grisOscuro,
                          fontSize: '0.875rem',
                          cursor: 'help',
                        }}
                      >
                        {truncateText(vehiculo.Marca, 15)}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    <Tooltip title={vehiculo.Modelo} placement="top" arrow>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: grisOscuro,
                          fontSize: '0.875rem',
                          cursor: 'help',
                        }}
                      >
                        {truncateText(vehiculo.Modelo, 15)}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={vehiculo.Matricula}
                      size="small"
                      sx={{
                        backgroundColor: azulBase,
                        color: blanco,
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        color: vehiculo.Año ? grisOscuro : 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    >
                      {vehiculo.Año || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {vehiculo.Color ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          width={16}
                          height={16}
                          borderRadius="50%"
                          sx={{
                            backgroundColor:
                              colorMap[vehiculo.Color] ||
                              vehiculo.Color.toLowerCase(),

                            border: '2px solid rgba(0,0,0,0.1)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.875rem',
                            color: grisOscuro,
                          }}
                        >
                          {truncateText(vehiculo.Color, 10)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontStyle: 'italic',
                          fontSize: '0.875rem',
                        }}
                      >
                        -
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        color: vehiculo.Padron ? grisOscuro : 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    >
                      {vehiculo.Padron || '-'}
                    </Typography>
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
                          onClick={event =>
                            handleMenuOpen(event, vehiculo._id!)
                          }
                          size="small"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={menuState.anchorEl}
                        open={Boolean(
                          menuState.anchorEl &&
                            menuState.vehiculoId === vehiculo._id
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
                            boxShadow:
                              '0px 4px 12px rgba(0,0,0,0.15) !important',
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
                          onClick={() => handleClickVerDetalles(vehiculo)}
                        >
                          <ViewIcon
                            sx={{ fontSize: 18, mr: 1, color: azulBase }}
                          />
                          Ver Detalles
                        </MenuItem>
                        <MenuItem onClick={() => handleClickEditar(vehiculo)}>
                          <EditIcon
                            sx={{ fontSize: 18, mr: 1, color: azulBase }}
                          />
                          Editar
                        </MenuItem>
                        <MenuItem onClick={() => handleClickEliminar(vehiculo)}>
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
              ))
            )}
          </TableBody>
        </Table>

        {filteredVehiculos.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color={grisTexto}>
              {searchTerm
                ? 'No se encontraron vehículos que coincidan con la búsqueda'
                : 'No hay vehículos registrados'}
            </Typography>
          </Box>
        )}
      </TableContainer>

      {/* Footer con estadísticas */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" color={grisTexto}>
          Mostrando {filteredVehiculos.length} de {vehiculos.length} vehículos
        </Typography>

        {searchTerm && (
          <Typography variant="caption" color={naranja}>
            Filtro activo: "{searchTerm}"
          </Typography>
        )}
      </Box>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Estás seguro de que deseas eliminar el vehículo{' '}
            <strong>
              {deleteDialog.vehiculo?.Marca} {deleteDialog.vehiculo?.Modelo} -{' '}
              {deleteDialog.vehiculo?.Matricula}
            </strong>
            ? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
