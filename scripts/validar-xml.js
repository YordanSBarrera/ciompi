import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const DATA_DIR = path.join('.', 'data');

// ============================================================================
// UTILIDADES
// ============================================================================
function readXMLFile(fileName) {
  const fullPath = path.join(DATA_DIR, fileName);
  
  if (!fs.existsSync(fullPath)) {
    return { error: 'Archivo no encontrado', path: fullPath };
  }

  try {
    const raw = fs.readFileSync(fullPath, 'binary');
    const parsed = parseStringPromise(raw, {
      explicitArray: false,
      attrkey: '$',
      charkey: '_',
      trim: true,
      mergeAttrs: false,
    });
    return { success: true, parsed, path: fullPath };
  } catch (error) {
    return { error: error.message, path: fullPath };
  }
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

function parseFecha(str) {
  if (!str) return null;
  
  const s = String(str).trim();
  
  // Formato YYYYMMDD
  const ymd = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (ymd) {
    const year = parseInt(ymd[1]);
    const month = parseInt(ymd[2]);
    const day = parseInt(ymd[3]);
    
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
  
  return null;
}

// ============================================================================
// VALIDACIÓN
// ============================================================================
async function validar() {
  console.log('\n🔍 VALIDACIÓN DE ARCHIVOS XML\n');
  console.log('='.repeat(70) + '\n');
  
  const archivos = [
    { nombre: 'clientes.XML', requerido: true, descripcion: 'Clientes' },
    { nombre: 'operac.XML', requerido: true, descripcion: 'Operaciones' },
    { nombre: 'formaPag.XML', requerido: true, descripcion: 'Pagos' },
    { nombre: 'empre.XML', requerido: true, descripcion: 'Empresas' },
  ];
  
  const resultados = {
    archivosValidos: 0,
    archivosFaltantes: 0,
    archivosConErrores: 0,
    totalRegistros: 0,
    advertencias: [],
    erroresCriticos: [],
  };
  
  // Validar cada archivo
  for (const archivo of archivos) {
    console.log(`📄 ${archivo.descripcion} (${archivo.nombre})`);
    
    const resultado = await readXMLFile(archivo.nombre);
    
    if (resultado.error) {
      console.log(`   ❌ ERROR: ${resultado.error}`);
      if (archivo.requerido) {
        resultados.archivosFaltantes++;
        resultados.erroresCriticos.push(`${archivo.nombre}: ${resultado.error}`);
      }
      console.log('');
      continue;
    }
    
    const rows = extractRows(resultado.parsed);
    console.log(`   ✅ Archivo válido`);
    console.log(`   📊 Registros: ${rows.length}`);
    
    resultados.archivosValidos++;
    resultados.totalRegistros += rows.length;
    
    // Validaciones específicas
    if (archivo.nombre === 'clientes.XML') {
      let sinCodigo = 0;
      let sinNombre = 0;
      
      for (const r of rows) {
        if (!r.CODCLI) sinCodigo++;
        if (!r.NOMBRE) sinNombre++;
      }
      
      if (sinCodigo > 0) {
        console.log(`   ⚠️  ${sinCodigo} clientes sin código`);
        resultados.advertencias.push(`${sinCodigo} clientes sin código`);
      }
      if (sinNombre > 0) {
        console.log(`   ⚠️  ${sinNombre} clientes sin nombre`);
        resultados.advertencias.push(`${sinNombre} clientes sin nombre`);
      }
    }
    
    if (archivo.nombre === 'operac.XML') {
      let sinCliente = 0;
      let sinCodop = 0;
      let fechasInvalidas = 0;
      let sinCuotas = 0;
      
      for (const r of rows) {
        if (!r.CODCLI) sinCliente++;
        if (!r.CODOP) sinCodop++;
        
        const fecha = parseFecha(r.FECHA || r.FEC_COMPRA || r.FEC_VENTA);
        if (!fecha) fechasInvalidas++;
        
        if (!r.CUOTAS || parseInt(r.CUOTAS) === 0) sinCuotas++;
      }
      
      if (sinCliente > 0) {
        console.log(`   ⚠️  ${sinCliente} operaciones sin cliente`);
        resultados.advertencias.push(`${sinCliente} operaciones sin cliente`);
      }
      if (sinCodop > 0) {
        console.log(`   ⚠️  ${sinCodop} operaciones sin código`);
        resultados.advertencias.push(`${sinCodop} operaciones sin código`);
      }
      if (fechasInvalidas > 0) {
        console.log(`   ⚠️  ${fechasInvalidas} operaciones con fecha inválida`);
        resultados.advertencias.push(`${fechasInvalidas} operaciones con fecha inválida`);
      }
      if (sinCuotas > 0) {
        console.log(`   ℹ️  ${sinCuotas} operaciones sin cuotas especificadas`);
      }
    }
    
    if (archivo.nombre === 'formaPag.XML') {
      let sinCodop = 0;
      let fechasInvalidas = 0;
      let sinImporte = 0;
      
      for (const r of rows) {
        if (!r.CODOP) sinCodop++;
        if (!r.IMPORTE) sinImporte++;
        
        const fecha = parseFecha(r.FECHA);
        if (!fecha) fechasInvalidas++;
      }
      
      if (sinCodop > 0) {
        console.log(`   ⚠️  ${sinCodop} pagos sin código de operación`);
        resultados.advertencias.push(`${sinCodop} pagos sin código de operación`);
      }
      if (sinImporte > 0) {
        console.log(`   ⚠️  ${sinImporte} pagos sin importe`);
        resultados.advertencias.push(`${sinImporte} pagos sin importe`);
      }
      if (fechasInvalidas > 0) {
        console.log(`   ⚠️  ${fechasInvalidas} pagos con fecha inválida`);
        resultados.advertencias.push(`${fechasInvalidas} pagos con fecha inválida`);
      }
    }
    
    if (archivo.nombre === 'empre.XML') {
      let sinCodigo = 0;
      let sinNombre = 0;
      
      for (const r of rows) {
        if (!r.CODEMP) sinCodigo++;
        if (!r.EMPRESA) sinNombre++;
      }
      
      if (sinCodigo > 0) {
        console.log(`   ⚠️  ${sinCodigo} empresas sin código`);
        resultados.advertencias.push(`${sinCodigo} empresas sin código`);
      }
      if (sinNombre > 0) {
        console.log(`   ⚠️  ${sinNombre} empresas sin nombre`);
        resultados.advertencias.push(`${sinNombre} empresas sin nombre`);
      }
    }
    
    console.log('');
  }
  
  // Validación de referencias cruzadas
  console.log('🔗 Validando referencias cruzadas...\n');
  
  const clientes = extractRows((await readXMLFile('clientes.XML')).parsed);
  const operaciones = extractRows((await readXMLFile('operac.XML')).parsed);
  const pagos = extractRows((await readXMLFile('formaPag.XML')).parsed);
  const empresas = extractRows((await readXMLFile('empre.XML')).parsed);
  
  const clienteCodes = new Set(clientes.map(c => String(c.CODCLI).trim()));
  const empresaCodes = new Set(empresas.map(e => String(e.CODEMP).trim()));
  const operacionCodes = new Set(operaciones.map(o => String(o.CODOP).trim()));
  
  // Verificar operaciones con clientes inexistentes
  let opsSinCliente = 0;
  for (const op of operaciones) {
    const codcli = String(op.CODCLI || '').trim();
    if (codcli && !clienteCodes.has(codcli)) {
      opsSinCliente++;
    }
  }
  
  if (opsSinCliente > 0) {
    console.log(`   ⚠️  ${opsSinCliente} operaciones referencian clientes inexistentes`);
    console.log(`      (Se crearán clientes temporales automáticamente)`);
    resultados.advertencias.push(`${opsSinCliente} operaciones con cliente inexistente`);
  } else {
    console.log(`   ✅ Todas las operaciones tienen clientes válidos`);
  }
  
  // Verificar pagos con operaciones inexistentes
  let pagosSinOp = 0;
  for (const pago of pagos) {
    const codop = String(pago.CODOP || '').trim();
    if (codop && !operacionCodes.has(codop)) {
      pagosSinOp++;
    }
  }
  
  if (pagosSinOp > 0) {
    console.log(`   ⚠️  ${pagosSinOp} pagos referencian operaciones inexistentes`);
    console.log(`      (Estos pagos se omitirán en la migración)`);
    resultados.advertencias.push(`${pagosSinOp} pagos con operación inexistente`);
  } else {
    console.log(`   ✅ Todos los pagos tienen operaciones válidas`);
  }
  
  console.log('');
  
  // Resumen final
  console.log('='.repeat(70));
  console.log('📊 RESUMEN DE VALIDACIÓN');
  console.log('='.repeat(70) + '\n');
  
  console.log(`✅ Archivos válidos: ${resultados.archivosValidos}/4`);
  console.log(`❌ Archivos faltantes: ${resultados.archivosFaltantes}/4`);
  console.log(`📊 Total de registros: ${resultados.totalRegistros}`);
  
  if (resultados.advertencias.length > 0) {
    console.log(`\n⚠️  Advertencias: ${resultados.advertencias.length}`);
    resultados.advertencias.forEach((adv, i) => {
      console.log(`   ${i + 1}. ${adv}`);
    });
  }
  
  if (resultados.erroresCriticos.length > 0) {
    console.log(`\n❌ Errores críticos: ${resultados.erroresCriticos.length}`);
    resultados.erroresCriticos.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (resultados.erroresCriticos.length > 0) {
    console.log('❌ VALIDACIÓN FALLIDA - Corregir errores antes de migrar');
    process.exit(1);
  } else if (resultados.advertencias.length > 0) {
    console.log('⚠️  VALIDACIÓN CON ADVERTENCIAS - La migración continuará');
    console.log('   pero algunos datos pueden omitirse o crear registros temporales');
  } else {
    console.log('✅ VALIDACIÓN EXITOSA - Listo para migrar');
  }
  
  console.log('='.repeat(70) + '\n');
  
  if (resultados.erroresCriticos.length === 0) {
    console.log('💡 Para ejecutar la migración, usa: pnpm migrar\n');
  }
}

// ============================================================================
// EJECUTAR
// ============================================================================
validar().catch(err => {
  console.error('\n💥 ERROR:', err);
  process.exit(1);
});

