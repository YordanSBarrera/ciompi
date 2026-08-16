'use client';
import AuthGuard from '@/app/components/AuthGuard';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Business as BusinessIcon,
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
import type { EmpresaType } from '@/lib/types';
import {
  azulBase,
  azulOscuro,
  blanco,
  grisClaro,
  grisMedio,
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
  const [empresas, setEmpresas] = useState<EmpresaType[]>([]);
  const [empresaId, setEmpresaId] = useState<string>('');
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

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

  // Cargar empresas activas una sola vez
  useEffect(() => {
    const cargarEmpresas = async () => {
      try {
        setLoadingEmpresas(true);
        const response = await fetch('/api/empresas?limit=1000');
        if (!response.ok) {
          throw new Error('Error al cargar empresas');
        }
        const result = await response.json();
        const lista = result.success ? result.data : result;
        const activas = lista.filter(
          (e: EmpresaType) => e.estado === 'activa'
        );
        setEmpresas(activas);
        if (activas.length > 0) {
          setEmpresaId(activas[0]._id || '');
        }
      } catch (error) {
        console.error('Error cargando empresas:', error);
      } finally {
        setLoadingEmpresas(false);
      }
    };
    cargarEmpresas();
  }, []);

  // Sincronizar tab con query param ?tab=
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const empresaSeleccionada =
    empresas.find(e => e._id === empresaId) || null;

  const handleEmpresaChange = (value: string) => {
    setEmpresaId(value);
  };

  const renderContent = () => {
    const commonProps: {
      empresaId: string;
      empresaNombre?: string;
    } = {
      empresaId,
      empresaNombre: empresaSeleccionada?.nombre,
    };

    switch (activeTab) {
      case 'buscar':
        return <BuscarClientes {...commonProps} />;
      case 'financiamientos-atrasados':
        return <FinanciamientosAtrasados {...commonProps} />;
      case 'pagos-atrasados':
        return <PagosAtrasados {...commonProps} />;
      case 'estado-cuenta':
        return <EstadoDeCuentaPage {...commonProps} />;
      case 'vencimientos':
        return <Vencimientos {...commonProps} />;
      default:
        return <BuscarClientes {...commonProps} />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header con selector de empresa */}
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
            <Typography variant="h4" component="h1" gutterBottom>
              Operaciones
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Búsquedas y operaciones de seguimiento basadas en una empresa
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <FormControl
              size="small"
              sx={{ minWidth: 280, bgcolor: 'rgba(255,255,255,0.1)' }}
            >
              <InputLabel
                sx={{
                  color: blanco,
                  '&.Mui-focused': { color: blanco },
                  '&.MuiInputLabel-shrink': { color: blanco },
                }}
              >
                Empresa
              </InputLabel>
              <Select
                value={empresaId}
                onChange={e => handleEmpresaChange(e.target.value)}
                label="Empresa"
                disabled={loadingEmpresas}
                sx={{
                  color: blanco,
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.4)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.7)',
                  },
                  '& .MuiSvgIcon-root': { color: blanco },
                }}
              >
                {empresas.map(empresa => (
                  <MenuItem key={empresa._id} value={empresa._id}>
                    {empresa.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {empresaSeleccionada && (
              <Chip
                icon={<BusinessIcon style={{ color: blanco }} />}
                label={`Resultados de: ${empresaSeleccionada.nombre}`}
                sx={{
                  color: blanco,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  fontWeight: 600,
                  '& .MuiChip-deleteIcon': { color: blanco },
                }}
              />
            )}
          </Box>
        </Box>

        {loadingEmpresas && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} sx={{ color: blanco }} />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Cargando empresas...
            </Typography>
          </Box>
        )}
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
      {empresaId ? (
        <>
          <TabPanel value={activeTab} index="buscar">
            <BuscarClientes empresaId={empresaId} empresaNombre={empresaSeleccionada?.nombre} />
          </TabPanel>
          <TabPanel value={activeTab} index="financiamientos-atrasados">
            <FinanciamientosAtrasados empresaId={empresaId} empresaNombre={empresaSeleccionada?.nombre} />
          </TabPanel>
          <TabPanel value={activeTab} index="pagos-atrasados">
            <PagosAtrasados empresaId={empresaId} empresaNombre={empresaSeleccionada?.nombre} />
          </TabPanel>
          <TabPanel value={activeTab} index="estado-cuenta">
            <EstadoDeCuentaPage empresaId={empresaId} empresaNombre={empresaSeleccionada?.nombre} />
          </TabPanel>
          <TabPanel value={activeTab} index="vencimientos">
            <Vencimientos empresaId={empresaId} empresaNombre={empresaSeleccionada?.nombre} />
          </TabPanel>
        </>
      ) : (
        !loadingEmpresas && (
          <Paper elevation={1} sx={{ p: 5, mt: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No hay empresas activas disponibles. Seleccione o cree una
              empresa para comenzar.
            </Typography>
          </Paper>
        )
      )}
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