import { connectDB } from '@/db/dbConnection';
import Cliente from '@/models/cliente';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const cliente = await Cliente.find();
    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const newCliente = new Cliente(body);
    const savedCliente = await newCliente.save();
    return NextResponse.json(savedCliente);
  } catch (error: unknown) {
    console.error('Error creando cliente:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('id');

    if (!clienteId) {
      return NextResponse.json(
        { error: 'ID del cliente es requerido' },
        { status: 400 }
      );
    }

    const clienteEliminado = await Cliente.findByIdAndDelete(clienteId);

    if (!clienteEliminado) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente eliminado exitosamente',
      cliente: clienteEliminado,
    });
  } catch (error: unknown) {
    console.error('Error eliminando cliente:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }
}
