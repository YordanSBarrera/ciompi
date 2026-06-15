import { connectDB } from '@/db/dbConnection';
import { getUserIdFromToken, requireAdminAuth } from '@/lib/server-utils';
import Cliente from '@/models/cliente';
import Financiamiento from '@/models/financiamiento';
import { NextRequest, NextResponse } from 'next/server';

// Forzar registro de modelos para populate
void Financiamiento;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Parámetro de búsqueda
    const search = searchParams.get('search') || '';
    const incluirEliminados = searchParams.get('incluirEliminados') === 'true';
    
    // Construir query base - filtrar eliminados por defecto
    let query: any = incluirEliminados ? {} : { eliminado: { $ne: true } };
    
    // Si hay búsqueda, buscar en múltiples campos
    if (search) {
      const searchLower = search.trim().toLowerCase();
      query.$and = [
        query.eliminado !== undefined ? { eliminado: query.eliminado } : {},
        {
          $or: [
            { NOMBRE: { $regex: searchLower, $options: 'i' } },
            { DIRECCION: { $regex: searchLower, $options: 'i' } },
            { TELEFONO: { $regex: searchLower, $options: 'i' } },
            { correo: { $regex: searchLower, $options: 'i' } },
            { profesion: { $regex: searchLower, $options: 'i' } },
            { cedula: { $regex: searchLower, $options: 'i' } },
          ]
        }
      ];
      // Limpiar el query para evitar duplicados
      if (!incluirEliminados) {
        query = {
          eliminado: { $ne: true },
          $or: [
            { NOMBRE: { $regex: searchLower, $options: 'i' } },
            { DIRECCION: { $regex: searchLower, $options: 'i' } },
            { TELEFONO: { $regex: searchLower, $options: 'i' } },
            { correo: { $regex: searchLower, $options: 'i' } },
            { profesion: { $regex: searchLower, $options: 'i' } },
            { cedula: { $regex: searchLower, $options: 'i' } },
          ]
        };
      } else {
        query = {
          $or: [
            { NOMBRE: { $regex: searchLower, $options: 'i' } },
            { DIRECCION: { $regex: searchLower, $options: 'i' } },
            { TELEFONO: { $regex: searchLower, $options: 'i' } },
            { correo: { $regex: searchLower, $options: 'i' } },
            { profesion: { $regex: searchLower, $options: 'i' } },
            { cedula: { $regex: searchLower, $options: 'i' } },
          ]
        };
      }
    }
    
    // Obtener clientes con paginación
    const clientes = await Cliente.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Usar lean() para mejor rendimiento
    
    // Contar total de documentos que coinciden con el query
    const total = await Cliente.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: clientes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
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

    // Obtener ID del usuario desde el token
    const userId = getUserIdFromToken(request) || '68f83df25d5fc999682c6dfb'; // Fallback al admin
    const body = await request.json();
    const newCliente = new Cliente({
      ...body,
      usuarioCreacion: userId,
      usuarioModificacion: userId,
    });
    const savedCliente = await newCliente.save();
    await savedCliente.populate('usuarioCreacion', 'nombre usuario email');
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

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('id');

    if (!clienteId) {
      return NextResponse.json(
        { error: 'ID del cliente es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya está eliminado
    if (cliente.eliminado) {
      return NextResponse.json(
        { error: 'El cliente ya fue eliminado anteriormente' },
        { status: 400 }
      );
    }

    // Verificar si está en algún financiamiento ACTIVO (como cliente o cliente2)
    const financiamientoActivo = await Financiamiento.findOne({
      $or: [
        { cliente: clienteId },
        { cliente2: clienteId }
      ],
      estadoFinanciamiento: { $in: ['activo', 'en_mora'] }
    });

    if (financiamientoActivo) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el cliente porque está asociado a un financiamiento activo',
          financiamientoId: financiamientoActivo._id 
        },
        { status: 409 } // Conflict
      );
    }

    // Obtener ID del usuario para auditoría
    const userId = auth.user.id;

    // Soft delete: marcar como eliminado en lugar de borrar
    const clienteEliminado = await Cliente.findByIdAndUpdate(
      clienteId,
      {
        eliminado: true,
        fechaEliminacion: new Date(),
        usuarioEliminacion: userId,
        usuarioModificacion: userId,
      },
      { new: true }
    );

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
