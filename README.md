<div align="center">

<img src="assets/pulse.svg" alt="IA-CRYPTO" width="100%">

# IA-CRYPTO

**Datos públicos · Indicadores · Simulación educativa**

Un laboratorio ligero para estudiar datos de mercado sin conectar cuentas ni arriesgar dinero real.

</div>

## Incluye

- Cotizaciones BTC, ETH y SOL desde la API pública de Binance.
- Actualizaciones de precio mediante WebSocket público, con consulta REST alternativa.
- Historial configurable de 1 día, 4 horas y 1 hora.
- Gráfico de cierres, RSI(14) de Wilder, SMA(20) y variación del periodo.
- Cartera virtual de 10,000 USD con comisión simulada y guardado local.
- Diseño adaptable a móvil y escritorio, sin claves API ni dependencias de compilación.

## Sitio

https://ppequepro-cmyk.github.io/IA-CRYPTO/

GitHub Pages publica desde `main` y la carpeta raíz. Cada cambio en los archivos del sitio inicia un nuevo despliegue.

## Datos y limitaciones

- REST: `https://data-api.binance.vision/api/v3`.
- WebSocket público: `wss://data-stream.binance.vision`.
- La disponibilidad, latencia y límites dependen del proveedor y de la red.
- Los indicadores describen datos históricos. No predicen precios ni garantizan resultados.
- La simulación es local al navegador, usa saldo ficticio y no ejecuta órdenes.
- No existe un modelo de aprendizaje automático ni una precisión predictiva validada en esta versión.

## Validación

Consulta [docs/VALIDACION.md](docs/VALIDACION.md) para conocer las fórmulas, el alcance del simulador y los requisitos antes de evaluar un modelo predictivo.

GitHub Actions comprueba la sintaxis de JavaScript y la presencia de los archivos principales en cada cambio a `main`.

## Seguridad

No se solicitan ni almacenan claves privadas, frases semilla, credenciales o permisos de cuentas. Proyecto educativo, no asesoría financiera.
