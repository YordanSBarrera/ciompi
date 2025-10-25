const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Probando conexión a MongoDB...');

    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ciompi';
    console.log('URI de conexión:', mongoUri);

    await mongoose.connect(mongoUri);
    console.log('✅ Conexión exitosa a MongoDB');

    // Verificar si la base de datos existe
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(
      'Colecciones encontradas:',
      collections.map(c => c.name)
    );

    // Verificar si existe la colección de usuarios
    const usuarios = await db.collection('usuarios').findOne();
    console.log('Usuarios en la base de datos:', usuarios ? 'Sí' : 'No');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

testConnection();
