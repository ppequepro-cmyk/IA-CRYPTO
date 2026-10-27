# Validación y alcance del modelo

## Estado actual

IA-CRYPTO es un panel educativo, no un sistema predictivo. Consulta datos públicos de mercado, calcula indicadores descriptivos y permite practicar con una cartera ficticia local.

## Datos

- Cotizaciones e historial: Binance Public Market Data.
- REST: `https://data-api.binance.vision/api/v3`.
- Actualizaciones de precio: streams públicos de mercado en `data-stream.binance.vision`.
- No se solicitan claves API, credenciales, wallet ni permisos de cuenta.

La API pública puede limitar solicitudes, cambiar disponibilidad o no responder desde algunas redes. La interfaz debe mostrar el estado de conexión y no inventar datos cuando el proveedor falla.

## Indicadores

- SMA(20): promedio aritmético de los últimos 20 cierres.
- RSI(14): cálculo suavizado de Wilder sobre cambios de cierre.
- Variación: cambio porcentual entre el primer y el último cierre del intervalo cargado.

Estos indicadores resumen el pasado. No son probabilidades ni predicciones.

## Simulador

- Saldo inicial ficticio: 10,000 USD.
- Activos simulados: BTC, ETH y SOL.
- Comisión educativa configurada: 0.10% por operación simulada.
- El estado se guarda localmente en el navegador mediante `localStorage`.
- No hay conexión con cuentas, órdenes reales, wallets ni retiros.
- Borrar los datos del navegador puede reiniciar la simulación.

## Antes de investigar un modelo predictivo

No se debe afirmar una precisión del 65–75% sin una evaluación reproducible. Un experimento futuro tendría que:

1. Definir de antemano el objetivo y horizonte de predicción.
2. Usar datos históricos con marcas de tiempo y conservar una fuente verificable.
3. Separar entrenamiento, validación y prueba cronológicamente, sin mezclar el futuro con el pasado.
4. Comparar contra referencias sencillas, como persistencia y media móvil.
5. Evitar fuga de datos y ajustar hiperparámetros solo con entrenamiento/validación.
6. Medir MAE/RMSE para precios o métricas apropiadas para clasificación, además de calibración.
7. Incluir comisiones, deslizamiento y periodos sin datos al evaluar una estrategia hipotética.
8. Publicar resultados negativos y límites, no solo el mejor periodo.

No se entrena ni despliega ningún modelo en esta versión. No se generan recomendaciones de compra/venta.
