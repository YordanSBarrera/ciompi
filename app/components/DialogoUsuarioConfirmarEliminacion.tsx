import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export const DialogoUsuarioConfirmarEleminacion = () => {
  return (
    <Dialog
      open={confirmDialog.open}
      onClose={() => setConfirmDialog({ open: false, usuarioId: null })}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Confirmar eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          ¿Estás seguro de que deseas eliminar el usuario "{usuario.nombre}
          "? Esta acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setConfirmDialog({ open: false, usuarioId: null })}
        >
          Cancelar
        </Button>
        <Button onClick={handleEliminar} color="error" variant="contained">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
