import { Schema, Document, model, models } from 'mongoose';

export interface IEmpresa extends Document {
  nombre: string;
  descripcion?: string;
  telefono?: string;
  usuarioRegistro: Schema.Types.ObjectId;
  usuarioModificacion?: Schema.Types.ObjectId;
  estado: 'activa' | 'inactiva';
  // Campos para Soft Delete
  eliminado?: boolean;
  fechaEliminacion?: Date;
  usuarioEliminacion?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmpresaSchema = new Schema<IEmpresa>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la empresa es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    telefono: {
      type: String,
      trim: true,
      maxlength: [20, 'El teléfono no puede exceder 20 caracteres'],
    },
    usuarioRegistro: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario que registra es requerido'],
    },
    usuarioModificacion: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },
    estado: {
      type: String,
      enum: ['activa', 'inactiva'],
      default: 'activa',
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para mejorar el rendimiento
EmpresaSchema.index({ nombre: 1 });
EmpresaSchema.index({ estado: 1 });
EmpresaSchema.index({ eliminado: 1 });
EmpresaSchema.index({ usuarioRegistro: 1 });

// Middleware para validaciones adicionales
EmpresaSchema.pre('save', function (next) {
  // Convertir nombre a formato título
  if (this.nombre) {
    this.nombre = this.nombre
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  next();
});

export default models.Empresa || model<IEmpresa>('Empresa', EmpresaSchema);
