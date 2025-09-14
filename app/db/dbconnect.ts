import mongoose from 'mongoose';

export default function dbconnect() {
  try {
    mongoose.connect(process.env.MONGO_URI!);
    console.log('Base de datos CONECTADA');
  } catch (error) {
    console.log('ERROR en conección a BD');
  }
}
