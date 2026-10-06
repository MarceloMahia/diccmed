// ---------------------------------------------------------------
// CONTRATO TMF ↔ DICCMED
// Una fila por campo de TMF. Regla central: "necesario" indica el
// mínimo que debe estar cargado en el formulario DICCMED para que
// el SP genere el registro en TMF (columna "Necesario (SP)").
//
// regla:
//   viaja     → el dato sale de DICCMED y se escribe en TMF.
//   solo_tmf  → existe en TMF; DICCMED no lo conoce (carga propia en TMF).
//   no_viaja  → existe en DICCMED pero no se envía (en TMF no hay dónde).
//   futuro    → hoy no se usa; documentado dónde podría resolverse.
//   definir   → pendiente de decisión (ver `pendientes`).
//
// necesario: true | false | 'auto' (lo completa el sistema: fechas,
//            estado por defecto) | null (no aplica / sin dato DICCMED).
//
// transforma: true cuando el dato no se copia tal cual (hay que
//             mapear unidad, etiqueta, laboratorio, etc.).
// ---------------------------------------------------------------

const CONTRATO_REGLAS = {
  viaja:    { label: 'Viaja',                    desc: 'Sale de DICCMED hacia TMF' },
  solo_tmf: { label: 'Solo TMF',                 desc: 'Existe en TMF; DICCMED no lo conoce (carga propia)' },
  no_viaja: { label: 'No viaja desde DICCMED',   desc: 'Existe en DICCMED pero TMF no tiene dónde guardarlo' },
  futuro:   { label: 'Futuro',                   desc: 'Hoy no se usa; se documenta dónde podría hacerse' },
  definir:  { label: 'Por definir',              desc: 'Pendiente de decisión' },
};

