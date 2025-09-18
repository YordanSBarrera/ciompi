import { Schema, model, models } from 'mongoose';

const clientSchema = new Schema(
  {
    NOMBRE: { type: String, require: true, unique: false, trim: true },
    DIRECCION: { type: String, require: false, unique: false, trim: true },
    CODCLI: { type: String, require: true, unique: true, trim: false },
    TELEFONO: { type: Number, require: false, unique: false, trim: true },
  },
  { timestamps: true }
);

export default models.Cliente || model('Cliente', clientSchema);
