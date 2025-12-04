import { Schema, model, models } from 'mongoose';

const financiamientoSchema = new Schema(
  {
    // Referencias a Cliente, Vehículo y Empresa
    cliente: {
      type: Schema.Types.ObjectId,
      ref: 'Cliente',
      required: true,
    },
    cliente2: {
      type: Schema.Types.ObjectId,
      ref: 'Cliente',
      required: false,
    },
    vehiculo: {
      type: Schema.Types.ObjectId,
      ref: 'Vehiculo',
      required: false,
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: 'Empresa',
      required: true,
    },

    // Información financiera
    costoVehiculo: {
      type: Number,
      required: true,
      min: 0,
    },
    // Nuevos campos financieros
    valorBase: {
      type: Number,
      required: false,
      min: 0,
    },
    costosDocumentacion: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
    gastosExtras: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
    cuotasExtras: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
    cuotasFuturas: [
      {
        numeroCuota: { type: Number, required: true },
        fechaVencimiento: { type: Date, required: true },
        valorCuota: { type: Number, required: true },
        estadoCuota: {
          type: String,
          enum: ['pendiente', 'pagada', 'parcial'],
          default: 'pendiente',
          required: false,
        },
      },
    ],
    cuotas: {
      type: Number,
      required: true,
      min: 1,
      max: 120, // Máximo 120 cuotas (10 años)
    },
    valorCuota: {
      type: Number,
      required: true,
      min: 0,
    },
    interesTotal: {
      type: Number,
      required: true,
    },
    montoTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // Información de la venta
    fechaVenta: {
      type: Date,
      required: true,
      default: Date.now,
    },
    estadoFinanciamiento: {
      type: String,
      enum: ['activo', 'finalizado', 'cancelado', 'en_mora'],
      default: 'activo',
    },

    // Usuarios de registro y modificación
    usuarioCreacion: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },
    usuarioRegistro: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    usuarioModificacion: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },

    // Información adicional
    observaciones: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Fechas importantes
    fechaPrimeraCuota: {
      type: Date,
      required: true,
    },
    fechaUltimaCuota: {
      type: Date,
      required: true,
    },

    // Contadores
    cuotasPagadas: {
      type: Number,
      default: 0,
      min: 0,
    },
    cuotasPendientes: {
      type: Number,
      required: true,
      min: 0,
    },

    // Montos pagados
    montoPagado: {
      type: Number,
      default: 0,
      min: 0,
    },
    saldoPendiente: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices para mejorar rendimiento
financiamientoSchema.index({ cliente: 1 });
financiamientoSchema.index({ cliente2: 1 });
financiamientoSchema.index({ vehiculo: 1 });
financiamientoSchema.index({ empresa: 1 });
financiamientoSchema.index({ usuarioRegistro: 1 });
financiamientoSchema.index({ usuarioCreacion: 1 });
financiamientoSchema.index({ usuarioModificacion: 1 });
financiamientoSchema.index({ estadoFinanciamiento: 1 });
financiamientoSchema.index({ fechaVenta: -1 });

// Virtual para calcular el progreso del financiamiento
financiamientoSchema.virtual('progresoFinanciamiento').get(function () {
  if (this.cuotas === 0) return 0;
  return Math.round((this.cuotasPagadas / this.cuotas) * 100);
});

// Virtual para verificar si está al día
financiamientoSchema.virtual('estaAlDia').get(function () {
  const hoy = new Date();
  return this.fechaUltimaCuota >= hoy;
});

// Limpiar caché del modelo para evitar problemas con esquemas actualizados
if (models.Financiamiento) {
  delete models.Financiamiento;
}

export default models.Financiamiento || model('Financiamiento', financiamientoSchema);
