import { model, models, Schema } from 'mongoose';

const vehiculoSchema = new Schema(
  {
    Modelo: { type: String, require: true, unique: false, trim: true },
    Marca: { type: String, require: true, unique: false, trim: true },
    Matricula: { type: String, require: false, unique: true, trim: false },
    Padron: { type: String, require: false, trim: true },
    Descripcion: { type: String, require: false, unique: false, trim: true },
    Año: { type: Number, require: false, unique: false },
    Color: { type: String, require: false, unique: false, trim: true },
    disponible: {
      type: Boolean,
      default: true,
      required: false,
    },
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
      required: false,
    },
    usuarioModificacion: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaActualizacion: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Índices para mejorar rendimiento
vehiculoSchema.index({ disponible: 1 });
vehiculoSchema.index({ eliminado: 1 });

// Limpiar el modelo si ya existe para forzar la recreación
if (models.Vehiculo) {
  delete models.Vehiculo;
}

export default models.Vehiculo || model('Vehiculo', vehiculoSchema);
