'use client';
import { useState, useEffect, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { EmpresaType } from '@/lib/types';
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
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {
  azulBase,
  azulClaro,
  naranja,
  turquesa,
  grisMedio,
  verde,
  rojo,
} from '@/lib/color';
import CardDG from './CardDG';
import { formatMoney, type MonedaFinanciamiento } from '@/lib/moneda';

interface MontoPorMoneda {
  montoTotal: number;
  saldoPendiente: number;
  montoRecaudado: number;
  cantidad: number;
}

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
    montosPorMoneda: Record<MonedaFinanciamiento, MontoPorMoneda>;
    montosVigentesPorMoneda: Record<MonedaFinanciamiento, MontoPorMoneda>;
    montosActivosPorMoneda: Record<MonedaFinanciamiento, MontoPorMoneda>;
    montosEnMoraPorMoneda: Record<MonedaFinanciamiento, MontoPorMoneda>;
  };
  empresas: {
    total: number;
  };
  usuarios: {
    total: number;
  };
}

const MONTO_VACIO = {
  montoTotal: 0,
  saldoPendiente: 0,
  montoRecaudado: 0,
  cantidad: 0,
};

const pctCobrado = (pagado: number, total: number) =>
  total > 0 ? Math.round((pagado / total) * 100) : 0;

interface TarjetaMonedaProps {
  titulo: string;
  icon: React.ReactNode;
  color: string;
  usd: number;
  uyu: number;
  subtitulo?: string;
}

const TarjetaMoneda = ({
  titulo,
  icon,
  color,
  usd,
  uyu,
  subtitulo,
}: TarjetaMonedaProps) => (
  <Card
    sx={{
      background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
      color: 'white',
      height: '100%',
      boxShadow: 3,
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.2)',
            mr: 2,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {titulo}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
        {formatMoney(usd, 'USD')}
      </Typography>
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, opacity: 0.9, lineHeight: 1.15 }}
      >
        {formatMoney(uyu, 'UYU')}
      </Typography>
      {subtitulo && (
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          {subtitulo}
        </Typography>
      )}
    </CardContent>
  </Card>
);

interface BannerMontoProps {
  titulo: string;
  icon: React.ReactNode;
  usd: number;
  uyu: number;
  subtitulo?: React.ReactNode;
}

