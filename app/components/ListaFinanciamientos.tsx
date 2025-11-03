'use client';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Box,
  Typography,
  Stack,
  InputAdornment,
  TextField,
  Tooltip,
  Button,
  useTheme,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { FinanciamientoType } from '@/lib/types';
import {
  azulBase,
  azulClaro,
  azulOscuro,
  blanco,
  grisClaro,
  grisMedio,
  grisOscuro,
  grisTexto,
  turquesa,
} from '@/lib/color';
import { useRouter } from 'next/navigation';

interface ListaFinanciamientosProps {
  financiamientos: FinanciamientoType[];
  onFinanciamientoEliminado?: () => void;
  onAgregarFinanciamiento?: () => void;
}

export default function ListaFinanciamientos({
  financiamientos,
  onFinanciamientoEliminado,
  onAgregarFinanciamiento,
}: ListaFinanciamientosProps) {
  const [filter, setFilter] = React.useState('');
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-UY');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'finalizado':
        return 'info';
      case 'cancelado':
        return 'error';
      case 'en_mora':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleClickVerDetalles = (id: string) => {
    router.push(`/ciompi/financiamiento/${id}`);
  };

  const filteredFinanciamientos = financiamientos.filter(fin => {
    const searchTerm = filter.toLowerCase().trim();

    if (!searchTerm) return true;

    const searchInField = (field: string | undefined | null): boolean => {
      if (!field) return false;
      return field.toString().toLowerCase().includes(searchTerm);
    };

    const clienteNombre =
      typeof fin.cliente === 'object' ? fin.cliente.NOMBRE : '';
    const vehiculoMarca =
      typeof fin.vehiculo === 'object' ? fin.vehiculo.Marca : '';
    const vehiculoModelo =
      typeof fin.vehiculo === 'object' ? fin.vehiculo.Modelo : '';
    const vehiculoMatricula =
      typeof fin.vehiculo === 'object' ? fin.vehiculo.Matricula : '';

    return (
      searchInField(clienteNombre) ||
      searchInField(vehiculoMarca) ||
      searchInField(vehiculoModelo) ||
      searchInField(vehiculoMatricula) ||
      searchInField(fin.estadoFinanciamiento)
    );
  });

  const getStatusColor = (index: number) => {
    return index % 2 === 0 ? blanco : grisClaro;
  };

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: azulOscuro,
            fontWeight: 600,
          }}
        >
          Lista de Financiamientos
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`${filteredFinanciamientos.length} financiamientos`}
            variant="outlined"
            sx={{
              borderColor: turquesa,
              color: azulOscuro,
              fontWeight: 600,
            }}
          />

          {onAgregarFinanciamiento && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAgregarFinanciamiento}
              sx={{
                backgroundColor: azulBase,
                background: `linear-gradient(135deg, ${azulBase} 0%, ${azulOscuro} 100%)`,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: azulOscuro,
                  background: `linear-gradient(135deg, ${azulOscuro} 0%, ${azulBase} 100%)`,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                },
              }}
            >
              Agregar Financiamiento
            </Button>
          )}
        </Box>
      </Box>

      {/* Barra de búsqueda */}
      <TextField
        placeholder="Buscar por cliente, vehículo, marca, matrícula o estado..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        sx={{
          maxWidth: 500,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.8)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '& fieldset': {
                borderColor: azulClaro,
              },
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255,255,255,1)',
              boxShadow: `0 0 0 2px ${azulBase}20`,
              '& fieldset': {
                borderColor: azulBase,
              },
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: azulBase }} />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'auto',
          maxHeight: '70vh',
          position: 'relative',
          '&::-webkit-scrollbar': {
            height: 8,
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: grisClaro,
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: grisMedio,
            borderRadius: 4,
            '&:hover': {
              backgroundColor: grisOscuro,
            },
          },
        }}
      >
        <Table
          sx={{
            minWidth: isMobile ? 1200 : 900,
            '& .MuiTableCell-root': {
              whiteSpace: 'nowrap',
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: azulBase }}>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  minWidth: 50,
                  width: 50,
                }}
              >
                #
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Cliente
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Vehículo
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Costo
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Cuotas
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Estado
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Fecha Venta
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: 100,
                  width: 100,
                  position: 'sticky',
                  right: 0,
                  backgroundColor: azulBase,
                  zIndex: 10,
                  borderLeft: `2px solid ${azulClaro}`,
                }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFinanciamientos.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" color={grisTexto} sx={{ py: 4 }}>
                    {filter
                      ? 'No se encontraron financiamientos que coincidan con la búsqueda'
                      : 'No hay financiamientos registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {filteredFinanciamientos.map((fin, index) => (
              <TableRow
                key={fin._id}
                sx={{
                  backgroundColor: getStatusColor(index),
                  '&:hover': {
                    backgroundColor: azulClaro + '20',
                  },
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {typeof fin.cliente === 'object' ? fin.cliente.NOMBRE : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {typeof fin.vehiculo === 'object'
                      ? `${fin.vehiculo.Marca} ${fin.vehiculo.Modelo}`
                      : '-'}
                  </Typography>
                  <Typography variant="caption" color={grisTexto}>
                    {typeof fin.vehiculo === 'object'
                      ? fin.vehiculo.Matricula
                      : ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(fin.costoVehiculo)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {fin.cuotasPagadas || 0} / {fin.cuotas}
                  </Typography>
                  {fin.progresoFinanciamiento !== undefined && (
                    <LinearProgress
                      variant="determinate"
                      value={fin.progresoFinanciamiento}
                      sx={{
                        mt: 0.5,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: grisClaro,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={fin.estadoFinanciamiento}
                    color={getEstadoColor(fin.estadoFinanciamiento) as any}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={grisTexto}>
                    {formatDate(fin.fechaVenta)}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    position: 'sticky',
                    right: 0,
                    backgroundColor: getStatusColor(index),
                    zIndex: 5,
                    '.MuiTableRow-root:hover &': {
                      backgroundColor: azulClaro + '20',
                    },
                  }}
                >
                  <Tooltip title="Ver Detalles">
                    <IconButton
                      onClick={() => handleClickVerDetalles(fin._id || '')}
                      size="small"
                      sx={{
                        color: azulBase,
                        '&:hover': {
                          backgroundColor: azulBase + '20',
                        },
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
