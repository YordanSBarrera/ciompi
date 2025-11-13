'use client';
import { grisClaro, grisMedio } from '@/lib/color';
import {
  ClienteType,
  VehiculoType,
  EmpresaType,
  FinanciamientoFormType,
  ClienteFormType,
  CuotaFutura,
  VehiculoFormType,
} from '@/lib/types';
import AuthGuard from '@/app/components/AuthGuard';
import ModalNuevoCliente from '@/app/components/ModalNuevoCliente';
import FormularioVehiculo from '@/app/components/FormularioVehiculo';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Función para cargar clientes
async function cargarClientes(): Promise<ClienteType[]> {
  try {
    const response = await fetch('/api/clientes');
    if (!response.ok) {
      throw new Error('Error al cargar clientes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error cargando clientes:', error);
    return [];
  }
}

// Función para cargar vehículos
async function cargarVehiculos(): Promise<VehiculoType[]> {
  try {
    const response = await fetch('/api/vehiculos');
    if (!response.ok) {
      throw new Error('Error al cargar vehículos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error cargando vehículos:', error);
    return [];
  }
}

// Función para cargar empresas
async function cargarEmpresas(): Promise<EmpresaType[]> {
  try {
    const response = await fetch('/api/empresas');
    if (!response.ok) {
      throw new Error('Error al cargar empresas');
    }
    const result = await response.json();
    return result.success ? result.data : result;
  } catch (error) {
    console.error('Error cargando empresas:', error);
    return [];
  }
}

export default function NuevoFinanciamientoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteType[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoType[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [modalClienteOpen, setModalClienteOpen] = useState(false);
  const [vehiculoModalOpen, setVehiculoModalOpen] = useState(false);
  const [clienteModalIndex, setClienteModalIndex] = useState<0 | 1>(0); // Para saber qué cliente estamos creando
  const [incluirCostosDocumentacion, setIncluirCostosDocumentacion] =
    useState(false);
  const [incluirGastosExtras, setIncluirGastosExtras] = useState(false);
  const [mostrarCuotasExtras, setMostrarCuotasExtras] = useState(false);
  const [cuotasExtras, setCuotasExtras] = useState<CuotaFutura[]>([]);
  const [nuevaCuotaExtra, setNuevaCuotaExtra] = useState({
    valorCuota: 0,
    fechaCuota: new Date().toISOString().split('T')[0],
  });

  const [formData, setFormData] = useState<FinanciamientoFormType>({
    clientes: [''],
    vehiculo: '',
    empresa: '',
    valorBase: 0,
    costosDocumentacion: 0,
    gastosExtras: 0,
    cuotas: 12,
    cuotasExtras: 0,
    valorCuota: 0,
    interesTotal: 0,
    montoTotal: 0,
    fechaPrimeraCuota: new Date().toISOString().split('T')[0],
    cuotasFuturas: [],
    observaciones: '',
  });

  const [clientesNuevos, setClientesNuevos] = useState<
    Array<ClienteFormType | null>
  >([null, null]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientesData, vehiculosData, empresasData] = await Promise.all([
          cargarClientes(),
          cargarVehiculos(),
          cargarEmpresas(),
        ]);
        setClientes(clientesData);
        setVehiculos(vehiculosData);
        setEmpresas(empresasData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generar cuotas futuras cuando cambian cuotas, fechaPrimeraCuota o valorCuota
  useEffect(() => {
    const cuotas = formData.cuotas;
    const fechaPrimeraCuota = formData.fechaPrimeraCuota;
    const valorCuota = formData.valorCuota;

    if (cuotas > 0 && fechaPrimeraCuota && valorCuota > 0) {
      const nuevasCuotas: CuotaFutura[] = [];
      const fechaBase = new Date(fechaPrimeraCuota);

      for (let i = 0; i < cuotas; i++) {
        const fechaCuota = new Date(fechaBase);
        fechaCuota.setMonth(fechaCuota.getMonth() + i);
        nuevasCuotas.push({
          numeroCuota: i + 1,
          fechaVencimiento: fechaCuota.toISOString().split('T')[0],
          valorCuota: valorCuota,
        });
      }

      setFormData(prev => ({
        ...prev,
        cuotasFuturas: nuevasCuotas,
      }));
    }
  }, [formData.cuotas, formData.fechaPrimeraCuota, formData.valorCuota]);

  // Calcular montos automáticamente
  useEffect(() => {
    const valorBase = formData.valorBase || 0;
    const costosDocumentacion = formData.costosDocumentacion || 0;
    const gastosExtras = formData.gastosExtras || 0;
    const cuotas = formData.cuotas || 0;
    const valorCuota = formData.valorCuota || 0;

    // Calcular monto de cuotas extras
    const montoCuotasExtras = cuotasExtras.reduce(
      (sum, cuota) => sum + cuota.valorCuota,
      0
    );

    if ((cuotas > 0 && valorCuota > 0) || montoCuotasExtras > 0) {
      const montoTotal = valorCuota * cuotas + montoCuotasExtras;
      const interesTotal =
        montoTotal - valorBase - costosDocumentacion - gastosExtras;

      setFormData(prev => ({
        ...prev,
        montoTotal,
        interesTotal,
      }));
    }
  }, [
    formData.valorBase,
    formData.costosDocumentacion,
    formData.gastosExtras,
    formData.cuotas,
    formData.valorCuota,
    cuotasExtras,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'valorBase' ||
        name === 'costosDocumentacion' ||
        name === 'gastosExtras' ||
        name === 'cuotas' ||
        name === 'cuotasExtras' ||
        name === 'valorCuota'
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClienteSelect = (
    index: 0 | 1,
    value: string | ClienteFormType
  ) => {
    const nuevosClientes = [...formData.clientes];
    nuevosClientes[index] = value;
    setFormData(prev => ({
      ...prev,
      clientes: nuevosClientes,
    }));
  };

  const handleClienteCreado = (cliente: ClienteFormType) => {
    const nuevosClientesNuevos = [...clientesNuevos];
    nuevosClientesNuevos[clienteModalIndex] = cliente;
    setClientesNuevos(nuevosClientesNuevos);

    const nuevosClientes = [...formData.clientes];
    nuevosClientes[clienteModalIndex] = cliente;
    setFormData(prev => ({
      ...prev,
      clientes: nuevosClientes,
    }));

    setModalClienteOpen(false);
  };

  const handleGuardarVehiculo = async (vehiculoData: VehiculoFormType) => {
    try {
      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehiculoData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || 'Error al crear el vehículo. Intenta nuevamente.'
        );
      }

      const vehiculoGuardado: VehiculoType = await response.json();
      setVehiculos(prev => [vehiculoGuardado, ...prev]);
      setFormData(prev => ({
        ...prev,
        vehiculo: vehiculoGuardado._id || '',
      }));
      return { success: true };
    } catch (error) {
      console.error('Error guardando vehículo:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error desconocido al guardar vehículo',
      };
    }
  };

  const handleAgregarSegundoCliente = () => {
    setFormData(prev => ({
      ...prev,
      clientes: [...prev.clientes, ''],
    }));
    setClientesNuevos([...clientesNuevos, null]);
  };

  const handleEliminarSegundoCliente = () => {
    setFormData(prev => ({
      ...prev,
      clientes: [prev.clientes[0]],
    }));
    setClientesNuevos([clientesNuevos[0]]);
  };

  const handleFechaCuotaChange = (index: number, nuevaFecha: string) => {
    const nuevasCuotas = [...(formData.cuotasFuturas || [])];
    nuevasCuotas[index] = {
      ...nuevasCuotas[index],
      fechaVencimiento: nuevaFecha,
    };
    setFormData(prev => ({
      ...prev,
      cuotasFuturas: nuevasCuotas,
    }));
  };

  const handleAgregarCuotaExtra = () => {
    if (nuevaCuotaExtra.valorCuota > 0 && nuevaCuotaExtra.fechaCuota) {
      const nuevaCuota: CuotaFutura = {
        numeroCuota: cuotasExtras.length + 1,
        fechaVencimiento: nuevaCuotaExtra.fechaCuota,
        valorCuota: nuevaCuotaExtra.valorCuota,
      };
      setCuotasExtras([...cuotasExtras, nuevaCuota]);
      setNuevaCuotaExtra({
        valorCuota: 0,
        fechaCuota: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleEliminarCuotaExtra = (index: number) => {
    const nuevasCuotasExtras = cuotasExtras.filter((_, i) => i !== index);
    // Renumerar las cuotas
    const cuotasRenumeradas = nuevasCuotasExtras.map((cuota, i) => ({
      ...cuota,
      numeroCuota: i + 1,
    }));
    setCuotasExtras(cuotasRenumeradas);
  };

  const handleFechaCuotaExtraChange = (index: number, nuevaFecha: string) => {
    const nuevasCuotasExtras = [...cuotasExtras];
    nuevasCuotasExtras[index] = {
      ...nuevasCuotasExtras[index],
      fechaVencimiento: nuevaFecha,
    };
    setCuotasExtras(nuevasCuotasExtras);
  };

  const validateForm = (): boolean => {
    if (formData.clientes.length === 0 || !formData.clientes[0]) {
      setError('Debe seleccionar al menos un cliente');
      return false;
    }
    if (!formData.empresa) {
      setError('Debe seleccionar una empresa');
      return false;
    }
    if (formData.valorBase <= 0) {
      setError('El valor base debe ser mayor a 0');
      return false;
    }
    if (formData.cuotas <= 0) {
      setError('El número de cuotas debe ser mayor a 0');
      return false;
    }
    if (formData.valorCuota <= 0) {
      setError('El valor de la cuota debe ser mayor a 0');
      return false;
    }
    if (!formData.fechaPrimeraCuota) {
      setError('Debe seleccionar una fecha para la primera cuota');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      // Obtener el usuario actual del localStorage o contexto
      const usuarioActual = localStorage.getItem('user');
      let usuarioRegistro = '';

      if (usuarioActual) {
        const user = JSON.parse(usuarioActual);
        usuarioRegistro = user.id || user._id;
      }

      // Preparar datos de clientes
      const clientesData = formData.clientes.map((cliente, index) => {
        if (typeof cliente === 'object' && cliente.NOMBRE) {
          return cliente; // Es un cliente nuevo
        }
        return cliente; // Es un ID
      });

      // Para compatibilidad con el backend actual, usar el primer cliente
      // TODO: Actualizar el backend para manejar múltiples clientes
      const dataToSend = {
        ...formData,
        cliente: clientesData[0], // Por ahora solo el primer cliente
        costoVehiculo: formData.valorBase, // Mapeo temporal para compatibilidad
        cuotasExtras: cuotasExtras.length, // Número de cuotas extras para compatibilidad
        cuotasExtrasDetalle: cuotasExtras, // Array completo de cuotas extras
        usuarioRegistro,
      };

      const response = await fetch('/api/financiamiento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear financiamiento');
      }

      setSuccess(true);
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/ciompi/financiamiento');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/ciompi/financiamiento"
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver al listado
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Nueva Venta Financiada
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Registrar un nuevo financiamiento de vehículo
          </Typography>
        </Box>

        {/* Formulario */}
        <Paper
          elevation={3}
          sx={{ p: 4, bgcolor: grisClaro, border: `1px solid ${grisMedio}` }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Selección de Cliente(s) */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main' }}
                >
                  Selección de Cliente(s)
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              {/* Cliente 1 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Cliente 1 *</InputLabel>
                  <Select
                    value={
                      typeof formData.clientes[0] === 'object'
                        ? 'nuevo-0'
                        : formData.clientes[0] || ''
                    }
                    onChange={e => {
                      if (e.target.value === 'nuevo-0') {
                        setClienteModalIndex(0);
                        setModalClienteOpen(true);
                      } else if (e.target.value === '') {
                        handleClienteSelect(0, '');
                        const nuevosClientesNuevos = [...clientesNuevos];
                        nuevosClientesNuevos[0] = null;
                        setClientesNuevos(nuevosClientesNuevos);
                      } else {
                        handleClienteSelect(0, e.target.value);
                        const nuevosClientesNuevos = [...clientesNuevos];
                        nuevosClientesNuevos[0] = null;
                        setClientesNuevos(nuevosClientesNuevos);
                      }
                    }}
                    label="Cliente 1 *"
                  >
                    <MenuItem value="">
                      <Typography variant="body2" color="textSecondary">
                        Seleccionar...
                      </Typography>
                    </MenuItem>
                    <MenuItem value="nuevo-0">
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        + Crear Cliente Nuevo
                      </Typography>
                    </MenuItem>
                    {clientes.map(cliente => (
                      <MenuItem key={cliente._id} value={cliente._id}>
                        <Box>
                          <Typography variant="body1">
                            {cliente.NOMBRE}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {cliente.cedula}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Mostrar cliente seleccionado 1 */}
              {(typeof formData.clientes[0] === 'object' ||
                formData.clientes[0]) && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Cliente 1:{' '}
                      <strong>
                        {typeof formData.clientes[0] === 'object'
                          ? formData.clientes[0].NOMBRE
                          : clientes.find(c => c._id === formData.clientes[0])
                              ?.NOMBRE || 'N/A'}
                      </strong>
                      {typeof formData.clientes[0] === 'object' &&
                        formData.clientes[0].cedula &&
                        ` (${formData.clientes[0].cedula})`}
                      {typeof formData.clientes[0] === 'string' &&
                        clientes.find(c => c._id === formData.clientes[0])
                          ?.cedula &&
                        ` (${clientes.find(c => c._id === formData.clientes[0])?.cedula})`}
                    </Typography>
                  </Alert>
                </Grid>
              )}

              {/* Cliente 2 - Opcional */}
              {formData.clientes.length === 1 && (
                <Grid size={{ xs: 12 }}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAgregarSegundoCliente}
                    variant="outlined"
                    size="small"
                  >
                    Agregar Segundo Cliente (Opcional)
                  </Button>
                </Grid>
              )}

              {formData.clientes.length === 2 && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Cliente 2 (Opcional)</InputLabel>
                      <Select
                        value={
                          typeof formData.clientes[1] === 'object'
                            ? 'nuevo-1'
                            : formData.clientes[1] || ''
                        }
                        onChange={e => {
                          if (e.target.value === 'nuevo-1') {
                            setClienteModalIndex(1);
                            setModalClienteOpen(true);
                          } else if (e.target.value === '') {
                            handleClienteSelect(1, '');
                            const nuevosClientesNuevos = [...clientesNuevos];
                            nuevosClientesNuevos[1] = null;
                            setClientesNuevos(nuevosClientesNuevos);
                          } else {
                            handleClienteSelect(1, e.target.value);
                            const nuevosClientesNuevos = [...clientesNuevos];
                            nuevosClientesNuevos[1] = null;
                            setClientesNuevos(nuevosClientesNuevos);
                          }
                        }}
                        label="Cliente 2 (Opcional)"
                      >
                        <MenuItem value="">
                          <Typography variant="body2" color="textSecondary">
                            Seleccionar...
                          </Typography>
                        </MenuItem>
                        <MenuItem value="nuevo-1">
                          <Typography
                            variant="body1"
                            sx={{ fontStyle: 'italic' }}
                          >
                            + Crear Cliente Nuevo
                          </Typography>
                        </MenuItem>
                        {clientes.map(cliente => (
                          <MenuItem key={cliente._id} value={cliente._id}>
                            <Box>
                              <Typography variant="body1">
                                {cliente.NOMBRE}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {cliente.cedula}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.clientes[1] && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="body2">
                            Cliente 2:{' '}
                            <strong>
                              {typeof formData.clientes[1] === 'object'
                                ? formData.clientes[1].NOMBRE
                                : clientes.find(
                                    c => c._id === formData.clientes[1]
                                  )?.NOMBRE || 'N/A'}
                            </strong>
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={handleEliminarSegundoCliente}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Alert>
                    </Grid>
                  )}
                </>
              )}

              {/* Selección de Empresa */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', mt: 2 }}
                >
                  Empresa Financiadora
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Empresa</InputLabel>
                  <Select
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleSelectChange}
                    label="Empresa"
                  >
                    {empresas
                      .filter(empresa => empresa.estado === 'activa')
                      .map(empresa => (
                        <MenuItem key={empresa._id} value={empresa._id}>
                          <Typography variant="body1">
                            {empresa.nombre}
                          </Typography>
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Selección de Vehículo */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', mt: 2 }}
                >
                  Selección de Vehículo
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Vehículo (Opcional)</InputLabel>
                  <Select
                    name="vehiculo"
                    value={formData.vehiculo}
                    onChange={e => {
                      if (e.target.value === 'nuevo-vehiculo') {
                        setVehiculoModalOpen(true);
                        return;
                      }
                      handleSelectChange(e);
                    }}
                    label="Vehículo (Opcional)"
                  >
                    <MenuItem value="">
                      <Typography variant="body2" color="textSecondary">
                        Sin vehículo
                      </Typography>
                    </MenuItem>
                    <MenuItem value="nuevo-vehiculo">
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        + Crear Vehículo Nuevo
                      </Typography>
                    </MenuItem>
                    {vehiculos.map(vehiculo => (
                      <MenuItem key={vehiculo._id} value={vehiculo._id}>
                        <Box>
                          <Typography variant="body1">
                            {vehiculo.Marca} {vehiculo.Modelo}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {vehiculo.Matricula} - {vehiculo.Año}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Información Financiera */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', mt: 2 }}
                >
                  Información Financiera
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              {/* Valor Base */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Valor Base"
                  name="valorBase"
                  value={formData.valorBase}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el valor base"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Alert
                  severity="info"
                  sx={{ height: '100%', display: 'flex', alignItems: 'center' }}
                >
                  <Typography variant="body2">
                    Este será el valor por la financiación del vehículo
                  </Typography>
                </Alert>
              </Grid>

              {/* Checkbox y Costos de Documentación */}
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={incluirCostosDocumentacion}
                      onChange={e => {
                        setIncluirCostosDocumentacion(e.target.checked);
                        if (!e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            costosDocumentacion: 0,
                          }));
                        }
                      }}
                    />
                  }
                  label="Incluir Costos de Documentación"
                />
              </Grid>

              {incluirCostosDocumentacion && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Costos de Documentación"
                      name="costosDocumentacion"
                      value={formData.costosDocumentacion || 0}
                      onChange={handleChange}
                      placeholder="Costos de documentación"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Alert
                      severity="info"
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2">
                        Este es el costo por la tramitación o documentación del
                        vehículo
                      </Typography>
                    </Alert>
                  </Grid>
                </>
              )}

              {/* Checkbox y Gastos Extras */}
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={incluirGastosExtras}
                      onChange={e => {
                        setIncluirGastosExtras(e.target.checked);
                        if (!e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            gastosExtras: 0,
                          }));
                        }
                      }}
                    />
                  }
                  label="Incluir Gastos Extras"
                />
              </Grid>

              {incluirGastosExtras && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Gastos Extras"
                      name="gastosExtras"
                      value={formData.gastosExtras || 0}
                      onChange={handleChange}
                      placeholder="Gastos adicionales"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Alert
                      severity="info"
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2">
                        Gastos adicionales relacionados con el financiamiento
                      </Typography>
                    </Alert>
                  </Grid>
                </>
              )}

              {/* Cantidad de Cuotas, Valor de Cuota y Fecha Primera Cuota */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Número de Cuotas"
                  name="cuotas"
                  value={formData.cuotas}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Valor de Cuota"
                  name="valorCuota"
                  value={formData.valorCuota}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el valor de la cuota"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Fecha Primera Cuota"
                  name="fechaPrimeraCuota"
                  type="date"
                  value={formData.fechaPrimeraCuota}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Tabla de Cuotas Futuras */}
              {formData.cuotasFuturas && formData.cuotasFuturas.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Card sx={{ bgcolor: 'background.paper', mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Cuotas Futuras
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                      >
                        Puede editar las fechas de vencimiento de cada cuota
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Fecha de Vencimiento</TableCell>
                              <TableCell align="right">Valor Cuota</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {formData.cuotasFuturas.map((cuota, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Chip
                                    label={`Cuota ${cuota.numeroCuota}`}
                                    size="small"
                                    color="primary"
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    type="date"
                                    value={cuota.fechaVencimiento}
                                    onChange={e =>
                                      handleFechaCuotaChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ width: '100%', maxWidth: 200 }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={600}>
                                    {formatCurrency(cuota.valorCuota)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {/* Cuotas Extras */}
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={mostrarCuotasExtras}
                      onChange={e => {
                        setMostrarCuotasExtras(e.target.checked);
                        if (!e.target.checked) {
                          setCuotasExtras([]);
                        }
                      }}
                    />
                  }
                  label="Agregar Cuotas Extras"
                />
              </Grid>

              {mostrarCuotasExtras && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Card sx={{ bgcolor: 'background.paper', mt: 2, mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Nueva Cuota Extra
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              label="Valor Cuota"
                              value={nuevaCuotaExtra.valorCuota}
                              onChange={e =>
                                setNuevaCuotaExtra({
                                  ...nuevaCuotaExtra,
                                  valorCuota: Number(e.target.value),
                                })
                              }
                              placeholder="Ingrese el valor de la cuota"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              label="Fecha Cuota"
                              type="date"
                              value={nuevaCuotaExtra.fechaCuota}
                              onChange={e =>
                                setNuevaCuotaExtra({
                                  ...nuevaCuotaExtra,
                                  fechaCuota: e.target.value,
                                })
                              }
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={handleAgregarCuotaExtra}
                              fullWidth
                              sx={{ height: '100%' }}
                              disabled={
                                nuevaCuotaExtra.valorCuota <= 0 ||
                                !nuevaCuotaExtra.fechaCuota
                              }
                            >
                              Agregar
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Tabla de Cuotas Extras */}
                  {cuotasExtras.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Card sx={{ bgcolor: 'background.paper', mt: 2 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Cuotas Extras
                          </Typography>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>#</TableCell>
                                  <TableCell>Fecha de Vencimiento</TableCell>
                                  <TableCell align="right">
                                    Valor Cuota
                                  </TableCell>
                                  <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {cuotasExtras.map((cuota, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Chip
                                        label={`Cuota Extra ${cuota.numeroCuota}`}
                                        size="small"
                                        color="secondary"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        type="date"
                                        value={cuota.fechaVencimiento}
                                        onChange={e =>
                                          handleFechaCuotaExtraChange(
                                            index,
                                            e.target.value
                                          )
                                        }
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ width: '100%', maxWidth: 200 }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                      >
                                        {formatCurrency(cuota.valorCuota)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleEliminarCuotaExtra(index)
                                        }
                                        color="error"
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </>
              )}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  name="observaciones"
                  value={formData.observaciones || ''}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Observaciones adicionales sobre el financiamiento..."
                />
              </Grid>

              {/* Resumen de Cálculos */}
              {formData.montoTotal > 0 && (
                <Grid size={{ xs: 12 }}>
                  {formData.interesTotal < 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Advertencia:</strong> El interés total es
                        negativo ({formatCurrency(formData.interesTotal)}). Esto
                        puede indicar que el monto total a cobrar es menor que
                        los costos base. Puede continuar guardando el
                        financiamiento.
                      </Typography>
                    </Alert>
                  )}
                  <Card sx={{ bgcolor: 'background.paper', mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resumen del Financiamiento
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Valor Base
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {formatCurrency(formData.valorBase)}
                          </Typography>
                        </Grid>
                        {(formData.costosDocumentacion || 0) > 0 && (
                          <Grid size={{ xs: 12, md: 3 }}>
                            <Typography variant="body2" color="textSecondary">
                              Costos Documentación
                            </Typography>
                            <Typography variant="h6">
                              {formatCurrency(
                                formData.costosDocumentacion || 0
                              )}
                            </Typography>
                          </Grid>
                        )}
                        {(formData.gastosExtras || 0) > 0 && (
                          <Grid size={{ xs: 12, md: 3 }}>
                            <Typography variant="body2" color="textSecondary">
                              Gastos Extras
                            </Typography>
                            <Typography variant="h6">
                              {formatCurrency(formData.gastosExtras || 0)}
                            </Typography>
                          </Grid>
                        )}
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Interés Total
                          </Typography>
                          <Typography variant="h6" color="error">
                            {formatCurrency(formData.interesTotal)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Monto por Cobrar
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatCurrency(formData.montoTotal)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Cuotas
                          </Typography>
                          <Typography variant="h6">
                            {formData.cuotas} cuotas de{' '}
                            {formatCurrency(formData.valorCuota)}
                            {cuotasExtras.length > 0
                              ? ` + ${cuotasExtras.length} extras`
                              : ''}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Botones de acción */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    component={Link}
                    href="/ciompi/financiamiento"
                    variant="outlined"
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{ minWidth: 120 }}
                  >
                    {saving ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Registrar Financiamiento'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Mensajes de feedback */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          message="Financiamiento registrado correctamente"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />

        {/* Modal para crear cliente nuevo */}
        <ModalNuevoCliente
          open={modalClienteOpen}
          onClose={() => setModalClienteOpen(false)}
          onClienteCreado={handleClienteCreado}
        />
        <FormularioVehiculo
          open={vehiculoModalOpen}
          onClose={() => setVehiculoModalOpen(false)}
          onSave={handleGuardarVehiculo}
          title="Registrar Vehículo"
        />
      </Container>
    </AuthGuard>
  );
}
