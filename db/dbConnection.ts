import mongoose, { connect, connection } from 'mongoose';

const conn = { isConnected: false };

export async function connectDB() {
  if (conn.isConnected) return;

  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/ciompi';

  try {
    const db = await connect(mongoUri);
    console.log('Conectado a MongoDB:', db.connection.db?.databaseName);
    conn.isConnected = db.connections[0].readyState === 1;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error;
  }
}

connection.on('connected', () => {
  console.log('Base de Datos Conectada');
});

connection.on('error', err => {
  console.log('Error en conection a Base de Datos', err);
});
