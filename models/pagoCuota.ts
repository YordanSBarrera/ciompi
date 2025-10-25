import { Schema, model, models } from 'mongoose';

const pagoCuotaSchema = new Schema(
  {
    // Referencia al financiamiento
    financiamiento: {
      type: Schema.Types.ObjectId,
      ref: 'Financiamiento',
      required: true,
    },

    // Información del pago
    numeroCuota: {
      type: Number,
      required: true,
      min: 1,
    },
    montoPago: {
      type: Number,
      required: true,
      min: 0,
    },
    fechaPago: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Método de pago
    metodoPago: {
      type: String,
      enum: ['efectivo', 'transferencia', 'cheque', 'tarjeta', 'otro'],
      default: 'efectivo',
    },

    // Usuario que registró el pago
    usuarioRegistro: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },

    // Información adicional
    observaciones: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Estado del pago
    estadoPago: {
      type: String,
      enum: ['confirmado', 'pendiente', 'cancelado'],
      default: 'confirmado',
    },

    // Referencias bancarias (opcional)
    numeroComprobante: {
      type: String,
      trim: true,
    },
    banco: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices para mejorar rendimiento
pagoCuotaSchema.index({ financiamiento: 1 });
pagoCuotaSchema.index({ fechaPago: -1 });
pagoCuotaSchema.index({ usuarioRegistro: 1 });
pagoCuotaSchema.index({ estadoPago: 1 });

// Índice compuesto para evitar pagos duplicados de la misma cuota
pagoCuotaSchema.index({ financiamiento: 1, numeroCuota: 1 }, { unique: true });

export default models.PagoCuota || model('PagoCuota', pagoCuotaSchema);
