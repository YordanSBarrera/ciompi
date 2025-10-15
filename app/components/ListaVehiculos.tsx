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
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { VehiculoType } from '@/lib/types';
import { useVehiculos } from '@/app/hook/useVehiculos';
import FiltrosAvanzadosVehiculos from './FiltrosAvanzadosVehiculos';
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

interface FiltrosVehiculos {
  marca: string;
  modelo: string;
  matricula: string;
  color: string;
  añoMin: number | '';
  añoMax: number | '';
  padronMin: number | '';
  padronMax: number | '';
}

export default function ListaVehiculos({
  onAddVehiculo,
  onEditVehiculo,
  onViewVehiculo,
}: ListaVehiculosProps) {
  const { vehiculos, loading, error, deleteVehiculo, refreshing } =
    useVehiculos();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FiltrosVehiculos>({
    marca: '',
    modelo: '',
    matricula: '',
    color: '',
    añoMin: '',
    añoMax: '',
    padronMin: '',
    padronMax: '',
  });
  const [filtrosDialogOpen, setFiltrosDialogOpen] = useState(false);
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

  const filteredVehiculos = vehiculos.filter(vehiculo => {
    // Filtro de búsqueda general
    const matchesSearch =
      !searchTerm ||
      vehiculo.Marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.Descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtros avanzados
    const matchesMarca =
      !filtrosAvanzados.marca ||
      vehiculo.Marca.toLowerCase().includes(
        filtrosAvanzados.marca.toLowerCase()
      );

    const matchesModelo =
      !filtrosAvanzados.modelo ||
      vehiculo.Modelo.toLowerCase().includes(
        filtrosAvanzados.modelo.toLowerCase()
      );

    const matchesMatricula =
      !filtrosAvanzados.matricula ||
      vehiculo.Matricula.toLowerCase().includes(
        filtrosAvanzados.matricula.toLowerCase()
      );

    const matchesColor =
      !filtrosAvanzados.color ||
      vehiculo.Color?.toLowerCase().includes(
        filtrosAvanzados.color.toLowerCase()
      );

    const matchesAñoMin =
      !filtrosAvanzados.añoMin ||
      (vehiculo.Año && vehiculo.Año >= filtrosAvanzados.añoMin);

    const matchesAñoMax =
      !filtrosAvanzados.añoMax ||
      (vehiculo.Año && vehiculo.Año <= filtrosAvanzados.añoMax);

    const matchesPadronMin =
      !filtrosAvanzados.padronMin ||
      (vehiculo.Padron && vehiculo.Padron >= filtrosAvanzados.padronMin);

    const matchesPadronMax =
      !filtrosAvanzados.padronMax ||
      (vehiculo.Padron && vehiculo.Padron <= filtrosAvanzados.padronMax);

    return (
      matchesSearch &&
      matchesMarca &&
      matchesModelo &&
      matchesMatricula &&
      matchesColor &&
      matchesAñoMin &&
      matchesAñoMax &&
      matchesPadronMin &&
      matchesPadronMax
    );
  });

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

  const handleApplyFilters = (filters: FiltrosVehiculos) => {
    setFiltrosAvanzados(filters);
  };

  const handleClearFilters = () => {
    setFiltrosAvanzados({
      marca: '',
      modelo: '',
      matricula: '',
      color: '',
      añoMin: '',
      añoMax: '',
      padronMin: '',
      padronMax: '',
    });
  };

  const contarFiltrosActivos = () => {
    let count = 0;
    Object.values(filtrosAvanzados).forEach(value => {
      if (value !== '' && value !== null && value !== undefined) {
        count++;
      }
    });
    return count;
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
    <Box>
      {/* Header con búsqueda y botones */}
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
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFiltrosDialogOpen(true)}
            sx={{
              borderColor: azulBase,
              color: azulBase,
              '&:hover': {
                borderColor: azulOscuro,
                backgroundColor: azulBase + '10',
              },
            }}
          >
            Filtros
            {contarFiltrosActivos() > 0 && (
              <Chip
                label={contarFiltrosActivos()}
                size="small"
                sx={{
                  ml: 1,
                  backgroundColor: azulBase,
                  color: blanco,
                  height: 20,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddVehiculo}
            disabled={refreshing}
            sx={{
              backgroundColor: azulBase,
              '&:hover': {
                backgroundColor: azulOscuro,
              },
            }}
          >
            {refreshing ? 'Actualizando...' : 'Agregar Vehículo'}
          </Button>
        </Stack>
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

      {/* Filtros avanzados */}
      <FiltrosAvanzadosVehiculos
        open={filtrosDialogOpen}
        onClose={() => setFiltrosDialogOpen(false)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        initialFilters={filtrosAvanzados}
      />

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
