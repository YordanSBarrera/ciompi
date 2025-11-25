const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Definir esquemas directamente (compatibles con los modelos TypeScript)
const clienteSchema = new mongoose.Schema(
  {
    NOMBRE: { type: String, required: true, trim: true },
    DIRECCION: { type: String, required: false, trim: true },
    TELEFONO: { type: Number, required: false },
    cedula: { type: String, required: false, trim: true },
    correo: { type: String, required: false, trim: true },
    profesion: { type: String, required: false, trim: true },
    usuarioCreacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: false },
    usuarioModificacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: false },
  },
  { timestamps: true }
);

const vehiculoSchema = new mongoose.Schema(
  {
    Modelo: { type: String, required: true, trim: true },
    Marca: { type: String, required: true, trim: true },
    Matricula: { type: String, required: false, unique: true, trim: false },
    Padron: { type: String, required: false, trim: true },
    Descripcion: { type: String, required: false, trim: true },
    Año: { type: Number, required: false },
    Color: { type: String, required: false, trim: true },
    disponible: { type: Boolean, default: true, required: false },
    usuarioCreacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: false },
    usuarioModificacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: false },
    fechaCreacion: { type: Date, default: Date.now },
    fechaActualizacion: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const empresaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    descripcion: { type: String, trim: true, maxlength: 500 },
    telefono: { type: String, trim: true, maxlength: 20 },
    usuarioRegistro: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    usuarioModificacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: false },
    estado: { type: String, enum: ['activa', 'inactiva'], default: 'activa' },
  },
  { timestamps: true }
);

const financiamientoSchema = new mongoose.Schema(
  {
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    cliente2: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: false },
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo', required: false },
    empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
    costoVehiculo: { type: Number, required: true, min: 0 },
    valorBase: { type: Number, required: false, min: 0 },
    costosDocumentacion: { type: Number, required: false, default: 0, min: 0 },
    gastosExtras: { type: Number, required: false, default: 0, min: 0 },
    cuotasExtras: { type: Number, required: false, default: 0, min: 0 },
    cuotasFuturas: [{
      numeroCuota: { type: Number, required: true },
      fechaVencimiento: { type: Date, required: true },
      valorCuota: { type: Number, required: true },
    }],
    cuotas: { type: Number, required: true, min: 1, max: 120 },
    valorCuota: { type: Number, required: true, min: 0 },
    interesTotal: { type: Number, required: true },
    montoTotal: { type: Number, required: true, min: 0 },
    fechaVenta: { type: Date, required: true, default: Date.now },
    estadoFinanciamiento: { type: String, enum: ['activo', 'finalizado', 'cancelado', 'en_mora'], default: 'activo' },
    usuarioCreacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: false },
    usuarioRegistro: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    usuarioModificacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: false },
    observaciones: { type: String, trim: true, maxlength: 500 },
    fechaPrimeraCuota: { type: Date, required: true },
    fechaUltimaCuota: { type: Date, required: true },
    cuotasPagadas: { type: Number, default: 0, min: 0 },
    cuotasPendientes: { type: Number, required: true, min: 0 },
    montoPagado: { type: Number, default: 0, min: 0 },
    saldoPendiente: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const pagoCuotaSchema = new mongoose.Schema(
  {
    financiamiento: { type: mongoose.Schema.Types.ObjectId, ref: 'Financiamiento', required: true },
    numeroCuota: { type: Number, required: false, min: 0, default: 0 },
    montoPago: { type: Number, required: true, min: 0 },
    fechaPago: { type: Date, required: true, default: Date.now },
    metodoPago: { type: String, enum: ['efectivo', 'transferencia', 'cheque', 'tarjeta', 'otro'], default: 'efectivo' },
    usuarioRegistro: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    observaciones: { type: String, trim: true, maxlength: 500 },
    estadoPago: { type: String, enum: ['confirmado', 'pendiente', 'cancelado'], default: 'confirmado' },
    esExtra: { type: Boolean, default: false },
    numeroComprobante: { type: String, trim: true },
    banco: { type: String, trim: true },
  },
  { timestamps: true }
);

