import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUsuario extends Document {
  usuario: string;
  password: string;
  email: string;
  nombre: string;
  avatar?: string;
  rol: 'admin' | 'supervisor' | 'usuario';
  estado: 'activo' | 'inactivo' | 'bloqueado' | 'pendiente';
  ultimoAcceso?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  compararPassword(password: string): Promise<boolean>;
}

const usuarioSchema = new Schema(
  {
    usuario: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    nombre: { type: String, required: true, trim: true },
    avatar: { type: String, default: '/avatars/default-avatar.png' },
    rol: {
      type: String,
      enum: ['admin', 'supervisor', 'usuario'],
      default: 'usuario',
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo', 'bloqueado', 'pendiente'],
      default: 'activo',
    },
    ultimoAcceso: { type: Date },
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  }
);

// Hash password antes de guardar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para comparar passwords
usuarioSchema.methods.compararPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.models.Usuario ||
  mongoose.model<IUsuario>('Usuario', usuarioSchema);
