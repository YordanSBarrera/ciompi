'use client';
import AuthGuard from '@/app/components/AuthGuard';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BuscarClientes from '@/app/components/operaciones/BuscarClientes';
import FinanciamientosAtrasados from '@/app/components/operaciones/FinanciamientosAtrasados';
import PagosAtrasados from '@/app/components/operaciones/PagosAtrasados';
import EstadoDeCuentaPage from '@/app/components/EstadoDeCuentaPage';
import Vencimientos from '@/app/components/operaciones/Vencimientos';

function OperacionesContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('buscar');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (activeTab) {
      case 'buscar':
        return <BuscarClientes />;
      case 'financiamientos-atrasados':
        return <FinanciamientosAtrasados />;
      case 'pagos-atrasados':
        return <PagosAtrasados />;
      case 'estado-cuenta':
        return <EstadoDeCuentaPage />;
      case 'vencimientos':
        return <Vencimientos />;
      default:
        return <BuscarClientes />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Operaciones
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Buscar financiamientos y gestionar cuotas atrasadas
        </Typography>
      </Box>

      {/* Contenido según tab seleccionado */}
      {renderContent()}
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
