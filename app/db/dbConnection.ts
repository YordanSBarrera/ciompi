import mongoose, { connect, connection } from 'mongoose';

const conn = { isConnected: false };

export async function connectDB() {
  if (conn.isConnected) return;

  const db = await connect(process.env.MONGO_URI!);
  console.log(db.connection.db?.databaseName);
  conn.isConnected = db.connections[0].readyState === 1;
}

connection.on('connected', () => {
  console.log('Base de Datos Conectada');
});

connection.on('error', err => {
  console.log('Error en conection a Base de Datos', err);
});
// export default function dbconnect() {
//   try {
//     mongoose.connect(process.env.MONGO_URI!);
//     console.log('Base de datos CONECTADA');
//   } catch (error) {
//     console.log('ERROR en conección a BD');
//   }
// }
