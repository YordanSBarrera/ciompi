# 📦 Script de Migración de Datos

Este script migra datos desde el sistema antiguo (archivos XML) al nuevo sistema Ciompi.

## 🎯 Características

### ✨ Mejoras sobre el script anterior

1. **Manejo robusto de fechas**
   - Múltiples formatos soportados: YYYYMMDD, DD.MM.YYYY, YYYY-MM-DD
   - Validación de fechas inválidas (ej: 31 de febrero)
   - Logs de advertencia para fechas problemáticas

2. **Extracción inteligente de datos de clientes**
   - Separa nombres, cédulas y teléfonos del campo NOMBRE
   - Identifica automáticamente números de cédula (6-8 dígitos)
   - Extrae múltiples teléfonos y elimina duplicados

3. **Prevención de duplicados**
   - Verifica si empresas, clientes y financiamientos ya existen
   - Usa códigos únicos para evitar re-insertar datos

4. **Mejor manejo de errores**
   - Logs detallados con emojis para fácil lectura
   - Continúa la migración aunque falle un registro
   - Estadísticas completas al final

5. **Información completa en financiamientos**
   - Genera cronogramas de cuotas automáticamente
   - Calcula estados correctamente (activo/finalizado)
   - Aplica pagos con precisión
   - Maneja cuotas parciales

6. **Auditoría y trazabilidad**
   - Guarda código de operación original (`codigoOperacion`)
   - Registra fechas de creación y actualización
   - Vincula usuarios de auditoría

## 📋 Requisitos

### Archivos XML requeridos en la carpeta `data/`

- ✅ `clientes.XML` - Lista de clientes
- ✅ `operac.XML` - Operaciones/financiamientos
- ✅ `formaPag.XML` - Pagos realizados
- ✅ `empre.XML` - Empresas

### Variables de entorno

Crea un archivo `.env.local` con:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=ciompi
```

O usa los valores por defecto.

## 🚀 Uso

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Asegurarse de que MongoDB esté corriendo

```bash
# Verificar conexión
pnpm test-db
```

### 3. Ejecutar la migración

```bash
pnpm migrar
```

### 4. Ver el progreso

El script mostrará logs detallados:

```
🚀 Iniciando migración de datos...

📦 Base de datos: ciompi
🔗 URI: mongodb://localhost:27017

✅ Conectado a MongoDB

📖 Leyendo archivos XML...

📄 Leyendo archivo: clientes.XML
📄 Leyendo archivo: operac.XML
📄 Leyendo archivo: formaPag.XML
📄 Leyendo archivo: empre.XML

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

## 📊 Estadísticas Finales

Al terminar, verás un resumen completo:

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

======================================================================
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
======================================================================
```

## 🔍 Detalles Técnicos

### Extracción de datos de clientes

El campo `NOMBRE` en el XML antiguo contiene información mezclada:

```
"BOGGIO PEREZ PABLO 4819595*"
"MENDEZ ROY 2115000 099105420*"
```

El script extrae automáticamente:
- **Nombre**: `BOGGIO PEREZ PABLO`
- **Cédula**: `4819595` (6-8 dígitos)
- **Teléfonos**: `099105420` (8-11 dígitos)

### Generación de cronogramas de cuotas

Si una operación tiene `CUOTAS=12` y `FEC_COMPRA="20230115"`:

```javascript
Genera 12 cuotas mensuales:
- Cuota 1: 2023-01-15
- Cuota 2: 2023-02-15
- Cuota 3: 2023-03-15
- ...
- Cuota 12: 2024-01-15
```

Maneja correctamente:
- Meses con diferente número de días
- Años bisiestos
- Fechas inválidas

### Aplicación de pagos

Los pagos se aplican secuencialmente a las cuotas:

1. Se ordenan por fecha
2. Se aplican al saldo de cada cuota
3. Si el pago cubre toda la cuota → `estadoCuota: 'pagada'`
4. Si el pago es menor → `estadoCuota: 'parcial'`
5. Si sobra dinero, se aplica a la siguiente cuota

### Estado del financiamiento

- **`activo`**: Tiene cuotas pendientes
- **`finalizado`**: Todas las cuotas pagadas
- **`cancelado`**: Cancelado manualmente (no se usa en migración)
- **`en_mora`**: Tiene cuotas atrasadas (se puede calcular después)

## ⚠️ Consideraciones

### Primera ejecución

- La primera vez puede tardar varios minutos dependiendo del tamaño de los archivos XML
- Se recomienda hacer un backup de la base de datos antes de ejecutar

### Ejecuciones subsecuentes

- El script detecta duplicados por:
  - Empresas: código o nombre
  - Clientes: CODCLI
  - Financiamientos: codigoOperacion (CODOP)

- Si ejecutas el script múltiples veces, omitirá los registros existentes

### Clientes temporales

Si una operación referencia un cliente que no existe en `clientes.XML`, se crea uno temporal con el formato:

```
NOMBRE: "CLIENTE DESCONOCIDO {CODCLI}"
```

Puedes buscarlos después y actualizarlos manualmente.

## 🐛 Solución de Problemas

### Error: Cannot connect to MongoDB

```bash
# Verificar que MongoDB esté corriendo
mongosh

# O iniciar MongoDB
mongod --dbpath /path/to/data
```

### Error: Cannot find module 'xml2js'

```bash
pnpm install xml2js
```

### Fechas aparecen como null

Verifica el formato en el XML. El script soporta:
- `YYYYMMDD`: `20230115`
- `DD.MM.YYYY`: `15.01.2023`
- `YYYY-MM-DD`: `2023-01-15`

### Archivos XML con encoding incorrecto

Los archivos están en `windows-1252`. Si tienes problemas, convierte a UTF-8:

```bash
iconv -f WINDOWS-1252 -t UTF-8 data/clientes.XML > data/clientes-utf8.XML
```

## 📝 Logs y Debugging

Para ver más detalles durante la ejecución:

1. El script imprime información en tiempo real
2. Cada operación muestra su progreso
3. Las advertencias usan el emoji ⚠️
4. Los errores usan el emoji ❌

## 🔄 Re-ejecutar la migración

Si necesitas empezar de cero:

```bash
# Conectar a MongoDB
mongosh

# Seleccionar base de datos
use ciompi

# Limpiar colecciones
db.clientes.deleteMany({})
db.empresas.deleteMany({})
db.vehiculos.deleteMany({})
db.financiamientos.deleteMany({})
db.pagocuotas.deleteMany({})

# Salir
exit
```

Luego ejecuta nuevamente:

```bash
pnpm migrar
```

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs detallados
2. Verifica que los archivos XML sean válidos
3. Comprueba la conexión a MongoDB
4. Revisa las variables de entorno

## 🎉 Después de la migración

Una vez completada la migración:

1. Verifica algunos registros en la base de datos
2. Inicia la aplicación: `pnpm dev`
3. Revisa que los datos se muestren correctamente
4. Busca clientes temporales y actualízalos si es necesario

```bash
# Buscar clientes temporales
db.clientes.find({ NOMBRE: /CLIENTE DESCONOCIDO/ })
```

---

**Versión**: 2.0  
**Última actualización**: Diciembre 2025  
**Autor**: Sistema Ciompi

