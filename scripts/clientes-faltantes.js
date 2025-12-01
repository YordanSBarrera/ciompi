async function run() {
  await client.connect();
  const db = client.db('ciompi');

  const Clientes = db.collection('clientes');
  const Empresas = db.collection('empresas');
  const Financiamientos = db.collection('financiamientos');
  const PagoCuotas = db.collection('pagocuotas');
  const Vehiculos = db.collection('vehiculos');

  // -----------------------------
  //  CARGAR ARCHIVOS (FORMATO REAL)
  // -----------------------------
  const clientes = loadJSON('clientes.json').clientes;
  const operac = loadJSON('OPERAC.json').OPERAC;
  const formapag = loadJSON('FORMAPAG.json').FORMAPAG;
  const empre = loadJSON('EMPRE.json').EMPRE;

  console.log('Archivos cargados:');
  console.log('Clientes:', clientes.length);
  console.log('Operac:', operac.length);
  console.log('Formapag:', formapag.length);
  console.log('Empresas:', empre.length);

  // -----------------------------
  //   MAPEAR EMPRESAS
  // Detectar CODCLI que existen en OPERAC pero NO en clientes.json
  const codcliEnClientes = new Set(clientes.map(c => c.CODCLI.trim()));
  const codcliEnOperac = new Set(operac.map(o => o.CODCLI.trim()));

  const faltantes = [...codcliEnOperac].filter(
    cod => !codcliEnClientes.has(cod)
  );

  console.log('CODCLI faltantes:', faltantes);
  console.log('Cantidad:', faltantes.length);
}
