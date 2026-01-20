import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function AnalyticsPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString());

    console.log('Orders fetched:', data, 'Error:', error);

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  // Calculate revenue by day of week
  const getRevenueByDay = () => {
    const revenueByDay = Array(7).fill(0);
    const ordersByDay = Array(7).fill(0);

    orders.forEach(order => {
      const dayOfWeek = new Date(order.created_at).getDay();
      revenueByDay[dayOfWeek] += parseFloat(order.total_amount) || 0;
      ordersByDay[dayOfWeek] += 1;
    });

    return dayNames.map((name, index) => ({
      day: name,
      dayIndex: index,
      revenue: revenueByDay[index],
      orders: ordersByDay[index],
      avgTicket: ordersByDay[index] > 0 ? revenueByDay[index] / ordersByDay[index] : 0
    }));
  };

  const dayData = getRevenueByDay();
  const totalRevenue = dayData.reduce((sum, d) => sum + d.revenue, 0);
  const maxRevenue = Math.max(...dayData.map(d => d.revenue));
  const bestDay = dayData.find(d => d.revenue === maxRevenue);

  // Sort by revenue to show ranking
  const sortedByRevenue = [...dayData].sort((a, b) => b.revenue - a.revenue);

  // Export to Excel/CSV
  const exportToExcel = () => {
    // Create CSV content
    let csv = 'Reporte de Campañas - Farmared\n';
    csv += `Período: Últimos ${dateRange} días\n`;
    csv += `Generado: ${new Date().toLocaleDateString('es-EC')}\n\n`;

    csv += 'RESUMEN\n';
    csv += `Ingresos Totales,$${totalRevenue.toFixed(2)}\n`;
    csv += `Mejor Día,${bestDay?.day}\n`;
    csv += `Total Órdenes,${orders.length}\n\n`;

    csv += 'INGRESOS POR DÍA\n';
    csv += 'Día,Ingresos,Órdenes,Ticket Promedio,% del Total\n';
    sortedByRevenue.forEach(day => {
      csv += `${day.day},$${day.revenue.toFixed(2)},${day.orders},$${day.avgTicket.toFixed(2)},${totalRevenue > 0 ? ((day.revenue / totalRevenue) * 100).toFixed(1) : 0}%\n`;
    });

    // Create and download file
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_campanas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="analytics-panel">
      <div className="panel-header">
        <h2>📊 Análisis de Campañas</h2>
        <div className="header-actions">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="60">Últimos 60 días</option>
            <option value="90">Últimos 90 días</option>
          </select>
          <button className="export-btn" onClick={exportToExcel} disabled={orders.length === 0}>
            📥 Descargar Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando datos...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>No hay órdenes completadas en el período seleccionado</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card total">
              <span className="card-label">Ingresos Totales</span>
              <span className="card-value">${totalRevenue.toFixed(2)}</span>
            </div>
            <div className="summary-card best">
              <span className="card-label">Mejor Día</span>
              <span className="card-value">{bestDay?.day}</span>
              <span className="card-sub">${bestDay?.revenue.toFixed(2)}</span>
            </div>
            <div className="summary-card orders">
              <span className="card-label">Total Órdenes</span>
              <span className="card-value">{orders.length}</span>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="revenue-chart">
            <h3>Ingresos por Día de la Semana</h3>
            <div className="chart-container">
              {dayData.map((day, idx) => (
                <div key={idx} className="chart-bar-wrapper">
                  <div
                    className={`chart-bar ${day.revenue === maxRevenue ? 'best' : ''}`}
                    style={{ height: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}%` }}
                  >
                    <span className="bar-value">${day.revenue.toFixed(0)}</span>
                  </div>
                  <span className="bar-label">{day.day.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking Table */}
          <div className="ranking-section">
            <h3>🏆 Ranking de Campañas por Día</h3>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Día</th>
                  <th>Ingresos</th>
                  <th>Órdenes</th>
                  <th>Ticket Promedio</th>
                  <th>% del Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedByRevenue.map((day, idx) => (
                  <tr key={day.dayIndex} className={idx === 0 ? 'top-row' : ''}>
                    <td className="rank">
                      {idx === 0 && '🥇'}
                      {idx === 1 && '🥈'}
                      {idx === 2 && '🥉'}
                      {idx > 2 && (idx + 1)}
                    </td>
                    <td className="day-name">{day.day}</td>
                    <td className="revenue">${day.revenue.toFixed(2)}</td>
                    <td>{day.orders}</td>
                    <td>${day.avgTicket.toFixed(2)}</td>
                    <td>{totalRevenue > 0 ? ((day.revenue / totalRevenue) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendation */}
          <div className="recommendation">
            <h3>💡 Recomendación</h3>
            <p>
              {bestDay && bestDay.revenue > 0 ? (
                <>
                  El día <strong>{bestDay.day}</strong> genera el mayor ingreso con
                  <strong> ${bestDay.revenue.toFixed(2)}</strong> ({((bestDay.revenue / totalRevenue) * 100).toFixed(1)}% del total).
                  Considera reforzar las campañas de descuento en este día.
                </>
              ) : (
                'Aún no hay suficientes datos para generar recomendaciones.'
              )}
            </p>
          </div>
        </>
      )}

      <style>{`
        .analytics-panel { width: 100%; }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .panel-header h2 {
          font-size: 1.5rem;
          color: #0f172a;
          font-weight: 700;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .export-btn {
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .export-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .date-range-select {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          cursor: pointer;
        }

        .loading, .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .summary-card .card-label {
          display: block;
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .summary-card .card-value {
          display: block;
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
        }

        .summary-card .card-sub {
          display: block;
          font-size: 0.9rem;
          color: #10b981;
          margin-top: 0.25rem;
        }

        .summary-card.total { border-top: 4px solid #0284c7; }
        .summary-card.best { border-top: 4px solid #10b981; }
        .summary-card.orders { border-top: 4px solid #7c3aed; }

        .revenue-chart {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
        }

        .revenue-chart h3 {
          margin-bottom: 1.5rem;
          color: #0f172a;
        }

        .chart-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 200px;
          gap: 1rem;
        }

        .chart-bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
        }

        .chart-bar {
          width: 100%;
          background: linear-gradient(180deg, #0284c7, #0ea5e9);
          border-radius: 8px 8px 0 0;
          min-height: 20px;
          position: relative;
          transition: height 0.3s;
        }

        .chart-bar.best {
          background: linear-gradient(180deg, #10b981, #34d399);
        }

        .bar-value {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.75rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
        }

        .bar-label {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
        }

        .ranking-section {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
        }

        .ranking-section h3 {
          margin-bottom: 1.5rem;
          color: #0f172a;
        }

        .ranking-table {
          width: 100%;
          border-collapse: collapse;
        }

        .ranking-table th,
        .ranking-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .ranking-table th {
          background: #f8fafc;
          font-weight: 700;
          color: #475569;
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        .ranking-table .top-row {
          background: #ecfdf5;
        }

        .ranking-table .rank { font-size: 1.2rem; }
        .ranking-table .day-name { font-weight: 600; }
        .ranking-table .revenue { font-weight: 700; color: #10b981; }

        .recommendation {
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          padding: 1.5rem;
          border-radius: 16px;
          border-left: 4px solid #0284c7;
        }

        .recommendation h3 {
          margin-bottom: 0.75rem;
          color: #0c4a6e;
        }

        .recommendation p {
          color: #0369a1;
          line-height: 1.6;
        }

        .recommendation strong {
          color: #0c4a6e;
        }

        @media (max-width: 768px) {
          .summary-cards { grid-template-columns: 1fr; }
          .chart-container { height: 150px; }
          .panel-header { flex-direction: column; gap: 1rem; }
        }
      `}</style>
    </div>
  );
}
