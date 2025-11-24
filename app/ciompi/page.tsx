'use client';

import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  useTheme,
  alpha,
  Fade,
  Grow,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  DirectionsCar as CarIcon,
  AccountBalance as FinanceIcon,
  Person as PersonIcon,
  Assignment as OperationsIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { routes } from '@/lib/rutas';
import {
  azulBase,
  azulClaro,
  azulOscuro,
  blanco,
  grisClaro,
  naranja,
  turquesa,
  grisTexto,
} from '@/lib/color';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  delay?: number;
}

const ModuleCard = ({
  title,
  description,
  icon,
  href,
  color,
  delay = 0,
}: ModuleCardProps) => {
  const theme = useTheme();

  return (
    <Grow in={true} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        component={Link}
        href={href}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textDecoration: 'none',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`,
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 24px ${alpha(color, 0.3)}`,
            borderColor: color,
            '&::before': {
              transform: 'scaleX(1)',
            },
            '& .icon-container': {
              transform: 'scale(1.1) rotate(5deg)',
              backgroundColor: alpha(color, 0.15),
            },
          },
        }}
      >
        <CardContent sx={{ flex: 1, p: 3 }}>
          <Stack spacing={2}>
            <Box
              className="icon-container"
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(color, 0.1),
                color: color,
                transition: 'all 0.3s ease',
                mb: 1,
              }}
            >
              {icon}
            </Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                color: azulOscuro,
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: grisTexto,
                lineHeight: 1.6,
              }}
            >
              {description}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
};

export default function CiompiHomePage() {
  const theme = useTheme();

  const modules = [
    {
      title: 'Clientes',
      description:
        'Gestiona la información de tus clientes, consulta historiales y administra sus datos de contacto.',
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      href: `/${routes.clientes}`,
      color: azulBase,
      delay: 0,
    },
    {
      title: 'Empresas',
      description:
        'Administra las empresas asociadas y su información corporativa de manera centralizada.',
      icon: <BusinessIcon sx={{ fontSize: 32 }} />,
      href: `/${routes.empresas}`,
      color: azulClaro,
      delay: 100,
    },
    {
      title: 'Vehículos',
      description:
        'Consulta y gestiona el inventario de vehículos, sus características y estado actual.',
      icon: <CarIcon sx={{ fontSize: 32 }} />,
      href: `/${routes.vehiculos}`,
      color: turquesa,
      delay: 200,
    },
    {
      title: 'Financiamientos',
      description:
        'Controla los financiamientos activos, pagos, cuotas y estados de cuenta de tus clientes.',
      icon: <FinanceIcon sx={{ fontSize: 32 }} />,
      href: `/${routes.financiamiento}`,
      color: naranja,
      delay: 300,
    },
    {
      title: 'Usuarios',
      description:
        'Administra los usuarios del sistema, sus permisos y configuraciones de acceso.',
      icon: <PersonIcon sx={{ fontSize: 32 }} />,
      href: `/${routes.usuarios}`,
      color: azulOscuro,
      delay: 400,
    },
    {
      title: 'Operaciones',
      description:
        'Accede a las operaciones del sistema, reportes y herramientas de gestión avanzada.',
      icon: <OperationsIcon sx={{ fontSize: 32 }} />,
      href: `/${routes.operaciones}`,
      color: azulClaro,
      delay: 500,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Fade in={true} timeout={600}>
        <Stack spacing={6}>
          {/* Hero Section */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <DashboardIcon
                sx={{
                  fontSize: 48,
                  color: azulBase,
                }}
              />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${azulBase} 0%, ${azulClaro} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Panel de Control
              </Typography>
            </Stack>
            <Typography
              variant="h6"
              sx={{
                color: grisTexto,
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Bienvenido al sistema de gestión de cobranza. Accede rápidamente a
              los módulos principales.
            </Typography>
          </Box>

          {/* Modules Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {modules.map(module => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </Box>

          {/* Quick Stats Section (Optional - can be expanded later) */}
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(azulBase, 0.05)} 0%, ${alpha(azulClaro, 0.05)} 100%)`,
              border: `1px solid ${alpha(azulBase, 0.1)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: grisTexto,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              Selecciona un módulo para comenzar a trabajar
            </Typography>
          </Box>
        </Stack>
      </Fade>
    </Container>
  );
}
