import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/dbConnection';
import { getUserIdFromToken } from '@/lib/server-utils';
import Empresa from '@/models/empresa';
import Financiamiento from '@/models/financiamiento';

// Forzar registro de modelos para populate
void Financiamiento;

// GET - Obtener todas las empresas
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const incluirEliminados = searchParams.get('incluirEliminados') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construir filtro - filtrar eliminados por defecto
    const filter: any = incluirEliminados ? {} : { eliminado: { $ne: true } };
    if (estado) {
      filter.estado = estado;
    }

    const empresas = await Empresa.find(filter)
      .populate('usuarioRegistro', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Empresa.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: empresas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva empresa
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { nombre, descripcion, telefono } = body;

    // Validaciones
    if (!nombre || nombre.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El nombre de la empresa es requerido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una empresa con el mismo nombre
    const empresaExistente = await Empresa.findOne({
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') },
    });

    if (empresaExistente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una empresa con este nombre' },
        { status: 400 }
      );
    }

    // Obtener ID del usuario desde el token con fallback
    const userId = getUserIdFromToken(request) || '68f83df25d5fc999682c6dfb'; // Fallback al admin

    const nuevaEmpresa = new Empresa({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim(),
      telefono: telefono?.trim(),
      usuarioRegistro: userId as any,
      estado: 'activa',
    });

    await nuevaEmpresa.save();
    await nuevaEmpresa.populate('usuarioRegistro', 'nombre usuario email');

    return NextResponse.json(
      {
        success: true,
        data: nuevaEmpresa,
        message: 'Empresa creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
