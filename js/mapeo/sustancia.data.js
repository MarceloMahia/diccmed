// ---------------------------------------------------------------
// Datos del nivel Sustancia. Para agregar GENERICO o COMERCIAL acá
// (si alguna vez se necesitan como parte de ESTA página en vez de
// generico.html), reemplazá el `null` por un objeto con la misma
// forma que SUSTANCIA. El motor (shared/engine.js) no se toca.
// ---------------------------------------------------------------
const SUSTANCIA_LEVELS = {
  SUSTANCIA: {
    label: 'Sustancia',
    step: 'Paso 1 de 3 · Nivel Sustancia',
    title: 'TMF.FARMACO_SUSTANCIA ↔ DICCMED (concepto → descripción / base)',
    subtitle: 'Camino de join para resolver una sustancia de TMF contra DICCMED: <b>fs → sis_concepto_mapeos → dm_conceptos → (dm_descripciones, dm_sustancia_base)</b>. Los chips azules en cada tabla son condiciones fijas (WHERE); las etiquetas sobre las flechas son el campo de unión entre tablas.',
    columns: [
      [{
        id: 'fs', system: 'USUARIO_MF', title: 'FARMACO_SUSTANCIA', alias: '(fs)', accent: 'green',
        fields: [
          { id: 'id_farmaco_sustancia', name: 'ID_FARMACO_SUSTANCIA', badge: 'PK' },
          { id: 'descripcion', name: 'DESCRIPCION' },
          { id: 'estado', name: 'ESTADO' },
          { id: 'fecha_ultima', name: 'FECHA_ULTIMA_MODIFICACION', val: '?' },
          { id: 'fecha_alta', name: 'FECHA_ALTA_MODIFICACION', val: '?' },
          { id: 'fecha_baja', name: 'FECHA_BAJA_MODIFICACION', val: '?' },
          { id: 'modelo', name: 'MODELO', val: 'solo TMF' },
          { id: 'id_snomed', name: 'ID_SNOMED', val: 'no se usa' },
          { id: 'id_accion_farmacologica', name: 'ID_ACCION_FARMACOLOGICA', val: 'solo TMF' },
        ],
        note: 'MODELO e ID_ACCION_FARMACOLOGICA existen solo en TMF (DICCMED no los representa; la acción farmacológica queda fuera de alcance). ID_SNOMED no se usa hoy: si el costo-beneficio lo justifica, el SP podría completarlo desde DM_CONCEPTOS.ID_CONCEPTO. La pantalla TMF Componente ya tiene una pestaña Snomed.'
      }],
      [{
        id: 'scm', system: 'DICCMED', title: 'SIS_CONCEPTO_MAPEOS', alias: '(scm)',
        fields: [
          { id: 'id_terminologia', name: 'ID_TERMINOLOGIA', val: '= 30', cond: true },
          { id: 'id_concepto', name: 'ID_CONCEPTO', badge: 'FK' },
          { id: 'codigo_mapeo', name: 'CODIGO_MAPEO', val: '= fs.ID' },
        ],
        note: 'Puente entre (CODIGO_MAPEO) TMF y (ID_CONCEPTO) DICCMED. ID_TERMINOLOGIA=30 identifica que el origen es TMF.'
      }],
      [{
        id: 'c', system: 'DICCMED', title: 'DM_CONCEPTOS', alias: '(c)',
        fields: [
          { id: 'id_concepto', name: 'ID_CONCEPTO', badge: 'PK' },
          { id: 'id_subcategoria', name: 'ID_SUBCATEGORIA', val: '= 1', cond: true },
          { id: 'estado', name: 'ESTADO' },
          { id: 'fecha_alta', name: 'FECHA_ALTA' },
          { id: 'fecha_ultima', name: 'FECHA_ULTIMA_MODIFICACION' },
          { id: 'fecha_baja', name: 'FECHA_BAJA' },
        ],
        note: 'ID_SUBCATEGORIA=1 filtra los conceptos que son "sustancia".'
      }],
      [
        {
          id: 'dm_desc', system: 'DICCMED', title: 'DM_DESCRIPCIONES',
          fields: [
            { id: 'id_concepto', name: 'ID_CONCEPTO', badge: 'FK' },
            { id: 'tipo', name: 'TIPO', val: "= 'P'", cond: true },
            { id: 'descripcion', name: 'DESCRIPCION' },
          ],
          note: "TIPO='P' trae la descripción preferida del concepto → equivalente a fs.DESCRIPCION"
        },
        {
          id: 'dm_sust', system: 'DICCMED', title: 'DM_SUSTANCIA_BASE',
          fields: [
            { id: 'id_concepto', name: 'ID_CONCEPTO', badge: 'FK' },
          ],
          note: 'Atributos propios de sustancia en DICCMED, en esta tabla se guarda la relacion de SUSTANCIA BASE y SUSTANCIA PRECISA.'
        }
      ]
    ],
    connections: [
      { from: 'fs.id_farmaco_sustancia', to: 'scm.codigo_mapeo', label: 'ID_FARMACO_SUSTANCIA = CODIGO_MAPEO' },
      { from: 'scm.id_concepto', to: 'c.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO' },
      { from: 'c.id_concepto', to: 'dm_desc.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO' },
      { from: 'c.id_concepto', to: 'dm_sust.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO' },
    ]
  },

  GENERICO: null,   // ver /sps/generico/generico.html — completar acá solo si se decide fusionar
  COMERCIAL: null,  // reservado para el nivel Comercial; se muestra como pestaña hasta completar el mapeo
};
