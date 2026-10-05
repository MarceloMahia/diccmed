# Modelo de datos farmacéutico — proyecto refactorizado

## Estructura
- `index.html` — entrada al proyecto.
- `html/` — una pantalla por entidad.
- `css/app.css` — único CSS.
- `js/app.js` — único JavaScript.

## Secciones TMF
- **Principales:** Componente, Medicamento, Producto Médico y Producto Comercial.
- **Auxiliares:** Laboratorio, Unidad Medida, Forma Farmacéutica, Acción Farmacológica, Envase y Unidad Asistencial.
- **Otros:** Servicio NOV Proveedores.

## Navegación
El `nav` se genera desde `js/app.js` y aparece de forma transversal en todas las pantallas. Las entidades TMF se separan visualmente en Principales, Auxiliares y Otros.

- Entidad: cambia de pantalla.
- Nuevo / Edición: se conserva mediante `?mode=nuevo|edicion`.

## DICCMED
SUS, VTM, VMP, VMPP, Trade Family, AMP y AMPP, más la comparación TMF ↔ DICCMED.
