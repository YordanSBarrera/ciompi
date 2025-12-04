# 🚀 Guía Rápida de Migración

Esta guía te ayudará a migrar datos del sistema antiguo al nuevo sistema Ciompi.

## 📁 Requisitos Previos

### 1. Archivos XML en la carpeta `data/`

Asegúrate de tener estos archivos:

```
data/
  ├── clientes.XML    ✅
  ├── operac.XML      ✅
  ├── formaPag.XML    ✅
  └── empre.XML       ✅
```

### 2. MongoDB corriendo

```bash
# Verificar conexión
pnpm test-db
```

Si aparece error, inicia MongoDB.

### 3. Variables de entorno

Crea `.env.local` (opcional, hay valores por defecto):

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=ciompi
```

## 📋 Pasos de Migración

### Paso 1: Ver ejemplos de datos (Opcional)

Visualiza algunos registros de los archivos XML:

```bash
pnpm ver-xml
```

**Salida esperada:**
```
📋 EJEMPLOS DE REGISTROS XML

👥 CLIENTES (clientes.XML)
Total de registros: 8005

1. Cliente:
  NOMBRE: BOGGIO PEREZ PABLO 4819595*
  DIRECCION: 42251175 095905005
  CODCLI:   12
```

### Paso 2: Validar archivos XML

Antes de migrar, valida que los archivos sean correctos:

```bash
pnpm validar-xml
```

**Salida esperada:**
```
🔍 VALIDACIÓN DE ARCHIVOS XML

📄 Clientes (clientes.XML)
   ✅ Archivo válido
   📊 Registros: 8005

📄 Operaciones (operac.XML)
   ✅ Archivo válido
   📊 Registros: 8031

...

✅ VALIDACIÓN EXITOSA - Listo para migrar
💡 Para ejecutar la migración, usa: pnpm migrar
```

### Paso 3: Ejecutar migración

Una vez validado, ejecuta la migración:

```bash
pnpm migrar
```

**Esto tomará varios minutos.** Verás un progreso detallado:

```
🚀 Iniciando migración de datos...

✅ Conectado a MongoDB

📊 Registros encontrados:
   • Clientes: 8005
   • Operaciones: 8031
   • Pagos: 85515
   • Empresas: 2

🏢 Migrando empresas...
   ✅ Empresa creada: ENRIQUE CIOMPI (VA)
   ✅ Empresa creada: PROBLEMAS (ZZ)

✨ Empresas: 2 creadas, 0 errores

👥 Migrando clientes...
   ✅ Cliente creado: BOGGIO PEREZ PABLO (12)
   ...
```

### Paso 4: Verificar resultados

Al terminar verás un resumen:

```
======================================================================
📊 RESUMEN DE MIGRACIÓN
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

✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
```

### Paso 5: Iniciar la aplicación

```bash
pnpm dev
```

Abre http://localhost:3000 y verifica que los datos se muestren correctamente.

## 🔄 Ejecuciones Múltiples

El script detecta duplicados automáticamente. Si lo ejecutas varias veces:

- ✅ **Omitirá** registros existentes
- ✅ **Creará** solo registros nuevos
- ✅ **No duplicará** datos

Para empezar de cero, limpia la base de datos:

```bash
mongosh
use ciompi
db.clientes.deleteMany({})
db.empresas.deleteMany({})
db.vehiculos.deleteMany({})
db.financiamientos.deleteMany({})
db.pagocuotas.deleteMany({})
exit
```

## ⚠️ Problemas Comunes

### Error: Cannot connect to MongoDB

**Solución:**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongodb
```

### Error: Cannot find module 'xml2js'

**Solución:**
```bash
pnpm install
```

### Fechas aparecen incorrectas

El script maneja múltiples formatos automáticamente:
- `YYYYMMDD` → `20230115`
- `DD.MM.YYYY` → `15.01.2023`
- `YYYY-MM-DD` → `2023-01-15`

Si aún hay problemas, revisa el formato en los archivos XML.

### Clientes temporales

Si ves mensajes como:
```
⚠️  Cliente 123 no encontrado, creando temporal...
```

Esto es normal. Algunas operaciones referencian clientes que no están en `clientes.XML`. El script crea automáticamente un cliente con nombre "CLIENTE DESCONOCIDO {código}".

Para encontrarlos después:

```bash
mongosh
use ciompi
db.clientes.find({ NOMBRE: /CLIENTE DESCONOCIDO/ })
```

## 📊 Verificar Datos Migrados

### En MongoDB Shell

```bash
mongosh

use ciompi

# Contar registros
db.clientes.countDocuments()
db.empresas.countDocuments()
db.vehiculos.countDocuments()
db.financiamientos.countDocuments()
db.pagocuotas.countDocuments()

# Ver un cliente
db.clientes.findOne()

# Ver financiamientos activos
db.financiamientos.find({ estadoFinanciamiento: "activo" }).count()

# Ver financiamientos finalizados
db.financiamientos.find({ estadoFinanciamiento: "finalizado" }).count()
```

### En la Aplicación Web

1. Inicia la aplicación: `pnpm dev`
2. Ve a http://localhost:3000
3. Navega por las secciones de Clientes, Financiamientos, etc.
4. Verifica que los datos se muestren correctamente

## 🎯 Mejoras del Nuevo Script

Comparado con `datosViejos.js`, el nuevo script incluye:

### ✨ Mejoras en Fechas
- ✅ Validación de fechas inválidas (31 de febrero, etc.)
- ✅ Múltiples formatos soportados
- ✅ Logs de advertencia para fechas problemáticas

### ✨ Extracción de Datos
- ✅ Separa automáticamente nombre, cédula y teléfonos
- ✅ Limpia caracteres especiales
- ✅ Maneja datos faltantes

### ✨ Prevención de Duplicados
- ✅ Verifica existencia antes de insertar
- ✅ Usa códigos únicos para identificar registros
- ✅ Permite múltiples ejecuciones seguras

### ✨ Manejo de Errores
- ✅ Continúa aunque falle un registro
- ✅ Logs detallados con emojis
- ✅ Estadísticas completas al final

### ✨ Información Completa
- ✅ Genera cronogramas de cuotas automáticamente
- ✅ Calcula estados correctamente (activo/finalizado)
- ✅ Aplica pagos con precisión
- ✅ Maneja cuotas parciales

## 📞 Comandos Disponibles

```bash
# Ver ejemplos de registros XML
pnpm ver-xml

# Validar archivos XML antes de migrar
pnpm validar-xml

# Ejecutar migración (script mejorado)
pnpm migrar

# Ejecutar script antiguo (por compatibilidad)
pnpm migrar-old

# Verificar conexión a MongoDB
pnpm test-db

# Iniciar aplicación
pnpm dev
```

## 📚 Documentación Completa

Para más detalles, consulta:
- `scripts/README-MIGRACION.md` - Documentación completa del script

## ✅ Checklist de Migración

- [ ] Archivos XML en carpeta `data/`
- [ ] MongoDB corriendo
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Conexión verificada (`pnpm test-db`)
- [ ] XML validado (`pnpm validar-xml`)
- [ ] Backup de base de datos (recomendado)
- [ ] Migración ejecutada (`pnpm migrar`)
- [ ] Datos verificados en MongoDB
- [ ] Aplicación iniciada y funcionando
- [ ] Clientes temporales revisados (opcional)

---

**¡Listo! 🎉** Tu sistema antiguo ahora está migrado al nuevo sistema Ciompi.

