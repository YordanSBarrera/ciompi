import { model, models, Schema } from 'mongoose';

const vehiculoSchema = new Schema(
  {
    Modelo: { type: String, require: true, unique: false, trim: true },
    Marca: { type: String, require: true, unique: false, trim: true },
    Matricula: { type: String, require: true, unique: true, trim: false },
    Padron: { type: Number, require: true, unique: false, trim: true },
    Descripcion: { type: String, require: false, unique: false, trim: true },
    Año: { type: Number, require: false, unique: false },
    Color: { type: String, require: false, unique: false, trim: true },
  },
  { timestamps: true }
);
export default models.Vehiculo || model('Vehiculo', vehiculoSchema);
