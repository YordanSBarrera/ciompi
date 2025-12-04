import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const DATA_DIR = path.join('.', 'data');
const EJEMPLOS_POR_ARCHIVO = 3;

// ============================================================================
// UTILIDADES
// ============================================================================
function readXMLFile(fileName) {
  const fullPath = path.join(DATA_DIR, fileName);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Archivo no encontrado: ${fullPath}`);
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

function formatObject(obj, indent = 2) {
  const spaces = ' '.repeat(indent);
  let result = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') continue;
    result += `${spaces}${key}: ${value}\n`;
  }
  
  return result;
}

// ============================================================================
// MOSTRAR EJEMPLOS
// ============================================================================
async function mostrarEjemplos() {
  console.log('\n📋 EJEMPLOS DE REGISTROS XML\n');
  console.log('='.repeat(70) + '\n');
  
  // CLIENTES
  console.log('👥 CLIENTES (clientes.XML)\n');
  const parsedClientes = await readXMLFile('clientes.XML');
  const clientes = extractRows(parsedClientes);
  
  if (clientes.length > 0) {
    console.log(`Total de registros: ${clientes.length}\n`);
    console.log('Primeros registros:\n');
    
    for (let i = 0; i < Math.min(EJEMPLOS_POR_ARCHIVO, clientes.length); i++) {
      console.log(`${i + 1}. Cliente:`);
      console.log(formatObject(clientes[i]));
    }
  } else {
    console.log('⚠️  No se encontraron registros\n');
  }
  
  console.log('-'.repeat(70) + '\n');
  
  // EMPRESAS
  console.log('🏢 EMPRESAS (empre.XML)\n');
  const parsedEmpresas = await readXMLFile('empre.XML');
  const empresas = extractRows(parsedEmpresas);
  
  if (empresas.length > 0) {
    console.log(`Total de registros: ${empresas.length}\n`);
    console.log('Registros:\n');
    
    for (let i = 0; i < Math.min(EJEMPLOS_POR_ARCHIVO, empresas.length); i++) {
      console.log(`${i + 1}. Empresa:`);
      console.log(formatObject(empresas[i]));
    }
  } else {
    console.log('⚠️  No se encontraron registros\n');
  }
  
  console.log('-'.repeat(70) + '\n');
  
  // OPERACIONES
  console.log('🚗 OPERACIONES (operac.XML)\n');
  const parsedOperaciones = await readXMLFile('operac.XML');
  const operaciones = extractRows(parsedOperaciones);
  
  if (operaciones.length > 0) {
    console.log(`Total de registros: ${operaciones.length}\n`);
    console.log('Primeros registros:\n');
    
    for (let i = 0; i < Math.min(EJEMPLOS_POR_ARCHIVO, operaciones.length); i++) {
      console.log(`${i + 1}. Operación:`);
      console.log(formatObject(operaciones[i]));
    }
  } else {
    console.log('⚠️  No se encontraron registros\n');
  }
  
  console.log('-'.repeat(70) + '\n');
  
  // PAGOS
  console.log('💰 PAGOS (formaPag.XML)\n');
  const parsedPagos = await readXMLFile('formaPag.XML');
  const pagos = extractRows(parsedPagos);
  
  if (pagos.length > 0) {
    console.log(`Total de registros: ${pagos.length}\n`);
    console.log('Primeros registros:\n');
    
    for (let i = 0; i < Math.min(EJEMPLOS_POR_ARCHIVO, pagos.length); i++) {
      console.log(`${i + 1}. Pago:`);
      console.log(formatObject(pagos[i]));
    }
  } else {
    console.log('⚠️  No se encontraron registros\n');
  }
  
  console.log('='.repeat(70));
  console.log('📊 RESUMEN');
  console.log('='.repeat(70) + '\n');
  
  console.log(`👥 Clientes: ${clientes.length}`);
  console.log(`🏢 Empresas: ${empresas.length}`);
  console.log(`🚗 Operaciones: ${operaciones.length}`);
  console.log(`💰 Pagos: ${pagos.length}`);
  console.log(`📈 Total: ${clientes.length + empresas.length + operaciones.length + pagos.length}\n`);
  
  console.log('='.repeat(70));
  console.log('💡 SIGUIENTE PASO');
  console.log('='.repeat(70) + '\n');
  
  console.log('1. Validar archivos:  pnpm validar-xml');
  console.log('2. Ejecutar migración: pnpm migrar\n');
}

// ============================================================================
// EJECUTAR
// ============================================================================
mostrarEjemplos().catch(err => {
  console.error('\n💥 ERROR:', err);
  process.exit(1);
});

