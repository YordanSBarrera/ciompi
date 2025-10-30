'use client';
import { ClienteFormType } from '@/lib/types';
import { validateCedula, handleCedulaInput, cleanCedula } from '@/lib/utils';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

interface ModalNuevoClienteProps {
  open: boolean;
  onClose: () => void;
  onClienteCreado: (cliente: ClienteFormType) => void;
}

export default function ModalNuevoCliente({
  open,
  onClose,
  onClienteCreado,
}: ModalNuevoClienteProps) {
  const [formData, setFormData] = useState<ClienteFormType>({
    NOMBRE: '',
    cedula: '',
    correo: '',
    profesion: '',
    DIRECCION: '',
    TELEFONO: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [cedulaError, setCedulaError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Resetear formulario al abrir
      setFormData({
        NOMBRE: '',
        cedula: '',
        correo: '',
        profesion: '',
        DIRECCION: '',
        TELEFONO: '',
      });
      setError(null);
      setCedulaError(null);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Manejo especial para cédula
    if (name === 'cedula') {
      const formattedValue = handleCedulaInput(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
      }));

      // Validar cédula en tiempo real
      if (formattedValue && formattedValue.length > 0) {
        const cleanValue = cleanCedula(formattedValue);
        if (cleanValue.length === 8) {
          if (!validateCedula(cleanValue)) {
            setCedulaError('La cédula debe tener exactamente 8 dígitos');
          } else {
            setCedulaError(null);
          }
        } else if (cleanValue.length > 0) {
          setCedulaError('La cédula debe tener exactamente 8 dígitos');
        } else {
          setCedulaError(null);
        }
      } else {
        setCedulaError(null);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.NOMBRE.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }

    // Validar cédula si se proporciona
    if (formData.cedula && formData.cedula.trim()) {
      const cleanCedulaValue = cleanCedula(formData.cedula);
      if (!validateCedula(cleanCedulaValue)) {
        setError('La cédula debe tener exactamente 8 dígitos');
        setCedulaError('La cédula debe tener exactamente 8 dígitos');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Preparar datos del cliente (limpiando la cédula)
    const clienteData: ClienteFormType = {
      ...formData,
      cedula: formData.cedula ? cleanCedula(formData.cedula) : formData.cedula,
    };

    // Llamar al callback con el cliente creado
    onClienteCreado(clienteData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="h2">
          Nuevo Cliente
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Ingrese los datos del cliente (este cliente no se guardará en la base
          de datos)
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Información Básica */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main' }}
              >
                Información Básica
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombre completo *"
                name="NOMBRE"
                value={formData.NOMBRE}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Cédula"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                error={!!cedulaError}
                helperText={cedulaError || 'Formato: 12345678'}
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* Información de Contacto */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', mt: 2 }}
              >
                Información de Contacto
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Teléfono"
                name="TELEFONO"
                value={formData.TELEFONO}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Correo electrónico"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Dirección"
                name="DIRECCION"
                value={formData.DIRECCION}
                onChange={handleChange}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Profesión"
                name="profesion"
                value={formData.profesion}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" sx={{ minWidth: 120 }}>
            Usar Cliente
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
