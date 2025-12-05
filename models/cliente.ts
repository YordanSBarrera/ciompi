import { Schema, model, models } from 'mongoose';

const clientSchema = new Schema(
  {
    NOMBRE: { type: String, require: true, unique: false, trim: true },
    DIRECCION: { type: String, require: false, unique: false, trim: true },
    TELEFONO: { type: Number, require: false, unique: false, trim: true },
    cedula: { type: String, require: false, unique: false, trim: true },
    correo: { type: String, require: false, unique: false, trim: true },
    profesion: { type: String, require: false, unique: false, trim: true },
    // Campos para Soft Delete
    eliminado: {
      type: Boolean,
      default: false,
      required: false,
    },
    fechaEliminacion: {
      type: Date,
      required: false,
    },
    usuarioEliminacion: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },
    usuarioCreacion: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      require: false,
    },
    usuarioModificacion: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      require: false,
    },
  },
  { timestamps: true }
);

// Índices para mejorar rendimiento
clientSchema.index({ eliminado: 1 });
clientSchema.index({ NOMBRE: 1 });

export default models.Cliente || model('Cliente', clientSchema);
