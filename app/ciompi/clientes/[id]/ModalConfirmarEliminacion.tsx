import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"

interface ModalConfirmarEliminarProp {
open: boolean;
onClose: () => void;
clienteNombre: string;
deleting: boolean;
onConfirmEliminar: () => void;
}

const ModalConfirmarEliminar=({open, onClose, clienteNombre, deleting, onConfirmEliminar}:ModalConfirmarEliminarProp)=>{
    return   <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">
      Confirmar eliminación
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        ¿Estás seguro de que deseas eliminar al cliente "
        {clienteNombre}"? Esta acción no se puede deshacer.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={deleting}>
        Cancelar
      </Button>
      <Button
        onClick={onConfirmEliminar}
        color="error"
        variant="contained"
        disabled={deleting}
      >
        {deleting ? 'Eliminando...' : 'Eliminar'}
      </Button>
    </DialogActions>
  </Dialog>
}

export default ModalConfirmarEliminar