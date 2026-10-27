<div align="center">

<img src="assets/pulse.svg" alt="IA-CRYPTO" width="100%">

# IA-CRYPTO

**Datos públicos · Indicadores · Simulación**

Un laboratorio ligero para aprender a leer el mercado cripto sin arriesgar dinero real.

</div>

## Qué incluye

- Panel de cotizaciones BTC, ETH y SOL desde Binance Public Market Data.
- Historial configurable (1 día, 4 horas y 1 hora).
- Gráfico de cierres, RSI (14), SMA (20) y variación del periodo.
- Lectura educativa de indicadores, sin promesas de predicción.
- Simulador de cartera con saldo ficticio de 10,000 USD.
- Diseño adaptable a móvil y escritorio, sin dependencias ni claves API.

## Publicación

La web se publica con GitHub Pages desde `main` y la carpeta raíz. Tras cada cambio en `index.html`, GitHub Pages vuelve a desplegar el sitio automáticamente.

Sitio: https://ppequepro-cmyk.github.io/IA-CRYPTO/

## Datos y limitaciones

- Los datos de mercado se consultan desde la API pública de Binance; disponibilidad, límites y acceso pueden variar.
- Si la API no responde, el panel mostrará que no hay datos. No se inventan cotizaciones.
- Los indicadores describen datos históricos y no predicen el precio futuro.
- El simulador solo modifica valores locales en el navegador. No conecta wallets, cuentas ni ejecuta órdenes.
- No hay modelo de aprendizaje automático ni precisión predictiva validada todavía.

## Desarrollo siguiente

Antes de evaluar cualquier modelo predictivo habrá que definir datos históricos, separar entrenamiento y prueba por tiempo, incluir comisiones y deslizamiento en el backtest y comparar resultados contra una estrategia base. Ningún porcentaje de acierto se publicará sin validación reproducible.

## Alcance

Proyecto educativo y experimental, no asesoría financiera. No usar dinero real ni compartir claves privadas o frases semilla.
