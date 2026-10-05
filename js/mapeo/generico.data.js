// ---------------------------------------------------------------
// Datos de los niveles Genérico. El motor compartido admite
// conexiones { approx:true } cuando el campo exacto de unión
// todavía no está confirmado (se dibujan punteadas), y from/to
// pueden apuntar a un campo puntual ("nodo.campo") o a un nodo
// entero ("nodo") cuando aún no sabemos el campo exacto.
//
// Los nodos se definen una sola vez (NODE_*) y se reutilizan en
// GENERICO, GENERICO_COMPOSICION y en la vista combinada
// GENERICO_FULL, para no duplicar campos/notas. Reutilizar el
// mismo objeto en varias columnas es seguro: el motor reconstruye
// las tarjetas desde cero en cada render, así que nunca se
// muestran dos niveles a la vez.
//
// `compactView` en un nivel indica qué datos mostrar cuando el
// usuario activa "Solo títulos": si está presente, reemplaza por
// completo columns/connections/title/etc. mientras el modo
// compacto esté activo (ver shared/engine.js).
// ---------------------------------------------------------------

const NODE_FG = {
  id: 'fg', system: 'USUARIO_MF', title: 'FARMACO_GENERICO', alias: '(fg)', accent: 'green',
  fields: [
    { id: 'id_farmaco_generico', name: 'ID_FARMACO_GENERICO', badge: 'PK' },
    { id: 'descripcion', name: 'DESCRIPCION' },
    { id: 'estado', name: 'ESTADO' },
    { id: 'tipo_producto', name: 'TIPO_PRODUCTO' },
    { id: 'saf', name: 'SAF' },
    { id: 'id_unidad_asistencial', name: 'ID_UNIDAD_ASISTENCIAL' },
    { id: 'id_via_administracion', name: 'ID_VIA_ADMINISTRACION' },
    { id: 'id_forma_farmaceutica', name: 'ID_FORMA_FARMACEUTICA' },
    { id: 'trazable', name: 'TRAZABLE' },
    { id: 'facturable', name: 'FACTURABLE' },
    { id: 'refrigerable', name: 'REFRIGERABLE' },
    { id: 'id_farmaco_envase', name: 'ID_FARMACO_ENVASE' },
    { id: 'cantidad', name: 'CANTIDAD' },
    { id: 'id_unidad_medida', name: 'ID_UNIDAD_MEDIDA' },
    { id: 'fecha_ultima', name: 'FECHA_ULTIMA_MODIFICACION' },
    { id: 'fecha_alta', name: 'FECHA_ALTA' },
    { id: 'fecha_baja', name: 'FECHA_BAJA' },
  ],
  note: 'Se une directo con SIS_CONCEPTO_MAPEOS (ID_FARMACO_GENERICO = CODIGO_MAPEO). Además mapea contra FARMACO_MAPEO, que a su vez se enlaza con FARMACO_MAPEO_PROPIEDAD.'
};

const NODE_FGC = {
  id: 'fgc', system: 'USUARIO_MF', title: 'FARMACO_GENERICO_COMPOSICION', alias: '(fgc)', accent: 'green',
  fields: [
    { id: 'id_farmaco_generico_comp', name: 'ID_FARMACO_GENERICO_COMP', badge: 'PK' },
    { id: 'id_farmaco_generico', name: 'ID_FARMACO_GENERICO', badge: 'FK' },
    { id: 'id_farmaco_sustancia', name: 'ID_FARMACO_SUSTANCIA', badge: 'FK' },
    { id: 'cantidad_numerador', name: 'CANTIDAD_NUMERADOR' },
    { id: 'id_unidad_numerador', name: 'ID_UNIDAD_NUMERADOR' },
    { id: 'cantidad_denominador', name: 'CANTIDAD_DENOMINADOR' },
    { id: 'id_unidad_denominador', name: 'ID_UNIDAD_DENOMINADOR' },
    { id: 'ord', name: 'ORD' },
  ],
  note: 'Une un genérico (fg) con sus sustancias componentes (fs), con cantidad numerador/denominador.'
};

