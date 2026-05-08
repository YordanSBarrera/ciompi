'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  IconButton,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  DirectionsCar as CarIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import {
  azulBase,
  azulClaro,
  naranja,
  turquesa,
  grisMedio,
  verde,
} from '@/lib/color';
import CardDG from './CardDG';
import { formatMoney, type MonedaFinanciamiento } from '@/lib/moneda';

interface StatsData {
  clientes: {
    total: number;
    hoy: number;
  };
  vehiculos: {
    total: number;
    hoy: number;
  };
  financiamientos: {
    total: number;
    activos: number;
    finalizados: number;
    cancelados: number;
    enMora: number;
    hoy: number;
    montosPorMoneda: Record<
      MonedaFinanciamiento,
      {
        montoTotal: number;
        saldoPendiente: number;
        montoRecaudado: number;
      }
    >;
  };
  empresas: {
    total: number;
  };
  usuarios: {
    total: number;
  };
}

export default function DatosGeneralesPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleImprimirClientes = () => {
    window.open('/api/reports/clientes?format=pdf', '_blank');
  };

  const handleImprimirFinanciaciones = () => {
    window.open('/api/reports/financiaciones?format=pdf', '_blank');
  };

  const handleImprimirFinanciacionesActivas = () => {
    window.open(
      '/api/reports/financiaciones?estado=activo&format=pdf',
      '_blank'
    );
  };

  return (
    <AuthGuard>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            background: `linear-gradient(135deg, ${azulBase} 0%, ${azulClaro} 100%)`,
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Datos Generales del Sistema
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Estadísticas e información general de CIOMPI
              </Typography>
            </Box>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ color: 'white' }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <CardDG titulo="Estadísticas Financieras">
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Totales por moneda de cada financiamiento.
              </Typography>
              {(['USD', 'UYU'] as const).map(moneda => {
                const datos = stats?.financiamientos.montosPorMoneda?.[
                  moneda
                ] ?? {
                  montoTotal: 0,
                  saldoPendiente: 0,
                  montoRecaudado: 0,
                };
                const pctProg =
                  datos.montoTotal > 0
                    ? Math.min(
                        100,
                        (datos.montoRecaudado / datos.montoTotal) * 100
                      )
                    : 0;
                return (
                  <Box key={moneda} sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ mb: 2 }}
                    >
                      {moneda === 'USD'
                        ? 'Dólares (USD)'
                        : 'Pesos uruguayos (UYU)'}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', boxShadow: 3 }}>
                          <CardContent>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2,
                              }}
                            >
                              <AttachMoneyIcon
                                sx={{ fontSize: 32, color: verde, mr: 2 }}
                              />
                              <Typography variant="h6">
                                Monto total financiado
                              </Typography>
                            </Box>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 600, color: verde }}
                            >
                              {formatMoney(datos.montoTotal, moneda)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', boxShadow: 3 }}>
                          <CardContent>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2,
                              }}
                            >
                              <TrendingUpIcon
                                sx={{ fontSize: 32, color: azulBase, mr: 2 }}
                              />
                              <Typography variant="h6">
                                Monto recaudado
                              </Typography>
                            </Box>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 600, color: azulBase }}
                            >
                              {formatMoney(datos.montoRecaudado, moneda)}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={pctProg}
                              sx={{ mt: 2, height: 8, borderRadius: 1 }}
                            />
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ mt: 1 }}
                            >
                              {datos.montoTotal > 0
                                ? `${pctProg.toFixed(1)}% del total en esta moneda`
                                : 'Sin datos en esta moneda'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', boxShadow: 3 }}>
                          <CardContent>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2,
                              }}
                            >
                              <ScheduleIcon
                                sx={{ fontSize: 32, color: naranja, mr: 2 }}
                              />
                              <Typography variant="h6">
                                Saldo pendiente
                              </Typography>
                            </Box>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 600, color: naranja }}
                            >
                              {formatMoney(datos.saldoPendiente, moneda)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  mt: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${stats?.financiamientos.finalizados || 0} finalizados`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`${stats?.financiamientos.activos || 0} activos`}
                  size="small"
                  color="warning"
                />
                {stats && (stats.financiamientos.enMora || 0) > 0 && (
                  <Chip
                    label={`${stats.financiamientos.enMora} en mora`}
                    size="small"
                    color="error"
                  />
                )}
                {stats && (stats.financiamientos.cancelados || 0) > 0 && (
                  <Chip
                    label={`${stats.financiamientos.cancelados} cancelados`}
                    size="small"
                    color="default"
                  />
                )}
              </Box>
            </CardDG>

            <CardDG titulo="Estadísticas de Clientes y Vehículos">
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${azulBase} 0%, ${azulClaro} 100%)`,
                      color: 'white',
                      height: '100%',
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Total Clientes
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{ fontWeight: 600, mt: 1 }}
                          >
                            {stats?.clientes.total || 0}
                          </Typography>
                          {stats && stats.clientes.hoy > 0 && (
                            <Chip
                              label={`+${stats.clientes.hoy} hoy`}
                              size="small"
                              sx={{
                                mt: 1,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                              }}
                            />
                          )}
                        </Box>
                        <PeopleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${naranja} 0%, #ff7043 100%)`,
                      color: 'white',
                      height: '100%',
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Total Vehículos
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{ fontWeight: 600, mt: 1 }}
                          >
                            {stats?.vehiculos.total || 0}
                          </Typography>
                          {stats && stats.vehiculos.hoy > 0 && (
                            <Chip
                              label={`+${stats.vehiculos.hoy} hoy`}
                              size="small"
                              sx={{
                                mt: 1,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                              }}
                            />
                          )}
                        </Box>
                        <CarIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${verde} 0%, #66bb6a 100%)`,
                      color: 'white',
                      height: '100%',
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Financiamientos
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{ fontWeight: 600, mt: 1 }}
                          >
                            {stats?.financiamientos.total || 0}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip
                              label={`${stats?.financiamientos.activos || 0} activos`}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                              }}
                            />
                            {stats && stats.financiamientos.hoy > 0 && (
                              <Chip
                                label={`+${stats.financiamientos.hoy} hoy`}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(255,255,255,0.2)',
                                  color: 'white',
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                        <AccountBalanceIcon
                          sx={{ fontSize: 48, opacity: 0.3 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${turquesa} 0%, #26a69a 100%)`,
                      color: 'white',
                      height: '100%',
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Empresas Activas
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{ fontWeight: 600, mt: 1 }}
                          >
                            {stats?.empresas.total || 0}
                          </Typography>
                        </Box>
                        <BusinessIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardDG>

            {/* Información Adicional */}
            <CardDG titulo="Información Adicional">
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                      >
                        <PersonIcon
                          sx={{ fontSize: 32, color: azulBase, mr: 2 }}
                        />
                        <Typography variant="h6">
                          Usuarios del Sistema
                        </Typography>
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 600, color: azulBase }}
                      >
                        {stats?.usuarios.total || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 1 }}
                      >
                        Total de usuarios registrados en el sistema
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                      >
                        <AssessmentIcon
                          sx={{ fontSize: 32, color: naranja, mr: 2 }}
                        />
                        <Typography variant="h6">
                          Estado de Financiamientos
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2">Activos</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {stats?.financiamientos.activos || 0}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={
                              stats && stats.financiamientos.total > 0
                                ? (stats.financiamientos.activos /
                                    stats.financiamientos.total) *
                                  100
                                : 0
                            }
                            sx={{ height: 8, borderRadius: 1 }}
                            color="warning"
                          />
                        </Box>
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2">Finalizados</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {stats?.financiamientos.finalizados || 0}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={
                              stats && stats.financiamientos.total > 0
                                ? (stats.financiamientos.finalizados /
                                    stats.financiamientos.total) *
                                  100
                                : 0
                            }
                            sx={{ height: 8, borderRadius: 1 }}
                            color="success"
                          />
                        </Box>
                        {stats && (stats.financiamientos.enMora || 0) > 0 && (
                          <Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="body2">En Mora</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {stats.financiamientos.enMora}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={
                                stats.financiamientos.total > 0
                                  ? (stats.financiamientos.enMora /
                                      stats.financiamientos.total) *
                                    100
                                  : 0
                              }
                              sx={{ height: 8, borderRadius: 1 }}
                              color="error"
                            />
                          </Box>
                        )}
                        {stats &&
                          (stats.financiamientos.cancelados || 0) > 0 && (
                            <Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  mb: 0.5,
                                }}
                              >
                                <Typography variant="body2">
                                  Cancelados
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {stats.financiamientos.cancelados}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={
                                  stats.financiamientos.total > 0
                                    ? (stats.financiamientos.cancelados /
                                        stats.financiamientos.total) *
                                      100
                                    : 0
                                }
                                sx={{
                                  height: 8,
                                  borderRadius: 1,
                                  bgcolor: grisMedio,
                                }}
                              />
                            </Box>
                          )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardDG>

            {/* Acciones de Impresión */}
            <CardDG titulo="Acciones de Impresión">
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PrintIcon sx={{ fontSize: 32, color: azulBase, mr: 2 }} />
                    <Typography variant="h6">Imprimir Listados</Typography>
                  </Box>
                  <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
                    <Button
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={handleImprimirClientes}
                      sx={{
                        flex: 1,
                        backgroundColor: azulBase,
                        background: `linear-gradient(135deg, ${azulBase} 0%, ${azulClaro} 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${azulClaro} 0%, ${azulBase} 100%)`,
                        },
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Imprimir Listado de Clientes
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={handleImprimirFinanciaciones}
                      sx={{
                        flex: 1,
                        backgroundColor: verde,
                        background: `linear-gradient(135deg, ${verde} 0%, #66bb6a 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, #66bb6a 0%, ${verde} 100%)`,
                        },
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Imprimir Listado de Financiaciones
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={handleImprimirFinanciacionesActivas}
                      sx={{
                        flex: 1,
                        backgroundColor: naranja,
                        background: `linear-gradient(135deg, ${naranja} 0%, #ff7043 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, #ff7043 0%, ${naranja} 100%)`,
                        },
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Imprimir Financiaciones Activas
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </CardDG>
          </>
        )}
      </Container>
    </AuthGuard>
  );
}