const CONTRATO = {

  // =============================================================
  SUSTANCIA: {
    label: 'Sustancia',
    tmf: 'FARMACO_SUSTANCIA',
    puente: 'SIS_CONCEPTO_MAPEOS (ID_TERMINOLOGIA = 30) → DM_CONCEPTOS (ID_SUBCATEGORIA = 1)',
    cardinalidad: 'Una sustancia DICCMED = un FARMACO_SUSTANCIA.',
    filas: [
      { tmf: 'ID_FARMACO_SUSTANCIA', dm: 'SIS_CONCEPTO_MAPEOS.CODIGO_MAPEO → ID_CONCEPTO → DM_CONCEPTOS.ID_CONCEPTO', regla: 'viaja', necesario: true, nota: 'Puente entre ambos mundos.' },
      { tmf: 'DESCRIPCION', dm: "DM_DESCRIPCIONES.DESCRIPCION (TIPO = 'P')", regla: 'viaja', necesario: true, nota: 'Término preferido.' },
      { tmf: 'ESTADO', dm: 'DM_CONCEPTOS.ESTADO', regla: 'viaja', necesario: 'auto', nota: 'Default Activo en el formulario.' },
      { tmf: 'FECHA_ALTA', dm: 'DM_CONCEPTOS.FECHA_ALTA', regla: 'viaja', necesario: 'auto', nota: 'Nombre exacto de columna a confirmar (familia FECHA_*).' },
      { tmf: 'FECHA_ULTIMA_MODIFICACION', dm: 'DM_CONCEPTOS.FECHA_ULTIMA_MODIFICACION', regla: 'viaja', necesario: 'auto', nota: '' },
      { tmf: 'FECHA_BAJA', dm: 'DM_CONCEPTOS.FECHA_BAJA', regla: 'viaja', necesario: 'auto', nota: 'Nombre exacto de columna a confirmar (familia FECHA_*).' },
      { tmf: 'MODELO', dm: '—', regla: 'solo_tmf', necesario: null, nota: 'Sin mapeo en DICCMED.' },
      { tmf: 'ID_SNOMED', dm: 'DM_CONCEPTOS.ID_CONCEPTO (posible)', regla: 'futuro', necesario: null, nota: 'No se usa hoy en TMF. Si el costo-beneficio lo justifica, el SP podría completarlo desde el ID_CONCEPTO de DICCMED. La pantalla TMF Componente ya tiene una pestaña Snomed.' },
      { tmf: 'ACCION_FARMACOLOGICA.ID_ACCION_FARMACOLOGICA', dm: '—', regla: 'solo_tmf', necesario: null, nota: 'Existe en TMF (con pantalla auxiliar). DICCMED no la representa y no interesa traerla: fuera de alcance.' },
    ],
  },

  // =============================================================
  GENERICO: {
    label: 'Genérico',
    tmf: 'FARMACO_GENERICO',
    puente: 'SIS_CONCEPTO_MAPEOS (ID_TERMINOLOGIA = 30) → DM_CONCEPTOS (ID_SUBCATEGORIA = 4, VMPP)',
    cardinalidad: 'DECISIÓN CONFIRMADA: un FARMACO_GENERICO por cada VMPP (no por VMP). El VMP aporta sus datos a cada VMPP hijo vía DM_VMPP.ID_CONCEPTO_VMP. Así FARMACO_COMERCIAL.ID_FARMACO_GENERICO apunta 1:1 al VMPP de su AMPP.',
    impacto: [
      'Comercial: el AMPP ya referencia un VMPP (AMPP.COMPONENTES.VMPP), por lo que el ID genérico asociado sale directo, sin ambigüedad.',
      'HIS: la búsqueda tiene que pasar primero por el VMP y desde ahí elegir el VMPP correspondiente; hoy eso no está así y hay que corregirlo.',
      'Datos del VMP (forma, vía, unidad asistencial, tipo de producto, composición) se repiten en cada FARMACO_GENERICO de los VMPP hermanos.',
      'Alternativa descartada por complejidad: generar FG para VMP y para VMPP (dos niveles).',
    ],
    filas: [
      { tmf: 'ID_FARMACO_GENERICO', dm: 'SIS_CONCEPTO_MAPEOS.CODIGO_MAPEO → ID_CONCEPTO → DM_CONCEPTOS (VMPP, subcategoría 4)', regla: 'viaja', necesario: true, nota: 'Puente. Una fila por VMPP (cardinalidad confirmada).' },
      { tmf: 'ID_FORMA_FARMACEUTICA', dm: 'DM_VMP.ID_CONCEPTO_FFA (VMP = DM_VMPP.ID_CONCEPTO_VMP)', regla: 'viaja', necesario: true, transforma: true, nota: 'Formulario VMP: FFA obligatoria. Requiere mapear al auxiliar TMF Forma Farmacéutica.' },
      { tmf: 'ID_VIA_ADMINISTRACION', dm: 'DM_VMP_VIA_ADMINISTRACION (orden 1 = principal)', regla: 'viaja', necesario: true, transforma: true, nota: 'Confirmado: se toma solo la vía de orden 1 (el VMP puede tener varias).' },
      { tmf: 'ID_UNIDAD_ASISTENCIAL', dm: 'DM_VMP_UNIDOSIS (ORDEN = 1)', regla: 'viaja', necesario: true, transforma: true, nota: 'Formulario VMP: unidad asistencial obligatoria.' },
      { tmf: 'TIPO_PRODUCTO', dm: 'DM_VMP.ID_CONCEPTO_TIPO_PROD', regla: 'viaja', necesario: true, transforma: true, nota: 'Formulario VMP: «Tipo de producto ANMAT» obligatorio. A confirmar equivalencia de valores con TMF.' },
      { tmf: 'SAF', dm: 'Etiqueta SAF del VMP (SIS_CONCEPTO_ETIQUETA → DM_CONCEPTO_ETIQUETA)', regla: 'viaja', necesario: false, transforma: true, nota: 'Formulario VMP: pestaña «Etiqueta SAF → TMF · Medicamento»; opcional. Se transforma al atributo SAF.' },
      { tmf: 'CANTIDAD', dm: 'DM_VMPP.VOLUMEN_TOT_CANT', regla: 'viaja', necesario: false, nota: 'Cantidad del envase del genérico (no confundir con EMPAQUE, que es DM_VMPP.CANTIDAD). En el formulario VMPP «Volumen total» es opcional: si TMF exige CANTIDAD hay que volverlo necesario. A confirmar.' },
      { tmf: 'ID_UNIDAD_MEDIDA', dm: 'DM_VMPP.ID_CONCEPTO_VOLUMEN_TOT_UNIDAD', regla: 'viaja', necesario: false, transforma: true, nota: 'Unidad de medida del envase en TMF, dada por el concepto de volumen (nombre de columna a confirmar). Requiere mapear al auxiliar TMF Unidad de Medida.' },
      { tmf: 'ID_FARMACO_ENVASE', dm: 'DM_VMPP.ID_CONCEPTO_UNIDAD', regla: 'viaja', necesario: true, transforma: true, nota: 'Confirmado. Formulario VMPP: «Unidad de medida» (unidad del envase) obligatoria. Requiere mapear al auxiliar TMF Envase.' },
      { tmf: 'ESTADO', dm: 'DM_CONCEPTOS.ESTADO (concepto VMPP)', regla: 'viaja', necesario: 'auto', nota: 'Asumo el de DM_CONCEPTOS, igual que Sustancia (DM_VMPP también tiene ESTADO).' },
      { tmf: 'FECHA_ALTA', dm: 'DM_CONCEPTOS.FECHA_ALTA (concepto VMPP)', regla: 'viaja', necesario: 'auto', nota: 'Todas las fechas salen de DM_CONCEPTOS, no de las tablas VMP/VMPP.' },
      { tmf: 'FECHA_ULTIMA_MODIFICACION', dm: 'DM_CONCEPTOS.FECHA_ULTIMA_MODIFICACION (concepto VMPP)', regla: 'viaja', necesario: 'auto', nota: 'Todas las fechas salen de DM_CONCEPTOS, no de las tablas VMP/VMPP.' },
      { tmf: 'FECHA_BAJA', dm: 'DM_CONCEPTOS.FECHA_BAJA (concepto VMPP)', regla: 'viaja', necesario: 'auto', nota: 'Todas las fechas salen de DM_CONCEPTOS, no de las tablas VMP/VMPP.' },
      { tmf: 'TRAZABLE', dm: '—', regla: 'solo_tmf', necesario: null, nota: 'Existe en TMF, no se usa y DICCMED no lo representa.' },
      { tmf: 'FACTURABLE', dm: '—', regla: 'solo_tmf', necesario: null, nota: 'Existe en TMF, no se usa y DICCMED no lo representa.' },
      { tmf: 'REFRIGERABLE', dm: '—', regla: 'solo_tmf', necesario: null, nota: 'Existe en TMF, no se usa y DICCMED no lo representa.' },
      { tmf: 'DESCRIPCION', dm: "DM_DESCRIPCIONES.DESCRIPCION (TIPO = 'P') del VMPP", regla: 'viaja', necesario: true, transforma: true, nota: 'Viaja desde DICCMED, pero en TMF no se guarda directo: se arma con FARMACO_MAPEO y FARMACO_MAPEO_PROPIEDAD.' },
    ],
  },

  // =============================================================
  GENERICO_COMPOSICION: {
    label: 'Genérico – Composición',
    tmf: 'FARMACO_GENERICO_COMPOSICION',
    puente: 'DM_VMPP.ID_CONCEPTO_VMP → DM_VMP_SUSTANCIA',
    cardinalidad: 'Una fila por sustancia del VMP, replicada para cada FARMACO_GENERICO (VMPP) hijo de ese VMP.',
    filas: [
      { tmf: 'ID_FARMACO_GENERICO_COMP', dm: '—', regla: 'solo_tmf', necesario: null, nota: 'PK propia de TMF (secuencia).' },
      { tmf: 'ID_FARMACO_GENERICO', dm: 'Mismo puente que FARMACO_GENERICO (VMPP)', regla: 'viaja', necesario: true, nota: 'FK al genérico recién generado.' },
      { tmf: 'ID_FARMACO_SUSTANCIA', dm: 'DM_VMP_SUSTANCIA.ID_CONCEPTO_SUSTANCIA → SIS_CONCEPTO_MAPEOS (TMF)', regla: 'viaja', necesario: true, transforma: true, nota: 'Formulario VMP: sustancias obligatorias. La sustancia tiene que existir antes en TMF.' },
      { tmf: 'CANTIDAD_NUMERADOR', dm: 'DM_VMP_SUSTANCIA.POTENCIA', regla: 'viaja', necesario: true, nota: '' },
      { tmf: 'ID_UNIDAD_NUMERADOR', dm: 'DM_VMP_SUSTANCIA.ID_CONCEPTO_UNIDAD_POTENCIA', regla: 'viaja', necesario: true, transforma: true, nota: 'Requiere mapear al auxiliar TMF Unidad de Medida.' },
      { tmf: 'CANTIDAD_DENOMINADOR', dm: 'DM_VMP_SUSTANCIA.PARTIDO_POR', regla: 'viaja', necesario: false, nota: 'Solo si la potencia es por unidad (mg/ml).' },
      { tmf: 'ID_UNIDAD_DENOMINADOR', dm: 'DM_VMP_SUSTANCIA.ID_CONCEPTO_PARTIDO_POR', regla: 'viaja', necesario: false, transforma: true, nota: 'A confirmar que ID_CONCEPTO_PARTIDO_POR es la unidad del denominador.' },
      { tmf: 'ORD', dm: 'DM_VMP_SUSTANCIA.ORDEN', regla: 'viaja', necesario: true, nota: 'Mismo orden que el VTM.' },
    ],
  },

  // =============================================================
  COMERCIAL: {
    label: 'Comercial',
    tmf: 'FARMACO_COMERCIAL',
    puente: 'SIS_CONCEPTO_MAPEOS (ID_TERMINOLOGIA = 30) → DM_CONCEPTOS (AMPP)',
    cardinalidad: 'Un AMPP = un FARMACO_COMERCIAL. Su ID_FARMACO_GENERICO es el del VMPP del AMPP.',
    filas: [
      { tmf: 'ID_FARMACO_COMERCIAL', dm: 'SIS_CONCEPTO_MAPEOS.CODIGO_MAPEO → ID_CONCEPTO (AMPP)', regla: 'viaja', necesario: true, nota: 'Puente.' },
      { tmf: 'DESCRIPCION', dm: "DM_DESCRIPCIONES.DESCRIPCION (TIPO = 'P') del AMPP", regla: 'viaja', necesario: true, nota: 'Formulario AMPP: término preferido obligatorio.' },
      { tmf: 'ID_FARMACO_GENERICO', dm: 'AMPP.COMPONENTES.VMPP → ID_FARMACO_GENERICO de ese VMPP', regla: 'viaja', necesario: true, transforma: true, nota: 'Formulario AMPP: VMPP obligatorio. Depende de la decisión de cardinalidad del Genérico.' },
      { tmf: 'ID_LABORATORIO', dm: 'AMPP → AMP.LABORATORIO', regla: 'viaja', necesario: true, transforma: true, nota: 'Formulario AMPP: AMP obligatorio. Requiere mapear al auxiliar TMF Laboratorio.' },
      { tmf: 'GTIN', dm: 'AMPP · pestaña GTIN', regla: 'viaja', necesario: false, nota: 'Formulario AMPP: opcional. A definir qué pasa con varios GTIN (adicionales) si TMF guarda uno solo.' },
      { tmf: 'ID_ALFABETA', dm: 'AMPP · AlfaBeta derivado del troquel', regla: 'viaja', necesario: false, nota: 'No editable; se deriva. A confirmar columna.' },
      { tmf: 'ID_KAIROS', dm: 'AMPP · pestaña Kairos (Id presentación Kairos)', regla: 'viaja', necesario: false, nota: 'Opcional, numérico. Existe además Id producto Kairos: confirmar cuál va a TMF.' },
      { tmf: 'ID_SNOMED', dm: 'DM_CONCEPTOS.ID_CONCEPTO (posible)', regla: 'definir', necesario: null, nota: 'En Sustancia quedó como «futuro». Confirmar si en Comercial pasa lo mismo.' },
      { tmf: 'EMPAQUE', dm: 'DM_VMPP.CANTIDAD (VMPP del AMPP)', regla: 'viaja', necesario: true, nota: 'Cantidad de unidades del envase (ej. 60 unidades). Formulario VMPP: Cantidad obligatoria.' },
      { tmf: 'ESTADO', dm: 'DM_CONCEPTOS.ESTADO (concepto AMPP)', regla: 'viaja', necesario: 'auto', nota: 'Formulario AMPP: Estado necesario para el SP, default Activo.' },
      { tmf: 'FECHA_ALTA', dm: 'DM_CONCEPTOS.FECHA_ALTA (concepto AMPP)', regla: 'viaja', necesario: 'auto', nota: 'Todas las fechas salen de DM_CONCEPTOS.' },
      { tmf: 'FECHA_ULTIMA_MODIFICACION', dm: 'DM_CONCEPTOS.FECHA_ULTIMA_MODIFICACION (concepto AMPP)', regla: 'viaja', necesario: 'auto', nota: 'Todas las fechas salen de DM_CONCEPTOS.' },
      { tmf: 'FECHA_BAJA', dm: 'DM_CONCEPTOS.FECHA_BAJA (concepto AMPP)', regla: 'viaja', necesario: 'auto', nota: 'Todas las fechas salen de DM_CONCEPTOS.' },
      { tmf: 'REFRIGERABLE', dm: 'AMPP (hoy no existe el campo)', regla: 'futuro', necesario: null, nota: 'Podría llegar a cargarse en el AMPP de DICCMED, pero hoy no está.' },
      { tmf: 'PRECIO', dm: '—', regla: 'definir', necesario: null, nota: 'A conversar: no existe en DICCMED; hoy viene de Novedades Comerciales / proveedores (a confirmar).' },
      { tmf: 'FECHA_ULTIMA_MODIFICACION_PRECIO', dm: '—', regla: 'definir', necesario: null, nota: 'Sigue a PRECIO (a conversar).' },
    ],
  },
};

