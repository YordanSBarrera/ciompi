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
  const raw = fs.readFileSync(full, 'binary'); // XML windows-1252 ok as binary -> xml2js will handle
  return parseStringPromise(raw, {
    explicitArray: false,
    attrkey: '$',
    charkey: '_',
    trim: true,
    mergeAttrs: false,
  });
}

// Convierte fecha "YYYYMMDD" o "YYYY-MM-DD" o "DD.MM.YYYY" -> Date
function parseFechaRaw(str) {
  if (!str) return new Date();
  const s = String(str).trim();
  // YYYYMMDD
  const ymd = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (ymd) return new Date(`${ymd[1]}-${ymd[2]}-${ymd[3]}`);

  // DD.MM.YYYY
  const dmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dmy) return new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}`);

  // YYYY-MM-DD
  if (/\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);

  // fallback
  const asNum = Number(s);
  if (!Number.isNaN(asNum)) {
    // try interpret as epoch-ish? fallback to string parse
  }
  return new Date(s);
}

function toNumber(val) {
  if (val == null) return 0;
  const s = String(val).trim().replace(/\s+/g, '');
  if (s === '') return 0;
  const n = Number(s);
  return Number.isNaN(n) ? 0 : n;
}

function normalizeCod(s) {
  if (s == null) return '';
  return String(s).trim().replace(/^\+/, '').replace(/\s+/g, '');
}

function extractRowsFromParsed(parsed) {
  // parsed expected like { RECORDS: { RECORD: [ { ROW: { $: {...} } }, ... ] } }
  // But shapes vary; normalize:
  const out = [];
  if (!parsed) return out;

  // Possible entry points: parsed.RECORDS or parsed.RECORDS.RECORD
  let records = parsed.RECORDS;
  if (!records) {
    // maybe root is RECORDS already:
    records = parsed;
  }

  let recArray = records.RECORD;
  if (!recArray) return out;

  if (!Array.isArray(recArray)) recArray = [recArray];

  for (const r of recArray) {
    // r can contain ROW which can be array or single; or r.ROW.$ directly
    let row = r.ROW;
    if (!row) continue;
    if (Array.isArray(row)) row = row[0];

    // If row has attribute container '$' (xml2js with attrkey '$'):
    if (row.$) {
      out.push(row.$);
    } else {
      // row might already be object with keys
      out.push(row);
    }
  }
  return out;
}

// -----------------------------
//  Main
// -----------------------------
async function run() {
  await client.connect();
  const db = client.db('ciompi');

  const Clientes = db.collection('clientes');
  const Empresas = db.collection('empresas');
  const Financiamientos = db.collection('financiamientos');
  const PagoCuotas = db.collection('pagocuotas');
  const Vehiculos = db.collection('vehiculos');

  // -----------------------------
  //  Leer y parsear XMLs
  // -----------------------------
  console.log('Leyendo XMLs desde ./data ...');
  const parsedClientes = await readXML('clientes.XML');
  const parsedOperac = await readXML('operac.XML');
  const parsedFormap = await readXML('formaPag.XML');
  const parsedEmpre = await readXML('empre.XML');

  const clientesRows = extractRowsFromParsed(parsedClientes);
  const operacRows = extractRowsFromParsed(parsedOperac);
  const formapRows = extractRowsFromParsed(parsedFormap);
  const empreRows = extractRowsFromParsed(parsedEmpre);

  console.log('Registros detectados:');
  console.log('clientes:', clientesRows.length);
  console.log('operac:', operacRows.length);
  console.log('formapag:', formapRows.length);
  console.log('empre:', empreRows.length);
  console.log('================================');

  // -----------------------------
  //  Insertar empresas
  // -----------------------------
  const empresaIdMap = {};
  for (const e of empreRows) {
    const code = normalizeCod(e.CODEMP || e.CODEMP?.toString());
    const empresaDoc = {
      _id: new ObjectId(),
      nombre: e.EMPRESA || '',
      descripcion: '',
      telefono: e.TELEFONO || '',
      estado: 'activa',
      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioRegistro: new ObjectId(),
      usuarioModificacion: new ObjectId(),
    };
    await Empresas.insertOne(empresaDoc);
    empresaIdMap[code] = empresaDoc._id;
  }

  // -----------------------------
  //  Insertar clientes (desde XML)
  // -----------------------------
  const clienteIdMap = {};
  for (const c of clientesRows) {
    const cod = normalizeCod(c.CODCLI || c.COD || c.COD_CLIE);
    const cliDoc = {
      _id: new ObjectId(),
      CODCLI: cod,
      NOMBRE: c.NOMBRE || '',
      DIRECCION: c.DIRECCION || '',
      TELEFONO: c.TELEFONO || '',
      cedula: c.CEDULA || '',
      correo: c.CORREO || '',
      profesion: c.PROFESION || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioCreacion: new ObjectId(),
      usuarioModificacion: null,
    };
    await Clientes.insertOne(cliDoc);
    clienteIdMap[cod] = cliDoc._id;
  }

  // -----------------------------
  //  Construir mapa de cuotas por CODOP (from formaPag)
  // -----------------------------
  const cuotasMap = {};
  for (const p of formapRows) {
    const codop = normalizeCod(p.CODOP || p.CODOP?.toString());
    if (!cuotasMap[codop]) cuotasMap[codop] = [];

    // fecha in formaPag appears like YYYYMMDD in those XMLs (e.g. 20000320)
    const fecha = parseFechaRaw(p.FECHA || p.fecha || p.FECHA?.toString());
    const valor = toNumber(p.IMPORTE ?? p.VALOR ?? p.MONTO ?? p.importe);
    cuotasMap[codop].push({ fecha, valor });
  }

  // -----------------------------
  //  Procesar OPERAC → crear financiamientos
  // -----------------------------
  let tempClientesCount = 0;
  for (const opRaw of operacRows) {
    const op = opRaw; // attributes map
    const codcli = normalizeCod(op.CODCLI || op.CODCLI?.toString());
    const codop = normalizeCod(op.CODOP || op.CODOP?.toString());
    const codemp = normalizeCod(op.CODEMP || op.CODEMP?.toString());

    let clienteFueCreado = false;

    // Si no existe cliente, crear temporal
    if (!clienteIdMap[codcli]) {
      clienteFueCreado = true;
      const tmp = {
        _id: new ObjectId(),
        CODCLI: codcli,
        NOMBRE: 'CLIENTE DESCONOCIDO ' + codcli,
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
      tempClientesCount++;
      console.log('⚠ Cliente temporal creado:', codcli);
    }

    const cliente = await Clientes.findOne({ _id: clienteIdMap[codcli] });
    const empresa = await Empresas.findOne({ _id: empresaIdMap[codemp] });

    // Crear vehículo
    const vehiculoDoc = {
      _id: new ObjectId(),
      Marca: op.MARCA || '',
      Modelo: op.MODELO || '',
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

    const vehiculoInsert = await Vehiculos.insertOne(vehiculoDoc);
    const vehiculo = await Vehiculos.findOne({
      _id: vehiculoInsert.insertedId,
    });

    // Cuotas de esta operación
    const cuotas = cuotasMap[codop] || [];

    // Crear financiamiento (embebido)
    const financiamientoDoc = {
      _id: new ObjectId(),

      cliente: cliente,
      cliente2: null,
      empresa: empresa,
      vehiculo: vehiculo,

      estadoFinanciamiento: clienteFueCreado ? 'cancelado' : 'activo',

      fechaVenta: parseFechaRaw(op.FECHA || op.FEC_COMPRA || op.FEC_VENTA),
      fechaPrimeraCuota: cuotas[0]
        ? cuotas[0].fecha
        : parseFechaRaw(op.FECHA || op.FEC_COMPRA),
      fechaUltimaCuota:
        cuotas.length > 0
          ? cuotas[cuotas.length - 1].fecha
          : parseFechaRaw(op.FECHA),

      costoVehiculo: toNumber(op.VALOR_BASE || op.VALOR_BASE?.toString()),
      valorBase: toNumber(op.VALOR_BASE || op.VALOR_BASE?.toString()),
      valorCuota: toNumber(op.VAL_CUOTA || op.VAL_CUOTA?.toString()),

      interesTotal: toNumber(op.INTERES || op.INTERES?.toString()),
      montoTotal: toNumber(op.TOT_FINANC || op.TOT_FINANC?.toString()),
      montoPagado: 0,
      saldoPendiente: toNumber(op.TOT_FINANC || op.TOT_FINANC?.toString()),

      cuotas: Number(op.CUOTAS ? toNumber(op.CUOTAS) : cuotas.length),
      cuotasPendientes: Number(op.CUOTAS ? toNumber(op.CUOTAS) : cuotas.length),
      cuotasPagadas: 0,
      cuotasExtras: 0,

      gastosExtras: toNumber(op.GASTOS_COM || op.GASTOS_COM?.toString()),
      costosDocumentacion: 0,

      cuotasFuturas: cuotas.map((c, i) => ({
        _id: new ObjectId(),
        numeroCuota: i + 1,
        fechaVencimiento: c.fecha,
        valorCuota: c.valor,
      })),

      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioRegistro: new ObjectId(),
      usuarioCreacion: new ObjectId(),
      usuarioModificacion: new ObjectId(),
      observaciones: op.OBSERVACIONES || '',
    };

    await Financiamientos.insertOne(financiamientoDoc);

    // Registrar pagos históricos (pagocuotas)
    for (let i = 0; i < cuotas.length; i++) {
      const cuota = cuotas[i];
      const pagoDoc = {
        _id: new ObjectId(),
        financiamiento: financiamientoDoc._id,
        numeroCuota: i + 1,
        metodoPago: 'EFECTIVO',
        banco: '',
        estadoPago: 'PENDIENTE',
        montoPago: cuota.valor,
        fechaPago: cuota.fecha,
        numeroComprobante: '',
        observaciones: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        usuarioRegistro: new ObjectId(),
      };
      await PagoCuotas.insertOne(pagoDoc);
    }
  }

  console.log('================================');
  console.log('Migración finalizada.');
  console.log('Clientes temporales creados:', tempClientesCount);
  console.log('Fin.');
  await client.close();
}

run().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