const BannerMonto = ({
  titulo,
  icon,
  usd,
  uyu,
  subtitulo,
}: BannerMontoProps) => (
  <Card
    sx={{
      background: `linear-gradient(135deg, ${azulBase} 0%, ${azulClaro} 100%)`,
      color: 'white',
      mb: 3,
      boxShadow: 4,
    }}
  >
    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.2)',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {titulo}
        </Typography>
      </Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Box>
          <Typography variant="overline" sx={{ opacity: 0.85 }}>
            Dólares (USD)
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, lineHeight: 1.1, wordBreak: 'break-word' }}
          >
            {formatMoney(usd, 'USD')}
          </Typography>
        </Box>
        <Box>
          <Typography variant="overline" sx={{ opacity: 0.85 }}>
            Pesos (UYU)
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, opacity: 0.95, lineHeight: 1.1 }}
          >
            {formatMoney(uyu, 'UYU')}
          </Typography>
        </Box>
      </Stack>
      {subtitulo && (
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 2 }}>
          {subtitulo}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function DatosGeneralesPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [empresas, setEmpresas] = useState<EmpresaType[]>([]);
  const [empresaId, setEmpresaId] = useState<string>('');

  const loadEmpresas = useCallback(async () => {
    try {
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const result = await response.json();
        setEmpresas(result.success ? result.data : []);
      }
    } catch (error) {
      console.error('Error cargando empresas:', error);
    }
  }, []);

  const loadStats = useCallback(async (empresa: string) => {
    try {
      setLoading(true);
      const query = empresa ? `?empresa=${encodeURIComponent(empresa)}` : '';
      const response = await fetch(`/api/stats${query}`);
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
  }, []);

  useEffect(() => {
    loadEmpresas();
  }, [loadEmpresas]);

  useEffect(() => {
    loadStats(empresaId);
  }, [empresaId, loadStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats(empresaId);
  };

  const handleEmpresaChange = (event: SelectChangeEvent) => {
    setEmpresaId(event.target.value);
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

  const fin = stats?.financiamientos;

  // Vigentes: activos + en mora
  const vig = fin?.montosVigentesPorMoneda ?? {
    USD: { ...MONTO_VACIO },
    UYU: { ...MONTO_VACIO },
  };
  // En mora
  const enMora = fin?.montosEnMoraPorMoneda ?? {
    USD: { ...MONTO_VACIO },
    UYU: { ...MONTO_VACIO },
  };
  // Históricos: todos los financiamientos
  const hist = fin?.montosPorMoneda ?? {
    USD: { ...MONTO_VACIO },
    UYU: { ...MONTO_VACIO },
  };

  const vigCantidad = (vig.USD.cantidad || 0) + (vig.UYU.cantidad || 0);
  const enMoraCantidad = (enMora.USD.cantidad || 0) + (enMora.UYU.cantidad || 0);

  const vigPctUsd = pctCobrado(vig.USD.montoRecaudado, vig.USD.montoTotal);
  const vigPctUyu = pctCobrado(vig.UYU.montoRecaudado, vig.UYU.montoTotal);
  const histPctUsd = pctCobrado(hist.USD.montoRecaudado, hist.USD.montoTotal);
  const histPctUyu = pctCobrado(hist.UYU.montoRecaudado, hist.UYU.montoTotal);

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
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel id="empresa-select-label" sx={{ color: 'white' }}>
                  Empresa
                </InputLabel>
                <Select
                  labelId="empresa-select-label"
                  label="Empresa"
                  value={empresaId}
                  onChange={handleEmpresaChange}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '& .MuiSvgIcon-root': { color: 'white' },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white',
                    },
                  }}
                >
                  <MenuItem value="">Todas las empresas</MenuItem>
                  {empresas.map(empresa => (
                    <MenuItem key={empresa._id} value={empresa._id}>
                      {empresa.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* 1. Resumen de Financiamientos Vigentes */}
            <CardDG titulo="Resumen de Financiamientos Vigentes">
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Financiamientos en curso (activos + en mora). Montos por moneda
                (USD y UYU).
              </Typography>

              <BannerMonto
                titulo="Monto actual financiado"
                icon={<AccountBalanceIcon sx={{ fontSize: 28 }} />}
                usd={vig.USD.montoTotal}
                uyu={vig.UYU.montoTotal}
                subtitulo={`${vigCantidad} financiamientos vigentes (${fin?.activos ?? 0} activos + ${
                  fin?.enMora ?? 0
                } en mora)`}
              />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TarjetaMoneda
                    titulo="Recaudado de los vigentes"
                    icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
                    color={verde}
                    usd={vig.USD.montoRecaudado}
                    uyu={vig.UYU.montoRecaudado}
                    subtitulo={`Progreso de cobro: ${vigPctUsd}% (U$S) · ${vigPctUyu}% ($U)`}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TarjetaMoneda
                    titulo="Saldo por cobrar pendiente"
                    icon={<ScheduleIcon sx={{ fontSize: 24 }} />}
                    color={naranja}
                    usd={vig.USD.saldoPendiente}
                    uyu={vig.UYU.saldoPendiente}
                    subtitulo="Lo que resta cobrar de los financiamientos vigentes"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TarjetaMoneda
                    titulo="Saldo en mora"
                    icon={<WarningIcon sx={{ fontSize: 24 }} />}
                    color={rojo}
                    usd={enMora.USD.saldoPendiente}
                    uyu={enMora.UYU.saldoPendiente}
                    subtitulo={`${enMoraCantidad} financiamientos en mora`}
                  />
                </Grid>
              </Grid>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 2 }}
              >
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${fin?.activos ?? 0} activos`}
                  size="small"
                  color="success"
                />
                <Chip
                  icon={<WarningIcon />}
                  label={`${fin?.enMora ?? 0} en mora`}
                  size="small"
                  color="error"
                />
                <Chip
                  label={`${fin?.total ?? 0} financiamientos en total`}
                  size="small"
                  color="default"
                />
              </Stack>
            </CardDG>

            {/* 2. Datos Históricos */}
            <CardDG titulo="Datos Históricos">
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Totales de todos los financiamientos registrados (incluye
                activos, finalizados y cancelados).
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TarjetaMoneda
                    titulo="Total financiado histórico"
                    icon={<AttachMoneyIcon sx={{ fontSize: 24 }} />}
                    color={azulBase}
                    usd={hist.USD.montoTotal}
                    uyu={hist.UYU.montoTotal}
                    subtitulo="Monto total financiado de todos los tiempos"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TarjetaMoneda
                    titulo="Total recaudado histórico"
                    icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
                    color={verde}
                    usd={hist.USD.montoRecaudado}
                    uyu={hist.UYU.montoRecaudado}
                    subtitulo={`Progreso de cobro: ${histPctUsd}% (U$S) · ${histPctUyu}% ($U)`}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TarjetaMoneda
                    titulo="Saldo global pendiente"
                    icon={<ScheduleIcon sx={{ fontSize: 24 }} />}
                    color={naranja}
                    usd={hist.USD.saldoPendiente}
                    uyu={hist.UYU.saldoPendiente}
                    subtitulo="Saldo por cobrar de todos los financiamientos"
                  />
                </Grid>
              </Grid>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 2 }}
              >
                <Chip
                  icon={<AccountBalanceIcon />}
                  label={`${fin?.total ?? 0} total`}
                  size="small"
                  color="primary"
                />
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${fin?.finalizados ?? 0} finalizados`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`${fin?.cancelados ?? 0} cancelados`}
                  size="small"
                  color="default"
                />
                <Chip
                  label={`${fin?.enMora ?? 0} en mora`}
                  size="small"
                  color="error"
                />
              </Stack>
            </CardDG>

            {/* 3. Otras Estadísticas */}
            <CardDG titulo="Otras Estadísticas">
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
                            Financiamientos Hoy
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{ fontWeight: 600, mt: 1 }}
                          >
                            {stats?.financiamientos.hoy || 0}
                          </Typography>
                          <Chip
                            label={`${fin?.total ?? 0} en total`}
                            size="small"
                            sx={{
                              mt: 1,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                            }}
                          />
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

            {/* 4. Información Adicional */}
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
                              {fin?.activos || 0}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={
                              fin && fin.total > 0
                                ? (fin.activos / fin.total) * 100
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
                              {fin?.finalizados || 0}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={
                              fin && fin.total > 0
                                ? (fin.finalizados / fin.total) * 100
                                : 0
                            }
                            sx={{ height: 8, borderRadius: 1 }}
                            color="success"
                          />
                        </Box>
                        {fin && (fin.enMora || 0) > 0 && (
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
                                {fin.enMora}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={
                                fin.total > 0
                                  ? (fin.enMora / fin.total) * 100
                                  : 0
                              }
                              sx={{ height: 8, borderRadius: 1 }}
                              color="error"
                            />
                          </Box>
                        )}
                        {fin && (fin.cancelados || 0) > 0 && (
                          <Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="body2">Cancelados</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {fin.cancelados}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={
                                fin.total > 0
                                  ? (fin.cancelados / fin.total) * 100
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

              {/* Acciones de Impresión */}
              <Card sx={{ boxShadow: 2, mt: 3 }}>
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
