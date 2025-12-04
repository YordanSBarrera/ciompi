# 🚀 Guía de Migración V3 - Con Fechas Reales

## ✨ Novedades de la Versión 3

Esta versión incluye mejoras críticas para mantener la integridad de los datos del sistema viejo:

### 🎯 Características Principales

#### 1. **Fechas Reales de Cuotas**
- ✅ Usa las fechas exactas de los pagos del sistema viejo
- ✅ No genera fechas estimadas artificialmente
- ✅ Mantiene el cronograma original de vencimientos

#### 2. **Detección de Cuotas Extras**
- ✅ Identifica automáticamente cuotas con montos diferentes
- ✅ Marca cuotas extras con la bandera `esExtra: true`
- ✅ Contabiliza separadamente cuotas regulares y extras

#### 3. **Verificación de Montos**
- ✅ Calcula el monto total desde las cuotas reales
- ✅ Compara con `TOT_FINANC` del sistema viejo
- ✅ Alerta sobre discrepancias mayores a $1

## 📋 Cómo Funciona

### Proceso de Generación de Cuotas

El script V3 utiliza un proceso inteligente para crear las cuotas:

```
1. Lee los pagos de formaPag.XML agrupados por CODOP
2. Ordena los pagos cronológicamente
3. Para cada pago:
   - Usa la FECHA como fecha de vencimiento de la cuota
   - Usa el IMPORTE - SALDO como valor de la cuota
   - Detecta si es cuota extra comparando con VAL_CUOTA base
4. Si faltan cuotas (TOT_FINANC indica más cuotas):
   - Genera las cuotas restantes desde la última fecha
   - Usa incrementos mensuales
   - Mantiene el valor de cuota base
```

### Ejemplo Real

**Sistema Viejo (operac.XML):**
```xml
<ROW
  CODOP="82"
  CUOTAS="21"
  VAL_CUOTA="2000"
  TOT_FINANC="42000"
/>
```

**Pagos Registrados (formaPag.XML):**
```xml
<ROW FECHA="20000120" IMPORTE="1561" CODOP="82"/> <!-- Cuota 1: $1561 (EXTRA) -->
<ROW FECHA="20000220" IMPORTE="2000" CODOP="82"/> <!-- Cuota 2: $2000 -->
<ROW FECHA="20000320" IMPORTE="2000" CODOP="82"/> <!-- Cuota 3: $2000 -->
...
```

**Resultado en cuotasFuturas:**
```javascript
[
  {
    numeroCuota: 1,
    fechaVencimiento: new Date("2000-01-20"),
    valorCuota: 1561,
    estadoCuota: "pendiente",
    esExtra: true  // ⚠️ Monto diferente al base
  },
  {
    numeroCuota: 2,
    fechaVencimiento: new Date("2000-02-20"),
    valorCuota: 2000,
    estadoCuota: "pendiente",
    esExtra: false
  },
  // ...
]
```

## 🚀 Uso

### Paso 1: Validar Datos

```bash
pnpm validar-xml
```

### Paso 2: Ejecutar Migración V3

```bash
pnpm migrar
```

El script mostrará información detallada:

```
[1/8031] 🔄 CODOP: 42
   📅 5 cuotas con fechas reales de pagos
   ℹ️  Detectadas 1 cuotas extras
   ✅ Financiamiento creado: 5 cuotas, $2500.00
   💰 Aplicando 5 pagos...
   ✅ 5 pagos aplicados
   ✅ Estado: FINALIZADO
   ℹ️  Progreso: 5/5 cuotas
   ℹ️  Saldo: $0.00
```

### Paso 3: Verificar Resultados

```bash
mongosh

use ciompi

// Ver financiamientos con cuotas extras
db.financiamientos.find({ cuotasExtras: { $gt: 0 } }).count()

// Ver un financiamiento completo
db.financiamientos.findOne({ codigoOperacion: "82" })

// Ver cuotas marcadas como extras
db.financiamientos.aggregate([
  { $unwind: "$cuotasFuturas" },
  { $match: { "cuotasFuturas.esExtra": true } },
  { $count: "totalCuotasExtras" }
])
```

## 📊 Estadísticas Finales

Al completar, verás un resumen como:

```
======================================================================
📊 RESUMEN DE MIGRACIÓN CON FECHAS REALES
======================================================================

🏢 Empresas:
   • Creadas: 2
   • Errores: 0

👥 Clientes:
   • Creados: 8005
   • Temporales: 26
   • Errores: 0

🚗 Vehículos:
   • Creados: 8031
   • Errores: 0

💼 Financiamientos:
   • Creados: 8031
   • Finalizados: 6234
   • Activos: 1797
   • Errores: 0

💰 Pagos:
   • Creados: 85515
   • Errores: 0

🔢 Cuotas Extras:
   • Total detectadas: 1247

======================================================================
✅ MIGRACIÓN COMPLETADA CON FECHAS REALES
======================================================================
```

## 🔍 Diferencias entre Versiones

