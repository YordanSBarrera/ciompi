import { connectDB } from '@/db/dbConnection';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const mongoose = await import('mongoose');
    const db = mongoose.default.connection.db;

    if (!db) {
      return NextResponse.json(
        { error: 'No se pudo conectar a la base de datos' },
        { status: 500 }
      );
    }

    const collection = db.collection('pagocuotas');

    // Listar índices actuales
    const indexes = await collection.indexes();
    console.log('Índices actuales:', indexes);

    // Intentar eliminar el índice único si existe
    try {
      await collection.dropIndex('financiamiento_1_numeroCuota_1');
      console.log('✅ Índice único eliminado exitosamente');
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️ El índice no existe, no es necesario eliminarlo');
      } else {
        console.error('Error eliminando índice:', error);
        return NextResponse.json(
          { error: `Error eliminando índice: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Crear el índice sin restricción de unicidad
    try {
      await collection.createIndex(
        { financiamiento: 1, numeroCuota: 1 },
        { unique: false, name: 'financiamiento_1_numeroCuota_1' }
      );
      console.log('✅ Índice recreado sin restricción de unicidad');
    } catch (error: any) {
      console.error('Error creando índice:', error);
      return NextResponse.json(
        { error: `Error creando índice: ${error.message}` },
        { status: 500 }
      );
    }

    // Verificar índices finales
    const finalIndexes = await collection.indexes();
    console.log('✅ Índices finales:', finalIndexes);

    return NextResponse.json({
      success: true,
      message: 'Índice actualizado correctamente. Ahora se pueden registrar múltiples pagos de la misma cuota.',
      indexes: finalIndexes,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