const usuarioSchema = new mongoose.Schema(
  {
    usuario: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 50 },
    password: { type: String, required: true, minlength: 6 },
    email: { type: String, required: false, unique: true, trim: true, lowercase: true },
    nombre: { type: String, required: true, trim: true, maxlength: 50 },
    avatar: { type: String, default: '/avatars/default-avatar.png' },
    rol: { type: String, enum: ['Administrativo', 'Usuario'], default: 'Usuario' },
    estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
    cargo: { type: String, trim: true, maxlength: 100 },
    usuarioCreacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: false },
    usuarioModificacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: false },
    fechaCreacion: { type: Date, default: Date.now },
    fechaActualizacion: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Crear modelos
const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', clienteSchema);
const Vehiculo = mongoose.models.Vehiculo || mongoose.model('Vehiculo', vehiculoSchema);
const Empresa = mongoose.models.Empresa || mongoose.model('Empresa', empresaSchema);
const Financiamiento = mongoose.models.Financiamiento || mongoose.model('Financiamiento', financiamientoSchema);
const PagoCuota = mongoose.models.PagoCuota || mongoose.model('PagoCuota', pagoCuotaSchema);
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

// Función para parsear fechas en formato DD.MM.YYYY
function parseDate(dateString) {
  if (!dateString || dateString.trim() === '') return new Date();
  
  try {
    const parts = dateString.trim().split('.');
    if (parts.length !== 3) return new Date();
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Los meses en JS son 0-indexed
    const year = parseInt(parts[2], 10);
    
    // Validar que los valores sean válidos
    if (isNaN(day) || isNaN(month) || isNaN(year)) return new Date();
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
      return new Date();
    }
    
    const date = new Date(year, month, day);
    // Verificar que la fecha es válida
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return new Date();
    }
    
    return date;
  } catch (error) {
    return new Date();
  }
}

