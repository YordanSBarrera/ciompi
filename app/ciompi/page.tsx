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
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { appModules } from '@/lib/modules';
import {
  azulBase,
  azulClaro,
  azulOscuro,
  grisMedio,
  grisTexto,
  naranja,
  turquesa,
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

interface SecondaryModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  delay?: number;
}

const SecondaryModuleCard = ({
  title,
  description,
  icon,
  href,
  color,
  delay = 0,
}: SecondaryModuleCardProps) => {
  const theme = useTheme();

  return (
    <Grow in={true} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        component={Link}
        href={href}
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          background: alpha(azulBase, 0.03),
          border: `1px solid ${grisMedio}`,
          borderRadius: 2,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            background: alpha(color, 0.08),
            borderColor: alpha(color, 0.5),
            boxShadow: `0 6px 16px ${alpha(color, 0.2)}`,
            transform: 'translateY(-2px)',
            '& .arrow-icon': {
              transform: 'translateX(4px)',
              color: color,
            },
          },
        }}
      >
        <CardContent sx={{ p: 2, width: '100%' }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ width: '100%' }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                minWidth: 44,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(color, 0.1),
                color: color,
              }}
            >
              {icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: azulOscuro,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: grisTexto,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {description}
              </Typography>
            </Box>
            <ArrowForwardIcon
              className="arrow-icon"
              sx={{
                fontSize: 20,
                color: grisMedio,
                transition: 'all 0.3s ease',
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
};

const FinanciamientoHero = () => {
  const theme = useTheme();
  const fin = appModules.find((m) => m.id === 'financiamientos')!;

  return (
    <Grow in={true} timeout={800}>
      <Card
        component={Link}
        href={fin.href}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: 3, md: 0 },
          textDecoration: 'none',
          background: `linear-gradient(135deg, ${naranja} 0%, #ff9d6f 100%)`,
          borderRadius: 3,
          color: 'white',
          boxShadow: 4,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -90,
            right: -90,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: -120,
            right: 140,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 18px 36px ${alpha(naranja, 0.45)}`,
          },
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            p: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 3,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: 76,
              height: 76,
              minWidth: 76,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
            }}
          >
            <fin.icon sx={{ fontSize: 42 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="overline"
              sx={{ opacity: 0.85, fontWeight: 600, letterSpacing: 1.5 }}
            >
              Módulo principal
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 700, lineHeight: 1.2, mb: 1 }}
            >
              {fin.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.95,
                lineHeight: 1.6,
                maxWidth: 620,
              }}
            >
              {fin.description}
            </Typography>
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              alignSelf: { xs: 'flex-start', sm: 'center' },
              bgcolor: 'rgba(255,255,255,0.18)',
              borderRadius: 2,
              px: 2,
              py: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>Ir al módulo</Typography>
            <ArrowForwardIcon />
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
};

export default function CiompiHomePage() {
  const principales = appModules.filter((m) =>
    ['clientes', 'vehiculos', 'empresas'].includes(m.id)
  );
  const secundarios = appModules.filter((m) =>
    ['operaciones', 'datosGenerales', 'usuarios'].includes(m.id)
  );

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

          {/* Módulo principal: Financiamientos */}
          <FinanciamientoHero />

          {/* Módulos principales */}
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: grisTexto,
                fontWeight: 600,
                letterSpacing: 1.5,
                mb: 1.5,
                display: 'block',
              }}
            >
              Módulos principales
            </Typography>
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
              {principales.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  title={module.title}
                  description={module.description}
                  icon={<module.icon sx={{ fontSize: 32 }} />}
                  href={module.href}
                  color={module.color}
                  delay={index * 100}
                />
              ))}
            </Box>
          </Box>

          {/* Otros módulos */}
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: grisTexto,
                fontWeight: 600,
                letterSpacing: 1.5,
                mb: 1.5,
                display: 'block',
              }}
            >
              Otros módulos
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
              }}
            >
              {secundarios.map((module, index) => (
                <SecondaryModuleCard
                  key={module.id}
                  title={module.title}
                  description={module.description}
                  icon={<module.icon sx={{ fontSize: 22 }} />}
                  href={module.href}
                  color={module.color}
                  delay={index * 100}
                />
              ))}
            </Box>
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
