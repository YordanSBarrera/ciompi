'use client';
import AuthGuard from '@/app/components/AuthGuard';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  AccountBalance as AccountBalanceIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BuscarClientes from '@/app/components/operaciones/BuscarClientes';
import FinanciamientosAtrasados from '@/app/components/operaciones/FinanciamientosAtrasados';
import PagosAtrasados from '@/app/components/operaciones/PagosAtrasados';
import EstadoDeCuentaPage from '@/app/components/EstadoDeCuentaPage';
import Vencimientos from '@/app/components/operaciones/Vencimientos';
import {
  azulBase,
  azulOscuro,
  blanco,
  grisClaro,
} from '@/lib/color';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactElement;
}

function TabPanel(props: {
  children?: React.ReactNode;
  index: string;
  value: string;
}) {
  const { children, value, index } = props;
  return <>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</>;
}

function OperacionesContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('buscar');

  const tabs: TabConfig[] = [
    { id: 'buscar', label: 'Buscar Clientes', icon: <SearchIcon /> },
    {
      id: 'financiamientos-atrasados',
      label: 'Financiamientos Atrasados',
      icon: <WarningIcon />,
    },
    {
      id: 'pagos-atrasados',
      label: 'Pagos Atrasados',
      icon: <WarningIcon />,
    },
    {
      id: 'estado-cuenta',
      label: 'Estado de Cuenta',
      icon: <AccountBalanceIcon />,
    },
    { id: 'vencimientos', label: 'Vencimientos', icon: <EventIcon /> },
  ];

  // Sincronizar tab con query param ?tab=
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header de Operaciones */}
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          p: 3,
          background: `linear-gradient(135deg, ${azulBase} 0%, ${azulOscuro} 100%)`,
          color: blanco,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Operaciones
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Búsquedas y operaciones de seguimiento
        </Typography>
      </Paper>

      {/* Tabs de operaciones */}
      <Paper elevation={1} sx={{ bgcolor: grisClaro, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: azulBase,
            },
          }}
        >
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Contenido según tab seleccionado */}
      <TabPanel value={activeTab} index="buscar">
        <BuscarClientes />
      </TabPanel>
      <TabPanel value={activeTab} index="financiamientos-atrasados">
        <FinanciamientosAtrasados />
      </TabPanel>
      <TabPanel value={activeTab} index="pagos-atrasados">
        <PagosAtrasados />
      </TabPanel>
      <TabPanel value={activeTab} index="estado-cuenta">
        <EstadoDeCuentaPage />
      </TabPanel>
      <TabPanel value={activeTab} index="vencimientos">
        <Vencimientos />
      </TabPanel>
    </Container>
  );
}

export default function OperacionesPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh"
          >
            <CircularProgress />
          </Box>
        }
      >
        <OperacionesContent />
      </Suspense>
    </AuthGuard>
  );
}