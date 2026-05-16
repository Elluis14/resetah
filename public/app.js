// Inicialización de Gráficas lineales
const ctxVib = document.getElementById('chartVibracion').getContext('2d');
const ctxTemp = document.getElementById('chartTemperatura').getContext('2d');

const crearConfiguracionGrafica = (label, color) => ({
    type: 'line',
    data: {
        labels: ['17:55', '18:00', '18:05'],
        datasets: [{
            label: label,
            data: [2.5, 3.1, 4.8],
            borderColor: color,
            tension: 0.3,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { color: '#222' } },
            x: { grid: { display: false } }
        }
    }
});

const vChart = new Chart(ctxVib, crearConfiguracionGrafica('Vibración', '#3B82F6'));
const tChart = new Chart(ctxTemp, crearConfiguracionGrafica('Temperatura', '#FBBF24'));

// Actualización del Reloj UTC en el Header
setInterval(() => {
    document.getElementById('utc-time').innerText = new Date().toISOString().substr(11, 8);
}, 1000);

// Función medular para consultar Express vía Polling
async function actualizarDashboard() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();

        // 1. Renderizar telemetría actual
        document.getElementById('val-temp').innerHTML = `${data.telemetria.temperature} <span class="text-sm">°C</span>`;
        document.getElementById('val-vib').innerHTML = `${data.telemetria.vibration} <span class="text-sm">mm/s</span>`;
        document.getElementById('val-pres').innerHTML = `${data.telemetria.pressure} <span class="text-sm">bar</span>`;

        document.getElementById('ia-salud').innerText = `${data.telemetria.salud_mecanica}%`;
        document.getElementById('ia-calidad').innerText = `${data.telemetria.riesgo_calidad}%`;
        document.getElementById('ia-estado-txt').innerText = `ESTADO: ${data.telemetria.estado_general}`;

        // 2. Renderizar bloque de Consola de Eventos IES
        const consola = document.getElementById('logger-console');
        consola.innerHTML = '';

        data.eventos.forEach(ev => {
            let colorClase = ev.severity === 'HIGH' ? 'text-red-500' : (ev.severity === 'MEDIUM' ? 'text-yellow-500' : 'text-green-400');

            const eventoHtml = document.createElement('div');
            eventoHtml.className = 'border-b border-gray-900 pb-2';
            eventoHtml.innerHTML = `
                <p class="text-gray-500">[${ev.timestamp}] <span class="${colorClase} font-bold">EVENT_SENT: ${ev.type}</span></p>
                <p class="text-gray-400 font-semibold">Severity: ${ev.severity}</p>
                <pre class="text-emerald-400 bg-gray-950 p-2 rounded mt-1 overflow-x-auto select-all text-[10px]">${ev.payload}</pre>
            `;
            consola.appendChild(eventoHtml);
        });

    } catch (error) {
        console.error("Fallo al obtener datos del servicio API de Express:", error);
    }
}

// Intervalo de actualización del frontend cada 2 segundos
setInterval(actualizarDashboard, 2000);
actualizarDashboard();