const NODE_FM = {
  id: 'fm', system: 'USUARIO_MF', title: 'FARMACO_MAPEO', alias: '(fm)',
  fields: [
    { id: 'id_tipo_farmaco', name: 'ID_TIPO_FARMACO', val: '= 2', cond: true },
    { id: 'id_codificacion', name: 'ID_CODIFICACION', val: '= 4 (NNE) / 6 (DESC_TMF)', cond: true },
  ],
  note: 'ID_TIPO_FARMACO=2 identifica el tipo Genérico. ID_CODIFICACION distingue el origen del código externo.'
};

const NODE_FMP = {
  id: 'fmp', system: 'USUARIO_MF', title: 'FARMACO_MAPEO_PROPIEDAD', alias: '(fmp)',
  fields: [
    { id: 'id_propiedad', name: 'ID_PROPIEDAD' },
  ],
  note: 'Propiedades adicionales del mapeo — alcance exacto a definir.'
};

const NODE_SCM = {
  id: 'scm', system: 'DICCMED', title: 'SIS_CONCEPTO_MAPEOS', alias: '(scm)',
  fields: [
    { id: 'id_terminologia', name: 'ID_TERMINOLOGIA', val: '= 30', cond: true },
    { id: 'id_concepto', name: 'ID_CONCEPTO', badge: 'FK' },
    { id: 'codigo_mapeo', name: 'CODIGO_MAPEO', val: '= fg.ID' },
  ],
  note: 'Puente mediante (ID_TERMINOLOGIA=27) : CODIGO_MAPEO se une directo con ID_FARMACO_GENERICO.'
};

const NODE_SCE = {
  id: 'sce', system: 'DICCMED', title: 'SIS_CONCEPTO_ETIQUETA', alias: '(sce)',
  fields: [
    { id: 'id_concepto', name: 'ID_CONCEPTO', val: '?' },
    { id: 'codigo_mapeo', name: 'CODIGO_MAPEO', val: '?' },
  ],
  note: 'Similar a SIS_CONCEPTO_MAPEOS pero referencia etiquetas. Mapea FARMACO_GENERICO contra DM_CONCEPTO_ETIQUETA. Campos exactos a confirmar.'
};

const NODE_C = {
  id: 'c', system: 'DICCMED', title: 'DM_CONCEPTOS', alias: '(c)',
  fields: [
    { id: 'id_concepto', name: 'ID_CONCEPTO', badge: 'PK' },
    { id: 'id_subcategoria', name: 'ID_SUBCATEGORIA', val: '= 3, 4 (VMP, VMPP)', cond: true },
    { id: 'fecha_ultima', name: 'FECHA_ULTIMA_MODIFICACION', val: '?' },
  ],
  note: 'ID_SUBCATEGORIA 3/4 filtra conceptos VMP y VMPP (genérico).'
};

const NODE_DCE = {
  id: 'dce', system: 'DICCMED', title: 'DM_CONCEPTO_ETIQUETA', alias: '(dce)',
  fields: [
    { id: 'id_concepto', name: 'ID_CONCEPTO', val: 'VARCHAR2' },
  ],
  note: 'ID_CONCEPTO es VARCHAR2 (no numérico como en DM_CONCEPTOS): cuidar la conversión de tipos en el join.'
};

const NODE_DM_DESC = {
  id: 'dm_desc', system: 'DICCMED', title: 'DM_DESCRIPCIONES',
  fields: [
    { id: 'id_concepto', name: 'ID_CONCEPTO', badge: 'FK' },
    { id: 'tipo', name: 'TIPO', val: "= 'P'", cond: true },
    { id: 'descripcion', name: 'DESCRIPCION' },
  ],
  note: "TIPO='P' → equivalente a fg.DESCRIPCION. Atributo/etiqueta/mapeo exactos en DICCMED: a definir."
};