// Decisiones tomadas y preguntas abiertas, para mostrar en la vista.
const CONTRATO_DECISIONES = [
  { tema: 'Cardinalidad de Genérico', estado: 'cerrada', texto: 'Un FARMACO_GENERICO por VMPP. El HIS busca por VMP y luego elige VMPP.' },
  { tema: 'ID_SNOMED en Sustancia', estado: 'cerrada', texto: 'No se usa hoy; posible origen futuro: DM_CONCEPTOS.ID_CONCEPTO.' },
  { tema: 'ACCION_FARMACOLOGICA', estado: 'cerrada', texto: 'Solo TMF, fuera de alcance.' },
  { tema: 'TRAZABLE / FACTURABLE / REFRIGERABLE (genérico)', estado: 'cerrada', texto: 'Existen en TMF, no se usan ni se representan en DICCMED. REFRIGERABLE podría ir a futuro en el AMPP.' },
  { tema: 'Vía de administración', estado: 'cerrada', texto: 'Se toma la de orden 1.' },
  { tema: 'Fechas', estado: 'cerrada', texto: 'Sustancia, Genérico y Comercial toman las fechas de DM_CONCEPTOS.FECHA_* de su concepto (sustancia, VMPP, AMPP).' },
  { tema: 'DESCRIPCION de genérico', estado: 'cerrada', texto: 'Viaja desde DICCMED; en TMF se arma con FARMACO_MAPEO y FARMACO_MAPEO_PROPIEDAD.' },
];

const CONTRATO_PENDIENTES = [
  'PRECIO y FECHA_ULTIMA_MODIFICACION_PRECIO: a conversar.',
  'Genérico: CANTIDAD / ID_UNIDAD_MEDIDA salen del volumen total del VMPP (opcional en el formulario). ¿Se vuelve necesario si TMF lo exige? Nombre exacto de la columna de unidad de volumen.',
  'DM_VMPP.ID_CONCEPTO_UNIDAD_MEDIDA_CANT (unidad de la cantidad): ¿se descarta? EMPAQUE en TMF no tiene unidad.',
  'ESTADO: se asume DM_CONCEPTOS.ESTADO (no DM_VMPP.ESTADO).',
  'Comercial: ID_SNOMED, varios GTIN, qué Id Kairos viaja, columna de AlfaBeta.',
  'Nombres exactos de las columnas FECHA_ALTA / FECHA_BAJA en DM_CONCEPTOS.',
];

if (typeof module !== 'undefined') module.exports = { CONTRATO_REGLAS, CONTRATO, CONTRATO_DECISIONES, CONTRATO_PENDIENTES };
