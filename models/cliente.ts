import { Schema, model, models } from 'mongoose';

const clientSchema = new Schema(
  {
    NOMBRE: { type: String, require: true, unique: false, trim: true },
    DIRECCION: { type: String, require: false, unique: false, trim: true },
    CODCLI: { type: String, require: false, unique: true, trim: false }, //dato en BD vieja, eliminar luego de actualizada
    TELEFONO: { type: Number, require: false, unique: false, trim: true },
    cedula: { type: String, require: false, unique: false, trim: true },
    correo: { type: String, require: false, unique: false, trim: true },
    profesion: { type: String, require: false, unique: false, trim: true },
  },
  { timestamps: true }
);

export default models.Cliente || model('Cliente', clientSchema);