const NODE_DM_VMP = {
  id: 'dm_vmp', system: 'DICCMED', title: 'DM_VMP',
  fields: [
    { id: 'id_concepto_ffa', name: 'ID_CONCEPTO_FFA' },
    { id: 'volumen_tot_cant', name: 'VOLUMEN_TOT_CANT' },
    { id: 'id_concepto_volumen_tot_u', name: 'ID_CONCEPTO_VOLUMEN_TOT_U' },
    { id: 'id_concepto_tipo_prod', name: 'ID_CONCEPTO_TIPO_PROD' },
  ],
  note: 'Relación 1 a 1 con el concepto VMP. Algunos campos no se usan actualmente.'
};

const NODE_DM_VMP_UNI = {
  id: 'dm_vmp_uni', system: 'DICCMED', title: 'DM_VMP_UNIDOSIS', alias: '{U ASISTENCIAL}',
  fields: [
    { id: 'id_concepto_ffa', name: 'ID_CONCEPTO_FFA' },
    { id: 'volumen_tot_cant', name: 'VOLUMEN_TOT_CANT' },
    { id: 'id_concepto_volumen_tot_u', name: 'ID_CONCEPTO_VOLUMEN_TOT_U' },
    { id: 'id_concepto_tipo_prod', name: 'ID_CONCEPTO_TIPO_PROD' },
    { id: 'orden', name: 'ORDEN', val: '= 1 (preferida)', cond: true },
  ],
  note: 'VMP con forma farmacéutica "solución inyectable"; VMPP puede traer 3 valores.'
};

const NODE_DM_VMP_VIA = {
  id: 'dm_vmp_via', system: 'DICCMED', title: 'DM_VMP_VIA_ADMINISTRACION',
  fields: [
    { id: 'id_concepto_ffa', name: 'ID_CONCEPTO_FFA' },
    { id: 'volumen_tot_cant', name: 'VOLUMEN_TOT_CANT' },
    { id: 'id_concepto_volumen_tot_u', name: 'ID_CONCEPTO_VOLUMEN_TOT_U' },
    { id: 'id_concepto_tipo_prod', name: 'ID_CONCEPTO_TIPO_PROD' },
  ],
  note: 'Detalle de VMP por vía de administración.'
};

const NODE_DM_VMPP = {
  id: 'dm_vmpp', system: 'DICCMED', title: 'DM_VMPP',
  fields: [
    { id: 'id_concepto_vmpp', name: 'ID_CONCEPTO_VMPP', badge: 'PK' },
    { id: 'id_concepto_vmp', name: 'ID_CONCEPTO_VMP', badge: 'FK' },
    { id: 'tipo_vmpp', name: 'TIPO_VMPP' },
    { id: 'cantidad', name: 'CANTIDAD' },
    { id: 'id_concepto_unidad_medida_cant', name: 'ID_CONCEPTO_UNIDAD_MEDIDA_CANT' },
    { id: 'pack_multi_cant', name: 'PACK_MULTI_CANT' },
    { id: 'id_concepto_pack_multi_unidad', name: 'ID_CONCEPTO_PACK_MULTI_UNIDAD' },
    { id: 'volumen_tot_cant', name: 'VOLUMEN_TOT_CANT' },
    { id: 'id_concepto_volumen_tot_unidad', name: 'ID_CONCEPTO_VOLUMEN_TOT_UNIDAD' },
    { id: 'estado', name: 'ESTADO' },
    { id: 'fecha_alta', name: 'FECHA_ALTA' },
    { id: 'fecha_ultima', name: 'FECHA_ULTIMA_MODIFICACION' },
    { id: 'fecha_baja', name: 'FECHA_BAJA' },
    { id: 'dosis_cant', name: 'DOSIS_CANT' },
    { id: 'id_concepto_dosis_u', name: 'ID_CONCEPTO_DOSIS_U' },
    { id: 'distintivo', name: 'DISTINTIVO' },
  ],
  note: 'Presentación (VMPP) de un VMP: varias filas VMPP pueden colgar del mismo VMP vía ID_CONCEPTO_VMP.'
};

