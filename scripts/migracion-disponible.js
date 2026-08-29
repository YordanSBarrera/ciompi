import { MongoClient } from 'mongodb';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'ciompi';

const ESTADOS_ACTIVO = ['activo', 'en_mora'];

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
async function run() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log('\n🚀 Iniciando backfill del campo "disponible" en vehículos...\n');
    console.log(`📦 Base de datos: ${DB_NAME}`);
    console.log(`🔗 URI: ${MONGO_URI}\n`);

    await client.connect();
    console.log('✅ Conectado a MongoDB\n');

    const db = client.db(DB_NAME);
    const Vehiculos = db.collection('vehiculos');
    const Financiamientos = db.collection('financiamientos');

    const sinCampo = await Vehiculos.find({ disponible: { $exists: false } }).toArray();
    console.log(`🔍 Vehículos sin campo "disponible": ${sinCampo.length}\n`);

    if (sinCampo.length === 0) {
      console.log('✨ No hay vehículos para actualizar.');
      return;
    }

    const stats = { disponibles: 0, noDisponibles: 0, errores: 0 };

    for (const veh of sinCampo) {
      try {
        const financiamientoActivo = await Financiamientos.findOne({
          vehiculo: veh._id,
          estadoFinanciamiento: { $in: ESTADOS_ACTIVO },
        });

        const disponible = !financiamientoActivo;

        await Vehiculos.updateOne(
          { _id: veh._id },
          { $set: { disponible, updatedAt: new Date() } }
        );

        stats[disponible ? 'disponibles' : 'noDisponibles']++;
        console.log(
          `   ✅ ${veh.Marca || ''} ${veh.Modelo || ''} (${veh.Matricula || 'sin matrícula'}) -> ${disponible ? 'Disponible' : 'No disponible'}`
        );
      } catch (error) {
        stats.errores++;
        console.error(`   ❌ Error con vehículo ${veh._id}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DEL BACKFILL DE "disponible"');
    console.log('='.repeat(60));
    console.log(`   • Disponibles: ${stats.disponibles}`);
    console.log(`   • No disponibles: ${stats.noDisponibles}`);
    console.log(`   • Errores: ${stats.errores}`);
    console.log('\n✅ BACKFILL COMPLETADO\n');
  } catch (error) {
    console.error('\n❌ ERROR FATAL EN BACKFILL:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada\n');
  }
}

// ============================================================================
// EJECUTAR
// ============================================================================
run().catch(err => {
  console.error('\n💥 ERROR:', err);
  process.exit(1);
});