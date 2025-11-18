'use client';
import { useAuth } from '@/app/hook/useAuth';
import AuthGuard from '@/app/components/AuthGuard';
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  DirectionsCar as CarIcon,
  AccountBalance as AccountBalanceIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  azulBase,
  azulClaro,
  naranja,
  turquesa,
  grisClaro,
  verde,
} from '@/lib/color';
import { routes } from '@/lib/rutas';

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
    completados: number;
    hoy: number;
    montoTotal: number;
    saldoPendiente: number;
    montoRecaudado: number;
  };
  empresas: {
    total: number;
  };
  usuarios: {
    total: number;
  };
}

export default function CiompiHomePage() {
  const { user } = useAuth();
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

  const menuItems = [
    {
      title: 'Clientes',
      description: 'Gestionar información de clientes',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      href: `/${routes.clientes}`,
      color: azulBase,
      count: stats?.clientes.total || 0,
      newToday: stats?.clientes.hoy || 0,
    },
    {
      title: 'Vehículos',
      description: 'Administrar vehículos',
      icon: <CarIcon sx={{ fontSize: 40 }} />,
      href: `/${routes.vehiculos}`,
      color: naranja,
      count: stats?.vehiculos.total || 0,
      newToday: stats?.vehiculos.hoy || 0,
    },
    {
      title: 'Financiamiento',
      description: 'Gestionar ventas financiadas',
      icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
      href: `/${routes.financiamiento}`,
      color: verde,
      count: stats?.financiamientos.total || 0,
      newToday: stats?.financiamientos.hoy || 0,
    },
    {
      title: 'Empresas',
      description: 'Administrar empresas',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      href: `/${routes.empresas}`,
      color: azulClaro,
      count: stats?.empresas.total || 0,
    },
    {
      title: 'Operaciones',
      description: 'Gestionar operaciones',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      href: `/${routes.operaciones}`,
      color: turquesa,
    },
    {
      title: 'Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      href: `/${routes.usuarios}`,
      color: '#666666',
      count: stats?.usuarios.total || 0,
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      href: `/${routes.datosGenerales}`,
      color: '#999999',
    },
  ];

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
                Bienvenido, {user?.nombre || 'Usuario'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Panel de Control - CIOMPI
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
              <Avatar
                src={user?.avatar}
                sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}
              >
                {user?.nombre?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ color: 'white' }}
                >
                  {user?.usuario || 'Usuario'}
                </Typography>
                <Chip
                  label={user?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Estadísticas Principales */}
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
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
                      <Typography variant="h3" sx={{ fontWeight: 600, mt: 1 }}>
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
                      <Typography variant="h3" sx={{ fontWeight: 600, mt: 1 }}>
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
                      <Typography variant="h3" sx={{ fontWeight: 600, mt: 1 }}>
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
                    <AccountBalanceIcon sx={{ fontSize: 48, opacity: 0.3 }} />
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
                      <Typography variant="h3" sx={{ fontWeight: 600, mt: 1 }}>
                        {stats?.empresas.total || 0}
                      </Typography>
                    </Box>
                    <BusinessIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </AuthGuard>
  );
}