const NODE_DM_VMP_SUST = {
  id: 'dm_vmp_sust', system: 'DICCMED', title: 'DM_VMP_SUSTANCIA',
  fields: [
    { id: 'id_concepto_sustancia', name: 'ID_CONCEPTO_SUSTANCIA', badge: 'FK' },
    { id: 'orden', name: 'ORDEN' },
    { id: 'potencia', name: 'POTENCIA' },
    { id: 'id_concepto_unidad_potencia', name: 'ID_CONCEPTO_UNIDAD_POTENCIA' },
    { id: 'partido_por', name: 'PARTIDO_POR' },
    { id: 'id_concepto_partido_por', name: 'ID_CONCEPTO_PARTIDO_POR' },
  ],
  note: 'Cada fila es una sustancia dentro del VMP, con su potencia y unidad.'
};

// ---------------------------------------------------------------
// Vista combinada: solo se usa cuando el modo "Solo títulos" está
// activo, sea que se venía viendo GENERICO o GENERICO_COMPOSICION.
// FGC queda apilado debajo de FG (mismo array de columna).
// ---------------------------------------------------------------
const GENERICO_FULL = {
  step: 'Paso 2 de 3 · Genérico (vista combinada)',
  title: 'TMF.FARMACO_GENERICO + FARMACO_GENERICO_COMPOSICION ↔ DICCMED',
  subtitle: 'Vista combinada de Genérico y Genérico – Composición: ambos comparten el mismo puente <b>scm → c</b>. Disponible solo en modo "Solo títulos".',
  columns: [
    [NODE_FG, NODE_FGC],
    [NODE_FM, NODE_FMP],
    [NODE_SCM, NODE_SCE],
    [NODE_C, NODE_DCE],
    [NODE_DM_DESC, NODE_DM_VMP, NODE_DM_VMP_SUST],
    [NODE_DM_VMP_UNI, NODE_DM_VMP_VIA, NODE_DM_VMPP],
  ],
  connections: [
    { from: 'fg.id_farmaco_generico', to: 'scm.codigo_mapeo', label: 'ID_FARMACO_GENERICO = CODIGO_MAPEO' },
    { from: 'fgc.id_farmaco_generico', to: 'scm', label: 'fgc ↔ scm (mismo puente)', approx: true },
    { from: 'fg', to: 'fm', label: 'fg ↔ fm (ID_TIPO_FARMACO=2)', approx: true },
    { from: 'fm', to: 'fmp', label: 'fm ↔ fmp', approx: true, vertical: true },
    { from: 'fg.id_farmaco_generico', to: 'sce.codigo_mapeo', label: 'fg ↔ sce (etiquetas)', approx: true },
    { from: 'sce.id_concepto', to: 'dce.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO', approx: true },
    { from: 'scm.id_concepto', to: 'c.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO' },
    { from: 'c.id_concepto', to: 'dm_desc.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO' },
    { from: 'c', to: 'dm_vmp', label: 'concepto VMP/VMPP → DM_VMP', approx: true },
    { from: 'c', to: 'dm_vmp_sust', label: 'concepto VMP/VMPP → DM_VMP_SUSTANCIA', approx: true },
    { from: 'dm_vmp', to: 'dm_vmp_uni', label: 'por ID_CONCEPTO_FFA', approx: true },
    { from: 'dm_vmp', to: 'dm_vmp_via', label: 'por ID_CONCEPTO_FFA', approx: true },
    { from: 'dm_vmp', to: 'dm_vmpp.id_concepto_vmp', label: 'ID_CONCEPTO = ID_CONCEPTO_VMP', approx: true },
    { from: 'fgc.id_farmaco_sustancia', to: 'dm_vmp_sust.id_concepto_sustancia', label: 'ID_FARMACO_SUSTANCIA = ID_CONCEPTO_SUSTANCIA' },
  ]
};

