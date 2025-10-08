import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

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
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: '/avatars/default-avatar.png',
    },
    rol: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo'],
      default: 'activo',
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
