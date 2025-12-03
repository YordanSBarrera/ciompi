// === migrar-xml-pagos.js ===
// Basado en migrar-xml.js, con lógica NUEVA para registrar pagos reales

import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb://localhost:27017/ciompi';
const client = new MongoClient(uri);

// -----------------------------
//  Helpers
// -----------------------------
function readXML(file) {
  const full = path.join('data', file);
  const raw = fs.readFileSync(full, 'binary');
  return parseStringPromise(raw, {
    explicitArray: false,
    attrkey: '$',
    trim: true,
  });
}

function parseFecha(str) {
  if (!str) return new Date();
  const s = str.toString();
  const ymd = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (ymd) return new Date(`${ymd[1]}-${ymd[2]}-${ymd[3]}`);
  return new Date(s);
}

function toNumber(v) {
  if (v == null) return 0;
  const n = Number(v.toString().trim());
  return isNaN(n) ? 0 : n;
}

function normalizeCod(val) {
  return val ? val.toString().trim() : '';
}

function extractRows(parsed) {
  const out = [];
  if (!parsed || !parsed.RECORDS || !parsed.RECORDS.RECORD) return out;
  let recs = parsed.RECORDS.RECORD;
  if (!Array.isArray(recs)) recs = [recs];
  for (const r of recs) {
    const row = r.ROW;
    if (!row) continue;
    out.push(row.$ ? row.$ : row);
  }
  return out;
}