const GENERICO_LEVELS = {

  GENERICO: {
    label: 'Genérico',
    step: 'Paso 2 de 3 · Nivel Genérico',
    title: 'TMF.FARMACO_GENERICO ↔ DICCMED (VMP / VMPP)',
    subtitle: 'Camino de join: <b>fg → sis_concepto_mapeos → dm_conceptos → (dm_descripciones, dm_vmp → dm_vmp_unidosis / dm_vmp_via_administracion / dm_vmpp)</b>. Por separado, <b>fg → FARMACO_MAPEO → FARMACO_MAPEO_PROPIEDAD</b>. Además, <b>fg → sis_concepto_etiqueta → dm_concepto_etiqueta</b> resuelve las etiquetas. Las líneas punteadas son vínculos cuyo campo exacto todavía hay que confirmar.',
    // En modo "Solo títulos" se muestra la vista combinada con GENERICO_COMPOSICION.
    compactView: GENERICO_FULL,
    columns: [
      [NODE_FG],
      [NODE_FM, NODE_FMP],
      [NODE_SCM, NODE_SCE],
      [NODE_C, NODE_DCE],
      [NODE_DM_DESC, NODE_DM_VMP],
      [NODE_DM_VMP_UNI, NODE_DM_VMP_VIA, NODE_DM_VMPP],
    ],
    connections: [
      { from: 'fg.id_farmaco_generico', to: 'scm.codigo_mapeo', label: 'ID_FARMACO_GENERICO = CODIGO_MAPEO' },
      { from: 'fg', to: 'fm', label: 'fg ↔ fm (ID_TIPO_FARMACO=2)' },
      { from: 'fm', to: 'fmp', label: 'fm ↔ fmp',  vertical: true },
      { from: 'fg.id_farmaco_generico', to: 'sce.codigo_mapeo', label: 'fg ↔ sce (etiquetas)' },
      { from: 'sce.id_concepto', to: 'dce.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO' },
      { from: 'scm.id_concepto', to: 'c.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO' },
      { from: 'c.id_concepto', to: 'dm_desc.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO' },
      { from: 'c', to: 'dm_vmp', label: 'concepto VMP/VMPP → DM_VMP', approx: true },
      { from: 'dm_vmp', to: 'dm_vmp_uni', label: 'por ID_CONCEPTO_FFA', approx: true },
      { from: 'dm_vmp', to: 'dm_vmp_via', label: 'por ID_CONCEPTO_FFA', approx: true },
      { from: 'dm_vmp', to: 'dm_vmpp.id_concepto_vmp', label: 'ID_CONCEPTO = ID_CONCEPTO_VMP', approx: true },
    ]
  },

  GENERICO_COMPOSICION: {
    label: 'Genérico – Composición',
    step: 'Paso 2 de 3 · Genérico – Composición',
    title: 'TMF.FARMACO_GENERICO_COMPOSICION ↔ DICCMED.DM_VMP_SUSTANCIA',
    subtitle: 'Misma lógica del nivel Genérico: <b>fgc</b> une un genérico con sus sustancias componentes, y se mapea contra <b>dm_vmp_sustancia</b> a través del mismo puente concepto (scm → c) usado en Genérico.',
    // Mismo compactView que GENERICO: al activar "Solo títulos" desde
    // cualquiera de los dos tabs se ve la misma vista combinada.
    compactView: GENERICO_FULL,
    columns: [
      [NODE_FGC],
      [NODE_SCM],
      [NODE_C],
      [NODE_DM_DESC, NODE_DM_VMP_SUST]
    ],
    connections: [
      { from: 'fgc.id_farmaco_generico', to: 'scm', label: 'mismo puente que en Genérico', approx: true },
      { from: 'scm.id_concepto', to: 'c.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO' },
      { from: 'c.id_concepto', to: 'dm_desc.id_concepto', label: 'ID_CONCEPTO = ID_CONCEPTO' },
      { from: 'c', to: 'dm_vmp_sust', label: 'concepto VMP/VMPP → DM_VMP_SUSTANCIA', approx: true },
      { from: 'fgc.id_farmaco_sustancia', to: 'dm_vmp_sust.id_concepto_sustancia', label: 'ID_FARMACO_SUSTANCIA = ID_CONCEPTO_SUSTANCIA' },
    ]
  },
};