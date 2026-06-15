import { connectDB } from '@/db/dbConnection';
import Cliente from '@/models/cliente';
import Financiamiento from '@/models/financiamiento';
import { formatMoney, normalizarMoneda } from '@/lib/moneda';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Obtener el cliente con información poblada
    const cliente = await Cliente.findById(id)
      .populate('usuarioCreacion', 'nombre usuario email')
      .populate('usuarioModificacion', 'nombre usuario email');

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener financiamientos relacionados al cliente
    const financiamientos = await Financiamiento.find({ cliente: id })
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('empresa', 'nombre descripcion telefono')
      .sort({ fechaVenta: -1 });

    // Generar HTML para impresión
    const html = generateClienteDetailReportHTML(cliente, financiamientos);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generando reporte de detalles del cliente:', error);
    return NextResponse.json(
      { error: 'Error generando reporte' },
      { status: 500 }
    );
  }
}

function generateClienteDetailReportHTML(cliente: any, financiamientos: any[]): string {
  const fechaActual = new Date().toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fmt = (amount: number, fin: any) =>
    formatMoney(amount, normalizarMoneda(fin?.moneda));

  const montosResumenPorMoneda = financiamientos.reduce(
    (
      acc,
      fin
    ): {
      USD: { financiado: number; saldo: number };
      UYU: { financiado: number; saldo: number };
    } => {
      const m = normalizarMoneda(fin.moneda);
      acc[m].financiado += fin.montoTotal || 0;
      acc[m].saldo += fin.saldoPendiente || 0;
      return acc;
    },
    {
      USD: { financiado: 0, saldo: 0 },
      UYU: { financiado: 0, saldo: 0 },
    }
  );

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-UY');
  };

  const formatDateTime = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoLabel = (estado: string) => {
    const estados: { [key: string]: string } = {
      activo: 'Activo',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
      en_mora: 'En Mora',
    };
    return estados[estado] || estado;
  };

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      activo: '#4caf50',
      finalizado: '#2196f3',
      cancelado: '#f44336',
      en_mora: '#ff9800',
    };
    return colores[estado] || '#757575';
  };

  // Calcular totales de financiamientos
  const totalFinanciamientos = financiamientos.length;
  const montoTotalFinanciado = financiamientos.reduce(
    (sum, fin) => sum + (fin.montoTotal || 0),
    0
  );
  const saldoPendienteTotal = financiamientos.reduce(
    (sum, fin) => sum + (fin.saldoPendiente || 0),
    0
  );
  const montoRecaudadoTotal = financiamientos.reduce(
    (sum, fin) => sum + (fin.montoPagado || 0),
    0
  );
  const financiamientosActivos = financiamientos.filter(
    fin => fin.estadoFinanciamiento === 'activo'
  ).length;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Detalles del Cliente - ${cliente.NOMBRE} - CIOMPI</title>
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
    
    .summary-boxes {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .summary-box {
      background: white;
      padding: 12px;
      border-radius: 5px;
      border-left: 4px solid #1e88e5;
      text-align: center;
    }
    
    .summary-box h3 {
      font-size: 10px;
      color: #666;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    
    .summary-box .value {
      font-size: 16px;
      font-weight: 600;
      color: #1e88e5;
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
    
    .estado-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 600;
      text-transform: uppercase;
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
    <h1>DETALLES DEL CLIENTE</h1>
    <p class="subtitle">Información Completa</p>
    <p class="fecha">Generado el ${fechaActual}</p>
  </div>
  
  <!-- Información del Cliente -->
  <div class="section">
    <div class="section-title">Información Personal</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Nombre Completo</div>
        <div class="info-value" style="font-size: 14px; font-weight: 600;">${cliente.NOMBRE || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Cédula</div>
        <div class="info-value monospace">${cliente.cedula || 'No especificada'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Teléfono</div>
        <div class="info-value monospace">${cliente.TELEFONO || 'No especificado'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Correo Electrónico</div>
        <div class="info-value">${cliente.correo || 'No especificado'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Profesión</div>
        <div class="info-value">${cliente.profesion || 'No especificada'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Dirección</div>
        <div class="info-value">${cliente.DIRECCION || 'No especificada'}</div>
      </div>
    </div>
  </div>
  
  <!-- Resumen de Financiamientos -->
  ${financiamientos.length > 0 ? `
  <div class="section">
    <div class="section-title">Resumen de Financiamientos</div>
    <div class="summary-boxes">
      <div class="summary-box">
        <h3>Total Financiamientos</h3>
        <div class="value">${totalFinanciamientos}</div>
      </div>
      <div class="summary-box">
        <h3>Financiamientos Activos</h3>
        <div class="value">${financiamientosActivos}</div>
      </div>
      <div class="summary-box">
        <h3>Monto Total Financiado</h3>
        <div class="value" style="font-size:12px;line-height:1.35;">
          <div>USD: ${formatMoney(montosResumenPorMoneda.USD.financiado, 'USD')}</div>
          <div>UYU: ${formatMoney(montosResumenPorMoneda.UYU.financiado, 'UYU')}</div>
        </div>
      </div>
      <div class="summary-box">
        <h3>Saldo Pendiente</h3>
        <div class="value" style="font-size:12px;line-height:1.35;">
          <div>USD: ${formatMoney(montosResumenPorMoneda.USD.saldo, 'USD')}</div>
          <div>UYU: ${formatMoney(montosResumenPorMoneda.UYU.saldo, 'UYU')}</div>
        </div>
      </div>
    </div>
  </div>
  ` : ''}
  
  <!-- Lista de Financiamientos -->
  ${financiamientos.length > 0 ? `
  <div class="section">
    <div class="section-title">Financiamientos Asociados (${financiamientos.length})</div>
    <table>
      <thead>
        <tr>
          <th style="width: 3%;">#</th>
          <th style="width: 15%;">Vehículo</th>
          <th style="width: 8%;">Matrícula</th>
          <th style="width: 8%;" class="text-right">Costo</th>
          <th style="width: 5%;" class="text-center">Cuotas</th>
          <th style="width: 6%;" class="text-center">Cuotas Pag.</th>
          <th style="width: 8%;" class="text-right">Valor Cuota</th>
          <th style="width: 8%;" class="text-right">Monto Total</th>
          <th style="width: 8%;" class="text-right">Saldo Pend.</th>
          <th style="width: 7%;" class="text-center">Estado</th>
          <th style="width: 8%;" class="text-center">Fecha Venta</th>
        </tr>
      </thead>
      <tbody>
        ${financiamientos
          .map(
            (fin, index) => {
              const vehiculoInfo =
                typeof fin.vehiculo === 'object' && fin.vehiculo
                  ? `${fin.vehiculo.Marca || ''} ${fin.vehiculo.Modelo || ''}`.trim()
                  : '-';
              const matricula =
                typeof fin.vehiculo === 'object' && fin.vehiculo
                  ? fin.vehiculo.Matricula || '-'
                  : '-';
              const estadoColor = getEstadoColor(fin.estadoFinanciamiento);
              
              return `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td><strong>${vehiculoInfo}</strong></td>
          <td>${matricula}</td>
          <td class="text-right">${fmt(fin.costoVehiculo || 0, fin)}</td>
          <td class="text-center">${fin.cuotas || 0}</td>
          <td class="text-center">${fin.cuotasPagadas || 0}</td>
          <td class="text-right">${fmt(fin.valorCuota || 0, fin)}</td>
          <td class="text-right"><strong>${fmt(fin.montoTotal || 0, fin)}</strong></td>
          <td class="text-right">${fmt(fin.saldoPendiente || 0, fin)}</td>
          <td class="text-center">
            <span class="estado-badge" style="background: ${estadoColor}20; color: ${estadoColor};">
              ${getEstadoLabel(fin.estadoFinanciamiento || 'activo')}
            </span>
          </td>
          <td class="text-center">${formatDate(fin.fechaVenta)}</td>
        </tr>
      `;
            }
          )
          .join('')}
      </tbody>
    </table>
  </div>
  ` : `
  <div class="section">
    <div class="section-title">Financiamientos Asociados</div>
    <div class="no-data">Este cliente no tiene financiamientos registrados</div>
  </div>
  `}
  
  <!-- Información del Sistema -->
  <div class="section">
    <div class="section-title">Información del Sistema</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Creado por</div>
        <div class="info-value">
          ${typeof cliente.usuarioCreacion === 'object' && cliente.usuarioCreacion?.nombre
            ? cliente.usuarioCreacion.nombre
            : '-'}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Fecha de Creación</div>
        <div class="info-value">
          ${cliente.createdAt ? formatDateTime(cliente.createdAt) : 'No disponible'}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Modificado por</div>
        <div class="info-value">
          ${typeof cliente.usuarioModificacion === 'object' && cliente.usuarioModificacion?.nombre
            ? cliente.usuarioModificacion.nombre
            : '-'}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Última Actualización</div>
        <div class="info-value">
          ${cliente.updatedAt ? formatDateTime(cliente.updatedAt) : 'No disponible'}
        </div>
      </div>
      <div class="info-item" style="grid-column: 1 / -1;">
        <div class="info-label">ID de Base de Datos</div>
        <div class="info-value monospace" style="font-size: 9px;">${cliente._id}</div>
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

