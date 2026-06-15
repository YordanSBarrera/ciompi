import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/dbConnection';
import { requireAdminAuth } from '@/lib/server-utils';
import Empresa from '@/models/empresa';
import Financiamiento from '@/models/financiamiento';

// Forzar registro de modelos para populate
void Financiamiento;

// GET - Obtener empresa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const empresa = await Empresa.findById(id)
      .populate('usuarioRegistro', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email');

    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: empresa,
    });
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar empresa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { nombre, descripcion, telefono, estado } = body;

    // Validaciones
    if (!nombre || nombre.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El nombre de la empresa es requerido' },
        { status: 400 }
      );
    }

    // Verificar si la empresa existe
    const empresa = await Empresa.findById(id);
    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si ya existe otra empresa con el mismo nombre
    const empresaExistente = await Empresa.findOne({
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') },
      _id: { $ne: id },
    });

    if (empresaExistente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe otra empresa con este nombre' },
        { status: 400 }
      );
    }

    // Actualizar empresa
    empresa.nombre = nombre.trim();
    empresa.descripcion = descripcion?.trim();
    empresa.telefono = telefono?.trim();
    if (estado) {
      empresa.estado = estado;
    }
    // Asignar usuario de modificación autenticado
    const userId = auth.user.id;
    empresa.usuarioModificacion = userId as any;

    await empresa.save();
    await empresa.populate('usuarioRegistro', 'nombre usuario email');
    await empresa.populate('usuarioModificacion', 'nombre usuario email');

    return NextResponse.json({
      success: true,
      data: empresa,
      message: 'Empresa actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar empresa (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response;
    }

    await connectDB();
    const { id } = await params;

    const empresa = await Empresa.findById(id);
    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si ya está eliminada
    if (empresa.eliminado) {
      return NextResponse.json(
        { success: false, error: 'La empresa ya fue eliminada anteriormente' },
        { status: 400 }
      );
    }

    // Verificar si está en algún financiamiento ACTIVO
    const financiamientoActivo = await Financiamiento.findOne({
      empresa: id,
      estadoFinanciamiento: { $in: ['activo', 'en_mora'] }
    });

    if (financiamientoActivo) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No se puede eliminar la empresa porque está asociada a un financiamiento activo',
          financiamientoId: financiamientoActivo._id 
        },
        { status: 409 } // Conflict
      );
    }

    // Obtener ID del usuario para auditoría
    const userId = auth.user.id;

    // Soft delete: marcar como eliminado y cambiar estado a inactiva
    empresa.eliminado = true;
    empresa.fechaEliminacion = new Date();
    empresa.usuarioEliminacion = userId as any;
    empresa.usuarioModificacion = userId as any;
    empresa.estado = 'inactiva';
    await empresa.save();

    return NextResponse.json({
      success: true,
      message: 'Empresa eliminada exitosamente',
      data: empresa,
    });
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
