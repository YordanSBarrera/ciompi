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
  MenuItem,
  Menu,
  Fade,
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { dynamicRoutes } from '@/lib/rutas';
import { useRouter } from 'next/navigation';

interface ListaClientesProps {
  clientes: ClienteType[];
}

export default function ListaClientes({ clientes }: ListaClientesProps) {
  const [filter, setFilter] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickVerDetalles = (id: string) => {
    handleClose();
    router.push(dynamicRoutes.cliente(id));
  };

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
                Nombre
              </TableCell>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                Cedula
              </TableCell>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                Teléfono
              </TableCell>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                Correo
              </TableCell>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                Dirección
              </TableCell>
              <TableCell
                sx={{ color: blanco, fontWeight: 600, fontSize: '1rem' }}
              >
                Profesión
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
                key={cliente._id}
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
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: grisOscuro,
                    }}
                  >
                    {cliente.NOMBRE}
                  </Typography>
                </TableCell>
                {/* nombre/cedula/telefono/correo/direccion/profesion */}
                <TableCell>
                  <Typography
                    sx={{
                      variant: cliente.cedula ? 'body1' : 'caption',
                      color: cliente.cedula ? grisOscuro : azulClaro,
                      fontFamily: 'monospace',
                    }}
                  >
                    {cliente.cedula || 'Sin dato'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      color: cliente.TELEFONO ? grisOscuro : 'text.secondary',
                      fontStyle: cliente.TELEFONO ? 'normal' : 'italic',
                    }}
                  >
                    {cliente.TELEFONO || 'No Data'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      color: cliente.correo ? 'text.primary' : 'text.secondary',
                      fontStyle: cliente.correo ? 'normal' : 'italic',
                    }}
                  >
                    {cliente.correo || 'No Data'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      variant: cliente.DIRECCION ? 'body1' : 'overline',
                      color: cliente.DIRECCION
                        ? 'text.primary'
                        : 'text.secondary',
                      fontStyle: cliente.DIRECCION ? 'normal' : 'italic',
                    }}
                  >
                    {cliente.DIRECCION || 'No especificado'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    // variant="caption"
                    sx={{
                      color: grisTexto,
                      fontFamily: 'monospace',
                    }}
                  >
                    {cliente.profesion || 'No Data'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack alignItems="flex-end">
                    <Tooltip title="Acciones" placement="top">
                      <IconButton
                        aria-controls={open ? 'long-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={handleClick}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>

                    <Menu
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      sx={{
                        '& .MuiPaper-root': {
                          borderRadius: '8px !important',
                          border: `1px solid ${grisClaro} !important`,
                          boxShadow: '0px 2px 3px rgba(0,0,0,0.1) !important',
                          minWidth: '140px !important',
                          // Reset completo de estilos no deseados
                          outline: 'none !important',
                          borderImage: 'none !important',
                          backgroundImage: 'none !important',
                        },
                        '& .MuiMenu-list': {
                          padding: '4px 0 !important',
                        },
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          minHeight: '36px',
                        },
                      }}
                    >
                      <MenuItem
                        onClick={() => handleClickVerDetalles(cliente._id)}
                      >
                        Ver Detalles
                      </MenuItem>
                      <MenuItem onClick={handleClose}>Editar</MenuItem>
                      <MenuItem onClick={handleClose}>
                        <Typography variant="body2" color="error.main">
                          Eliminar
                        </Typography>
                      </MenuItem>
                    </Menu>
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
