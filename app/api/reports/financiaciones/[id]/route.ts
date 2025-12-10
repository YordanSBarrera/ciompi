import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import PagoCuota from '@/models/pagoCuota';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Obtener el financiamiento con información poblada
    const financiamiento = await Financiamiento.findById(id)
      .populate('cliente', 'NOMBRE TELEFONO cedula DIRECCION correo profesion')
      .populate('cliente2', 'NOMBRE TELEFONO cedula DIRECCION correo profesion')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color Padron Descripcion disponible')
      .populate('empresa', 'nombre descripcion telefono')
      .populate('usuarioRegistro', 'nombre usuario email')
      .populate('usuarioCreacion', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email');

    if (!financiamiento) {
      return NextResponse.json(
        { error: 'Financiamiento no encontrado' },
        { status: 404 }
      );
    }

    // Obtener pagos relacionados
    const pagos = await PagoCuota.find({ financiamiento: id })
      .populate('usuarioRegistro', 'nombre usuario')
      .sort({ fechaPago: -1 });

    // Generar HTML para impresión
    const html = generateFinanciamientoDetailReportHTML(
      financiamiento,
      pagos
    );

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generando reporte de detalles del financiamiento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error generando reporte: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function generateFinanciamientoDetailReportHTML(
  financiamiento: any,
  pagos: any[]
): string {
  // Función para escapar HTML y prevenir errores
  const escapeHtml = (text: any): string => {
    if (text === null || text === undefined) return '';
    const str = String(text);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const fechaActual = new Date().toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '$0.00';
    try {
      return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(amount);
    } catch {
      return '$0.00';
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('es-UY');
    } catch {
      return '-';
    }
  };

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString('es-UY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const getEstadoLabel = (estado: string | null | undefined) => {
    if (!estado) return 'Activo';
    const estados: { [key: string]: string } = {
      activo: 'Activo',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
      en_mora: 'En Mora',
    };
    return estados[estado] || estado;
  };

  const getEstadoColor = (estado: string | null | undefined) => {
    if (!estado) return '#4caf50';
    const colores: { [key: string]: string } = {
      activo: '#4caf50',
      finalizado: '#2196f3',
      cancelado: '#f44336',
      en_mora: '#ff9800',
    };
    return colores[estado] || '#757575';
  };

  const estadoColor = getEstadoColor(financiamiento?.estadoFinanciamiento);
  const clienteNombre =
    typeof financiamiento?.cliente === 'object' && financiamiento.cliente
      ? escapeHtml(financiamiento.cliente.NOMBRE || 'N/A')
      : 'N/A';
  const vehiculoInfo =
    typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo
      ? escapeHtml(
          `${financiamiento.vehiculo.Marca || ''} ${financiamiento.vehiculo.Modelo || ''}`.trim() || 'N/A'
        )
      : 'N/A';
  const matricula =
    typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo
      ? escapeHtml(financiamiento.vehiculo.Matricula || 'N/A')
      : 'N/A';

  // Calcular estadísticas de pagos
  const totalPagos = pagos?.length || 0;
  const montoTotalPagado = (pagos || []).reduce(
    (sum, pago) => sum + (pago?.montoPago || 0),
    0
  );
  
  // Generar todas las cuotas (normales y extras)
  const generarTodasLasCuotas = () => {
    if (!financiamiento) return [];

    // Calcular el monto pagado por cada cuota
    const pagosPorCuota: { [key: number]: number } = {};
    pagos
      .filter(
        pago =>
          !pago.esExtra && pago.numeroCuota && pago.estadoPago === 'confirmado'
      )
      .forEach(pago => {
        const numCuota = pago.numeroCuota!;
        if (!pagosPorCuota[numCuota]) {
          pagosPorCuota[numCuota] = 0;
        }
        pagosPorCuota[numCuota] += pago.montoPago;
      });

    const todasLasCuotas: Array<{
      numeroCuota: number;
      fechaVencimiento: Date;
      valorCuota: number;
      esExtra: boolean;
      pagada: boolean;
      montoPagado: number;
      montoPendiente: number;
    }> = [];

    // Si hay cuotasFuturas definidas, usarlas
    if (
      financiamiento.cuotasFuturas &&
      financiamiento.cuotasFuturas.length > 0
    ) {
      financiamiento.cuotasFuturas.forEach((cuota: { numeroCuota: number; fechaVencimiento: Date; valorCuota: number }) => {
        const fechaVencimiento = new Date(cuota.fechaVencimiento);
        const esExtra = cuota.numeroCuota > financiamiento.cuotas;
        
        // Calcular pagos para esta cuota específica
        let montoPagado = 0;
        if (esExtra) {
          // Para cuotas extras, buscar pagos extras con este número de cuota
          montoPagado = pagos
            .filter(
              pago =>
                pago.esExtra &&
                pago.numeroCuota === cuota.numeroCuota &&
                pago.estadoPago === 'confirmado'
            )
            .reduce((sum, pago) => sum + pago.montoPago, 0);
        } else {
          // Para cuotas normales, usar el cálculo existente
          montoPagado = pagosPorCuota[cuota.numeroCuota] || 0;
        }
        
        const pagada = montoPagado >= cuota.valorCuota;
        const montoPendiente = Math.max(0, cuota.valorCuota - montoPagado);

        todasLasCuotas.push({
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento,
          valorCuota: cuota.valorCuota,
          esExtra: esExtra,
          pagada,
          montoPagado,
          montoPendiente,
        });
      });
    } else {
      // Si no hay cuotasFuturas, calcular las fechas basándome en fechaPrimeraCuota
      const fechaPrimera = new Date(financiamiento.fechaPrimeraCuota);
      for (let i = 1; i <= financiamiento.cuotas; i++) {
        const fechaVencimiento = new Date(fechaPrimera);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i - 1);

        const montoPagado = pagosPorCuota[i] || 0;
        const pagada = montoPagado >= financiamiento.valorCuota;
        const montoPendiente = Math.max(
          0,
          financiamiento.valorCuota - montoPagado
        );

        todasLasCuotas.push({
          numeroCuota: i,
          fechaVencimiento,
          valorCuota: financiamiento.valorCuota,
          esExtra: false,
          pagada,
          montoPagado,
          montoPendiente,
        });
      }
    }

    // Agregar cuotas extras si existen y no están ya en cuotasFuturas
    // Solo si no hay cuotasFuturas o si hay menos cuotas extras de las esperadas
    if (financiamiento.cuotasExtras && financiamiento.cuotasExtras > 0) {
      // Contar cuántas cuotas extras ya están en todasLasCuotas
      const cuotasExtrasExistentes = todasLasCuotas.filter(
        c => c.esExtra
      ).length;
      
      // Si faltan cuotas extras, generarlas
      if (cuotasExtrasExistentes < financiamiento.cuotasExtras) {
        // Obtener la fecha de la última cuota normal
        const fechaUltima =
          todasLasCuotas.length > 0
            ? new Date(todasLasCuotas[todasLasCuotas.length - 1].fechaVencimiento)
            : financiamiento.cuotasFuturas &&
                financiamiento.cuotasFuturas.length > 0
              ? new Date(
                  financiamiento.cuotasFuturas[
                    financiamiento.cuotasFuturas.length - 1
                  ].fechaVencimiento
                )
              : new Date(financiamiento.fechaUltimaCuota);

        // Obtener el número de cuota más alto para las extras
        const maxNumeroCuota = todasLasCuotas.length > 0
          ? Math.max(...todasLasCuotas.map(c => c.numeroCuota))
          : financiamiento.cuotas;

        // Generar solo las cuotas extras faltantes
        const cuotasExtrasFaltantes = financiamiento.cuotasExtras - cuotasExtrasExistentes;
        for (let i = 1; i <= cuotasExtrasFaltantes; i++) {
          const fechaVencimiento = new Date(fechaUltima);
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

          const numeroCuotaExtra = maxNumeroCuota + i;
          const montoPagadoExtra = pagos
            .filter(
              pago =>
                pago.esExtra &&
                pago.numeroCuota === numeroCuotaExtra &&
                pago.estadoPago === 'confirmado'
            )
            .reduce((sum, pago) => sum + pago.montoPago, 0);
          const montoPendienteExtra = Math.max(
            0,
            financiamiento.valorCuota - montoPagadoExtra
          );

          todasLasCuotas.push({
            numeroCuota: numeroCuotaExtra,
            fechaVencimiento,
            valorCuota: financiamiento.valorCuota,
            esExtra: true,
            pagada: montoPagadoExtra >= financiamiento.valorCuota,
            montoPagado: montoPagadoExtra,
            montoPendiente: montoPendienteExtra,
          });
        }
      }
    }

    return todasLasCuotas.sort((a, b) => a.numeroCuota - b.numeroCuota);
  };

  const todasLasCuotas = generarTodasLasCuotas();
  
  // Asegurar valores por defecto
  const finId = financiamiento?._id?.toString() || 'N/A';
  const finIdShort = finId !== 'N/A' ? finId.slice(-8) : 'N/A';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Detalles del Financiamiento #${finIdShort} - CIOMPI</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @media print {
      @page {
        size: A4;
        margin: 0.8cm;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        padding: 0;
      }
      
      .no-print {
        display: none;
      }
      
      .page-break {
        page-break-after: always;
      }
      
      .section {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 8px;
      color: #333;
      background: white;
      padding: 0;
      line-height: 1.3;
      margin: 0;
    }
    
    .header {
      text-align: center;
      margin-bottom: 8px;
      border-bottom: 2px solid #1e88e5;
      padding-bottom: 6px;
    }
    
    .header h1 {
      font-size: 14px;
      color: #1e88e5;
      margin: 0 0 3px 0;
      font-weight: 700;
    }
    
    .header .subtitle {
      font-size: 10px;
      color: #666;
      margin: 0;
    }
    
    .header .fecha {
      font-size: 8px;
      color: #999;
      margin: 2px 0 0 0;
    }
    
    .estado-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 3px;
    }
    
    .section {
      margin-bottom: 6px;
      padding: 6px;
      background: #f9f9f9;
      border-radius: 3px;
      border-left: 3px solid #1e88e5;
      break-inside: avoid;
    }
    
    .section-title {
      font-size: 10px;
      color: #1e88e5;
      font-weight: 600;
      margin: 0 0 5px 0;
      padding-bottom: 3px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      margin-bottom: 5px;
    }
    
    .info-item {
      padding: 4px;
      background: white;
      border-radius: 2px;
    }
    
    .info-label {
      font-size: 7px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .info-value {
      font-size: 9px;
      color: #333;
      font-weight: 500;
      line-height: 1.2;
    }
    
    .info-value.monospace {
      font-family: monospace;
      font-size: 8px;
    }
    
    .info-value.large {
      font-size: 10px;
      font-weight: 600;
    }
    
    .financial-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      margin-bottom: 6px;
    }
    
    .financial-box {
      background: white;
      padding: 5px;
      border-radius: 3px;
      border-left: 3px solid #1e88e5;
      text-align: center;
    }
    
    .financial-box.primary {
      border-left-color: #1e88e5;
    }
    
    .financial-box.success {
      border-left-color: #4caf50;
    }
    
    .financial-box.error {
      border-left-color: #f44336;
    }
    
    .financial-box.warning {
      border-left-color: #ff9800;
    }
    
    .financial-box h3 {
      font-size: 7px;
      color: #666;
      margin: 0 0 3px 0;
      text-transform: uppercase;
      font-weight: 600;
    }
    
    .financial-box .value {
      font-size: 11px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    .progress-bar {
      width: 100%;
      height: 12px;
      background: #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
      margin: 4px 0;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 7px;
      font-weight: 600;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      font-size: 7px;
      background: white;
    }
    
    thead {
      background: #1e88e5;
      color: white;
    }
    
    th {
      padding: 4px 3px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #1565c0;
      font-size: 7px;
      line-height: 1.2;
    }
    
    td {
      padding: 3px;
      border: 1px solid #ddd;
      font-size: 7px;
      line-height: 1.2;
    }
    
    tbody tr:nth-child(even) {
      background: #f9f9f9;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-right {
      text-align: right;
    }
    
    .footer {
      margin-top: 8px;
      padding-top: 5px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 7px;
      color: #666;
    }
    
    .no-data {
      text-align: center;
      padding: 10px;
      color: #999;
      font-size: 8px;
      background: white;
      border-radius: 3px;
    }
    
    .compact-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-bottom: 6px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>DETALLES DEL FINANCIAMIENTO</h1>
    <p class="subtitle">Financiamiento #${finIdShort}</p>
    <p class="fecha">Generado el ${fechaActual}</p>
    <span class="estado-badge" style="background: ${estadoColor}20; color: ${estadoColor};">
      ${getEstadoLabel(financiamiento?.estadoFinanciamiento)}
    </span>
  </div>
  
  <!-- Información de Clientes y Vehículo -->
  <div class="compact-row">
    <div class="section">
      <div class="section-title">Cliente Principal</div>
      <div style="font-size: 9px; font-weight: 600; margin-bottom: 4px;">${clienteNombre}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Cédula:</strong> ${escapeHtml(
        typeof financiamiento?.cliente === 'object' && financiamiento.cliente?.cedula
          ? financiamiento.cliente.cedula
          : 'N/A'
      )}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Prof:</strong> ${escapeHtml(
        typeof financiamiento?.cliente === 'object' && financiamiento.cliente?.profesion
          ? financiamiento.cliente.profesion
          : 'N/A'
      )}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Tel:</strong> ${escapeHtml(
        typeof financiamiento?.cliente === 'object' && financiamiento.cliente?.TELEFONO
          ? financiamiento.cliente.TELEFONO
          : 'N/A'
      )}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Email:</strong> ${escapeHtml(
        typeof financiamiento?.cliente === 'object' && financiamiento.cliente?.correo
          ? financiamiento.cliente.correo
          : 'N/A'
      )}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Dir:</strong> ${escapeHtml(
        typeof financiamiento?.cliente === 'object' && financiamiento.cliente?.DIRECCION
          ? financiamiento.cliente.DIRECCION
          : 'N/A'
      )}</div>
    </div>
    
    ${financiamiento?.cliente2 && typeof financiamiento.cliente2 === 'object' ? `
    <div class="section">
      <div class="section-title">Segundo Cliente</div>
      <div style="font-size: 9px; font-weight: 600; margin-bottom: 4px;">${escapeHtml(financiamiento.cliente2.NOMBRE || 'N/A')}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Cédula:</strong> ${escapeHtml(financiamiento.cliente2.cedula || 'N/A')}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Prof:</strong> ${escapeHtml(financiamiento.cliente2.profesion || 'N/A')}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Tel:</strong> ${escapeHtml(financiamiento.cliente2.TELEFONO || 'N/A')}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Email:</strong> ${escapeHtml(financiamiento.cliente2.correo || 'N/A')}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Dir:</strong> ${escapeHtml(financiamiento.cliente2.DIRECCION || 'N/A')}</div>
    </div>
    ` : `
    <div class="section">
      <div class="section-title">Vehículo</div>
      <div style="font-size: 9px; font-weight: 600; margin-bottom: 4px;">${vehiculoInfo}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Matrícula:</strong> ${matricula}</div>
      ${typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo?.Padron ? `
      <div style="font-size: 7px; margin: 2px 0;"><strong>Padrón:</strong> ${escapeHtml(financiamiento.vehiculo.Padron.toString())}</div>
      ` : ''}
      <div style="font-size: 7px; margin: 2px 0;"><strong>Año:</strong> ${escapeHtml(
        typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo?.Año
          ? financiamiento.vehiculo.Año
          : 'N/A'
      )}</div>
      <div style="font-size: 7px; margin: 2px 0;"><strong>Color:</strong> ${escapeHtml(
        typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo?.Color
          ? financiamiento.vehiculo.Color
          : 'N/A'
      )}</div>
      ${typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo?.Descripcion ? `
      <div style="font-size: 7px; margin: 2px 0;"><strong>Desc:</strong> ${escapeHtml(financiamiento.vehiculo.Descripcion)}</div>
      ` : ''}
    </div>
    `}
  </div>
  
  ${financiamiento?.cliente2 && typeof financiamiento.cliente2 === 'object' ? `
  <!-- Información del Vehículo (si hay 2 clientes, va en nueva fila) -->
  <div class="section">
    <div class="section-title">Vehículo</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Marca y Modelo</div>
        <div class="info-value large">${vehiculoInfo}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Matrícula</div>
        <div class="info-value monospace large">${matricula}</div>
      </div>
      ${typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo?.Padron ? `
      <div class="info-item">
        <div class="info-label">Padrón</div>
        <div class="info-value">${escapeHtml(financiamiento.vehiculo.Padron.toString())}</div>
      </div>
      ` : ''}
      <div class="info-item">
        <div class="info-label">Año</div>
        <div class="info-value">${escapeHtml(
          typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo?.Año
            ? financiamiento.vehiculo.Año
            : 'N/A'
        )}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Color</div>
        <div class="info-value">${escapeHtml(
          typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo?.Color
            ? financiamiento.vehiculo.Color
            : 'N/A'
        )}</div>
      </div>
      ${typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo?.Descripcion ? `
      <div class="info-item" style="grid-column: 1 / -1;">
        <div class="info-label">Descripción</div>
        <div class="info-value">${escapeHtml(financiamiento.vehiculo.Descripcion)}</div>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}
  
  <!-- Información de Empresa -->
  ${typeof financiamiento?.empresa === 'object' && financiamiento.empresa ? `
  <div class="section">
    <div class="section-title">Empresa</div>
    <div style="font-size: 8px;">
      <strong>Nombre:</strong> ${escapeHtml(financiamiento.empresa.nombre || 'N/A')} | 
      <strong>Tel:</strong> ${escapeHtml(financiamiento.empresa.telefono || 'N/A')}
      ${financiamiento.empresa.descripcion ? ` | <strong>Desc:</strong> ${escapeHtml(financiamiento.empresa.descripcion)}` : ''}
    </div>
  </div>
  ` : ''}
  
  <!-- Información Financiera -->
  <div class="section">
    <div class="section-title">Información Financiera</div>
    <div class="financial-summary">
      <div class="financial-box primary">
        <h3>Costo</h3>
        <div class="value">${formatCurrency(financiamiento?.costoVehiculo)}</div>
      </div>
      <div class="financial-box error">
        <h3>Interés</h3>
        <div class="value">${formatCurrency(financiamiento?.interesTotal)}</div>
      </div>
      <div class="financial-box success">
        <h3>Total</h3>
        <div class="value">${formatCurrency(financiamiento?.montoTotal)}</div>
      </div>
      <div class="financial-box warning">
        <h3>Cuota</h3>
        <div class="value">${formatCurrency(financiamiento?.valorCuota)}</div>
      </div>
    </div>
    
    <div class="info-grid" style="margin-top: 4px;">
      <div class="info-item">
        <div class="info-label">Cuotas</div>
        <div class="info-value">${financiamiento?.cuotas || 0} total | ${financiamiento?.cuotasPagadas || 0} pagadas</div>
      </div>
      <div class="info-item">
        <div class="info-label">Progreso</div>
        <div class="info-value">${financiamiento?.progresoFinanciamiento || 0}%</div>
      </div>
      <div class="info-item">
        <div class="info-label">Montos</div>
        <div class="info-value">Pagado: <span style="color: #4caf50;">${formatCurrency(financiamiento?.montoPagado)}</span> | Pendiente: <span style="color: #ff9800;">${formatCurrency(financiamiento?.saldoPendiente)}</span></div>
      </div>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${Math.min(100, Math.max(0, financiamiento?.progresoFinanciamiento || 0))}%;">
        ${financiamiento?.progresoFinanciamiento || 0}%
      </div>
    </div>
    
    <div style="font-size: 7px; margin-top: 4px; color: #666;">
      <strong>Fechas:</strong> Venta: ${formatDate(financiamiento?.fechaVenta)} | 
      Primera: ${formatDate(financiamiento?.fechaPrimeraCuota)} | 
      Última: ${formatDate(financiamiento?.fechaUltimaCuota)}
    </div>
    ${financiamiento?.observaciones ? `
    <div style="font-size: 7px; margin-top: 4px; padding: 4px; background: white; border-radius: 2px;">
      <strong>Observaciones:</strong> ${escapeHtml(financiamiento.observaciones)}
    </div>
    ` : ''}
  </div>
  
  <!-- Progreso del Financiamiento -->
  <div class="section">
    <div class="section-title">Progreso del Financiamiento</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Cuotas Pagadas / Total</div>
        <div class="info-value large">${financiamiento?.cuotasPagadas || 0} / ${financiamiento?.cuotas || 0}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Progreso</div>
        <div class="info-value large">${financiamiento?.progresoFinanciamiento || 0}%</div>
      </div>
      <div class="info-item">
        <div class="info-label">Saldo Pendiente</div>
        <div class="info-value large" style="color: #ff9800;">${formatCurrency(financiamiento?.saldoPendiente)}</div>
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${Math.min(100, Math.max(0, financiamiento?.progresoFinanciamiento || 0))}%;">
        ${financiamiento?.progresoFinanciamiento || 0}%
      </div>
    </div>
    <div style="font-size: 7px; margin-top: 4px; color: #666;">
      <strong>Monto Pagado:</strong> <span style="color: #4caf50;">${formatCurrency(financiamiento?.montoPagado)}</span>
    </div>
  </div>
  
  <!-- Fechas de Cuotas -->
  ${todasLasCuotas.length > 0 ? `
  <div class="section">
    <div class="section-title">Fechas de Cuotas</div>
    <table>
      <thead>
        <tr>
          <th style="width: 8%;" class="text-center">Cuota</th>
          <th style="width: 15%;" class="text-center">Fecha Vencimiento</th>
          <th style="width: 12%;" class="text-right">Valor</th>
          <th style="width: 12%;" class="text-right">Pagado</th>
          <th style="width: 12%;" class="text-right">Pendiente</th>
          <th style="width: 10%;" class="text-center">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${todasLasCuotas
          .map(cuota => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaVenc = new Date(cuota.fechaVencimiento);
            fechaVenc.setHours(0, 0, 0, 0);
            const vencida = !cuota.pagada && fechaVenc < hoy;
            const estadoText = cuota.pagada
              ? 'Pagada'
              : cuota.montoPagado > 0
                ? 'Parcial'
                : vencida
                  ? 'Vencida'
                  : 'Pendiente';
            const estadoColor = cuota.pagada
              ? '#4caf50'
              : cuota.montoPagado > 0
                ? '#ff9800'
                : vencida
                  ? '#f44336'
                  : '#666';
            
            return `
        <tr style="background-color: ${cuota.pagada ? '#e8f5e9' : vencida ? '#ffebee' : 'transparent'};">
          <td class="text-center">
            <strong>#${cuota.numeroCuota}</strong>
            ${cuota.esExtra ? ' <span style="font-size: 6px; color: #999;">(Extra)</span>' : ''}
          </td>
          <td class="text-center" style="${vencida && !cuota.pagada ? 'color: #f44336; font-weight: 600;' : ''}">${formatDate(cuota.fechaVencimiento)}</td>
          <td class="text-right"><strong>${formatCurrency(cuota.valorCuota)}</strong></td>
          <td class="text-right" style="${cuota.montoPagado > 0 ? 'color: #4caf50;' : ''}">${formatCurrency(cuota.montoPagado || 0)}</td>
          <td class="text-right" style="${cuota.montoPendiente > 0 ? 'color: #f44336;' : ''}">${formatCurrency(cuota.montoPendiente || 0)}</td>
          <td class="text-center">
            <span style="font-size: 6px; padding: 2px 6px; border-radius: 3px; background: ${estadoColor}20; color: ${estadoColor}; font-weight: 600;">
              ${estadoText}
            </span>
          </td>
        </tr>
      `;
          })
          .join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  <!-- Historial de Pagos -->
  ${pagos.length > 0 ? `
  <div class="section">
    <div class="section-title">Pagos (${totalPagos} - Total: ${formatCurrency(montoTotalPagado)})</div>
    <table>
      <thead>
        <tr>
          <th style="width: 4%;">#</th>
          <th style="width: 8%;" class="text-center">Cuota</th>
          <th style="width: 10%;" class="text-center">Fecha</th>
          <th style="width: 10%;" class="text-right">Monto</th>
          <th style="width: 10%;" class="text-center">Método</th>
          <th style="width: 12%;">Comprobante</th>
          <th style="width: 12%;">Banco</th>
          <th style="width: 10%;">Registrado</th>
        </tr>
      </thead>
      <tbody>
        ${(pagos || [])
          .map(
            (pago, index) => `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td class="text-center"><strong>${pago?.numeroCuota || '-'}</strong></td>
          <td class="text-center">${formatDate(pago?.fechaPago)}</td>
          <td class="text-right"><strong>${formatCurrency(pago?.montoPago)}</strong></td>
          <td class="text-center">${escapeHtml(pago?.metodoPago || '-')}</td>
          <td style="font-size: 6px;">${escapeHtml(pago?.numeroComprobante || '-')}</td>
          <td style="font-size: 6px;">${escapeHtml(pago?.banco || '-')}</td>
          <td style="font-size: 6px;">
            ${escapeHtml(
              typeof pago?.usuarioRegistro === 'object' && pago.usuarioRegistro?.nombre
                ? pago.usuarioRegistro.nombre.split(' ')[0]
                : '-'
            )}
          </td>
        </tr>
      `
          )
          .join('')}
      </tbody>
    </table>
  </div>
  ` : `
  <div class="section">
    <div class="section-title">Pagos</div>
    <div class="no-data">No hay pagos registrados</div>
  </div>
  `}
  
  <div class="footer">
    <p>CIOMPI - ${fechaActual}</p>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  return html;
}

