# Script de Migración de Datos

Este script migra los datos del sistema antiguo (archivos JSON en la carpeta `BD`) a la base de datos MongoDB del nuevo sistema.

## Requisitos Previos

1. **MongoDB debe estar corriendo** en tu sistema
2. **Variables de entorno** (opcional):
   - `MONGODB_URI` o `MONGO_URI`: URI de conexión a MongoDB (por defecto: `mongodb://localhost:27017/ciompi`)
3. **Archivos JSON** en la carpeta `BD/`:
   - `clientes.json`
   - `EMPRE.json`
   - `OPERAC.json`
   - `FORMAPAG.json`

## Cómo Ejecutar

### Opción 1: Usando npm/pnpm
```bash
pnpm run migrate-data
```

### Opción 2: Directamente con Node.js
```bash
node scripts/migrateData.js
```

## Qué Hace el Script

El script realiza las siguientes migraciones en orden:

1. **Empresas** (`EMPRE.json`)
   - Crea empresas desde el archivo JSON
   - Mapea `CODEMP` → código de empresa
   - Mapea `EMPRESA` → nombre

2. **Clientes** (`clientes.json`)
   - Crea clientes desde el archivo JSON
   - Extrae información de teléfono, cédula y email cuando es posible
   - Mapea `CODCLI` → referencia al cliente

3. **Vehículos y Financiamientos** (`OPERAC.json`)
   - Crea vehículos cuando hay información de marca/matrícula
   - Crea financiamientos con toda la información financiera
   - Calcula fechas de cuotas y saldos pendientes
   - Mapea `CODOP` → referencia al financiamiento

4. **Pagos** (`FORMAPAG.json`)
   - Crea registros de pagos
   - Actualiza los saldos de los financiamientos
   - Calcula cuotas pagadas automáticamente

## Mapeo de Datos

### Clientes
- `NOMBRE` → `NOMBRE`
- `DIRECCION` → `DIRECCION`
- `TELEFONO` → `TELEFONO` (extraído automáticamente)
- `CODCLI` → usado como referencia interna

### Empresas
- `EMPRESA` → `nombre`
- `CODEMP` → usado como referencia interna

### Financiamientos
- `FEC_COMPRA` / `FECHA` → `fechaVenta`
- `VALOR_BASE` → `valorBase` y `costoVehiculo`
- `VAL_CUOTA` → `valorCuota`
- `CUOTAS` → `cuotas`
- `INTERES` → `interesTotal`
- `TOT_FINANC` → `montoTotal`
- `MARCA`, `MATRICULA`, `ANIO` → usado para crear vehículos

### Pagos
- `FECHA` → `fechaPago`
- `IMPORTE` → `montoPago`
- `COMENTARIO` → `observaciones`
- `CODOP` → referencia al financiamiento

## Notas Importantes

- **Usuario por defecto**: El script busca un usuario "admin" o usa el primer usuario disponible para las referencias de creación/modificación
- **Datos duplicados**: El script verifica si los datos ya existen antes de crearlos
- **Validaciones**: Se validan fechas, números y formatos antes de insertar
- **Errores**: Si un registro falla, el script continúa con los siguientes y muestra un mensaje de error

## Resolución de Problemas

### Error: "No se encontró ningún usuario"
- Crea un usuario admin primero: `pnpm run create-admin`

### Error: "Cliente no encontrado"
- Verifica que el `CODCLI` en `OPERAC.json` exista en `clientes.json`

### Error: "Empresa no encontrada"
- Verifica que el `CODEMP` en `OPERAC.json` exista en `EMPRE.json`

### Fechas inválidas
- El script maneja automáticamente fechas inválidas usando la fecha actual como fallback

## Resultado Esperado

Al finalizar, verás un resumen como:
```
📊 RESUMEN DE MIGRACIÓN:
  - Empresas: 2
  - Clientes: 50
  - Vehículos: 45
  - Financiamientos: 45
  - Pagos: 120
```

