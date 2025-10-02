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
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
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

interface MenuState {
  anchorEl: HTMLElement | null;
  clienteId: string | null;
}

export default function ListaClientes({ clientes }: ListaClientesProps) {
  const [filter, setFilter] = React.useState('');
  const [menuState, setMenuState] = React.useState<MenuState>({
    anchorEl: null,
    clienteId: null,
  });
  const router = useRouter();
  const emptyData = '-';

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    clienteId: string
  ) => {
    setMenuState({
      anchorEl: event.currentTarget,
      clienteId,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      clienteId: null,
    });
  };

  const handleClickVerDetalles = (id: string) => {
    handleMenuClose();
    router.push(dynamicRoutes.cliente(id));
  };

  const handleClickEditar = (id: string) => {
    handleMenuClose();
    router.push(dynamicRoutes.clienteEditar(id));
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
    <Stack spacing={2} sx={{ p: 2 }}>
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
                sx={{ color: blanco, fontWeight: 500, fontSize: '1rem' }}
              >
                #
              </TableCell>
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
                  <Typography sx={{ fontWeight: 500, color: grisOscuro }}>
                    {index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 600, color: grisOscuro }}>
                    {cliente.NOMBRE}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      color: cliente.cedula ? grisOscuro : azulClaro,
                      fontFamily: 'monospace',
                    }}
                  >
                    {cliente.cedula || '-'}
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
                    {cliente.TELEFONO || emptyData}
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
                    {cliente.correo || emptyData}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      color: cliente.DIRECCION
                        ? 'text.primary'
                        : 'text.secondary',
                      fontStyle: cliente.DIRECCION ? 'normal' : 'italic',
                    }}
                  >
                    {cliente.DIRECCION || emptyData}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{ color: grisTexto, fontFamily: 'monospace' }}
                  >
                    {cliente.profesion || emptyData}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack alignItems="flex-end">
                    <Tooltip title="Acciones" placement="top">
                      <IconButton
                        onClick={event => handleMenuOpen(event, cliente._id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuState.anchorEl}
                      open={Boolean(
                        menuState.anchorEl &&
                          menuState.clienteId === cliente._id
                      )}
                      onClose={handleMenuClose}
                      sx={{
                        '& .MuiPaper-root': {
                          borderRadius: '8px !important',
                          border: `1px solid ${grisClaro} !important`,
                          boxShadow: '0px 2px 3px rgba(0,0,0,0.1) !important',
                          minWidth: '140px !important',
                          outline: 'none !important',
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
                        <ViewIcon
                          sx={{ fontSize: 18, mr: 1, color: azulBase }}
                        />
                        Ver Detalles
                      </MenuItem>
                      <MenuItem onClick={() => handleClickEditar(cliente._id)}>
                        <EditIcon
                          sx={{ fontSize: 18, mr: 1, color: azulBase }}
                        />
                        Editar
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
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
