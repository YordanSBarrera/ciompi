import fs from 'fs';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb://localhost:27017/ciompi';
const client = new MongoClient(uri);

// -----------------------------
//   CARGA JSON DESDE /data
// -----------------------------
function loadJSON(file) {
  const full = path.join('data', file);
  const raw = fs.readFileSync(full, 'utf8');
  return JSON.parse(raw);
}

// Convertir fecha DD.MM.AAAA → YYYY-MM-DD
function parseFecha(str) {
  if (!str) return new Date();
  return new Date(str.replace(/(\d+)\.(\d+)\.(\d+)/, '$3-$2-$1'));
}

async function run() {
  await client.connect();
  const db = client.db('ciompi');

  const Clientes = db.collection('clientes');
  const Empresas = db.collection('empresas');
  const Financiamientos = db.collection('financiamientos');
  const PagoCuotas = db.collection('pagocuotas');
  const Vehiculos = db.collection('vehiculos');

  // -----------------------------
  //  CARGAR ARCHIVOS
  // -----------------------------
  const clientes = loadJSON('clientes.json').clientes;
  const operac = loadJSON('OPERAC.json').OPERAC;
  const formapag = loadJSON('FORMAPAG.json').FORMAPAG;
  const empre = loadJSON('EMPRE.json').EMPRE;

  console.log('\nArchivos cargados:');
  console.log('Clientes:', clientes.length);
  console.log('Operac:', operac.length);
  console.log('Formapag:', formapag.length);
  console.log('Empresas:', empre.length);
  console.log('================================\n');

  // -----------------------------
  //   IMPORTAR EMPRESAS
  // -----------------------------
  const empresaIdMap = {};

  for (const e of empre) {
    const empresaDoc = {
      _id: new ObjectId(),
      nombre: e.EMPRESA,
      descripcion: '',
      telefono: '',
      estado: 'ACTIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
      usuarioRegistro: new ObjectId(),
      usuarioModificacion: new ObjectId(),
    };

    await Empresas.insertOne(empresaDoc);
    empresaIdMap[e.CODEMP.trim()] = empresaDoc._id;
  }

  // -----------------------------
  //   IMPORTAR CLIENTES
  // -----------------------------
  const clienteIdMap = {};

  for (const c of clientes) {
    const cliDoc = {
      _id: new ObjectId(),
      CODCLI: c.CCODCLI?.trim?.() ?? c.CODCLI.trim(),
      NOMBRE: c.NOMBRE,
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

    await Clientes.insertOne(cliDoc);
    clienteIdMap[cliDoc.CODCLI] = cliDoc._id;
  }

  // -----------------------------
  //  MAPA DE CUOTAS POR CODOP
  // -----------------------------
  const cuotasMap = {};

  for (const p of formapag) {
    const codop = p.CODOP.trim();
    if (!cuotasMap[codop]) cuotasMap[codop] = [];

    cuotasMap[codop].push({
      fecha: parseFecha(p.FECHA),
      valor: Number((p.IMPORTE || p.VALOR).trim()),
    });
  }

  // -----------------------------
  //  PROCESAR TODAS LAS OPERACIONES
  // -----------------------------
  for (const op of operac) {
    const codcli = op.CODCLI.trim();
    const codop = op.CODOP.trim();
    const codemp = op.CODEMP.trim();

    let clienteFueCreado = false;

    // ============================
    // 1. Verificar cliente
    // ============================
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

      console.log('⚠ Cliente faltante creado automáticamente:', codcli);
    }

    const cliente = await Clientes.findOne({ _id: clienteIdMap[codcli] });
    const empresa = await Empresas.findOne({ _id: empresaIdMap[codemp] });

    // ============================
    // 2. Crear vehículo
    // ============================
    const vehiculoDoc = {
      _id: new ObjectId(),
      Marca: op.MARCA || '',
      Modelo: '',
      Color: '',
      Matricula: op.MATRICULA || '',
      Año: Number(op.ANIO || 0),
      Padron: op.PADRON || '',
      Descripcion: '',
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

    // ============================
    // 3. Cuotas de esta operación
    // ============================
    const cuotas = cuotasMap[codop] || [];

    // ============================
    // 4. Crear financiamiento
    // ============================
    const financiamientoDoc = {
      _id: new ObjectId(),

      cliente: cliente,
      cliente2: null,
      empresa: empresa,
      vehiculo: vehiculo,

      estadoFinanciamiento: clienteFueCreado ? 'cancelado' : 'activo',

      fechaVenta: parseFecha(op.FECHA),
      fechaPrimeraCuota: cuotas[0] ? cuotas[0].fecha : parseFecha(op.FECHA),
      fechaUltimaCuota:
        cuotas.length > 0
          ? cuotas[cuotas.length - 1].fecha
          : parseFecha(op.FECHA),

      costoVehiculo: Number(op.VALOR_BASE),
      valorBase: Number(op.VALOR_BASE),
      valorCuota: Number(op.VAL_CUOTA),

      interesTotal: Number(op.INTERES || 0),
      montoTotal: Number(op.TOT_FINANC),
      montoPagado: 0,
      saldoPendiente: Number(op.TOT_FINANC),

      cuotas: Number(op.CUOTAS || cuotas.length),
      cuotasPendientes: Number(op.CUOTAS || cuotas.length),
      cuotasPagadas: 0,
      cuotasExtras: 0,

      gastosExtras: Number(op.GASTOS_COM || 0),
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
      observaciones: '',
    };

    await Financiamientos.insertOne(financiamientoDoc);

    // ============================
    // 5. Registrar pagos históricos
    // ============================
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

  console.log('\nMigración completada correctamente.\n');
  await client.close();
}

run().catch(err => {
  console.error('ERROR EN LA MIGRACION:', err);
});
