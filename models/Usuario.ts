import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UsuarioRoles, UsuarioEstado } from '@/lib/const';

const usuarioSchema = new Schema(
  {
    usuario: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      lowercase: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    avatar: {
      type: String,
      default: '/avatars/default-avatar.png',
    },
    rol: {
      type: String,
      enum: [UsuarioRoles.Administrativo, UsuarioRoles.Usuario],
      default: UsuarioRoles.Usuario,
    },
    estado: {
      type: String,
      enum: [UsuarioEstado.Activo, UsuarioEstado.Inactivo],
      default: UsuarioEstado.Activo,
    },
    cargo: {
      type: String,
      trim: true,
      maxlength: 100,
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
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const { password, ...userWithoutPassword } = ret;
        return userWithoutPassword;
      },
    },
  }
);

// Índice para soft delete
usuarioSchema.index({ eliminado: 1 });

// Middleware para actualizar fechaActualizacion
usuarioSchema.pre('save', function (next) {
  this.fechaActualizacion = new Date();
  next();
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Método para hashear contraseña antes de guardar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default models.Usuario || model('Usuario', usuarioSchema);
