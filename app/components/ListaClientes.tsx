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
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { ClienteType } from '@/lib/types';
import {
  azulBase,
  azulClaro,
  azulOscuro,
  blanco,
  grisClaro,
  grisMedio,
  grisOscuro,
  grisTexto,
  naranja,
  turquesa,
} from '@/lib/color';

interface ListaClientesProps {
  clientes: ClienteType[];
}

export default function ListaClientes({ clientes }: ListaClientesProps) {
  const [filter, setFilter] = React.useState('');

  const filteredClientes = clientes.filter(
    cliente =>
      cliente.NOMBRE.toLowerCase().includes(filter.toLowerCase()) ||
      cliente.CODCLI.toLowerCase().includes(filter.toLowerCase()) ||
      cliente.DIRECCION?.toLowerCase().includes(filter.toLowerCase()) ||
      cliente.TELEFONO?.includes(filter)
  );

  const getStatusColor = (index: number) => {
    return index % 2 === 0 ? blanco : grisClaro;
  };

  const formatTelefono = (telefono?: string) => {
    if (!telefono) return '-';
    // Formato básico para teléfonos
    return telefono.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          Lista de Clientes
        </Typography>

        <Chip
          label={`${filteredClientes.length} clientes`}
          variant="outlined"
          sx={{
            borderColor: turquesa,
            color: azulOscuro,
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Barra de búsqueda */}
      <TextField
        placeholder="Buscar cliente por nombre, código, dirección o teléfono..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        sx={{
          maxWidth: 500,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: azulClaro,
            },
            '&.Mui-focused fieldset': {
              borderColor: azulBase,
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: grisTexto }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Tabla de clientes */}
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: azulBase }}>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                Código
              </TableCell>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                Nombre
              </TableCell>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                Dirección
              </TableCell>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                Teléfono
              </TableCell>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                ID
              </TableCell>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClientes.map((cliente, index) => (
              <TableRow
                key={cliente.id}
                sx={{
                  backgroundColor: getStatusColor(index),
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: grisMedio,
                    transform: 'translateY(-1px)',
                    boxShadow: 1,
                  },
                }}
              >
                <TableCell>
                  <Chip
                    label={cliente.CODCLI}
                    size="small"
                    sx={{
                      backgroundColor: azulClaro,
                      color: blanco,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: grisOscuro,
                    }}
                  >
                    {cliente.NOMBRE}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      color: grisTexto,
                      fontStyle: cliente.DIRECCION ? 'normal' : 'italic',
                    }}
                  >
                    {cliente.DIRECCION || 'No especificada'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      color: grisOscuro,
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatTelefono(cliente.TELEFONO)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{
                      color: grisTexto,
                      fontFamily: 'monospace',
                    }}
                  >
                    {cliente.id}
                    {/* {cliente.id.slice(0, 8)}... */}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Ver detalles">
                      <Link href={`/clientes/${cliente.id}`} passHref>
                        <IconButton
                          size="small"
                          sx={{
                            backgroundColor: turquesa + '20',
                            color: turquesa,
                            '&:hover': {
                              backgroundColor: turquesa,
                              color: blanco,
                            },
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Link>
                    </Tooltip>

                    <Tooltip title="Editar cliente">
                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: naranja + '20',
                          color: naranja,
                          '&:hover': {
                            backgroundColor: naranja,
                            color: blanco,
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Mensaje cuando no hay resultados */}
        {filteredClientes.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color={grisTexto}>
              {filter
                ? 'No se encontraron clientes que coincidan con la búsqueda'
                : 'No hay clientes registrados'}
            </Typography>
          </Box>
        )}
      </TableContainer>

      {/* Footer informativo */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" color={grisTexto}>
          Mostrando {filteredClientes.length} de {clientes.length} clientes
        </Typography>

        {filter && (
          <Typography variant="caption" color={naranja}>
            Filtro activo: "{filter}"
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
