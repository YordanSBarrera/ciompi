import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/dbConnection';
import { getUserIdFromToken } from '@/lib/server-utils';
import Empresa from '@/models/empresa';

// GET - Obtener empresa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const empresa = await Empresa.findById(params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

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
    const empresa = await Empresa.findById(params.id);
    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si ya existe otra empresa con el mismo nombre
    const empresaExistente = await Empresa.findOne({
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') },
      _id: { $ne: params.id },
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
    // Asignar usuario de modificación si existe token
    const userId = getUserIdFromToken(request) || '68f83df25d5fc999682c6dfb';
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

// DELETE - Eliminar empresa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const empresa = await Empresa.findById(params.id);
    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // En lugar de eliminar físicamente, cambiar estado a inactiva
    empresa.estado = 'inactiva';
    await empresa.save();

    return NextResponse.json({
      success: true,
      message: 'Empresa desactivada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
