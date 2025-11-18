// Script para eliminar el índice único de financiamiento y numeroCuota en la colección pagocuotas
// Esto permite múltiples pagos de la misma cuota (pagos parciales)

const mongoose = require('mongoose');

// Conectar a la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ciompi';

async function removeUniqueIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('pagocuotas');

    // Listar índices actuales
    const indexes = await collection.indexes();
    console.log('Índices actuales:', indexes);

    // Eliminar el índice único si existe
    try {
      await collection.dropIndex('financiamiento_1_numeroCuota_1');
      console.log('Índice único eliminado exitosamente');
    } catch (error) {
      if (error.code === 27) {
        console.log('El índice no existe, no es necesario eliminarlo');
      } else {
        throw error;
      }
    }

    // Crear el índice sin restricción de unicidad
    await collection.createIndex(
      { financiamiento: 1, numeroCuota: 1 },
      { unique: false, name: 'financiamiento_1_numeroCuota_1' }
    );
    console.log('Índice recreado sin restricción de unicidad');

    // Verificar índices finales
    const finalIndexes = await collection.indexes();
    console.log('Índices finales:', finalIndexes);

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

removeUniqueIndex();

