import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { MongoClient, ObjectId } from 'mongodb';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const DATA_DIR = path.join('.', 'data');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'ciompi';

// IDs de usuario por defecto para la migración
const DEFAULT_USER_ID = new ObjectId();

// ============================================================================
// UTILIDADES DE ARCHIVOS XML
// ============================================================================
function readXMLFile(fileName) {
  const fullPath = path.join(DATA_DIR, fileName);
  console.log(`📄 Leyendo archivo: ${fileName}`);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Archivo no encontrado: ${fileName}`);
    return null;
  }

  const raw = fs.readFileSync(fullPath, 'binary');
  return parseStringPromise(raw, {
    explicitArray: false,
    attrkey: '$',
    charkey: '_',
    trim: true,
    mergeAttrs: false,
  });
}

function extractRows(parsed) {
  if (!parsed) return [];
  
  let records = parsed.RECORDS || parsed;
  let recArray = records.RECORD;
  
  if (!recArray) return [];
  if (!Array.isArray(recArray)) recArray = [recArray];
  
  const out = [];
  for (const r of recArray) {
    let row = r.ROW || r;
    if (!row) continue;
    if (Array.isArray(row)) row = row[0];
    if (row.$) out.push(row.$);
    else out.push(row);
  }
  
  return out;
}

// ============================================================================
// UTILIDADES DE NORMALIZACIÓN
// ============================================================================
function normalizeCod(s) {
  if (s == null) return '';
  return String(s)
    .trim()
    .replace(/^\+/, '')
    .replace(/\s+/g, '');
}

function toNumber(val) {
  if (val == null) return 0;
  const s = String(val)
    .trim()
    .replace(/[^0-9.-]/g, '');
  const n = Number(s);
  return Number.isNaN(n) ? 0 : n;
}

function cleanString(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\*+$/, ''); // Remover asteriscos al final
}

// ============================================================================
// UTILIDADES DE FECHAS (MEJORADAS)
// ============================================================================

/**
 * Parsea fechas en múltiples formatos
 * Soporta: YYYYMMDD, DD.MM.YYYY, YYYY-MM-DD, timestamps
 */
function parseFechaRaw(str) {
  if (!str) return null;
  
  const s = String(str).trim();
  
  // Formato YYYYMMDD (ej: 19990120)
  const ymd = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (ymd) {
    const year = parseInt(ymd[1]);
    const month = parseInt(ymd[2]);
    const day = parseInt(ymd[3]);
    
    // Validar fecha
    if (year < 1900 || year > 2100) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    
    const date = new Date(year, month - 1, day);
    
    // Verificar que la fecha sea válida (ej: no 31 de febrero)
    if (date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
      console.warn(`⚠️  Fecha inválida: ${s}`);
      return null;
    }
    
    return date;
  }
  
  // Formato DD.MM.YYYY
  const dmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1]);
    const month = parseInt(dmy[2]);
    const year = parseInt(dmy[3]);
    
    if (year < 1900 || year > 2100) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    
    const date = new Date(year, month - 1, day);
    
    if (date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
      return null;
    }
    
    return date;
  }
  
  // Formato ISO (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const date = new Date(s);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Timestamp numérico
  const n = Number(s);
  if (!Number.isNaN(n) && n > 0) {
    const date = new Date(n);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Intento final con Date constructor
  const date = new Date(s);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Suma meses a una fecha manejando overflow
 */
function addMonths(date, months) {
  if (!date) return null;
  
  const d = new Date(date.getTime());
  const day = d.getDate();
  
  d.setMonth(d.getMonth() + months);
  
  // Manejar overflow (ej: 31 de enero + 1 mes = 28/29 de febrero)
  if (d.getDate() < day) {
    d.setDate(0); // Último día del mes anterior
  }
  
  return d;
}

/**
 * Genera cronograma de cuotas
 */
function generateSchedule(startDate, count) {
  if (!startDate || count <= 0) return [];
  
  const schedule = [];
  for (let i = 0; i < count; i++) {
    const fecha = addMonths(startDate, i);
    if (fecha) {
      schedule.push(fecha);
    }
  }
  
  return schedule;
}

// ============================================================================
// EXTRACCIÓN DE DATOS DE CLIENTES
// ============================================================================

/**
 * Extrae información estructurada del campo NOMBRE que suele contener
 * nombre, cédula y teléfonos mezclados
 * Ej: "BOGGIO PEREZ PABLO 4819595*" o "MENDEZ ROY 2115000 099105420*"
 */
function parseClienteInfo(nombreRaw, direccionRaw) {
  const info = {
    nombre: '',
    cedula: '',
    telefonos: [],
  };

  if (!nombreRaw) return info;

  const clean = cleanString(nombreRaw);
  
  // Extraer números (potencialmente cédulas y teléfonos)
  const numeros = clean.match(/\d+/g) || [];
  
  // Extraer el nombre (todo lo que no sean números)
  const nombreParts = clean
    .split(/\d+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  info.nombre = nombreParts.join(' ').trim();
  
  // Clasificar números: cédulas (6-8 dígitos) vs teléfonos (8-9 dígitos)
  for (const num of numeros) {
    if (num.length >= 6 && num.length <= 8 && !info.cedula) {
      // Probablemente una cédula
      info.cedula = num;
    } else if (num.length >= 8 && num.length <= 11) {
      // Probablemente un teléfono
      info.telefonos.push(num);
    }
  }
  
  // Si DIRECCION también tiene números, pueden ser teléfonos
  if (direccionRaw) {
    const direccionNums = String(direccionRaw).match(/\d{8,11}/g) || [];
    info.telefonos.push(...direccionNums);
  }
  
  // Remover duplicados de teléfonos
  info.telefonos = [...new Set(info.telefonos)];
  
  return info;
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE MIGRACIÓN
// ============================================================================
async function run() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log('\n🚀 Iniciando migración de datos...\n');
    console.log(`📦 Base de datos: ${DB_NAME}`);
    console.log(`🔗 URI: ${MONGO_URI}\n`);
    
    await client.connect();
    console.log('✅ Conectado a MongoDB\n');
    
    const db = client.db(DB_NAME);
    
    // Colecciones
    const Clientes = db.collection('clientes');
    const Empresas = db.collection('empresas');
    const Financiamientos = db.collection('financiamientos');
    const PagoCuotas = db.collection('pagocuotas');
    const Vehiculos = db.collection('vehiculos');
    
    // ========================================================================
    // LEER ARCHIVOS XML
    // ========================================================================
    console.log('📖 Leyendo archivos XML...\n');
    
    const parsedClientes = await readXMLFile('clientes.XML');
    const parsedOperac = await readXMLFile('operac.XML');
    const parsedFormap = await readXMLFile('formaPag.XML');
    const parsedEmpre = await readXMLFile('empre.XML');
    
    const clientesRows = extractRows(parsedClientes);
    const operacRows = extractRows(parsedOperac);
    const formapRows = extractRows(parsedFormap);
    const empreRows = extractRows(parsedEmpre);
    
    console.log('\n📊 Registros encontrados:');
    console.log(`   • Clientes: ${clientesRows.length}`);
    console.log(`   • Operaciones: ${operacRows.length}`);
    console.log(`   • Pagos: ${formapRows.length}`);
    console.log(`   • Empresas: ${empreRows.length}\n`);
    
    // Estadísticas
    const stats = {
      empresas: { creadas: 0, errores: 0 },
      clientes: { creados: 0, temporales: 0, errores: 0 },
      vehiculos: { creados: 0, errores: 0 },
      financiamientos: { creados: 0, finalizados: 0, activos: 0, errores: 0 },
      pagos: { creados: 0, errores: 0 },
    };
    
    // ========================================================================
    // MIGRAR EMPRESAS
    // ========================================================================
    console.log('🏢 Migrando empresas...');
    const empresaIdMap = {};
    
    for (const e of empreRows) {
      try {
        const code = normalizeCod(e.CODEMP);
        
        if (!code) {
          console.warn('⚠️  Empresa sin código, omitiendo');
          continue;
        }
        
        // Verificar si ya existe
        const existente = await Empresas.findOne({ 
          $or: [
            { codigo: code },
            { nombre: e.EMPRESA }
          ]
        });
        
        if (existente) {
          empresaIdMap[code] = existente._id;
          console.log(`   ℹ️  Empresa ya existe: ${e.EMPRESA} (${code})`);
          continue;
        }
        
        const doc = {
          _id: new ObjectId(),
          codigo: code,
          nombre: cleanString(e.EMPRESA) || `Empresa ${code}`,
          descripcion: '',
          telefono: cleanString(e.TELEFONO) || '',
          estado: 'activa',
          usuarioRegistro: DEFAULT_USER_ID,
          usuarioModificacion: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await Empresas.insertOne(doc);
        empresaIdMap[code] = doc._id;
        stats.empresas.creadas++;
        
        console.log(`   ✅ Empresa creada: ${doc.nombre} (${code})`);
      } catch (error) {
        stats.empresas.errores++;
        console.error(`   ❌ Error con empresa ${e.CODEMP}:`, error.message);
      }
    }
    
    console.log(`\n✨ Empresas: ${stats.empresas.creadas} creadas, ${stats.empresas.errores} errores\n`);
    
    // ========================================================================
    // MIGRAR CLIENTES
    // ========================================================================
    console.log('👥 Migrando clientes...');
    const clienteIdMap = {};
    
    for (const c of clientesRows) {
      try {
        const cod = normalizeCod(c.CODCLI || c.COD || c.COD_CLIE);
        
        if (!cod) {
          console.warn('⚠️  Cliente sin código, omitiendo');
          continue;
        }
        
        // Verificar si ya existe
        const existente = await Clientes.findOne({ CODCLI: cod });
        
        if (existente) {
          clienteIdMap[cod] = existente._id;
          console.log(`   ℹ️  Cliente ya existe: ${existente.NOMBRE} (${cod})`);
          continue;
        }
        
        // Extraer información del nombre
        const info = parseClienteInfo(c.NOMBRE, c.DIRECCION);
        
        const doc = {
          _id: new ObjectId(),
          CODCLI: cod,
          NOMBRE: info.nombre || `Cliente ${cod}`,
          DIRECCION: cleanString(c.DIRECCION) || '',
          TELEFONO: info.telefonos[0] || '',
          cedula: info.cedula || '',
          correo: cleanString(c.CORREO || c.EMAIL) || '',
          profesion: cleanString(c.PROFESION || c.OBS) || '',
          usuarioCreacion: DEFAULT_USER_ID,
          usuarioModificacion: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await Clientes.insertOne(doc);
        clienteIdMap[cod] = doc._id;
        stats.clientes.creados++;
        
        console.log(`   ✅ Cliente creado: ${doc.NOMBRE} (${cod})`);
      } catch (error) {
        stats.clientes.errores++;
        console.error(`   ❌ Error con cliente ${c.CODCLI}:`, error.message);
      }
    }
    
    console.log(`\n✨ Clientes: ${stats.clientes.creados} creados, ${stats.clientes.errores} errores\n`);
    
    // ========================================================================
    // CONSTRUIR MAPA DE PAGOS
    // ========================================================================
    console.log('💰 Procesando pagos...');
    const pagosByOp = {};
    
    for (const p of formapRows) {
      const codop = normalizeCod(p.CODOP);
      if (!codop) continue;
      
      if (!pagosByOp[codop]) pagosByOp[codop] = [];
      
      const fecha = parseFechaRaw(p.FECHA);
      const importe = toNumber(p.IMPORTE);
      const saldo = toNumber(p.SALDO);
      const pagado = importe - saldo;
      
      if (fecha) {
        pagosByOp[codop].push({ 
          fecha, 
          importe, 
          saldo, 
          pagado: pagado > 0 ? pagado : 0, 
          raw: p 
        });
      } else {
        console.warn(`   ⚠️  Pago con fecha inválida en CODOP ${codop}: ${p.FECHA}`);
      }
    }
    
    // Ordenar pagos por fecha
    for (const k of Object.keys(pagosByOp)) {
      pagosByOp[k].sort((a, b) => a.fecha - b.fecha);
    }
    
    console.log(`   ℹ️  Pagos agrupados por ${Object.keys(pagosByOp).length} operaciones\n`);
    
    // ========================================================================
    // MIGRAR OPERACIONES -> FINANCIAMIENTOS + VEHÍCULOS + PAGOS
    // ========================================================================
    console.log('🚗 Migrando operaciones y financiamientos...\n');
    
    for (let i = 0; i < operacRows.length; i++) {
      const op = operacRows[i];
      
      try {
        const codcli = normalizeCod(op.CODCLI);
        const codop = normalizeCod(op.CODOP);
        const codemp = normalizeCod(op.CODEMP);
        
        console.log(`\n[${i + 1}/${operacRows.length}] Procesando operación CODOP: ${codop}`);
        
        // Verificar si ya existe
        const existenteFin = await Financiamientos.findOne({ codigoOperacion: codop });
        if (existenteFin) {
          console.log(`   ℹ️  Financiamiento ya existe, omitiendo`);
          continue;
        }
        
        // ====================================================================
        // CLIENTE
        // ====================================================================
        let clienteId = clienteIdMap[codcli];
        
        // Si no existe el cliente, crear uno temporal
        if (!clienteId) {
          console.log(`   ⚠️  Cliente ${codcli} no encontrado, creando temporal...`);
          
          const tempCliente = {
            _id: new ObjectId(),
            CODCLI: codcli,
            NOMBRE: `CLIENTE DESCONOCIDO ${codcli}`,
            DIRECCION: '',
            TELEFONO: '',
            cedula: '',
            correo: '',
            profesion: '',
            usuarioCreacion: DEFAULT_USER_ID,
            usuarioModificacion: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await Clientes.insertOne(tempCliente);
          clienteId = tempCliente._id;
          clienteIdMap[codcli] = clienteId;
          stats.clientes.temporales++;
          
          console.log(`   ✅ Cliente temporal creado`);
        }
        
        // ====================================================================
        // EMPRESA
        // ====================================================================
        const empresaId = empresaIdMap[codemp] || null;
        
        if (!empresaId && codemp) {
          console.warn(`   ⚠️  Empresa ${codemp} no encontrada`);
        }
        
        // ====================================================================
        // VEHÍCULO
        // ====================================================================
        const veh = {
          _id: new ObjectId(),
          Marca: cleanString(op.MARCA) || 'Sin especificar',
          Modelo: cleanString(op.MODELO || op.MODEL) || '',
          Color: cleanString(op.COLOR) || '',
          Matricula: cleanString(op.MATRICULA) || '',
          Año: toNumber(op.ANIO || op.AÑO) || null,
          Padron: cleanString(op.PADRON) || '',
          Descripcion: cleanString(op.DESCRIPCION) || '',
          disponible: false,
          usuarioCreacion: DEFAULT_USER_ID,
          usuarioModificacion: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await Vehiculos.insertOne(veh);
        stats.vehiculos.creados++;
        console.log(`   ✅ Vehículo creado: ${veh.Marca} ${veh.Modelo} (${veh.Matricula})`);
        
        // ====================================================================
        // FECHAS Y CRONOGRAMA
        // ====================================================================
        const cuotasCount = Math.max(0, toNumber(op.CUOTAS));
        const valorCuota = toNumber(op.VAL_CUOTA || op.VALOR_CUOTA);
        
        // Fecha de inicio
        let fechaInicio = parseFechaRaw(op.FEC_COMPRA || op.FECHA || op.FEC_VENTA);
        if (!fechaInicio) {
          fechaInicio = new Date();
          console.warn(`   ⚠️  Fecha inválida, usando fecha actual`);
        }
        
        // Generar cronograma de cuotas
        let cuotasFuturas = [];
        
        if (cuotasCount > 0) {
          const sched = generateSchedule(fechaInicio, cuotasCount);
          cuotasFuturas = sched.map((d, idx) => ({
            numeroCuota: idx + 1,
            fechaVencimiento: d,
            valorCuota: valorCuota,
            estadoCuota: 'pendiente',
          }));
          
          console.log(`   ℹ️  Generadas ${cuotasFuturas.length} cuotas desde ${fechaInicio.toISOString().split('T')[0]}`);
        } else {
          // Si no hay cuotas especificadas, usar fechas de pagos
          const pagos = pagosByOp[codop] || [];
          if (pagos.length > 0) {
            cuotasFuturas = pagos.map((p, idx) => ({
              numeroCuota: idx + 1,
              fechaVencimiento: p.fecha,
              valorCuota: valorCuota || p.importe,
              estadoCuota: 'pendiente',
            }));
            console.log(`   ℹ️  Generadas ${cuotasFuturas.length} cuotas desde pagos`);
          }
        }
        
        // ====================================================================
        // MONTOS Y VALORES
        // ====================================================================
        const valorBase = toNumber(op.VALOR_BASE);
        const totFinanc = toNumber(op.TOT_FINANC || op.TOT_PREST);
        const interesTotal = toNumber(op.INTERES);
        const gastosExtras = toNumber(op.GASTOS_COM);
        
        const montoTotal = totFinanc || (valorCuota * cuotasFuturas.length) || valorBase;
        const costoVehiculo = valorBase || montoTotal;
        
        // ====================================================================
        // CREAR FINANCIAMIENTO
        // ====================================================================
        const financiamiento = {
          _id: new ObjectId(),
          codigoOperacion: codop, // Para evitar duplicados
          cliente: clienteId,
          cliente2: null,
          empresa: empresaId,
          vehiculo: veh._id,
          
          // Montos
          costoVehiculo: costoVehiculo,
          valorBase: valorBase,
          costosDocumentacion: 0,
          gastosExtras: gastosExtras,
          
          // Cuotas
          cuotas: cuotasFuturas.length,
          cuotasExtras: 0,
          valorCuota: valorCuota,
          interesTotal: interesTotal,
          montoTotal: montoTotal,
          
          // Fechas
          fechaVenta: fechaInicio,
          fechaPrimeraCuota: cuotasFuturas[0]?.fechaVencimiento || fechaInicio,
          fechaUltimaCuota: cuotasFuturas.length 
            ? cuotasFuturas[cuotasFuturas.length - 1].fechaVencimiento 
            : fechaInicio,
          
          // Estado inicial
          estadoFinanciamiento: 'activo',
          cuotasPagadas: 0,
          cuotasPendientes: cuotasFuturas.length,
          montoPagado: 0,
          saldoPendiente: montoTotal,
          
          // Cuotas futuras
          cuotasFuturas: cuotasFuturas,
          
          // Observaciones
          observaciones: cleanString(op.OBSERVACIONES || op.COMENTARIO) || '',
          
          // Auditoría
          usuarioRegistro: DEFAULT_USER_ID,
          usuarioCreacion: DEFAULT_USER_ID,
          usuarioModificacion: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await Financiamientos.insertOne(financiamiento);
        console.log(`   ✅ Financiamiento creado: ${cuotasFuturas.length} cuotas, $${montoTotal}`);
        
        // ====================================================================
        // APLICAR PAGOS
        // ====================================================================
        const pagos = pagosByOp[codop] || [];
        
        if (pagos.length > 0) {
          console.log(`   💰 Aplicando ${pagos.length} pagos...`);
          
          let cuotaIndex = 0;
          let pagosAplicados = 0;
          
          for (const pago of pagos) {
            const pagado = pago.pagado || 0;
            
            if (pagado <= 0) continue;
            
            let restante = pagado;
            
            // Aplicar el pago a las cuotas
            while (restante > 0 && cuotaIndex < financiamiento.cuotasFuturas.length) {
              const cuota = financiamiento.cuotasFuturas[cuotaIndex];
              const valorCuotaActual = cuota.valorCuota || financiamiento.valorCuota || 0;
              const aplicar = Math.min(restante, valorCuotaActual);
              
              const estadoCuota = aplicar >= valorCuotaActual ? 'pagada' : 'parcial';
              
              const pagoDoc = {
                _id: new ObjectId(),
                financiamiento: financiamiento._id,
                numeroCuota: cuota.numeroCuota,
                metodoPago: 'efectivo',
                estadoPago: 'confirmado',
                montoPago: aplicar,
                fechaPago: pago.fecha,
                banco: '',
                numeroComprobante: '',
                observaciones: cleanString(pago.raw?.COMENTARIO) || '',
                esExtra: false,
                usuarioRegistro: DEFAULT_USER_ID,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              
              await PagoCuotas.insertOne(pagoDoc);
              
              // Actualizar estado de la cuota
              financiamiento.cuotasFuturas[cuotaIndex].estadoCuota = estadoCuota;
              
              // Actualizar totales
              restante -= aplicar;
              financiamiento.montoPagado += aplicar;
              financiamiento.saldoPendiente = Math.max(0, financiamiento.saldoPendiente - aplicar);
              
              if (estadoCuota === 'pagada') {
                financiamiento.cuotasPagadas += 1;
                financiamiento.cuotasPendientes = Math.max(0, financiamiento.cuotasPendientes - 1);
                cuotaIndex += 1;
              } else {
                // Pago parcial, mantenerse en la misma cuota
                break;
              }
              
              pagosAplicados++;
              stats.pagos.creados++;
            }
          }
          
          console.log(`   ✅ ${pagosAplicados} pagos aplicados`);
        }
        
        // ====================================================================
        // DETERMINAR ESTADO FINAL
        // ====================================================================
        const estadoFinal = financiamiento.cuotasPagadas >= financiamiento.cuotas
          ? 'finalizado'
          : financiamiento.cuotasPagadas > 0
            ? 'activo'
            : 'activo';
        
        // Actualizar financiamiento con valores finales
        await Financiamientos.updateOne(
          { _id: financiamiento._id },
          {
            $set: {
              estadoFinanciamiento: estadoFinal,
              montoPagado: financiamiento.montoPagado,
              saldoPendiente: financiamiento.saldoPendiente,
              cuotasPagadas: financiamiento.cuotasPagadas,
              cuotasPendientes: financiamiento.cuotasPendientes,
              cuotasFuturas: financiamiento.cuotasFuturas,
              updatedAt: new Date(),
            },
          }
        );
        
        if (estadoFinal === 'finalizado') {
          stats.financiamientos.finalizados++;
        } else {
          stats.financiamientos.activos++;
        }
        
        stats.financiamientos.creados++;
        
        console.log(`   ✅ Estado final: ${estadoFinal.toUpperCase()}`);
        console.log(`   ℹ️  Progreso: ${financiamiento.cuotasPagadas}/${financiamiento.cuotas} cuotas pagadas`);
        console.log(`   ℹ️  Saldo: $${financiamiento.saldoPendiente.toFixed(2)}`);
        
      } catch (error) {
        stats.financiamientos.errores++;
        console.error(`   ❌ Error procesando operación ${op.CODOP}:`, error.message);
      }
    }
    
    // ========================================================================
    // RESUMEN FINAL
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(70));
    console.log(`\n🏢 Empresas:`);
    console.log(`   • Creadas: ${stats.empresas.creadas}`);
    console.log(`   • Errores: ${stats.empresas.errores}`);
    
    console.log(`\n👥 Clientes:`);
    console.log(`   • Creados: ${stats.clientes.creados}`);
    console.log(`   • Temporales: ${stats.clientes.temporales}`);
    console.log(`   • Errores: ${stats.clientes.errores}`);
    
    console.log(`\n🚗 Vehículos:`);
    console.log(`   • Creados: ${stats.vehiculos.creados}`);
    console.log(`   • Errores: ${stats.vehiculos.errores}`);
    
    console.log(`\n💼 Financiamientos:`);
    console.log(`   • Creados: ${stats.financiamientos.creados}`);
    console.log(`   • Finalizados: ${stats.financiamientos.finalizados}`);
    console.log(`   • Activos: ${stats.financiamientos.activos}`);
    console.log(`   • Errores: ${stats.financiamientos.errores}`);
    
    console.log(`\n💰 Pagos:`);
    console.log(`   • Creados: ${stats.pagos.creados}`);
    console.log(`   • Errores: ${stats.pagos.errores}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERROR FATAL EN MIGRACIÓN:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada\n');
  }
}

// ============================================================================
// EJECUTAR
// ============================================================================
run().catch(err => {
  console.error('\n💥 ERROR:', err);
  process.exit(1);
});

