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
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { VehiculoType } from '@/lib/types';
import { useVehiculos } from '@/app/hook/useVehiculos';
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
  rojo,
  rojoOscuro,
  verde,
  verdeOscuro,
} from '@/lib/color';

interface ListaVehiculosProps {
  onAddVehiculo: () => void;
  onEditVehiculo: (vehiculo: VehiculoType) => void;
  onViewVehiculo: (vehiculo: VehiculoType) => void;
}

export default function ListaVehiculos({
  onAddVehiculo,
  onEditVehiculo,
  onViewVehiculo,
}: ListaVehiculosProps) {
  const { vehiculos, loading, error, deleteVehiculo } = useVehiculos();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    vehiculo: VehiculoType | null;
  }>({ open: false, vehiculo: null });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredVehiculos = vehiculos.filter(
    vehiculo =>
      vehiculo.Marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (vehiculo: VehiculoType) => {
    setDeleteDialog({ open: true, vehiculo });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.vehiculo) {
      const result = await deleteVehiculo(deleteDialog.vehiculo._id!);
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
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
    <Box>
      {/* Header con búsqueda y botón agregar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 3 }}
      >
        <TextField
          placeholder="Buscar vehículos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          size="small"
          sx={{
            flexGrow: 1,
            maxWidth: { xs: '100%', sm: '400px' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddVehiculo}
          sx={{
            backgroundColor: azulBase,
            '&:hover': {
              backgroundColor: azulOscuro,
            },
            minWidth: { xs: '100%', sm: 'auto' },
          }}
        >
          Agregar Vehículo
        </Button>
      </Stack>

      {/* Tabla de vehículos */}
      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: azulClaro }}>
              <TableCell sx={{ fontWeight: 'bold', color: blanco }}>
                Marca
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: blanco }}>
                Modelo
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: blanco }}>
                Matrícula
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: blanco }}>
                Año
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: blanco }}>
                Color
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: blanco }}>
                Padrón
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: blanco }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehiculos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    {searchTerm
                      ? 'No se encontraron vehículos'
                      : 'No hay vehículos registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredVehiculos.map((vehiculo, index) => (
                <TableRow
                  key={vehiculo._id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? grisClaro : blanco,
                    '&:hover': {
                      backgroundColor: azulClaro + '20',
                    },
                  }}
                >
                  <TableCell>{vehiculo.Marca}</TableCell>
                  <TableCell>{vehiculo.Modelo}</TableCell>
                  <TableCell>
                    <Chip
                      label={vehiculo.Matricula}
                      size="small"
                      sx={{
                        backgroundColor: azulBase,
                        color: blanco,
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>{vehiculo.Año || '-'}</TableCell>
                  <TableCell>
                    {vehiculo.Color ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          width={16}
                          height={16}
                          borderRadius="50%"
                          sx={{ backgroundColor: vehiculo.Color }}
                          border="1px solid #ccc"
                        />
                        <Typography variant="body2">
                          {vehiculo.Color}
                        </Typography>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{vehiculo.Padron || '-'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => onViewVehiculo(vehiculo)}
                          sx={{
                            color: verde,
                            '&:hover': {
                              color: verdeOscuro,
                              backgroundColor: verde + '10',
                            },
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => onEditVehiculo(vehiculo)}
                          sx={{ color: naranja }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(vehiculo)}
                          sx={{
                            color: rojo,
                            '&:hover': {
                              color: rojoOscuro,
                              backgroundColor: rojo + '10',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
    </Box>
  );
}
