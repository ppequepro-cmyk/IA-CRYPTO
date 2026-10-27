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

## Antes de investigar un modelo predictivo

No se debe afirmar una precisión del 65–75% sin una evaluación reproducible. Un experimento académico futuro tendría que:

1. Definir de antemano el objetivo y horizonte de predicción.
2. Usar datos históricos con marcas de tiempo y conservar una fuente verificable.
3. Separar entrenamiento, validación y prueba cronológicamente, sin mezclar el futuro con el pasado.
4. Comparar contra referencias sencillas y transparentes.
5. Evitar fuga de datos y ajustar parámetros solo con entrenamiento/validación.
6. Medir errores y calibración con métricas apropiadas para el objetivo.
7. Publicar resultados negativos, limitaciones y periodos donde el modelo falla.

No se entrena ni despliega ningún modelo en esta versión. El proyecto no ofrece asesoría financiera ni recomendaciones de inversión.
