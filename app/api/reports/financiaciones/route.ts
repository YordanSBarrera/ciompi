import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener parámetros de la query
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');

    // Construir query
    let query: any = {};
    if (estado) {
      query.estadoFinanciamiento = estado;
    }

    // Obtener financiamientos con información poblada
    const financiamientos = await Financiamiento.find(query)
      .populate('cliente', 'NOMBRE TELEFONO cedula')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('empresa', 'nombre descripcion telefono')
      .sort({ fechaVenta: -1 });

    // Generar HTML para impresión
    const html = generateFinanciacionesReportHTML(
      financiamientos,
      estado || 'todos'
    );

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generando reporte de financiaciones:', error);
    return NextResponse.json(
      { error: 'Error generando reporte' },
      { status: 500 }
    );
  }
}

function generateFinanciacionesReportHTML(
  financiamientos: any[],
  filtroEstado: string
): string {
  const fechaActual = new Date().toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tituloReporte =
    filtroEstado === 'activo' || filtroEstado === 'activos'
      ? 'FINANCIACIONES ACTIVAS'
      : 'LISTADO DE FINANCIACIONES';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-UY');
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

  // Calcular totales
  const montoTotal = financiamientos.reduce(
    (sum, fin) => sum + (fin.montoTotal || 0),
    0
  );
  const saldoPendiente = financiamientos.reduce(
    (sum, fin) => sum + (fin.saldoPendiente || 0),
    0
  );
  const montoRecaudado = financiamientos.reduce(
    (sum, fin) => sum + (fin.montoPagado || 0),
    0
  );

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tituloReporte} - CIOMPI</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @media print {
      @page {
        size: A4 landscape;
        margin: 0.8cm;
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
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 9px;
      color: #333;
      background: white;
      padding: 15px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 3px solid #1e88e5;
      padding-bottom: 10px;
    }
    
    .header h1 {
      font-size: 22px;
      color: #1e88e5;
      margin-bottom: 5px;
    }
    
    .header .fecha {
      font-size: 11px;
      color: #666;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .summary-box {
      background: #f5f5f5;
      padding: 8px;
      border-radius: 5px;
      border-left: 4px solid #1e88e5;
    }
    
    .summary-box.primary {
      border-left-color: #1e88e5;
    }
    
    .summary-box.success {
      border-left-color: #4caf50;
    }
    
    .summary-box.warning {
      border-left-color: #ff9800;
    }
    
    .summary-box.danger {
      border-left-color: #f44336;
    }
    
    .summary-box h3 {
      font-size: 9px;
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    
    .summary-box .value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 8px;
    }
    
    thead {
      background: #1e88e5;
      color: white;
    }
    
    th {
      padding: 6px 4px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #1565c0;
      font-size: 8px;
    }
    
    td {
      padding: 5px 4px;
      border: 1px solid #ddd;
      font-size: 8px;
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
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 7px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 8px;
      color: #666;
    }
    
    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${tituloReporte}</h1>
    <p class="fecha">Generado el ${fechaActual}</p>
  </div>
  
  <div class="summary">
    <div class="summary-box primary">
      <h3>Total Financiaciones</h3>
      <div class="value">${financiamientos.length}</div>
    </div>
    <div class="summary-box success">
      <h3>Monto Total</h3>
      <div class="value">${formatCurrency(montoTotal)}</div>
    </div>
    <div class="summary-box warning">
      <h3>Saldo Pendiente</h3>
      <div class="value">${formatCurrency(saldoPendiente)}</div>
    </div>
    <div class="summary-box danger">
      <h3>Monto Recaudado</h3>
      <div class="value">${formatCurrency(montoRecaudado)}</div>
    </div>
  </div>
  
  ${financiamientos.length === 0 ? '<div class="no-data">No hay financiaciones registradas</div>' : `
  <table>
    <thead>
      <tr>
        <th style="width: 3%;">#</th>
        <th style="width: 15%;">Cliente</th>
        <th style="width: 12%;">Vehículo</th>
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
            const clienteNombre =
              typeof fin.cliente === 'object' && fin.cliente
                ? fin.cliente.NOMBRE
                : '-';
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
          <td><strong>${clienteNombre}</strong></td>
          <td>${vehiculoInfo}</td>
          <td>${matricula}</td>
          <td class="text-right">${formatCurrency(fin.costoVehiculo || 0)}</td>
          <td class="text-center">${fin.cuotas || 0}</td>
          <td class="text-center">${fin.cuotasPagadas || 0}</td>
          <td class="text-right">${formatCurrency(fin.valorCuota || 0)}</td>
          <td class="text-right"><strong>${formatCurrency(fin.montoTotal || 0)}</strong></td>
          <td class="text-right">${formatCurrency(fin.saldoPendiente || 0)}</td>
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
  `}
  
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