| Característica | V1 (datosViejos.js) | V2 (migracion-mejorada.js) | V3 (fechas-reales.js) |
|----------------|---------------------|----------------------------|------------------------|
| Fechas de cuotas | ❌ Estimadas | ❌ Estimadas | ✅ Reales de pagos |
| Cuotas extras | ❌ No detecta | ❌ No detecta | ✅ Detecta y marca |
| Verificación montos | ❌ No | ⚠️ Básica | ✅ Completa con alertas |
| Prevención duplicados | ❌ No | ✅ Sí | ✅ Sí |
| Logs detallados | ⚠️ Básicos | ✅ Buenos | ✅ Excelentes |
| Manejo errores | ❌ Se detiene | ✅ Continúa | ✅ Continúa |

## ⚠️ Casos Especiales

### Operaciones sin Pagos Registrados

Si una operación tiene `CUOTAS > 0` pero no hay pagos en `formaPag.XML`:

```
⚠️  Sin pagos registrados, usando fechas estimadas
```

El script generará fechas mensuales desde `FEC_COMPRA`.

### Discrepancias en Montos

Si el monto calculado difiere de `TOT_FINANC`:

```
⚠️  Discrepancia: TOT_FINANC=$42000 vs Cuotas=$41561.00
```

Esto puede indicar:
- Pagos parciales no registrados
- Cuotas ajustadas manualmente
- Descuentos o bonificaciones

El script usará el monto calculado de las cuotas (más preciso).

### Cuotas Extras sin Identificación Explícita

El script detecta cuotas extras automáticamente comparando montos:

```javascript
const esExtra = Math.abs(montoCuota - valorCuotaBase) > 0.01;
```

**Tolerancia:** $0.01 para manejar decimales.

## 🎯 Validación Post-Migración

### 1. Verificar Totales

```javascript
// En mongosh
use ciompi

// Suma total de financiamientos
db.financiamientos.aggregate([
  { $group: { 
      _id: null, 
      total: { $sum: "$montoTotal" },
      count: { $sum: 1 }
  }}
])

// Comparar con TOT_FINANC sumado de operac.XML
```

### 2. Verificar Fechas

```javascript
// Ver rango de fechas de cuotas
db.financiamientos.aggregate([
  { $unwind: "$cuotasFuturas" },
  { $group: {
      _id: null,
      minFecha: { $min: "$cuotasFuturas.fechaVencimiento" },
      maxFecha: { $max: "$cuotasFuturas.fechaVencimiento" }
  }}
])
```

### 3. Verificar Cuotas Extras

```javascript
// Financiamientos con cuotas extras
db.financiamientos.find({ 
  cuotasExtras: { $gt: 0 } 
}).forEach(fin => {
  print(`CODOP: ${fin.codigoOperacion} - ${fin.cuotasExtras} extras`);
});
```

## 🐛 Solución de Problemas

### Problema: "Cannot find module"

```bash
# Instalar dependencias
pnpm install
```

### Problema: Fechas aparecen null

El script valida fechas estrictamente. Revisa el log:

```
⚠️  Pago con fecha inválida en CODOP 123: 20001399
```

Fechas inválidas se omiten automáticamente.

### Problema: Demasiadas cuotas extras

Si hay muchas cuotas extras detectadas, puede ser que:

1. El sistema viejo usaba montos variables intencionalmente
2. `VAL_CUOTA` en operac.XML no es representativo
3. Hubo ajustes manuales

Revisa algunos casos manualmente en la base de datos.

## 📞 Scripts Disponibles

```bash
# Ver ejemplos de datos XML
pnpm ver-xml

# Validar archivos antes de migrar
pnpm validar-xml

# Ejecutar migración V3 (RECOMENDADO)
pnpm migrar

# Ejecutar migración V2 (sin fechas reales)
pnpm migrar-v2

# Ejecutar script original (legacy)
pnpm migrar-old

# Verificar conexión MongoDB
pnpm test-db
```

## ✅ Checklist de Migración

- [ ] Backup de base de datos realizado
- [ ] Archivos XML validados (`pnpm validar-xml`)
- [ ] MongoDB corriendo
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Migración ejecutada (`pnpm migrar`)
- [ ] Verificar totales en MongoDB
- [ ] Verificar fechas de cuotas
- [ ] Revisar cuotas extras detectadas
- [ ] Iniciar aplicación (`pnpm dev`)
- [ ] Verificar datos en UI

## 🎉 Ventajas del Script V3

1. **Integridad de Datos**: Usa fechas reales, no estimaciones
2. **Trazabilidad**: Cada cuota tiene su fecha exacta de vencimiento
3. **Cuotas Extras**: Identifica automáticamente variaciones en montos
4. **Verificación**: Alerta sobre discrepancias en montos
5. **Precisión**: Calcula totales desde cuotas reales

---

**🚀 ¡Listo para migrar con fechas reales!**

Si tienes problemas, revisa los logs detallados del script o consulta la documentación en `scripts/README-MIGRACION.md`.

