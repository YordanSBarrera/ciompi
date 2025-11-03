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
      .populate('cliente', 'NOMBRE TELEFONO cedula DIRECCION correo')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
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
        margin: 1.5cm;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .no-print {
        display: none;
      }
      
      .page-break {
        page-break-after: always;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #333;
      background: white;
      padding: 20px;
      line-height: 1.6;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 4px solid #1e88e5;
      padding-bottom: 20px;
    }
    
    .header h1 {
      font-size: 28px;
      color: #1e88e5;
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: #666;
    }
    
    .header .fecha {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
    
    .estado-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 10px;
    }
    
    .section {
      margin-bottom: 25px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 5px;
      border-left: 4px solid #1e88e5;
    }
    
    .section-title {
      font-size: 18px;
      color: #1e88e5;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .info-item {
      padding: 10px;
      background: white;
      border-radius: 3px;
    }
    
    .info-label {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-size: 12px;
      color: #333;
      font-weight: 500;
    }
    
    .info-value.monospace {
      font-family: monospace;
      font-size: 11px;
    }
    
    .info-value.large {
      font-size: 16px;
      font-weight: 600;
    }
    
    .financial-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .financial-box {
      background: white;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #1e88e5;
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
      font-size: 10px;
      color: #666;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    
    .financial-box .value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .progress-bar {
      width: 100%;
      height: 20px;
      background: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      margin: 10px 0;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: 600;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 9px;
      background: white;
    }
    
    thead {
      background: #1e88e5;
      color: white;
    }
    
    th {
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #1565c0;
      font-size: 9px;
    }
    
    td {
      padding: 8px;
      border: 1px solid #ddd;
      font-size: 9px;
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
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 9px;
      color: #666;
    }
    
    .no-data {
      text-align: center;
      padding: 30px;
      color: #999;
      font-size: 12px;
      background: white;
      border-radius: 5px;
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
  
  <!-- Información del Cliente -->
  <div class="section">
    <div class="section-title">Información del Cliente</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Nombre Completo</div>
        <div class="info-value large">${clienteNombre}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Teléfono</div>
        <div class="info-value monospace">
          ${escapeHtml(
            typeof financiamiento?.cliente === 'object' && financiamiento.cliente?.TELEFONO
              ? financiamiento.cliente.TELEFONO
              : 'N/A'
          )}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Cédula</div>
        <div class="info-value monospace">
          ${escapeHtml(
            typeof financiamiento?.cliente === 'object' && financiamiento.cliente?.cedula
              ? financiamiento.cliente.cedula
              : 'N/A'
          )}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Dirección</div>
        <div class="info-value">
          ${escapeHtml(
            typeof financiamiento?.cliente === 'object' && financiamiento.cliente?.DIRECCION
              ? financiamiento.cliente.DIRECCION
              : 'N/A'
          )}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Información del Vehículo -->
  <div class="section">
    <div class="section-title">Información del Vehículo</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Marca y Modelo</div>
        <div class="info-value large">${vehiculoInfo}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Matrícula</div>
        <div class="info-value monospace large">${matricula}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Año</div>
        <div class="info-value">
          ${escapeHtml(
            typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo?.Año
              ? financiamiento.vehiculo.Año
              : 'N/A'
          )}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Color</div>
        <div class="info-value">
          ${escapeHtml(
            typeof financiamiento?.vehiculo === 'object' && financiamiento.vehiculo?.Color
              ? financiamiento.vehiculo.Color
              : 'N/A'
          )}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Información Financiera -->
  <div class="section">
    <div class="section-title">Información Financiera</div>
    <div class="financial-summary">
      <div class="financial-box primary">
        <h3>Costo del Vehículo</h3>
        <div class="value">${formatCurrency(financiamiento?.costoVehiculo)}</div>
      </div>
      <div class="financial-box error">
        <h3>Interés Total</h3>
        <div class="value">${formatCurrency(financiamiento?.interesTotal)}</div>
      </div>
      <div class="financial-box success">
        <h3>Monto Total</h3>
        <div class="value">${formatCurrency(financiamiento?.montoTotal)}</div>
      </div>
      <div class="financial-box warning">
        <h3>Valor de Cuota</h3>
        <div class="value">${formatCurrency(financiamiento?.valorCuota)}</div>
      </div>
    </div>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Cuotas Totales</div>
        <div class="info-value large">${financiamiento?.cuotas || 0}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Cuotas Pagadas</div>
        <div class="info-value large">${financiamiento?.cuotasPagadas || 0}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Cuotas Pendientes</div>
        <div class="info-value large">${financiamiento?.cuotasPendientes || 0}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Progreso</div>
        <div class="info-value large">${financiamiento?.progresoFinanciamiento || 0}%</div>
      </div>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${Math.min(100, Math.max(0, financiamiento?.progresoFinanciamiento || 0))}%;">
        ${financiamiento?.progresoFinanciamiento || 0}%
      </div>
    </div>
    
    <div class="info-grid" style="margin-top: 15px;">
      <div class="info-item">
        <div class="info-label">Monto Pagado</div>
        <div class="info-value large" style="color: #4caf50;">
          ${formatCurrency(financiamiento?.montoPagado)}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Saldo Pendiente</div>
        <div class="info-value large" style="color: #ff9800;">
          ${formatCurrency(financiamiento?.saldoPendiente)}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Fecha Primera Cuota</div>
        <div class="info-value">${formatDate(financiamiento?.fechaPrimeraCuota)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Fecha Última Cuota</div>
        <div class="info-value">${formatDate(financiamiento?.fechaUltimaCuota)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Fecha de Venta</div>
        <div class="info-value">${formatDate(financiamiento?.fechaVenta)}</div>
      </div>
      ${financiamiento?.observaciones ? `
      <div class="info-item" style="grid-column: 1 / -1;">
        <div class="info-label">Observaciones</div>
        <div class="info-value">${escapeHtml(financiamiento.observaciones)}</div>
      </div>
      ` : ''}
    </div>
  </div>
  
  <!-- Historial de Pagos -->
  ${pagos.length > 0 ? `
  <div class="section">
    <div class="section-title">Historial de Pagos (${totalPagos} pagos - Total: ${formatCurrency(montoTotalPagado)})</div>
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: 12%;" class="text-center">Número Cuota</th>
          <th style="width: 12%;" class="text-center">Fecha Pago</th>
          <th style="width: 12%;" class="text-right">Monto</th>
          <th style="width: 12%;" class="text-center">Método</th>
          <th style="width: 12%;">N° Comprobante</th>
          <th style="width: 12%;">Banco</th>
          <th style="width: 15%;">Registrado por</th>
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
          <td>${escapeHtml(pago?.numeroComprobante || '-')}</td>
          <td>${escapeHtml(pago?.banco || '-')}</td>
          <td>
            ${escapeHtml(
              typeof pago?.usuarioRegistro === 'object' && pago.usuarioRegistro?.nombre
                ? pago.usuarioRegistro.nombre
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
    <div class="section-title">Historial de Pagos</div>
    <div class="no-data">No se han registrado pagos para este financiamiento</div>
  </div>
  `}
  
  <!-- Información del Sistema -->
  <div class="section">
    <div class="section-title">Información del Sistema</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Registrado por</div>
        <div class="info-value">
          ${escapeHtml(
            typeof financiamiento?.usuarioRegistro === 'object' && financiamiento.usuarioRegistro?.nombre
              ? financiamiento.usuarioRegistro.nombre
              : '-'
          )}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Fecha de Creación</div>
        <div class="info-value">
          ${formatDateTime(financiamiento?.createdAt)}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Modificado por</div>
        <div class="info-value">
          ${escapeHtml(
            typeof financiamiento?.usuarioModificacion === 'object' && financiamiento.usuarioModificacion?.nombre
              ? financiamiento.usuarioModificacion.nombre
              : '-'
          )}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Última Actualización</div>
        <div class="info-value">
          ${formatDateTime(financiamiento?.updatedAt)}
        </div>
      </div>
      <div class="info-item" style="grid-column: 1 / -1;">
        <div class="info-label">ID de Base de Datos</div>
        <div class="info-value monospace" style="font-size: 9px;">${escapeHtml(finId)}</div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>CIOMPI - Sistema de Gestión de Financiamientos</p>
    <p>Página generada automáticamente</p>
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