// Función para limpiar y convertir números
function parseNumber(value) {
  if (!value) return 0;
  const cleaned = String(value).trim().replace(/\s+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Función para limpiar strings
function cleanString(str) {
  if (!str) return '';
  return String(str).trim();
}

// Función para extraer teléfono de un string que puede contener múltiples números
function extractPhone(str) {
  if (!str) return null;
  // Buscar el primer número de teléfono (8-9 dígitos)
  const match = String(str).match(/\d{8,9}/);
  return match ? parseInt(match[0], 10) : null;
}

// Función para extraer cédula de un string
function extractCedula(str) {
  if (!str) return null;
  // Buscar números que parezcan cédulas (6-8 dígitos)
  const match = String(str).match(/\d{6,8}/);
  return match ? match[0] : null;
}

// Función para extraer email de un string
function extractEmail(str) {
  if (!str) return null;
  const match = String(str).match(/[\w\.-]+@[\w\.-]+\.\w+/);
  return match ? match[0] : null;
}

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos...\n');

    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ciompi';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB:', mongoose.connection.db.databaseName);

    // Obtener o crear un usuario por defecto para las referencias
    let defaultUser = await Usuario.findOne({ usuario: 'admin' });
    if (!defaultUser) {
      // Crear un usuario temporal si no existe
      defaultUser = await Usuario.findOne();
      if (!defaultUser) {
        console.log('⚠️  No se encontró ningún usuario. Creando usuario temporal...');
        defaultUser = new Usuario({
          usuario: 'migracion',
          password: 'temp123',
          nombre: 'Usuario Migración',
          email: 'migracion@ciompi.com',
          rol: 'Administrativo',
          estado: 'activo',
        });
        await defaultUser.save();
      }
    }
    console.log('✅ Usuario por defecto:', defaultUser.usuario);

    // Leer archivos JSON
    const bdPath = path.join(__dirname, '..', 'BD');
    console.log('\n📂 Leyendo archivos JSON desde:', bdPath);

    const clientesData = JSON.parse(fs.readFileSync(path.join(bdPath, 'clientes.json'), 'utf8'));
    const empresasData = JSON.parse(fs.readFileSync(path.join(bdPath, 'EMPRE.json'), 'utf8'));
    const operacionesData = JSON.parse(fs.readFileSync(path.join(bdPath, 'OPERAC.json'), 'utf8'));
    const pagosData = JSON.parse(fs.readFileSync(path.join(bdPath, 'FORMAPAG.json'), 'utf8'));

    console.log('✅ Archivos JSON leídos correctamente\n');

    // Mapa para almacenar relaciones CODCLI -> ObjectId
    const clienteMap = new Map();
    const empresaMap = new Map();
    const vehiculoMap = new Map();
    const financiamientoMap = new Map();

    // 1. MIGRAR EMPRESAS
    console.log('📊 Migrando empresas...');
    const empresas = empresasData.EMPRE || [];
    for (const emp of empresas) {
      const codEmp = cleanString(emp.CODEMP);
      const nombre = cleanString(emp.EMPRESA);

      if (!codEmp || !nombre) {
        console.log(`⚠️  Empresa omitida: datos incompletos`, emp);
        continue;
      }

      try {
        let empresa = await Empresa.findOne({ nombre });
        if (!empresa) {
          empresa = new Empresa({
            nombre,
            estado: 'activa',
            usuarioRegistro: defaultUser._id,
          });
          await empresa.save();
          console.log(`  ✅ Empresa creada: ${nombre} (${codEmp})`);
        } else {
          console.log(`  ℹ️  Empresa ya existe: ${nombre}`);
        }
        empresaMap.set(codEmp, empresa._id);
      } catch (error) {
        console.error(`  ❌ Error creando empresa ${nombre}:`, error.message);
      }
    }
    console.log(`✅ Empresas migradas: ${empresaMap.size}\n`);

    // 2. MIGRAR CLIENTES
    console.log('👥 Migrando clientes...');
    const clientes = clientesData.clientes || [];
    let clientesCreados = 0;
    let clientesExistentes = 0;

    for (const cli of clientes) {
      const codCli = cleanString(cli.CODCLI);
      const nombre = cleanString(cli.NOMBRE);
      const direccion = cleanString(cli.DIRECCION);
      const telefono = cli.TELEFONO ? extractPhone(cli.TELEFONO) : extractPhone(cli.DIRECCION);

      if (!codCli || !nombre) {
        console.log(`⚠️  Cliente omitido: datos incompletos`, cli);
        continue;
      }

      try {
        // Buscar por nombre similar o crear nuevo
        let cliente = await Cliente.findOne({ NOMBRE: nombre });
        if (!cliente) {
          cliente = new Cliente({
            NOMBRE: nombre,
            DIRECCION: direccion || undefined,
            TELEFONO: telefono || undefined,
            cedula: extractCedula(nombre) || extractCedula(direccion) || undefined,
            correo: extractEmail(nombre) || extractEmail(direccion) || undefined,
            usuarioCreacion: defaultUser._id,
          });
          await cliente.save();
          clientesCreados++;
          console.log(`  ✅ Cliente creado: ${nombre.substring(0, 40)}... (${codCli})`);
        } else {
          clientesExistentes++;
          console.log(`  ℹ️  Cliente ya existe: ${nombre.substring(0, 40)}...`);
        }
        clienteMap.set(codCli, cliente._id);
      } catch (error) {
        console.error(`  ❌ Error creando cliente ${nombre}:`, error.message);
      }
    }
    console.log(`✅ Clientes migrados: ${clientesCreados} nuevos, ${clientesExistentes} existentes\n`);

    // 3. MIGRAR VEHÍCULOS Y FINANCIAMIENTOS
    console.log('🚗 Migrando vehículos y financiamientos...');
    const operaciones = operacionesData.OPERAC || [];
    let vehiculosCreados = 0;
    let financiamientosCreados = 0;

    for (const op of operaciones) {
      try {
        const codCli = cleanString(op.CODCLI);
        const codEmp = cleanString(op.CODEMP);
        const codOp = cleanString(op.CODOP);

        // Validar datos básicos
        if (!codCli || !codEmp) {
          console.log(`⚠️  Operación omitida: datos incompletos`, op);
          continue;
        }

        const clienteId = clienteMap.get(codCli);
        const empresaId = empresaMap.get(codEmp);

        if (!clienteId) {
          console.log(`⚠️  Cliente no encontrado para CODCLI: ${codCli}`);
          continue;
        }
        if (!empresaId) {
          console.log(`⚠️  Empresa no encontrada para CODEMP: ${codEmp}`);
          continue;
        }

        // Crear o buscar vehículo
        let vehiculoId = null;
        if (op.MATRICULA || op.MARCA) {
          const matricula = cleanString(op.MATRICULA);
          const marca = cleanString(op.MARCA);
          const modelo = marca || 'Sin especificar';
          const año = op.ANIO ? parseInt(String(op.ANIO).trim(), 10) : undefined;

          if (matricula) {
            let vehiculo = await Vehiculo.findOne({ Matricula: matricula });
            if (!vehiculo) {
              vehiculo = new Vehiculo({
                Marca: marca || 'Sin especificar',
                Modelo: modelo,
                Matricula: matricula,
                Año: año || undefined,
                disponible: false, // Ya está financiado
                usuarioCreacion: defaultUser._id,
                fechaCreacion: parseDate(op.FEC_COMPRA || op.FECHA),
              });
              await vehiculo.save();
              vehiculosCreados++;
              console.log(`  ✅ Vehículo creado: ${marca} - ${matricula}`);
            }
            vehiculoId = vehiculo._id;
          } else if (marca) {
            // Si no hay matrícula pero hay marca, crear vehículo sin matrícula
            let vehiculo = new Vehiculo({
              Marca: marca,
              Modelo: modelo,
              Año: año || undefined,
              disponible: false,
              usuarioCreacion: defaultUser._id,
              fechaCreacion: parseDate(op.FEC_COMPRA || op.FECHA),
            });
            await vehiculo.save();
            vehiculosCreados++;
            vehiculoId = vehiculo._id;
          }
        }

        // Crear financiamiento
        const fechaCompra = parseDate(op.FEC_COMPRA || op.FECHA);
        const valorBase = parseNumber(op.VALOR_BASE);
        const valorCuota = parseNumber(op.VAL_CUOTA);
        const cuotas = parseInt(String(op.CUOTAS || '0').trim(), 10) || 1;
        const interesTotal = parseNumber(op.INTERES) || 0;
        const totFinanc = parseNumber(op.TOT_FINANC) || valorBase;
        const montoTotal = totFinanc || (valorBase + interesTotal);

        // Calcular fechas de cuotas
        const fechaPrimeraCuota = parseDate(op.FEC_COMPRA || op.FECHA);
        // Calcular fecha última cuota (aproximadamente)
        const fechaUltimaCuota = new Date(fechaPrimeraCuota);
        if (cuotas > 0) {
          fechaUltimaCuota.setMonth(fechaUltimaCuota.getMonth() + cuotas);
        }

        // Calcular saldo pendiente (asumiendo que no hay pagos aún, se actualizará después)
        const saldoPendiente = montoTotal;

        const financiamiento = new Financiamiento({
          cliente: clienteId,
          vehiculo: vehiculoId || undefined,
          empresa: empresaId,
          costoVehiculo: valorBase,
          valorBase: valorBase,
          cuotas: cuotas,
          valorCuota: valorCuota,
          interesTotal: interesTotal,
          montoTotal: montoTotal,
          fechaVenta: fechaCompra,
          fechaPrimeraCuota: fechaPrimeraCuota,
          fechaUltimaCuota: fechaUltimaCuota,
          cuotasPendientes: cuotas,
          cuotasPagadas: 0,
          montoPagado: 0,
          saldoPendiente: saldoPendiente,
          estadoFinanciamiento: 'activo',
          usuarioCreacion: defaultUser._id,
          usuarioRegistro: defaultUser._id,
        });

        await financiamiento.save();
        financiamientosCreados++;
        financiamientoMap.set(codOp, financiamiento._id);
        console.log(`  ✅ Financiamiento creado: CODOP ${codOp} - Cliente ${codCli}`);
      } catch (error) {
        console.error(`  ❌ Error procesando operación ${op.CODOP}:`, error.message);
      }
    }
    console.log(`✅ Vehículos creados: ${vehiculosCreados}`);
    console.log(`✅ Financiamientos creados: ${financiamientosCreados}\n`);

    // 4. MIGRAR PAGOS
    console.log('💰 Migrando pagos...');
    const pagos = pagosData.FORMAPAG || [];
    let pagosCreados = 0;
    let pagosOmitidos = 0;

    for (const pago of pagos) {
      try {
        const codOp = cleanString(pago.CODOP);
        const codCli = cleanString(pago.CODCLI);
        const fecha = parseDate(pago.FECHA);
        const importe = parseNumber(pago.IMPORTE);
        const comentario = cleanString(pago.COMENTARIO);

        if (!codOp || !importe || importe <= 0) {
          pagosOmitidos++;
          continue;
        }

        const financiamientoId = financiamientoMap.get(codOp);
        if (!financiamientoId) {
          // Intentar buscar por cliente si no encontramos por CODOP
          const clienteId = clienteMap.get(codCli);
          if (clienteId) {
            const fin = await Financiamiento.findOne({ cliente: clienteId }).sort({ fechaVenta: -1 });
            if (fin) {
              const pagoDoc = new PagoCuota({
                financiamiento: fin._id,
                montoPago: importe,
                fechaPago: fecha,
                metodoPago: 'efectivo',
                observaciones: comentario || undefined,
                usuarioRegistro: defaultUser._id,
                estadoPago: 'confirmado',
                esExtra: false,
              });
              await pagoDoc.save();
              pagosCreados++;

              // Actualizar financiamiento
              fin.montoPagado = (fin.montoPagado || 0) + importe;
              fin.saldoPendiente = Math.max(0, (fin.saldoPendiente || fin.montoTotal) - importe);
              await fin.save();
            } else {
              pagosOmitidos++;
            }
          } else {
            pagosOmitidos++;
          }
          continue;
        }

        const pagoDoc = new PagoCuota({
          financiamiento: financiamientoId,
          montoPago: importe,
          fechaPago: fecha,
          metodoPago: 'efectivo',
          observaciones: comentario || undefined,
          usuarioRegistro: defaultUser._id,
          estadoPago: 'confirmado',
          esExtra: false,
        });

        await pagoDoc.save();
        pagosCreados++;

        // Actualizar financiamiento
        const fin = await Financiamiento.findById(financiamientoId);
        if (fin) {
          fin.montoPagado = (fin.montoPagado || 0) + importe;
          fin.saldoPendiente = Math.max(0, (fin.saldoPendiente || fin.montoTotal) - importe);
          // Calcular cuotas pagadas aproximadas
          if (fin.valorCuota > 0) {
            fin.cuotasPagadas = Math.floor(fin.montoPagado / fin.valorCuota);
            fin.cuotasPendientes = Math.max(0, fin.cuotas - fin.cuotasPagadas);
          }
          await fin.save();
        }
      } catch (error) {
        console.error(`  ❌ Error procesando pago:`, error.message);
        pagosOmitidos++;
      }
    }
    console.log(`✅ Pagos migrados: ${pagosCreados} creados, ${pagosOmitidos} omitidos\n`);

    // Resumen final
    console.log('📊 RESUMEN DE MIGRACIÓN:');
    console.log(`  - Empresas: ${empresaMap.size}`);
    console.log(`  - Clientes: ${clienteMap.size}`);
    console.log(`  - Vehículos: ${vehiculosCreados}`);
    console.log(`  - Financiamientos: ${financiamientosCreados}`);
    console.log(`  - Pagos: ${pagosCreados}`);
    console.log('\n✅ Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar migración
migrateData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

