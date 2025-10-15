'use client';
import { useAuth } from '@/app/hook/useAuth';
import AuthGuard from '@/app/components/AuthGuard';
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
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { azulBase, azulClaro, naranja, turquesa } from '@/lib/color';
import Link from 'next/link';

export default function CiompiHomePage() {
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'Clientes',
      description: 'Gestionar información de clientes',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      href: '/ciompi/clientes',
      color: azulBase,
    },
    {
      title: 'Empresas',
      description: 'Administrar empresas',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      href: '/ciompi/empresas',
      color: azulClaro,
    },
    {
      title: 'Operaciones',
      description: 'Gestionar operaciones',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      href: '/ciompi/operaciones',
      color: naranja,
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      href: '/ciompi/datosGenerales',
      color: turquesa,
    },
  ];

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <h3>CIOMPI Home Page</h3>
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h3" component="h1" gutterBottom>
                Bienvenido, {user?.nombre}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Panel de Control - Ciompi
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={user?.avatar}
                sx={{ width: 56, height: 56, bgcolor: azulBase }}
              >
                {user?.nombre?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {user?.usuario}
                </Typography>
                <Chip
                  label={user?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                  color={user?.rol === 'admin' ? 'primary' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Menu Cards */}
        <Grid container spacing={3}>
          {menuItems.map((item, index) => (
            <Grid key={index} size={{ xs: 12, md: 6 }}>
              <Card
                component={Link}
                href={item.href}
                sx={{
                  height: '100%',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    '&:last-child': { pb: 4 },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Resumen Rápido
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  --
                </Typography>
                <Typography variant="body1">Total Clientes</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="secondary" gutterBottom>
                  --
                </Typography>
                <Typography variant="body1">Total Empresas</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" gutterBottom>
                  --
                </Typography>
                <Typography variant="body1">Operaciones Hoy</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </AuthGuard>
  );
}
