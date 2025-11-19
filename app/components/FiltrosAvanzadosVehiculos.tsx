'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { azulBase, azulOscuro, blanco } from '@/lib/color';

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

interface FiltrosAvanzadosVehiculosProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FiltrosVehiculos) => void;
  onClearFilters: () => void;
  initialFilters?: FiltrosVehiculos;
}

const marcasComunes = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'Nissan',
  'Hyundai',
  'Kia',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Mazda',
  'Subaru',
  'Mitsubishi',
  'Suzuki',
  'Peugeot',
  'Renault',
  'Fiat',
  'Volvo',
  'Jeep',
];

const coloresComunes = [
  'Blanco',
  'Negro',
  'Gris',
  'Plateado',
  'Azul',
  'Rojo',
  'Verde',
  'Amarillo',
  'Naranja',
  'Marrón',
  'Beige',
  'Dorado',
  'Violeta',
  'Rojo Oscuro',
  'Verde Oscuro',
  'Azul Oscuro',
  'Gris Oscuro',
];

export default function FiltrosAvanzadosVehiculos({
  open,
  onClose,
  onApplyFilters,
  onClearFilters,
  initialFilters,
}: FiltrosAvanzadosVehiculosProps) {
  const [filtros, setFiltros] = useState<FiltrosVehiculos>(
    initialFilters || {
      marca: '',
      modelo: '',
      matricula: '',
      color: '',
      añoMin: '',
      añoMax: '',
      padronMin: '',
      padronMax: '',
    }
  );

  const [filtrosActivos, setFiltrosActivos] = useState<number>(0);

  const handleInputChange = (field: keyof FiltrosVehiculos, value: any) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filtros);
    onClose();
  };

  const handleClearFilters = () => {
    const filtrosVacios: FiltrosVehiculos = {
      marca: '',
      modelo: '',
      matricula: '',
      color: '',
      añoMin: '' as const,
      añoMax: '' as const,
      padronMin: '' as const,
      padronMax: '' as const,
    };
    setFiltros(filtrosVacios);
    onClearFilters();
    onClose();
  };

  const contarFiltrosActivos = () => {
    let count = 0;
    Object.values(filtros).forEach(value => {
      if (value !== '' && value !== null && value !== undefined) {
        count++;
      }
    });
    return count;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: azulBase,
          color: blanco,
          fontWeight: 'bold',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <FilterIcon />
          Filtros Avanzados
          {filtrosActivos > 0 && (
            <Chip
              label={`${filtrosActivos} filtro${filtrosActivos > 1 ? 's' : ''}`}
              size="small"
              sx={{
                backgroundColor: blanco,
                color: azulBase,
                fontWeight: 'bold',
              }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: blanco }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Marca */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Marca</InputLabel>
              <Select
                value={filtros.marca}
                onChange={e => handleInputChange('marca', e.target.value)}
                label="Marca"
              >
                <MenuItem value="">
                  <em>Todas las marcas</em>
                </MenuItem>
                {marcasComunes.map(marca => (
                  <MenuItem key={marca} value={marca}>
                    {marca}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Modelo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Modelo"
              value={filtros.modelo}
              onChange={e => handleInputChange('modelo', e.target.value)}
              placeholder="Buscar por modelo..."
            />
          </Grid>

          {/* Matrícula */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Matrícula"
              value={filtros.matricula}
              onChange={e =>
                handleInputChange('matricula', e.target.value.toUpperCase())
              }
              placeholder="Buscar por matrícula..."
            />
          </Grid>

          {/* Color */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={filtros.color}
                onChange={e => handleInputChange('color', e.target.value)}
                label="Color"
              >
                <MenuItem value="">
                  <em>Todos los colores</em>
                </MenuItem>
                {coloresComunes.map(color => (
                  <MenuItem key={color} value={color}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        width={20}
                        height={20}
                        borderRadius="50%"
                        sx={{
                          backgroundColor:
                            color === 'Blanco'
                              ? '#FFFFFF'
                              : color === 'Negro'
                                ? '#000000'
                                : color === 'Gris'
                                  ? '#808080'
                                  : color === 'Plateado'
                                    ? '#C0C0C0'
                                    : color === 'Azul'
                                      ? '#0000FF'
                                      : color === 'Rojo'
                                        ? '#FF0000'
                                        : color === 'Verde'
                                          ? '#00FF00'
                                          : color === 'Amarillo'
                                            ? '#FFFF00'
                                            : color === 'Naranja'
                                              ? '#FFA500'
                                              : color === 'Marrón'
                                                ? '#8B4513'
                                                : color === 'Beige'
                                                  ? '#F5F5DC'
                                                  : color === 'Dorado'
                                                    ? '#FFD700'
                                                    : color === 'Violeta'
                                                      ? '#8A2BE2'
                                                      : color === 'Rojo Oscuro'
                                                        ? '#8B0000'
                                                        : color ===
                                                            'Verde Oscuro'
                                                          ? '#006400'
                                                          : color ===
                                                              'Azul Oscuro'
                                                            ? '#000080'
                                                            : color ===
                                                                'Gris Oscuro'
                                                              ? '#696969'
                                                              : '#808080',
                          border:
                            color === 'Blanco' ? '1px solid #ccc' : 'none',
                        }}
                      />
                      {color}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Año Mínimo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Año Mínimo</InputLabel>
              <Select
                value={filtros.añoMin}
                onChange={e =>
                  handleInputChange(
                    'añoMin',
                    e.target.value ? Number(e.target.value) : ''
                  )
                }
                label="Año Mínimo"
              >
                <MenuItem value="">
                  <em>Sin límite</em>
                </MenuItem>
                {years.map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Año Máximo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Año Máximo</InputLabel>
              <Select
                value={filtros.añoMax}
                onChange={e =>
                  handleInputChange(
                    'añoMax',
                    e.target.value ? Number(e.target.value) : ''
                  )
                }
                label="Año Máximo"
              >
                <MenuItem value="">
                  <em>Sin límite</em>
                </MenuItem>
                {years.map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Padrón Mínimo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Padrón Mínimo"
              type="number"
              value={filtros.padronMin}
              onChange={e =>
                handleInputChange(
                  'padronMin',
                  e.target.value ? Number(e.target.value) : ''
                )
              }
              placeholder="Número mínimo"
            />
          </Grid>

          {/* Padrón Máximo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Padrón Máximo"
              type="number"
              value={filtros.padronMax}
              onChange={e =>
                handleInputChange(
                  'padronMax',
                  e.target.value ? Number(e.target.value) : ''
                )
              }
              placeholder="Número máximo"
            />
          </Grid>
        </Grid>

        {/* Resumen de filtros activos */}
        {contarFiltrosActivos() > 0 && (
          <Box
            sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Filtros activos:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {filtros.marca && (
                <Chip
                  label={`Marca: ${filtros.marca}`}
                  size="small"
                  onDelete={() => handleInputChange('marca', '')}
                />
              )}
              {filtros.modelo && (
                <Chip
                  label={`Modelo: ${filtros.modelo}`}
                  size="small"
                  onDelete={() => handleInputChange('modelo', '')}
                />
              )}
              {filtros.matricula && (
                <Chip
                  label={`Matrícula: ${filtros.matricula}`}
                  size="small"
                  onDelete={() => handleInputChange('matricula', '')}
                />
              )}
              {filtros.color && (
                <Chip
                  label={`Color: ${filtros.color}`}
                  size="small"
                  onDelete={() => handleInputChange('color', '')}
                />
              )}
              {filtros.añoMin && (
                <Chip
                  label={`Año ≥ ${filtros.añoMin}`}
                  size="small"
                  onDelete={() => handleInputChange('añoMin', '')}
                />
              )}
              {filtros.añoMax && (
                <Chip
                  label={`Año ≤ ${filtros.añoMax}`}
                  size="small"
                  onDelete={() => handleInputChange('añoMax', '')}
                />
              )}
              {filtros.padronMin && (
                <Chip
                  label={`Padrón ≥ ${filtros.padronMin}`}
                  size="small"
                  onDelete={() => handleInputChange('padronMin', '')}
                />
              )}
              {filtros.padronMax && (
                <Chip
                  label={`Padrón ≤ ${filtros.padronMax}`}
                  size="small"
                  onDelete={() => handleInputChange('padronMax', '')}
                />
              )}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleClearFilters}
          startIcon={<ClearIcon />}
          variant="outlined"
          color="error"
        >
          Limpiar Filtros
        </Button>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleApplyFilters}
          variant="contained"
          sx={{
            backgroundColor: azulBase,
            '&:hover': {
              backgroundColor: azulOscuro,
            },
          }}
        >
          Aplicar Filtros
        </Button>
      </DialogActions>
    </Dialog>
  );
}
