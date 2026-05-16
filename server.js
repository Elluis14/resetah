const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CONFIGURACIÓN DE EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos (CSS y JS del cliente)
app.use(express.static(path.join(__dirname, 'public')));

// Estado inicial en memoria (Variables simuladas del PLC)
let telemetriaActual = {
    temperature: 72.4,
    vibration: 4.8,
    pressure: 182,
    run_status: "CONECTADO",
    salud_mecanica: 12,
    riesgo_calidad: 28,
    estado_general: "ALERTA"
};

let listaEventos = [
    { timestamp: "18:05:22", type: "data_telemetry", severity: "INFO", payload: '{\n  "temperature": 72.4,\n  "vibration": 4.8,\n  "pressure": 182\n}' },
    { timestamp: "18:05:18", type: "quality_risk_detected", severity: "MEDIUM", payload: '{\n  "quality_risk": 0.28,\n  "prediction": "out_of_tolerance_likely"\n}' }
];

// RUTA PRINCIPAL: Renderiza la plantilla EJS con los datos iniciales
app.get('/', (req, res) => {
    res.render('index', { 
        telemetria: telemetriaActual, 
        eventos: listaEventos 
    });
});

// Endpoint API para que el Frontend haga el refresco asíncrono
app.get('/api/data', (req, res) => {
    res.json({ telemetria: telemetriaActual, eventos: listaEventos });
});

// Endpoint API para recibir datos desde Python o el PLC
app.post('/api/update', (req, res) => {
    const { telemetria, nuevoEvento } = req.body;
    if (telemetria) telemetriaActual = { ...telemetriaActual, ...telemetria };
    if (nuevoEvento) {
        listaEventos.unshift(nuevoEvento);
        if (listaEventos.length > 20) listaEventos.pop();
    }
    res.status(200).json({ status: "success", message: "Datos actualizados" });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express con EJS corriendo en el puerto ${PORT}`);
});