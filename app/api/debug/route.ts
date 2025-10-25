import { NextResponse } from 'next/server';
import { connectDB } from '@/db/dbConnection';
import Usuario from '@/models/Usuario';

export async function GET() {
  try {
    console.log('Iniciando debug de conexión...');

    // Probar conexión
    await connectDB();
    console.log('✅ Conexión a DB exitosa');

    // Probar modelo
    const usuarios = await Usuario.find().limit(1);
    console.log('✅ Modelo Usuario funcionando');
    console.log('Usuarios encontrados:', usuarios.length);

    return NextResponse.json({
      success: true,
      message: 'Debug exitoso',
      usuarios: usuarios.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error en debug:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
