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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { EmpresaType } from '@/lib/types';
import { useEliminarEmpresa } from '@/app/hook/useEliminarEmpresa';
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
  verde,
} from '@/lib/color';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useRouter } from 'next/navigation';

interface ListaEmpresasProps {
  empresas: EmpresaType[];
  onEmpresaEliminada?: () => void;
  onAgregarEmpresa?: () => void;
}

interface MenuState {
  anchorEl: HTMLElement | null;
  empresaId: string | null;
}

export default function ListaEmpresas({
  empresas,
  onEmpresaEliminada,
  onAgregarEmpresa,
}: ListaEmpresasProps) {
  const [filter, setFilter] = React.useState('');
  const [menuState, setMenuState] = React.useState<MenuState>({
    anchorEl: null,
    empresaId: null,
  });

  // Hook personalizado para eliminar empresa
  const {
    confirmDialog,
    loading,
    snackbar,
    handleClickEliminar,
    handleConfirmEliminar,
    handleCancelEliminar,
    handleCloseSnackbar,
  } = useEliminarEmpresa({ onEmpresaEliminada });

  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const emptyData = '-';

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 10): string => {
    if (!text || text.length <= maxLength) return text;
    if (typeof text !== 'string') return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper function to check if text is truncated
  const isTruncated = (text: string, maxLength: number = 10): boolean => {
    return Boolean(text && text.length > maxLength);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    empresaId: string
  ) => {
    setMenuState({
      anchorEl: event.currentTarget,
      empresaId,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      empresaId: null,
    });
  };

  const handleClickVerDetalles = (id: string) => {
    handleMenuClose();
    router.push(`/ciompi/empresas/${id}`);
  };

  const handleClickEditar = (id: string) => {
    handleMenuClose();
    router.push(`/ciompi/empresas/${id}/editar`);
  };

  // Wrapper para handleClickEliminar que también cierra el menú
  const handleClickEliminarWrapper = (id: string, nombre: string) => {
    handleMenuClose();
    handleClickEliminar(id, nombre);
  };

  const filteredEmpresas = empresas.filter(empresa => {
    const searchTerm = filter.toLowerCase().trim();

    if (!searchTerm) return true;

    // Función helper para buscar en campos de texto
    const searchInField = (field: string | undefined | null): boolean => {
      if (!field) return false;
      return field.toString().toLowerCase().includes(searchTerm);
    };

    return (
      searchInField(empresa.nombre) ||
      searchInField(empresa.descripcion) ||
      searchInField(empresa.telefono) ||
      searchInField(empresa.estado)
    );
  });

  const getStatusColor = (index: number) => {
    return index % 2 === 0 ? blanco : grisClaro;
  };

  const getEstadoColor = (estado: string) => {
    return estado === 'activa' ? verde : naranja;
  };

  const getEstadoLabel = (estado: string) => {
    return estado === 'activa' ? 'Activa' : 'Inactiva';
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
          Lista de Empresas
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`${filteredEmpresas.length} empresas`}
            variant="outlined"
            sx={{
              borderColor: turquesa,
              color: azulOscuro,
              fontWeight: 600,
            }}
          />

          {onAgregarEmpresa && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAgregarEmpresa}
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
              Agregar Empresa
            </Button>
          )}
        </Box>
      </Box>

      {/* Barra de búsqueda */}
      <TextField
        placeholder="Buscar por nombre, descripción, teléfono o estado..."
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

      {/* Tabla de empresas */}
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
            minWidth: isMobile ? 800 : 650,
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
                  minWidth: isMobile ? 150 : 200,
                }}
              >
                Nombre
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 120 : 150,
                }}
              >
                Descripción
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 100 : 120,
                }}
              >
                Teléfono
              </TableCell>
              <TableCell
                sx={{
                  color: blanco,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: isMobile ? 100 : 120,
                }}
              >
                Estado
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
            {filteredEmpresas.map((empresa, index) => (
              <TableRow
                key={empresa._id}
                sx={{
                  backgroundColor: getStatusColor(index),
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: grisMedio,
                    transform: 'translateY(-1px)',
                    boxShadow: 1,
                    '& .sticky-actions-cell': {
                      backgroundColor: grisMedio,
                    },
                  },
                }}
              >
                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: grisOscuro,
                      fontSize: '0.875rem',
                    }}
                  >
                    {index + 1}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ color: azulBase, fontSize: 20 }} />
                    <Tooltip title={empresa.nombre} placement="top" arrow>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: grisOscuro,
                          fontSize: '0.875rem',
                          cursor: 'help',
                          opacity:
                            isMobile && isTruncated(empresa.nombre, 15)
                              ? 0.8
                              : 1,
                        }}
                      >
                        {isMobile
                          ? truncateText(empresa.nombre, 15)
                          : empresa.nombre}
                      </Typography>
                    </Tooltip>
                  </Box>
                </TableCell>

                <TableCell>
                  <Tooltip
                    title={empresa.descripcion || 'Sin descripción'}
                    placement="top"
                    arrow
                  >
                    <Typography
                      sx={{
                        color: empresa.descripcion
                          ? grisOscuro
                          : 'text.secondary',
                        fontStyle: empresa.descripcion ? 'normal' : 'italic',
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          empresa.descripcion &&
                          isTruncated(empresa.descripcion, 20)
                            ? 0.8
                            : 1,
                      }}
                    >
                      {empresa.descripcion
                        ? truncateText(empresa.descripcion, 20)
                        : emptyData}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Tooltip
                    title={empresa.telefono || 'Sin teléfono'}
                    placement="top"
                    arrow
                  >
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        color: empresa.telefono ? grisOscuro : 'text.secondary',
                        fontStyle: empresa.telefono ? 'normal' : 'italic',
                        fontSize: '0.875rem',
                        cursor: 'help',
                        opacity:
                          empresa.telefono && isTruncated(empresa.telefono, 10)
                            ? 0.8
                            : 1,
                      }}
                    >
                      {empresa.telefono
                        ? truncateText(empresa.telefono, 10)
                        : emptyData}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Chip
                    label={getEstadoLabel(empresa.estado)}
                    size="small"
                    sx={{
                      backgroundColor: getEstadoColor(empresa.estado),
                      color: blanco,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </TableCell>

                <TableCell
                  className="sticky-actions-cell"
                  sx={{
                    position: 'sticky',
                    right: 0,
                    backgroundColor: getStatusColor(index),
                    zIndex: 10,
                    minWidth: 100,
                    width: 100,
                    borderLeft: `2px solid ${grisMedio}`,
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Stack alignItems="flex-end">
                    <Tooltip title="Acciones" placement="top">
                      <IconButton
                        onClick={event => handleMenuOpen(event, empresa._id!)}
                        size="small"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuState.anchorEl}
                      open={Boolean(
                        menuState.anchorEl &&
                          menuState.empresaId === empresa._id
                      )}
                      onClose={handleMenuClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      sx={{
                        '& .MuiPaper-root': {
                          borderRadius: '8px !important',
                          border: `1px solid ${grisClaro} !important`,
                          boxShadow: '0px 4px 12px rgba(0,0,0,0.15) !important',
                          minWidth: '140px !important',
                          outline: 'none !important',
                          zIndex: 1300,
                        },
                        '& .MuiMenu-list': {
                          padding: '4px 0 !important',
                        },
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          minHeight: '36px',
                          '&:hover': {
                            backgroundColor: grisClaro,
                          },
                        },
                      }}
                    >
                      <MenuItem
                        onClick={() => handleClickVerDetalles(empresa._id!)}
                      >
                        <ViewIcon
                          sx={{ fontSize: 18, mr: 1, color: azulBase }}
                        />
                        Ver Detalles
                      </MenuItem>
                      <MenuItem onClick={() => handleClickEditar(empresa._id!)}>
                        <EditIcon
                          sx={{ fontSize: 18, mr: 1, color: azulBase }}
                        />
                        Editar
                      </MenuItem>
                      <MenuItem
                        onClick={() =>
                          handleClickEliminarWrapper(
                            empresa._id!,
                            empresa.nombre
                          )
                        }
                      >
                        <DeleteIcon
                          sx={{ fontSize: 18, mr: 1, color: 'error.main' }}
                        />
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
        {filteredEmpresas.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color={grisTexto}>
              {filter
                ? 'No se encontraron empresas que coincidan con la búsqueda'
                : 'No hay empresas registradas'}
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
          Mostrando {filteredEmpresas.length} de {empresas.length} empresas
        </Typography>

        {filter && (
          <Typography variant="caption" color={naranja}>
            Filtro activo: "{filter}"
          </Typography>
        )}
      </Box>

      {/* Diálogo de confirmación */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelEliminar}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar la empresa "
            {confirmDialog.empresaNombre}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEliminar} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmEliminar}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
