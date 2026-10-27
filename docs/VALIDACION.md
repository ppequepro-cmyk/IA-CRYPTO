# Validación y alcance del modelo

## Estado actual

IA-CRYPTO es un panel educativo de solo lectura. Consulta datos públicos de mercado y calcula indicadores descriptivos. No es un sistema predictivo y no ejecuta operaciones.

## Datos

- Cotizaciones e historial: Binance Public Market Data.
- REST: `https://data-api.binance.vision/api/v3`.
- Streams públicos: `wss://data-stream.binance.vision`.
- No se solicitan claves API, credenciales, wallets ni permisos de cuenta.

La API pública puede limitar solicitudes, cambiar disponibilidad o no responder desde algunas redes. La interfaz debe mostrar el estado de conexión y no inventar datos cuando el proveedor falla.

## Indicadores

- SMA(20): promedio aritmético de los últimos 20 cierres.
- RSI(14): cálculo suavizado de Wilder sobre cambios de cierre.
- Variación: cambio porcentual entre el primer y el último cierre del intervalo cargado.

Estos indicadores resumen el pasado. No son probabilidades ni predicciones, y la interfaz no emite señales de compra o venta.

## Experimento didáctico incluido

La página incluye un clasificador de regresión logística ejecutado localmente en el navegador. Usa hasta 1.000 velas públicas y variables derivadas de retornos pasados, volatilidad, distancia a SMA(20) y RSI. Las muestras se dividen en orden temporal: 70% entrenamiento, 15% validación y 15% prueba. El escalado se ajusta solo con el tramo de entrenamiento. Se compara la exactitud del tramo de prueba con una referencia mayoritaria calculada desde entrenamiento. La estimación de la última vela cerrada es experimental y no es una recomendación para operar.

Este diseño es una primera práctica reproducible, no una validación profesional: no incluye costes, deslizamiento, cambios de régimen ni una evaluación en múltiples periodos. La exactitud no debe interpretarse como probabilidad de ganar dinero.

## Antes de ampliar el modelo predictivo

No se debe afirmar una precisión del 65–75% sin una evaluación reproducible. Un experimento académico futuro tendría que:

1. Definir de antemano el objetivo y horizonte de predicción.
2. Usar datos históricos con marcas de tiempo y conservar una fuente verificable.
3. Separar entrenamiento, validación y prueba cronológicamente, sin mezclar el futuro con el pasado.
4. Comparar contra referencias sencillas y transparentes.
5. Evitar fuga de datos y ajustar parámetros solo con entrenamiento/validación.
6. Medir errores y calibración con métricas apropiadas para el objetivo.
7. Publicar resultados negativos, limitaciones y periodos donde el modelo falla.

No se entrena ni despliega ningún modelo en esta versión. El proyecto no ofrece asesoría financiera ni recomendaciones de inversión.
