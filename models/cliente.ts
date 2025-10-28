import { Schema, model, models } from 'mongoose';

const clientSchema = new Schema(
  {
    NOMBRE: { type: String, require: true, unique: false, trim: true },
    DIRECCION: { type: String, require: false, unique: false, trim: true },
    TELEFONO: { type: Number, require: false, unique: false, trim: true },
    cedula: { type: String, require: false, unique: false, trim: true },
    correo: { type: String, require: false, unique: false, trim: true },
    profesion: { type: String, require: false, unique: false, trim: true },
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

export default models.Cliente || model('Cliente', clientSchema);
