import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { MongoClient, ObjectId } from 'mongodb';

// CONFIG
const DATA_DIR = path.join('.', 'data');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'ciompi';

// Helpers
function readXMLFile(fileName) {
  const full = path.join(DATA_DIR, fileName);
  const raw = fs.readFileSync(full, 'binary');
  return parseStringPromise(raw, {
    explicitArray: false,
    attrkey: '$',
    charkey: '_',
    trim: true,
    mergeAttrs: false,
  });
}

function normalizeCod(s) {
  if (s == null) return '';
  return String(s).trim().replace(/^\+/, '').replace(/\s+/g, '');
}

function toNumber(val) {
  if (val == null) return 0;
  const s = String(val)
    .trim()
    .replace(/[^0-9.-]/g, '');
  const n = Number(s);
  return Number.isNaN(n) ? 0 : n;
}

function parseFechaRaw(str) {
  if (!str) return null;
  const s = String(str).trim();
  const ymd = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (ymd) return new Date(`${ymd[1]}-${ymd[2]}-${ymd[3]}`);
  const dmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dmy) return new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}`);
  if (/\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);
  // fallback
  const n = Number(s);
  if (!Number.isNaN(n)) return new Date(n);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
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

function addMonths(date, months) {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // handle month overflow (e.g., Jan 31 + 1 month -> Feb 28/29)
  if (d.getDate() < day) {
    d.setDate(0); // last day previous month
  }
  return d;
}

function generateSchedule(startDate, count) {
  const schedule = [];
  for (let i = 0; i < count; i++) {
    const fecha = addMonths(startDate, i);
    schedule.push(fecha);
  }
  return schedule;
}

// Main
async function run() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const Clientes = db.collection('clientes');
  const Empresas = db.collection('empresas');
  const Financiamientos = db.collection('financiamientos');
  const PagoCuotas = db.collection('pagocuotas');
  const Vehiculos = db.collection('vehiculos');

  // Read XMLs
  console.log('Leyendo XMLs...');
  const parsedClientes = await readXMLFile('clientes.XML');
  const parsedOperac = await readXMLFile('operac.XML');
  const parsedFormap = await readXMLFile('formaPag.XML');
  const parsedEmpre = await readXMLFile('empre.XML');

  const clientesRows = extractRows(parsedClientes);
  const operacRows = extractRows(parsedOperac);
  const formapRows = extractRows(parsedFormap);
  const empreRows = extractRows(parsedEmpre);

  console.log('Registros:', {
    clientes: clientesRows.length,
    operac: operacRows.length,
    pagos: formapRows.length,
    empresas: empreRows.length,
  });

  // --- Insert/ensure empresas
  const empresaIdMap = {};
  for (const e of empreRows) {
    const code = normalizeCod(e.CODEMP || e.CODEMP?.toString());
    const doc = {
      _id: new ObjectId(),
      nombre: e.EMPRESA || '',
      descripcion: '',
      telefono: e.TELEFONO || '',
      estado: 'activa',
      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioRegistro: 'emigracion',
      usuarioModificacion: new ObjectId(),
    };
    await Empresas.insertOne(doc);
    empresaIdMap[code] = doc._id;
  }

  // --- Insert clientes
  const clienteIdMap = {};
  for (const c of clientesRows) {
    const cod = normalizeCod(c.CODCLI || c.COD || c.COD_CLIE);
    const doc = {
      _id: new ObjectId(),
      CODCLI: cod,
      NOMBRE: c.NOMBRE || '',
      DIRECCION: c.DIRECCION || '',
      TELEFONO: c.TELEFONO || '',
      cedula: c.CEDULA || c.REFERENCIA || '',
      correo: c.CORREO || '',
      profesion: c.PROFESION || c.OBS || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioCreacion: new ObjectId(),
      usuarioModificacion: null,
    };
    await Clientes.insertOne(doc);
    clienteIdMap[cod] = doc._id;
  }

  // --- Build payments map by CODOP
  const pagosByOp = {};
  for (const p of formapRows) {
    const codop = normalizeCod(p.CODOP || p.CODOP?.toString());
    if (!pagosByOp[codop]) pagosByOp[codop] = [];
    const fecha = parseFechaRaw(p.FECHA || p.fecha);
    const importe = toNumber(p.IMPORTE || p.importe);
    const saldo = toNumber(p.SALDO || p.saldo);
    const pagado = importe - saldo;
    pagosByOp[codop].push({ fecha, importe, saldo, pagado, raw: p });
  }

  // sort payments by date for each operation
  for (const k of Object.keys(pagosByOp))
    pagosByOp[k].sort((a, b) => (a.fecha || 0) - (b.fecha || 0));

  // --- Process operations -> financiamientos + vehiculos + pagos
  let tempClients = 0;
  for (const op of operacRows) {
    const codcli = normalizeCod(op.CODCLI || op.CODCLI?.toString());
    const codop = normalizeCod(op.CODOP || op.CODOP?.toString());
    const codemp = normalizeCod(op.CODEMP || op.CODEMP?.toString());

    // ensure cliente exists
    if (!clienteIdMap[codcli]) {
      const tmp = {
        _id: new ObjectId(),
        CODCLI: codcli,
        NOMBRE: `CLIENTE DESCONOCIDO ${codcli}`,
        DIRECCION: '',
        TELEFONO: '',
        cedula: '',
        correo: '',
        profesion: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        usuarioCreacion: new ObjectId(),
        usuarioModificacion: null,
      };
      await Clientes.insertOne(tmp);
      clienteIdMap[codcli] = tmp._id;
      tempClients++;
      console.log('Cliente temporal creado:', codcli);
    }

    const clienteId = clienteIdMap[codcli];
    const empresaId = empresaIdMap[codemp] || null;

    // create vehiculo (model requires fields)
    const veh = {
      _id: new ObjectId(),
      Marca: op.MARCA || '',
      Modelo: op.MODELO || op.MODEL || '',
      Color: op.COLOR || '',
      Matricula: op.MATRICULA || op.MATRICULA?.toString() || '',
      Año: toNumber(op.ANIO || op.AÑO || op.ANIO?.toString()),
      Padron: op.PADRON || '',
      Descripcion: op.DESCRIPCION || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioCreacion: new ObjectId(),
      usuarioModificacion: new ObjectId(),
      disponible: false,
    };
    await Vehiculos.insertOne(veh);

    // Determine schedule (cuotas)
    const cuotasCount = Number(op.CUOTAS ? toNumber(op.CUOTAS) : 0) || 0;
    const valorCuota = toNumber(
      op.VAL_CUOTA || op.VAL_CUOTA?.toString() || op.VALOR_CUOTA
    );
    const fechaInicio =
      parseFechaRaw(op.FEC_COMPRA || op.FECHA || op.FEC_VENTA) || new Date();
    let cuotasFuturas = [];
    if (cuotasCount > 0) {
      const sched = generateSchedule(fechaInicio, cuotasCount);
      cuotasFuturas = sched.map((d, i) => ({
        _id: new ObjectId(),
        numeroCuota: i + 1,
        fechaVencimiento: new Date(d.getTime() + 12 * 3600 * 1000),
        valorCuota: valorCuota,
        estadoCuota: 'pendiente',
        montoPagado: 0,
      }));
    } else {
      // fallback: try to use pagos dates if present
      const pagos = pagosByOp[codop] || [];
      if (pagos.length > 0) {
        cuotasFuturas = pagos.map((p, i) => ({
          _id: new ObjectId(),
          numeroCuota: i + 1,
          fechaVencimiento: p.fecha || fechaInicio,
          valorCuota: valorCuota || p.importe,
        }));
      }
    }

    const totFinanc = toNumber(
      op.TOT_FINANC ||
        op.TOT_FINANC?.toString() ||
        op.TOT_PREST ||
        op.TOT_PREST?.toString()
    );
    const montoTotal = totFinanc || valorCuota * cuotasFuturas.length;

    const financiamiento = {
      _id: new ObjectId(),
      __v: 0,
      cliente: clienteId,
      cliente2: null,
      empresa: empresaId,
      vehiculo: veh._id,
      estadoFinanciamiento: 'activo', // luego se cambia a finalizado si todas pagas,
      fechaVenta:
        parseFechaRaw(op.FECHA || op.FEC_COMPRA || op.FEC_VENTA) || new Date(),
      fechaPrimeraCuota: cuotasFuturas[0]
        ? cuotasFuturas[0].fechaVencimiento
        : null,
      fechaUltimaCuota: cuotasFuturas.length
        ? cuotasFuturas[cuotasFuturas.length - 1].fechaVencimiento
        : null,
      costoVehiculo: toNumber(
        op.VALOR_BASE || op.VALOR_BASE?.toString() || op.VALOR_BASE
      ),
      valorBase: toNumber(op.VALOR_BASE || op.VALOR_BASE?.toString()),
      valorCuota: valorCuota,
      interesTotal: toNumber(op.INTERES || op.INTERES?.toString() || 0),
      montoTotal: montoTotal,
      montoPagado: 0,
      saldoPendiente: montoTotal, // se ajustará luego con pagos,
      cuotas: cuotasFuturas.length,
      cuotasPendientes: cuotasFuturas.length,
      cuotasPagadas: 0,
      cuotasExtras: 0,
      cuotasFuturas: cuotasFuturas,
      gastosExtras: toNumber(op.GASTOS_COM || op.GASTOS_COM?.toString()),
      costosDocumentacion: 0,
      observaciones: op.OBSERVACIONES || op.COMENTARIO || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioRegistro: new ObjectId(),
      usuarioCreacion: new ObjectId(),
      usuarioModificacion: new ObjectId(),
    };

    await Financiamientos.insertOne(financiamiento);

    // Apply payments
    const pagos = pagosByOp[codop] || [];
    let cuotaIndex = 0; // index in cuotasFuturas
    for (const p of pagos) {
      const pagado = p.pagado || 0;
      if (pagado <= 0) continue; // nothing to apply
      let restante = pagado;
      while (restante > 0 && cuotaIndex < financiamiento.cuotasFuturas.length) {
        const cuota = financiamiento.cuotasFuturas[cuotaIndex];
        const valor = cuota.valorCuota || financiamiento.valorCuota || 0;
        const aplicar = Math.min(restante, valor);

        const pagoDoc = {
          _id: new ObjectId(),
          financiamiento: financiamiento._id,
          numeroCuota: cuota.numeroCuota,
          metodoPago: 'EFECTIVO',
          banco: '',
          estadoCuota: aplicar === valor ? 'pagada' : 'parcial',
          montoPago: aplicar,
          fechaPago: p.fecha
            ? new Date(p.fecha.getTime() + 86400000)
            : parseFechaRaw(p.raw?.FECHA) || new Date(),
          numeroComprobante: '',
          observaciones: p.raw?.COMENTARIO || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          usuarioRegistro: new ObjectId(),
        };
        await PagoCuotas.insertOne(pagoDoc);

        restante -= aplicar;
        financiamiento.montoPagado += aplicar;
        financiamiento.saldoPendiente = Math.max(
          0,
          financiamiento.saldoPendiente - aplicar
        );

        if (aplicar === valor) {
          financiamiento.cuotasPagadas += 1;
          financiamiento.cuotasPendientes = Math.max(
            0,
            financiamiento.cuotasPendientes - 1
          );
          cuotaIndex += 1;
        } else {
          // partial -> leave cuotaIndex as is
          break;
        }
      }
    }

    // final update to financiamiento totals
    // await // determinar estado final
    const estadoFinal =
      financiamiento.cuotasPagadas === financiamiento.cuotas
        ? 'finalizado'
        : 'activo';

    await Financiamientos.updateOne(
      { _id: financiamiento._id },
      {
        $set: {
          montoPagado: financiamiento.montoPagado,
          saldoPendiente: financiamiento.saldoPendiente,
          cuotasPagadas: financiamiento.cuotasPagadas,
          cuotasPendientes: financiamiento.cuotasPendientes,
          estadoFinanciamiento: estadoFinal,
          updatedAt: new Date(),
        },
      }
    );
  }

  console.log('Migración completa. Clientes temporales creados:', tempClients);
  await client.close();
}

run().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
