# Plan de Sostenibilidad del CPD - FPConnect

## 1. Analisis de impacto
- Consumo principal: servidor backend, base de datos y almacenamiento.
- Huella mayor en cargas de CPU continuas, logs no controlados y sobredimensionamiento.

## 2. Medidas de eficiencia energetica
- Uso de VPS ajustado a demanda real (escalado vertical/horizontal progresivo).
- Apagado de entornos de pruebas fuera de horario.
- Compresion y rotacion de logs para reducir almacenamiento.
- Uso de cache y paginacion para disminuir carga de CPU y E/S.

## 3. Alternativas sostenibles
- Preferencia por proveedores cloud con mix energetico renovable.
- Virtualizacion frente a hardware dedicado infrautilizado.
- Reutilizacion de equipos locales para entornos no productivos.

## 4. Reciclaje y ciclo de vida
- Inventario de hardware y politica de renovacion responsable.
- Donacion/reciclado certificado de equipos obsoletos.
- Borrado seguro de datos antes de retirada de dispositivos.

## 5. Indicadores de seguimiento
- kWh/mes estimados por entorno.
- Uso medio de CPU/RAM/almacenamiento.
- Volumen mensual de datos y logs.
- Numero de incidencias por sobreconsumo o infrautilizacion.
