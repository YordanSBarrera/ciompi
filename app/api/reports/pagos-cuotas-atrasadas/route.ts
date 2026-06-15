import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import PagoCuota from '@/models/pagoCuota';
import { formatMoney, normalizarMoneda } from '@/lib/moneda';
import { NextResponse } from 'next/server';
import { MonedaTipo } from '@/lib/const';

export async function GET() {
  try {
    await connectDB();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día

    // Obtener todos los financiamientos activos
    const financiamientos = await Financiamiento.find({
      estadoFinanciamiento: { $in: ['activo', 'en_mora'] },
    })
      .populate('cliente', 'NOMBRE TELEFONO cedula')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('empresa', 'nombre descripcion telefono')
      .sort({ fechaVenta: -1 });

    // Array para almacenar todas las cuotas atrasadas
    const cuotasAtrasadas: Array<{
      numeroCuota: number;
      fechaVencimiento: Date;
      valorCuota: number;
      financiamientoId: string;
      moneda?: string;
      cliente: any;
      vehiculo: any;
      empresa: any;
      diasAtraso: number;
    }> = [];

    for (const financiamiento of financiamientos) {
      // Obtener pagos registrados para este financiamiento
      const pagos = await PagoCuota.find({
        financiamiento: financiamiento._id,
        estadoPago: 'confirmado',
      }).select('numeroCuota esExtra montoPago');

      const pagosPorCuota: { [key: number]: number } = {};
      pagos
        .filter(p => !p.esExtra && p.numeroCuota)
        .forEach(pago => {
          const numCuota = pago.numeroCuota!;
          if (!pagosPorCuota[numCuota]) {
            pagosPorCuota[numCuota] = 0;
          }
          pagosPorCuota[numCuota] += pago.montoPago;
        });

      // Verificar si tiene cuotasFuturas
      if (
        financiamiento.cuotasFuturas &&
        financiamiento.cuotasFuturas.length > 0
      ) {
        // Verificar cuotas vencidas
        financiamiento.cuotasFuturas.forEach((cuota: any) => {
          const fechaVencimiento = new Date(cuota.fechaVencimiento);
          fechaVencimiento.setHours(0, 0, 0, 0);

          // Calcular el monto pagado para esta cuota
          const montoPagado = pagosPorCuota[cuota.numeroCuota] || 0;
          const estaPagada = montoPagado >= cuota.valorCuota;

          // La cuota está atrasada si:
          // 1. La fecha de vencimiento es anterior a hoy
          // 2. No está completamente pagada
          if (fechaVencimiento < hoy && !estaPagada) {
            const diasAtraso = Math.floor(
              (hoy.getTime() - fechaVencimiento.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            cuotasAtrasadas.push({
              numeroCuota: cuota.numeroCuota,
              fechaVencimiento,
              valorCuota: cuota.valorCuota,
              financiamientoId: financiamiento._id?.toString() || '',
              moneda: financiamiento.moneda,
              cliente: financiamiento.cliente,
              vehiculo: financiamiento.vehiculo,
              empresa: financiamiento.empresa,
              diasAtraso,
            });
          }
        });
      } else {
        // Si no tiene cuotasFuturas, calcular las fechas basándome en fechaPrimeraCuota
        const fechaPrimera = new Date(financiamiento.fechaPrimeraCuota);
        fechaPrimera.setHours(0, 0, 0, 0);

        for (let i = 1; i <= financiamiento.cuotas; i++) {
          const fechaVencimiento = new Date(fechaPrimera);
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i - 1);
          fechaVencimiento.setHours(0, 0, 0, 0);

          // Calcular el monto pagado para esta cuota
          const montoPagado = pagosPorCuota[i] || 0;
          const estaPagada = montoPagado >= financiamiento.valorCuota;

          // Si la cuota está vencida y no está pagada
          if (fechaVencimiento < hoy && !estaPagada) {
            const diasAtraso = Math.floor(
              (hoy.getTime() - fechaVencimiento.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            cuotasAtrasadas.push({
              numeroCuota: i,
              fechaVencimiento,
              valorCuota: financiamiento.valorCuota,
              financiamientoId: financiamiento._id?.toString() || '',
              moneda: financiamiento.moneda,
              cliente: financiamiento.cliente,
              vehiculo: financiamiento.vehiculo,
              empresa: financiamiento.empresa,
              diasAtraso,
            });
          }
        }
      }
    }

    // Ordenar por fecha de vencimiento (más antiguas primero)
    cuotasAtrasadas.sort((a, b) => {
      const fechaA =
        a.fechaVencimiento instanceof Date
          ? a.fechaVencimiento
          : new Date(a.fechaVencimiento);
      const fechaB =
        b.fechaVencimiento instanceof Date
          ? b.fechaVencimiento
          : new Date(b.fechaVencimiento);
      return fechaA.getTime() - fechaB.getTime();
    });

    // Generar HTML para impresión
    const html = generateCuotasAtrasadasReportHTML(cuotasAtrasadas);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generando reporte de cuotas atrasadas:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error generando reporte: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function generateCuotasAtrasadasReportHTML(
  cuotasAtrasadas: Array<{
    numeroCuota: number;
    fechaVencimiento: Date;
    valorCuota: number;
    financiamientoId: string;
    moneda?: string;
    cliente: any;
    vehiculo: any;
    empresa: any;
    diasAtraso: number;
  }>
): string {
  const fechaActual = new Date().toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString('es-UY');
    } catch {
      return '-';
    }
  };

  // Calcular totales
  const totalCuotas = cuotasAtrasadas.length;
  const totalMontoUsd = cuotasAtrasadas.reduce((sum, cuota) => {
    return normalizarMoneda(cuota.moneda) === MonedaTipo.USD
      ? sum + cuota.valorCuota
      : sum;
  }, 0);
  const totalMontoUyu = cuotasAtrasadas.reduce((sum, cuota) => {
    return normalizarMoneda(cuota.moneda) === MonedaTipo.UYU
      ? sum + cuota.valorCuota
      : sum;
  }, 0);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cuotas Atrasadas - CIOMPI</title>
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
      border-bottom: 3px solid #f44336;
      padding-bottom: 10px;
    }
    
    .header h1 {
      font-size: 22px;
      color: #f44336;
      margin-bottom: 5px;
    }
    
    .header .fecha {
      font-size: 11px;
      color: #666;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .summary-box {
      background: #ffebee;
      padding: 10px;
      border-radius: 5px;
      border-left: 4px solid #f44336;
    }
    
    .summary-box h3 {
      font-size: 9px;
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    
    .summary-box .value {
      font-size: 16px;
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
      background: #f44336;
      color: white;
    }
    
    th {
      padding: 6px 4px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #d32f2f;
      font-size: 8px;
    }
    
    td {
      padding: 5px 4px;
      border: 1px solid #ddd;
      font-size: 8px;
    }
    
    tbody tr:nth-child(even) {
      background: #fff5f5;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-right {
      text-align: right;
    }
    
    .dias-atraso {
      color: #f44336;
      font-weight: 600;
    }
    
    .monto-cuota {
      color: #333;
      font-weight: 600;
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
    <h1>REPORTE DE CUOTAS ATRASADAS</h1>
    <p class="fecha">Generado el ${fechaActual}</p>
  </div>
  
  ${
    totalCuotas > 0
      ? `
  <div class="summary">
    <div class="summary-box">
      <h3>Total Cuotas Atrasadas</h3>
      <div class="value">${totalCuotas}</div>
    </div>
    <div class="summary-box">
      <h3>Monto Total Atrasado</h3>
      <div class="value" style="font-size:11px;line-height:1.35;">
        <div>USD: ${formatMoney(totalMontoUsd, 'USD')}</div>
        <div>UYU: ${formatMoney(totalMontoUyu, 'UYU')}</div>
      </div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 3%;">#</th>
        <th style="width: 15%;">Cliente</th>
        <th style="width: 15%;">Vehículo</th>
        <th style="width: 5%;" class="text-center">Cuota</th>
        <th style="width: 12%;" class="text-center">Fecha Vencimiento</th>
        <th style="width: 8%;" class="text-center">Días Atraso</th>
        <th style="width: 12%;" class="text-right">Valor Cuota</th>
        <th style="width: 10%;">Empresa</th>
      </tr>
    </thead>
    <tbody>
      ${cuotasAtrasadas
        .map((cuota, index) => {
          const clienteNombre =
            typeof cuota.cliente === 'object' && cuota.cliente
              ? escapeHtml(cuota.cliente.NOMBRE || 'N/A')
              : 'N/A';
          const vehiculoInfo =
            typeof cuota.vehiculo === 'object' && cuota.vehiculo
              ? escapeHtml(
                  `${cuota.vehiculo.Marca || ''} ${cuota.vehiculo.Modelo || ''}`.trim() ||
                    'N/A'
                )
              : 'N/A';
          const empresaNombre =
            typeof cuota.empresa === 'object' && cuota.empresa
              ? escapeHtml(cuota.empresa.nombre || 'N/A')
              : 'N/A';

          return `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${clienteNombre}</td>
          <td>${vehiculoInfo}</td>
          <td class="text-center"><strong>#${cuota.numeroCuota}</strong></td>
          <td class="text-center">${formatDate(cuota.fechaVencimiento)}</td>
          <td class="text-center dias-atraso">${cuota.diasAtraso} días</td>
          <td class="text-right monto-cuota">${formatMoney(cuota.valorCuota, normalizarMoneda(cuota.moneda))}</td>
          <td>${empresaNombre}</td>
        </tr>
      `;
        })
        .join('')}
    </tbody>
  </table>
  `
      : `
  <div class="no-data">No hay cuotas atrasadas</div>
  `
  }
  
  <div class="footer">
    <p>CIOMPI - Sistema de Gestión de Financiamientos</p>
    <p>Reporte generado automáticamente</p>
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