// --------------------------------------------------------------
//  MAIN
// --------------------------------------------------------------
async function run() {
  await client.connect();
  const db = client.db('ciompi');

  const Clientes = db.collection('clientes');
  const Empresas = db.collection('empresas');
  const Financiamientos = db.collection('financiamientos');
  const PagoCuotas = db.collection('pagocuotas');
  const Vehiculos = db.collection('vehiculos');

  // -----------------------------
  //  Load XML files
  // -----------------------------
  const cliXML = await readXML('clientes.XML');
  const opXML = await readXML('operac.XML');
  const fpXML = await readXML('formaPag.XML');
  const empXML = await readXML('empre.XML');

  const clientesArr = extractRows(cliXML);
  const operacArr = extractRows(opXML);
  const formapArr = extractRows(fpXML);
  const empreArr = extractRows(empXML);

  console.log('Clientes:', clientesArr.length);
  console.log('Operac:', operacArr.length);
  console.log('FormaPag:', formapArr.length);
  console.log('Empresas:', empreArr.length);

  // -----------------------------
  //  Insert empresas
  // -----------------------------
  const empresaIdMap = {};
  for (const e of empreArr) {
    const cod = normalizeCod(e.CODEMP);
    const empresa = {
      _id: new ObjectId(),
      nombre: e.EMPRESA || '',
      descripcion: '',
      telefono: '',
      estado: 'ACTIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioRegistro: new ObjectId(),
      usuarioModificacion: new ObjectId(),
    };
    await Empresas.insertOne(empresa);
    empresaIdMap[cod] = empresa._id;
  }

  // -----------------------------
  //  Insert clientes
  // -----------------------------
  const clienteIdMap = {};
  for (const c of clientesArr) {
    const cod = normalizeCod(c.CODCLI);
    const cli = {
      _id: new ObjectId(),
      CODCLI: cod,
      NOMBRE: c.NOMBRE || '',
      DIRECCION: c.DIRECCION || '',
      TELEFONO: c.TELEFONO || '',
      cedula: '',
      correo: '',
      profesion: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioCreacion: new ObjectId(),
      usuarioModificacion: null,
    };
    await Clientes.insertOne(cli);
    clienteIdMap[cod] = cli._id;
  }

  // --------------------------------------------------------------
  // NUEVA SECCIÓN: Mapear pagos REALES por CODOP
  // --------------------------------------------------------------
  const pagosPorOperacion = {};

  for (const p of formapArr) {
    const codop = normalizeCod(p.CODOP);

    const importe = toNumber(p.IMPORTE);
    const saldo = toNumber(p.SALDO);

    const pagado = importe - saldo; // 🧮 PAGO REAL

    if (pagado <= 0) {
      // No registrar un pago no realizado
      continue;
    }

    if (!pagosPorOperacion[codop]) pagosPorOperacion[codop] = [];

    pagosPorOperacion[codop].push({
      fecha: parseFecha(p.FECHA),
      monto: pagado, // monto real pagado
      originalImporte: importe,
      originalSaldo: saldo,
    });
  }

  // --------------------------------------------------------------
  //  PROCESAR OPERAC → FINANCIAMIENTOS
  // --------------------------------------------------------------
  for (const o of operacArr) {
    const codcli = normalizeCod(o.CODCLI);
    const codop = normalizeCod(o.CODOP);
    const codemp = normalizeCod(o.CODEMP);

    let clienteTemp = false;

    // ---- obtener cliente ----
    if (!clienteIdMap[codcli]) {
      clienteTemp = true;

      const tmpCli = {
        _id: new ObjectId(),
        CODCLI: codcli,
        NOMBRE: 'CLIENTE DESCONOCIDO ' + codcli,
        DIRECCION: '',
        TELEFONO: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        usuarioCreacion: new ObjectId(),
        usuarioModificacion: null,
      };

      await Clientes.insertOne(tmpCli);
      clienteIdMap[codcli] = tmpCli._id;
    }

    const cliente = await Clientes.findOne({ _id: clienteIdMap[codcli] });
    const empresa = await Empresas.findOne({ _id: empresaIdMap[codemp] });

    // ---- crear vehículo ----
    const veh = {
      _id: new ObjectId(),
      Marca: o.MARCA || '',
      Modelo: '',
      Color: '',
      Matricula: o.MATRICULA || '',
      Año: toNumber(o.ANIO),
      Padron: o.PADRON || '',
      Descripcion: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioCreacion: new ObjectId(),
      usuarioModificacion: new ObjectId(),
      disponible: false,
    };
    const vehInsert = await Vehiculos.insertOne(veh);
    const vehiculo = await Vehiculos.findOne({ _id: vehInsert.insertedId });

    // ---- cuotas futuras (tal como antes) ----
    const cuotasFuturas = [];
    const pagos = pagosPorOperacion[codop] || [];

    for (let i = 0; i < pagos.length; i++) {
      cuotasFuturas.push({
        _id: new ObjectId(),
        numeroCuota: i + 1,
        fechaVencimiento: pagos[i].fecha,
        valorCuota: pagos[i].originalImporte,
      });
    }

    // ---- crear financiamiento ----
    const financiamiento = {
      _id: new ObjectId(),
      cliente,
      cliente2: null,
      empresa,
      vehiculo,
      estadoFinanciamiento: clienteTemp ? 'CANCELADO' : 'ACTIVO',

      fechaVenta: parseFecha(o.FECHA),
      fechaPrimeraCuota:
        pagos.length > 0 ? pagos[0].fecha : parseFecha(o.FECHA),
      fechaUltimaCuota:
        pagos.length > 0 ? pagos[pagos.length - 1].fecha : parseFecha(o.FECHA),

      costoVehiculo: toNumber(o.VALOR_BASE),
      valorBase: toNumber(o.VALOR_BASE),
      valorCuota: toNumber(o.VAL_CUOTA),
      interesTotal: toNumber(o.INTERES),
      montoTotal: toNumber(o.TOT_FINANC),
      montoPagado: pagos.reduce((s, p) => s + p.monto, 0),
      saldoPendiente:
        toNumber(o.TOT_FINANC) - pagos.reduce((s, p) => s + p.monto, 0),

      cuotas: pagos.length,
      cuotasPendientes: pagos.length,
      cuotasPagadas: 0,
      cuotasExtras: 0,

      gastosExtras: toNumber(o.GASTOS_COM),
      costosDocumentacion: 0,

      cuotasFuturas,
      observaciones: '',

      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioRegistro: new ObjectId(),
      usuarioCreacion: new ObjectId(),
      usuarioModificacion: new ObjectId(),
    };

    await Financiamientos.insertOne(financiamiento);

    // --------------------------------------------------------------
    // 🆕 REGISTRAR PAGOS REALES (solo si montoPagado > 0)
    // --------------------------------------------------------------
    for (let i = 0; i < pagos.length; i++) {
      const p = pagos[i];

      const pagoDoc = {
        _id: new ObjectId(),
        financiamiento: financiamiento._id,
        numeroCuota: i + 1,
        metodoPago: 'EFECTIVO',
        banco: '',
        estadoPago: 'PAGADO',
        montoPago: p.monto, // monto real pagado
        fechaPago: p.fecha,
        numeroComprobante: '',
        observaciones: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        usuarioRegistro: new ObjectId(),
      };

      await PagoCuotas.insertOne(pagoDoc);
    }
  }

  console.log('Migración con pagos reales completada.');
  await client.close();
}

run().catch(err => console.error('ERROR:', err));
