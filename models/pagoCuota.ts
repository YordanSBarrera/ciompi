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
      required: false, // para pagos extra no es obligatorio
      min: 0, // 0 indica pago extra
      default: 0,
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

    // Pago fuera de cuota (extra)
    esExtra: {
      type: Boolean,
      default: false,
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

// Índice por financiamiento y cuota (sin unique) para permitir múltiples pagos de la misma cuota (pagos parciales)
pagoCuotaSchema.index({ financiamiento: 1, numeroCuota: 1 }, { unique: false });

export default models.PagoCuota || model('PagoCuota', pagoCuotaSchema);
