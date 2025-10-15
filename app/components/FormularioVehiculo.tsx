'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { VehiculoType, VehiculoFormType } from '@/lib/types';
import { azulBase, azulOscuro, blanco } from '@/lib/color';

interface FormularioVehiculoProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    vehiculoData: VehiculoFormType
  ) => Promise<{ success: boolean; error?: string }>;
  vehiculo?: VehiculoType | null;
  title: string;
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

export default function FormularioVehiculo({
  open,
  onClose,
  onSave,
  vehiculo,
  title,
}: FormularioVehiculoProps) {
  const [formData, setFormData] = useState<VehiculoFormType>({
    Marca: '',
    Modelo: '',
    Matricula: '',
    Padron: undefined,
    Descripcion: '',
    Año: undefined,
    Color: '',
  });

  const [errors, setErrors] = useState<Partial<VehiculoFormType>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (vehiculo) {
      setFormData({
        Marca: vehiculo.Marca || '',
        Modelo: vehiculo.Modelo || '',
        Matricula: vehiculo.Matricula || '',
        Padron: vehiculo.Padron || undefined,
        Descripcion: vehiculo.Descripcion || '',
        Año: vehiculo.Año || undefined,
        Color: vehiculo.Color || '',
      });
    } else {
      setFormData({
        Marca: '',
        Modelo: '',
        Matricula: '',
        Padron: undefined,
        Descripcion: '',
        Año: undefined,
        Color: '',
      });
    }
    setErrors({});
  }, [vehiculo, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<VehiculoFormType> = {};

    // Validación de marca
    if (!formData.Marca.trim()) {
      newErrors.Marca = 'La marca es requerida';
    } else if (formData.Marca.trim().length < 2) {
      newErrors.Marca = 'La marca debe tener al menos 2 caracteres';
    } else if (formData.Marca.trim().length > 50) {
      newErrors.Marca = 'La marca no puede exceder 50 caracteres';
    }

    // Validación de modelo
    if (!formData.Modelo.trim()) {
      newErrors.Modelo = 'El modelo es requerido';
    } else if (formData.Modelo.trim().length < 1) {
      newErrors.Modelo = 'El modelo debe tener al menos 1 carácter';
    } else if (formData.Modelo.trim().length > 50) {
      newErrors.Modelo = 'El modelo no puede exceder 50 caracteres';
    }

    // Validación de matrícula
    if (!formData.Matricula.trim()) {
      newErrors.Matricula = 'La matrícula es requerida';
    } else {
      const matriculaRegex = /^[A-Z0-9-]{3,10}$/;
      if (!matriculaRegex.test(formData.Matricula.trim())) {
        newErrors.Matricula =
          'La matrícula debe tener entre 3 y 10 caracteres alfanuméricos y guiones';
      }
    }

    // Validación de año
    if (formData.Año) {
      const currentYear = new Date().getFullYear();
      if (formData.Año < 1900 || formData.Año > currentYear + 1) {
        newErrors.Año = `El año debe estar entre 1900 y ${currentYear + 1}`;
      }
    }

    // Validación de padrón
    if (formData.Padron !== undefined && formData.Padron !== null) {
      if (formData.Padron < 0) {
        newErrors.Padron = 'El padrón debe ser un número positivo';
      } else if (formData.Padron > 999999999) {
        newErrors.Padron = 'El padrón no puede exceder 999,999,999';
      }
    }

    // Validación de descripción
    if (formData.Descripcion && formData.Descripcion.length > 500) {
      newErrors.Descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    // Validación de color
    if (formData.Color && formData.Color.length > 30) {
      newErrors.Color = 'El color no puede exceder 30 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof VehiculoFormType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Validación en tiempo real para algunos campos
    if (field === 'Matricula' && value) {
      const matriculaRegex = /^[A-Z0-9-]{3,10}$/;
      if (!matriculaRegex.test(value.trim())) {
        setErrors(prev => ({
          ...prev,
          Matricula:
            'Formato inválido. Use letras, números y guiones (3-10 caracteres)',
        }));
      }
    }

    if (field === 'Año' && value) {
      const currentYear = new Date().getFullYear();
      if (value < 1900 || value > currentYear + 1) {
        setErrors(prev => ({
          ...prev,
          Año: `El año debe estar entre 1900 y ${currentYear + 1}`,
        }));
      }
    }

    if (field === 'Padron' && value !== undefined && value !== null) {
      if (value < 0) {
        setErrors(prev => ({
          ...prev,
          Padron: 'El padrón debe ser un número positivo',
        }));
      } else if (value > 999999999) {
        setErrors(prev => ({
          ...prev,
          Padron: 'El padrón no puede exceder 999,999,999',
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await onSave(formData);
      if (result.success) {
        setSnackbar({
          open: true,
          message: vehiculo
            ? 'Vehículo actualizado exitosamente'
            : 'Vehículo creado exitosamente',
          severity: 'success',
        });
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Error al guardar vehículo',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error inesperado',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <>
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
          }}
        >
          {title}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Marca */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.Marca}>
                <InputLabel>Marca *</InputLabel>
                <Select
                  value={formData.Marca}
                  onChange={e => handleInputChange('Marca', e.target.value)}
                  label="Marca *"
                >
                  {marcasComunes.map(marca => (
                    <MenuItem key={marca} value={marca}>
                      {marca}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.Marca && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.Marca}
                </Typography>
              )}
            </Grid>

            {/* Modelo */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Modelo *"
                value={formData.Modelo}
                onChange={e => handleInputChange('Modelo', e.target.value)}
                error={!!errors.Modelo}
                helperText={errors.Modelo || `${formData.Modelo.length}/50`}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>

            {/* Matrícula */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Matrícula *"
                value={formData.Matricula}
                onChange={e =>
                  handleInputChange('Matricula', e.target.value.toUpperCase())
                }
                error={!!errors.Matricula}
                helperText={
                  errors.Matricula || `${formData.Matricula.length}/10`
                }
                placeholder="ABC-1234"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            {/* Año */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.Año}>
                <InputLabel>Año</InputLabel>
                <Select
                  value={formData.Año || ''}
                  onChange={e =>
                    handleInputChange(
                      'Año',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  label="Año"
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.Año && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.Año}
                </Typography>
              )}
            </Grid>

            {/* Color */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={formData.Color}
                  onChange={e => handleInputChange('Color', e.target.value)}
                  label="Color"
                >
                  {coloresComunes.map(color => {
                    const getColorValue = (colorName: string) => {
                      const colorMap: { [key: string]: string } = {
                        Blanco: '#FFFFFF',
                        Negro: '#000000',
                        Gris: '#808080',
                        Plateado: '#C0C0C0',
                        Azul: '#0000FF',
                        Rojo: '#FF0000',
                        Verde: '#00FF00',
                        Amarillo: '#FFFF00',
                        Naranja: '#FFA500',
                        Marrón: '#8B4513',
                        Beige: '#F5F5DC',
                        Dorado: '#FFD700',
                        Violeta: '#8A2BE2',
                        'Rojo Oscuro': '#8B0000',
                        'Verde Oscuro': '#006400',
                        'Azul Oscuro': '#000080',
                        'Gris Oscuro': '#696969',
                      };
                      return colorMap[colorName] || colorName.toLowerCase();
                    };

                    return (
                      <MenuItem key={color} value={color}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            width={20}
                            height={20}
                            borderRadius="50%"
                            sx={{
                              backgroundColor: getColorValue(color),
                              border:
                                color === 'Blanco' ? '1px solid #ccc' : 'none',
                            }}
                          />
                          {color}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            {/* Padrón */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Padrón"
                type="number"
                value={formData.Padron || ''}
                onChange={e =>
                  handleInputChange(
                    'Padron',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                error={!!errors.Padron}
                helperText={errors.Padron}
                placeholder="123456"
              />
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={formData.Descripcion}
                onChange={e => handleInputChange('Descripcion', e.target.value)}
                error={!!errors.Descripcion}
                helperText={
                  errors.Descripcion || `${formData.Descripcion.length}/500`
                }
                placeholder="Detalles adicionales del vehículo..."
                inputProps={{ maxLength: 500 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: azulBase,
              '&:hover': {
                backgroundColor: azulOscuro,
              },
            }}
          >
            {loading ? 'Guardando...' : vehiculo ? 'Actualizar' : 'Crear'}
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
    </>
  );
}
