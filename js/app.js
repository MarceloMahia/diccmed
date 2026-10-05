/* =========================================================
   DICCMED / MODELO FARMACÉUTICO
   JS CENTRALIZADO
   - navegación global
   - modo Nuevo / Edición
   - render de formularios por entidad
   - resumen de campos
   - edición de badges
   - casos específicos AMPP
   ========================================================= */

const PAGE_CONFIG = {
  sus: {
    label: "SUS",
    title: "Nuevo SUS",
    description: "Sustancia / principio activo.",
    tabs: ["Preferido","Riesgo Teratogenico","Metadatos","Mapeos","Etiquetas"],
    rows: [
 [["Término Preferido (P)","Si","Si","Carga manual (Man.); CREAC_NOMBRE = M"],
  ["Sinónimo","No","No","SENS_MAYUSC se auto-detecta"]],
 [["Riesgo teratogénico","Si","No","Solo aplica a Sustancia; valor de catálogo"]],
 [["Revisado","Si","No","Default: No"],
  ["Consultar","Si","No","Default: No"],
  ["Estado","Si","Si","Default: Activo"],
  ["Comercializado","Si","No","Default: Si"],
  ["Observación","No","No","Texto libre"]],
 [["Terminología (mapeo)","No","No","No utilizado en TMF mapeado a SNOMED"]],
 [["Etiqueta","No","No","-"]]
],
    templateCount: 5
  },
  vtm: {
    label: "VTM",
    title: "Nuevo VTM",
    description: "Virtual Therapeutic Moiety.",
    tabs: ["Preferido","Componentes","Metadatos","Mapeos","Etiquetas"],
    rows: [
 [["Término Preferido (P)","Si","No","En principio no se haria uso del VTM. Auto-generado; se compone con el distintivo"],
  ["Distintivo","No","No","Desambigua el nombre auto (comodín / colisión)"],
  ["Especial (comodín)","No","No","Default: No // Caso especial que permite el diccionario de VTM sin sustancias"],
  ["Sinónimo","No","No","CREAC_NOMBRE = M; SENS_MAYUSC se auto-detecta"]],
 [["Especial (comodín) – select","No","No","Default: No (estándar)"],
  ["Separador de sustancias","No","No","Sin separador = monosustancia"],
  ["Sustancias","Si","Si","Al menos 1; el VTM define el orden y se propaga a VMP/VMPP/AMP/AMPP"]],
 [["Revisado","No","No","Default: No"],
  ["Consultar","No","No","Default: No"],
  ["Estado","Si","Si","Default: Activo"],
  ["Comercializado","No","No","Derivado (solo lectura); se edita únicamente en el AMPP"],
  ["Observación","No","No","Texto libre"]],
 [["Terminología (mapeo)","No","No","NNE + código → TMF · Genérico"]],
 [["Etiqueta","No","No","Solo etiquetas vigentes"]]
],
    templateCount: 5
  },
  vmp: {
    label: "VMP",
    title: "Nuevo VMP",
    description: "Virtual Medicinal Product.",
    tabs: ["Preferido","Atributos VMP","Vías","Unidosis","Dosificación","Sustancias","Metadatos","Mapeos","Etiquetas"],
    rows: [
 [["Término Preferido (P)","Si","Si","No",""],
  ["Distintivo","No","No","Desambigua el nombre auto (comodín / colisión)"],
  ["Cómo se arma el preferido","No","No","Revisar"],
  ["Sinónimo","No","No","CREAC_NOMBRE = M; SENS_MAYUSC se auto-detecta"]],
 [["VTM","Si","Si","Buscador de VTM"],
  ["FFA / Forma farmacéutica","Si","Si","Forma farmacéutica agrupada"],
  ["Unidad asistencial","Si","Si","Unidad asistencial del medicamento"],
  ["Cantidad","No","No","Dato de cantidad cuando corresponda"],
  ["Volumen total (cant. / unidad)","No","No","Opcional; entra en el nombre si se usa FFA + volumen"],
  ["Especial (comodín)","No","No","Default: No (estándar)"],
  ["Condición de expendio","Si","Si","Select"],
  ["Estado de prescripción","Si","Si","Select"],
  ["Tipo de producto ANMAT","Si","Si","Un VMP pertenece a una sola categoría"]],
 [["Vías de administración","Si","Si","Al menos 1; orden 1 = principal; se pueden dar de baja"]],
 [["Unidad de prescripción","Si","Si","Al menos 1; si falta es error QC U1"],
  ["Unidad de despacho","Si","Si","Al menos 1"],
  ["Factores de conversión propios","No","No","Normalmente ninguno"]],
 [["Método de dosis","Si","Si","Default: Dosis fija; siempre existe una regla por producto"],
  ["Redondeo","No","No","Default: Unidad entera"],
  ["Confiabilidad","No","No","Default: Convención"],
  ["Techos","No","No","Default: sin máximos"],
  ["Fuente","No","No","PKG_DM_CALCULO.derivar_vmp; opción «No autocalcular»"],
  ["Observación (dosificación)","No","No","Texto derivado por regla"],
  ["Pautas de la ficha","No","No","0..N; solo si la ficha distingue por indicación, población o fase"]],
 [["Sustancias (potencias)","Si","Si","Mismas sustancias y orden que el VTM; acá solo se cargan potencias"]],
 [["Revisado","No","No","Default: No"],
  ["Consultar","No","No","Default: No"],
  ["Estado","No","Si","Default: Activo"],
  ["Comercializado","No","No","Derivado (solo lectura); se edita únicamente en el AMPP"],
  ["Observación","No","No","Texto libre"]],
 [["Terminología (mapeo)","No","No","NNE + código → TMF · Medicamento"]],
 [["Etiqueta SAF","No","No","SAF → TMF · Medicamento"]]
],
    templateCount: 9
  },
  vmpp: {
    label: "VMPP",
    title: "Nuevo VMPP",
    description: "Virtual Medicinal Product Pack.",
    tabs: ["Preferido","Empaque","Metadatos","Mapeos","Etiquetas"],
    rows: [
 [["Término Preferido (P)","Si","Si","Auto-generado; se compone con el distintivo"],
  ["Distintivo","No","No","Desambigua el nombre auto (comodín / colisión)"],
  ["Sinónimo","No","No","CREAC_NOMBRE = M; SENS_MAYUSC se auto-detecta"]],
 [["VMP","Si","Si","Buscador de VMP"],
  ["Cantidad","Si","Si","Cantidad del empaque del fármaco comercial"],
  ["Tipo VMPP","Si","Si","Select"],
  ["Unidad de medida","Si","Si","Unidad del envase del fármaco genérico"],
  ["Pack multi (cant. / unidad)","No","No","Opcional"],
  ["Volumen total (cant. / unidad)","No","No","Cantidad + unidad del envase del fármaco genérico"],
  ["Unidad volumen","No","No","Unidad de medida del envase del fármaco genérico"],
  ["Dosis (cantidad / unidad)","No","No","Opcional; la unidad se asigna con el botón «Asignar dosis»"]],
 [["Revisado","No","No","Default: No"],
  ["Consultar","No","No","Default: No"],
  ["Estado","No","Si","Default: Activo"],
  ["Comercializado","No","No","Derivado (solo lectura); se edita únicamente en el AMPP"],
  ["Observación","No","No","Texto libre"]],
 [["Terminología (mapeo)","No","No","NNE + código → TMF · Genérico con envase"]],
 [["Etiqueta","No","No","Solo etiquetas vigentes"]]
],
    templateCount: 5
  },
  tf: {
    label: "Trade Family",
    title: "Nuevo Trade Family",
    description: "Familia comercial.",
    tabs: ["Preferido","Metadatos","Mapeos","Etiquetas"],
    rows: [
 [["Término Preferido (P)","Si","Si","Ingreso manual (Man.)"],
  ["Sinónimo","No","No","CREAC_NOMBRE = M; SENS_MAYUSC se auto-detecta"]],
 [["Revisado","No","No","Default: No"],
  ["Consultar","No","No","Default: No"],
  ["Estado","No","Si","Default: Activo"],
  ["Comercializado","No","No","Derivado (solo lectura); se edita únicamente en el AMPP"],
  ["Observación","No","No","Texto libre"]],
 [["Terminología (mapeo)","No","No","Solo terminologías vigentes de la subcategoría"]],
 [["Etiqueta","No","No","Solo etiquetas vigentes"]]
],
    templateCount: 4
  },
  amp: {
    label: "AMP",
    title: "Nuevo AMP",
    description: "Actual Medicinal Product.",
    tabs: [
  "Preferido",
  "Componentes",
  "Dispositivos",
  "Metadatos",
  "Mapeos",
  "Etiquetas"
],
    rows: [

  /* 0 — Preferido */

  [
    [
      "Término Preferido (P)",
      "Si",
      "Si",
      "Auto-generado a partir de los componentes",
      "Si"
    ],

    [
      "Distintivo",
      "No",
      "No",
      "Desambiguador / comodín / colisión",
      "No"
    ],

    [
      "Sinónimo",
      "No",
      "No",
      "CREAC_NOMBRE = M; SENS_MAYUSC se auto-detecta",
      "No"
    ]
  ],


  /* 1 — Componentes */

  [
    [
      "Trade Family (TF)",
      "Si",
      "Si",
      "Buscar TF vigente",
      "Si"
    ],

    [
      "VMP",
      "Si",
      "Si",
      "Buscar VMP vigente",
      "Si"
    ],

    [
      "Laboratorio",
      "Si",
      "Si",
      "Buscar laboratorio vigente",
      "Si"
    ],

    [
      "FFE",
      "Si",
      "Si",
      "Forma farmacéutica extendida",
      "Si"
    ],

    [
      "VCD",
      "No",
      "No",
      "Depende del VMP seleccionado",
      "No"
    ],

    [
      "Cualidad",
      "No",
      "No",
      "Sabor, color u otra cualidad",
      "No"
    ],

    [
      "Especial",
      "No",
      "No",
      "Comodín / especial",
      "No"
    ],

    [
      "Refrigerado",
      "No",
      "No",
      "Carga inicial desde AlfaBeta",
      "No"
    ]
  ],


  /* 2 — Dispositivos */

  [
    [
      "Dispositivo",
      "No",
      "No",
      "Jeringa, vaso, cuchara, etc.",
      "Si"
    ],

    [
      "Capacidad",
      "No",
      "No",
      "Capacidad del dispositivo",
      "No"
    ],

    [
      "Unidad",
      "No",
      "No",
      "Unidad de capacidad",
      "No"
    ],

    [
      "Graduación",
      "No",
      "No",
      "Escala del dispositivo",
      "Si"
    ],

    [
      "Unidad escala",
      "No",
      "No",
      "Unidad de la graduación",
      "No"
    ],

    [
      "Confiabilidad graduación",
      "No",
      "No",
      "Exacta / estimada",
      "No"
    ],

    [
      "Fuente",
      "Si",
      "Si",
      "Cita textual mínima de 20 caracteres",
      "Si"
    ]
  ],


  /* 3 — Metadatos */

  [
    [
      "Revisado",
      "No",
      "No",
      "Default: No",
      "No"
    ],

    [
      "Consultar",
      "No",
      "No",
      "Default: No",
      "No"
    ],

    [
      "Estado",
      "No",
      "Si",
      "Default: Activo",
      "Si"
    ],

    [
      "Comercializado",
      "No",
      "No",
      "Derivado; solo lectura en AMP",
      "No"
    ],

    [
      "Observación",
      "No",
      "No",
      "Texto libre",
      "No"
    ]
  ],


  /* 4 — Mapeos */

  [
    [
      "Terminología",
      "No",
      "No",
      "Solo terminologías vigentes",
      "Si"
    ]
  ],


  /* 5 — Etiquetas */

  [
    [
      "Etiqueta",
      "No",
      "No",
      "Solo etiquetas vigentes",
      "Si"
    ]
  ]

],
    templateCount: 6
  }
  ,ampp: {
    label: "AMPP",
    title: "Nuevo AMPP",
    description: "Actual Medicinal Product Pack.",
    tabs: ["Preferido","Componentes","Pack","GTIN","Kairos","Metadatos","Mapeos","Etiquetas"],
    rows: [
 [["Término Preferido (P)","Si","Si","Auto-generado; se compone con el distintivo","Si"],
  ["Distintivo","No","No","Desambigua el nombre auto (comodín / colisión)","No"],
  ["Sinónimo","No","No","CREAC_NOMBRE = M; SENS_MAYUSC se auto-detecta","No"]],
 [["AMP","Si","Si","Buscar AMP vigente","Si"],
  ["VMPP","Si","Si","Buscar VMPP vigente","Si"]],
 [["Pack envase cant.","No","No","Opcional","No"],
  ["Unidad pack envase","No","No","Opcional","No"],
  ["Código fabricante","No","No","Opcional","No"]],
 [["GTIN adicional","No","No","AlfaBeta se deriva del troquel (no editable); cargar solo los que no estén en AlfaBeta ni SNOMED. Requiere guardar el AMPP primero","No"]],
 [["Id presentación Kairos","No","No","Numérico; requiere guardar el AMPP primero","No"],
  ["Id producto Kairos","No","No","Opcional","No"]],
 [["Revisado","No","No","Default: No","No"],
  ["Consultar","No","No","Default: No","No"],
  ["Estado","No","Si","Default: Activo","Si"],
  ["Comercializado","No","No","Se edita únicamente en el AMPP","No"],
  ["Observación","No","No","Texto libre","No"]],
 [["Terminología (mapeo)","No","No","Solo terminologías vigentes de la subcategoría","No"]],
 [["Etiqueta","No","No","Solo etiquetas vigentes","No"]]
],
    templateCount: 8
  }
};


// ================================================================
// TRAZABILIDAD DICCMED -> TMF
// Expone en cada formulario qué datos se representan en TMF,
// cuáles se transforman y cuáles no tienen impacto directo.
// ================================================================
const TMF_BRIDGE = {
  sus: {
    title: 'Cómo se representa en TMF',
    subtitle: 'La Sustancia aporta el dato que TMF necesita para Componente; otros atributos quedan en DICCMED.',
    items: [
      ['direct','Descripción','TMF · Componente → Nombre','Se representa directamente'],
      ['none','Riesgo teratogénico','—','No aplica directamente a TMF']
    ]
  },
  vtm: {
    title: 'Impacto en TMF',
    subtitle: 'El VTM es parte del modelo DICCMED y no se representa directamente como una entidad TMF.',
    items: [['none','VTM','—','No aplica directamente a TMF']]
  },
  vmp: {
    title: 'Cómo se representa en TMF · Medicamento',
    subtitle: 'El VMP concentra la información que termina formando el Medicamento genérico en TMF.',
    items: [
      ['direct','Nombre','TMF · Medicamento → Denominación','Se representa'],
      ['direct','Forma farmacéutica','TMF · Medicamento → Forma Farmacéutica','Se representa'],
      ['direct','Vía','TMF · Medicamento → Vía','Se representa'],
      ['direct','Unidad asistencial','TMF · Medicamento → Unidad Asistencial','Se representa'],
      ['transform','Sustancias + numerador / denominador','TMF · Medicamento → Composición','Se transforma según Autocontenido / Continuo'],
      ['transform','Volumen + cantidad','TMF · Medicamento / Composición','Se incorpora según la forma y composición'],
      ['direct','Mapeos → NNE + código','TMF · Medicamento → Código NNE','Se representa mediante el mapeo'],
      ['transform','Etiquetas → SAF','TMF · Medicamento → SAF','Se transforma al atributo SAF']
    ]
  },
  vmpp: {
    title: 'Cómo se representa en TMF · Genérico con envase',
    subtitle: 'El VMPP aporta los datos mínimos de presentación/envase que TMF necesita para el genérico.',
    items: [
      ['direct','Cantidad','TMF · Genérico con envase → Cantidad','Cantidad del empaque del fármaco comercial'],
      ['direct','Unidad de medida','TMF · Genérico con envase → Unidad de medida','Unidad asociada al envase del fármaco genérico'],
      ['direct','Volumen total','TMF · Genérico con envase → Volumen','Cantidad del envase del fármaco genérico'],
      ['direct','Unidad volumen','TMF · Genérico con envase → Unidad de volumen','Unidad de medida del envase del fármaco genérico'],
      ['direct','VMP relacionado','TMF · Medicamento','Identifica el genérico del que proviene el envase'],
      ['none','Pack multi / Dosis (si no corresponde)','—','No se toma como dato TMF mínimo en esta relación']
    ]
  },
  tf: {
    title: 'Impacto en TMF',
    subtitle: 'Trade Family no tiene una representación directa en TMF.',
    items: [['none','Trade Family','—','No aplica directamente a TMF']]
  },
  amp: {
    title: 'Impacto en TMF',
    subtitle: 'AMP no se representa como entidad TMF directa; algunos datos sirven como origen para el producto comercial.',
    items: [
      ['none','AMP','—','No aplica directamente a TMF'],
      ['transform','Laboratorio','TMF · Producto Comercial → Laboratorio','Se utiliza como origen del laboratorio del producto comercial']
    ]
  },
  ampp: {
    title: 'Cómo se representa en TMF · Producto Comercial',
    subtitle: 'El AMPP reúne la presentación comercial y conecta el VMPP (genérico con envase) con el producto comercial.',
    items: [
      ['direct','Componentes → VMPP','TMF · Producto Comercial → Fármaco genérico con envase','AMPP.COMPONENTES.VMPP'],
      ['direct','GTIN','TMF · Producto Comercial → GTIN','GTIN del fármaco comercial'],
      ['transform','AMP → Laboratorio','TMF · Producto Comercial → Laboratorio','Laboratorio del fármaco comercial, tomado desde AMP.LABORATORIO']
    ]
  }
};

function renderTmfBridge(entity){
  const b=TMF_BRIDGE[entity];
  if(!b) return '';
  const icon={direct:'→',transform:'⇄',none:'—'};
  const label={direct:'Representado',transform:'Transformado',none:'Sin impacto directo'};
  return `<section class="tmf-bridge">
    <div class="tmf-bridge-head"><div><div class="tmf-bridge-kicker">TRAZABILIDAD DICCMED ↔ TMF</div><h3>${b.title}</h3><p>${b.subtitle}</p></div><a href="mapeo.html?mode=nuevo" class="tmf-bridge-link">Ver mapa completo →</a></div>
    <div class="tmf-bridge-grid">${b.items.map(([kind,from,to,note])=>`<div class="tmf-bridge-row ${kind}">
      <div class="tmf-bridge-status"><span class="tmf-bridge-dot">${icon[kind]}</span><span>${label[kind]}</span></div>
      <div class="tmf-bridge-from">${from}</div><div class="tmf-bridge-arrow">→</div><div class="tmf-bridge-to">${to}</div><div class="tmf-bridge-note">${note}</div>
    </div>`).join('')}</div>
  </section>`;
}

const ENTITY_META = {
  sus: { group:"principales", navLabel:"Sustancia", label:"SUS", description:"Sustancia / principio activo.", href:"nuevo_sustancia.html" },
  vtm: { group:"principales", navLabel:"VTM", label:"VTM", description:"Virtual Therapeutic Moiety.", href:"nuevo_vtm.html" },
  vmp: { group:"principales", navLabel:"Genérico", label:"VMP", description:"Virtual Medicinal Product.", href:"nuevo_vmp.html" },
  vmpp: { group:"principales", navLabel:"Genérico Composición", label:"VMPP", description:"Virtual Medicinal Product Pack.", href:"nuevo_vmpp.html" },
  tf: { group:"principales", navLabel:"Trade Family", label:"Trade Family", description:"Familia comercial.", href:"nuevo_tf.html" },
  amp: { group:"principales", navLabel:"AMP", label:"AMP", description:"Actual Medicinal Product.", href:"nuevo_amp.html" },
  ampp: { group:"principales", navLabel:"Comercial", label:"AMPP", description:"Actual Medicinal Product Pack.", href:"nuevo_ampp.html" },
  casos: { group:"casos", navLabel:"Casos DICCMED → TMF", label:"Casos de uso", description:"Ejemplos completos de carga DICCMED y su representación en TMF.", href:"casos_uso.html" },
  tmfcomp: { section:"tmf", group:"principales", label:"Componente", description:"TMF · Componente (sustancia) del Maestro de Fármacos.", href:"tmf_componente.html" },
  tmfmed: { section:"tmf", group:"principales", label:"Medicamento", description:"TMF · Medicamento (autocontenido / continuo) del Maestro de Fármacos.", href:"tmf_medicamento.html" },
  tmfpm: { section:"tmf", group:"principales", label:"Producto Médico", description:"TMF · Producto Médico del Maestro de Fármacos.", href:"tmf_producto_medico.html" },
  tmfpc: { section:"tmf", group:"principales", label:"Producto Comercial", description:"TMF · Producto Comercial del Maestro de Fármacos.", href:"tmf_producto_comercial.html" },
  tmflab: { section:"tmf", group:"auxiliares", label:"Laboratorio", description:"TMF · Laboratorio.", href:"tmf_laboratorio.html" },
  tmfum: { section:"tmf", group:"auxiliares", label:"Unidad Medida", description:"TMF · Unidad de medida.", href:"tmf_unidad_medida.html" },
  tmfforma: { section:"tmf", group:"auxiliares", label:"Forma Farmacéutica", description:"TMF · Forma farmacéutica.", href:"tmf_forma_farmaceutica.html" },
  tmfaccion: { section:"tmf", group:"auxiliares", label:"Acción Farmacológica", description:"TMF · Acción farmacológica.", href:"tmf_accion_farmacologica.html" },
  tmfenv: { section:"tmf", group:"auxiliares", label:"Envase", description:"TMF · Envase.", href:"tmf_envase.html" },
  tmfua: { section:"tmf", group:"auxiliares", label:"Unidad Asistencial", description:"TMF · Unidad asistencial.", href:"tmf_unidad_asistencial.html" },
  tmfnov: { section:"tmf", group:"otros", sinDiccmed:true, label:"Servicio NOV Proveedores", description:"TMF · Servicio de novedades de productos comerciales propuestas por proveedores.", href:"tmf_novedades_comerciales.html" },
  mapeo: { label:"Mapeo TMF", description:"Campos mapeados TMF ↔ DICCMED y relaciones entre tablas.", href:"mapeo.html" }
};

function sectionOf(e){ return e==="mapeo"?"comparacion":(e==="casos"?"diccmed":(ENTITY_META[e]?.section||"diccmed")); }

function entityFromBody() {
  return document.body.dataset.entity || "sus";
}

function modeFromUrl() {
  return new URLSearchParams(location.search).get("mode") || "nuevo";
}

function buildGlobalNav() {
  const host=document.getElementById("global-nav");
  if(!host) return;
  const entity=entityFromBody();
  const mode=modeFromUrl();
  const sec=sectionOf(entity);
  const navKeys=Object.keys(ENTITY_META).filter(k=>k!=="mapeo" && (sec==="tmf")===(ENTITY_META[k].section==="tmf"));
  const groups=["principales","casos","auxiliares","otros"];
  const groupTitle=g=>{
    if(sec==="diccmed" || sec==="comparacion") return g==="casos"?"Casos de uso":"Principal";
    return g==="principales"?"Principales":g==="auxiliares"?"Auxiliares":"Otros";
  };
  const activeGroup=ENTITY_META[entity]?.group || "principales";
  host.innerHTML=`<div class="main-nav">
    <div class="nav-header">
      <div><div class="nav-title">Modelo de datos farmacéutico</div><div class="nav-subtitle">Navegación por entidad y modo de trabajo</div></div>
      <div class="nav-mode"><button data-mode="nuevo">Nuevo</button><button data-mode="edicion">Edición</button></div>
    </div>
    <div class="entity-nav entity-nav-accordion">
      ${groups.map(g=>{
        const keys=navKeys.filter(k=>(ENTITY_META[k].group||"otros")===g);
        if(!keys.length) return "";
        const open=g===activeGroup;
        return `<div class="nav-group ${open?"open":""}" data-group="${g}">
          <button class="nav-group-toggle" data-group-toggle="${g}" aria-expanded="${open}">${groupTitle(g)} <span>▾</span></button>
          <div class="nav-group-items">${keys.map(k=>`<button data-entity="${k}" class="${g==="auxiliares"?"aux ":g==="otros"?"other ":""}${k===entity?"active":""}">${ENTITY_META[k].navLabel || ENTITY_META[k].label}</button>`).join("")}</div>
        </div>`;
      }).join("")}
    </div>
    <div class="nav-content">
      <div class="entity-description"><span class="entity-badge">${ENTITY_META[entity]?.label || entity}</span><span>${ENTITY_META[entity]?.description || ""}</span>${ENTITY_META[entity]?.sinDiccmed?`<span class="entity-badge warn">Sin equivalente en DICCMED</span>`:""}</div>
      <div class="quick-nav"><button data-section="tmf">TMF</button><button data-section="diccmed">DICCMED</button><button data-section="comparacion">Comparación TMF ↔ DICCMED</button></div>
    </div>
  </div>`;
  host.querySelectorAll("[data-entity]").forEach(btn=>btn.addEventListener("click",()=>{
    const meta=ENTITY_META[btn.dataset.entity];
    if(meta) location.href=((location.pathname.includes("/html/")?"":"html/")+meta.href)+"?mode="+mode;
  }));
  host.querySelectorAll("[data-group-toggle]").forEach(btn=>btn.addEventListener("click",()=>{
    const target=btn.dataset.groupToggle;
    host.querySelectorAll(".nav-group").forEach(g=>{
      const open=g.dataset.group===target && !g.classList.contains("open");
      g.classList.toggle("open",open);
      const b=g.querySelector("[data-group-toggle]");
      if(b) b.setAttribute("aria-expanded",String(open));
    });
    setTimeout(()=>document.documentElement.style.setProperty("--nav-h",host.offsetHeight+"px"),0);
  }));
  host.querySelectorAll("[data-mode]").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.mode===mode);
    btn.addEventListener("click",()=>{const u=new URL(location.href);u.searchParams.set("mode",btn.dataset.mode);location.href=u.toString();});
  });
  const base=location.pathname.includes("/html/")?"":"html/";
  const SEC_HREF={tmf:"tmf_componente.html",diccmed:"nuevo_sustancia.html",comparacion:"mapeo.html"};
  host.querySelectorAll("[data-section]").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.section===sec);
    btn.addEventListener("click",()=>{location.href=base+SEC_HREF[btn.dataset.section]+"?mode="+mode;});
  });
  document.body.dataset.mode=mode;
  const setH=()=>document.documentElement.style.setProperty("--nav-h",host.offsetHeight+"px");
  setH();window.addEventListener("resize",setH);
}

function badge(v,g,r,c){
  return `<span class="b tg ${v==="Si"?"si":"no"}" data-g="${g}" data-r="${r}" data-c="${c}">${v==="Si"?"Sí":"No"}</span>`;
}
function editCell(txt,g,r,c,cls=""){
  return `<td class="${cls}" contenteditable="true" spellcheck="false" data-g="${g}" data-r="${r}" data-c="${c}">${txt}</td>`;
}

// ================================================================
// DICCMED -> TMF: definición única de "cómo se representa".
// Se muestra en el resumen lateral para evitar duplicar la
// comparación en otra sección del formulario.
// ================================================================
const TMF_FIELD_MAP = {
  sus: {
    "Término Preferido (P)": "TMF · Componente → Nombre. Es el dato de descripción de la Sustancia que TMF necesita.",
    "Sinónimo": "Sin impacto directo en TMF.", "Riesgo teratogénico": "Sin impacto directo en TMF; permanece en DICCMED.",
    "Revisado": "Sin impacto directo en TMF.", "Consultar": "Sin impacto directo en TMF.", "Estado": "Sin impacto directo en TMF.", "Comercializado": "Sin impacto directo en TMF.", "Observación": "Sin impacto directo en TMF.",
    "Terminología (mapeo)": "Sin impacto directo en TMF para la relación Sustancia → Componente.", "Etiqueta": "Sin impacto directo en TMF."
  },
  vtm: {
    "Término Preferido (P)": "Sin impacto directo en TMF.", "Distintivo": "Sin impacto directo en TMF.", "Especial (comodín)": "Sin impacto directo en TMF.", "Sinónimo": "Sin impacto directo en TMF.",
    "Especial (comodín) – select": "Sin impacto directo en TMF.", "Separador de sustancias": "Sin impacto directo en TMF.", "Sustancias": "Sin impacto directo en TMF; el VTM no se representa como entidad TMF.",
    "Revisado": "Sin impacto directo en TMF.", "Consultar": "Sin impacto directo en TMF.", "Estado": "Sin impacto directo en TMF.", "Comercializado": "Sin impacto directo en TMF.", "Observación": "Sin impacto directo en TMF.", "Terminología (mapeo)": "Sin impacto directo en TMF.", "Etiqueta": "Sin impacto directo en TMF."
  },
  vmp: {
    "Término Preferido (P)": "TMF · Medicamento → Denominación. Es el nombre del medicamento que se representa en TMF.",
    "Distintivo": "Participa en la construcción del nombre cuando corresponde; no es un campo TMF independiente.", "Cómo se arma el preferido": "Regla de generación del nombre DICCMED; no es un campo TMF independiente.", "Sinónimo": "Sin impacto directo en TMF.",
    "VTM": "No se representa como entidad TMF independiente; queda como referencia de origen del VMP.", "FFA / Forma farmacéutica": "TMF · Medicamento → Forma farmacéutica.", "Unidad asistencial": "TMF · Medicamento → Unidad asistencial.",
    "Cantidad": "Se utiliza en la representación de la composición/presentación cuando corresponda; no se replica como campo TMF independiente si la maqueta lo resuelve dentro de la composición.", "Volumen total (cant. / unidad)": "TMF · Medicamento / Composición → volumen/cantidad, según sea Autocontenido o Continuo.",
    "Especial (comodín)": "Sin impacto directo en TMF.", "Condición de expendio": "Sin impacto directo en la maqueta mínima TMF definida hasta ahora.", "Estado de prescripción": "Sin impacto directo en la maqueta mínima TMF definida hasta ahora.", "Tipo de producto ANMAT": "Sin impacto directo en la maqueta mínima TMF definida hasta ahora.",
    "Vías de administración": "TMF · Medicamento → Vía de administración.", "Unidad de prescripción": "Sin impacto directo en la representación mínima TMF definida hasta ahora.", "Unidad de despacho": "Sin impacto directo en la representación mínima TMF definida hasta ahora.", "Factores de conversión propios": "Sin impacto directo en TMF.",
    "Método de dosis": "Sin impacto directo en la maqueta TMF mínima definida hasta ahora.", "Redondeo": "Sin impacto directo en TMF.", "Confiabilidad": "Sin impacto directo en TMF.", "Techos": "Sin impacto directo en TMF.", "Fuente": "Sin impacto directo en TMF.", "Observación (dosificación)": "Sin impacto directo en TMF.", "Pautas de la ficha": "Sin impacto directo en TMF.",
    "Sustancias (potencias)": "TMF · Medicamento → Composición. Autocontenido: denominador; Continuo: numerador + denominador.",
    "Revisado": "Sin impacto directo en TMF.", "Consultar": "Sin impacto directo en TMF.", "Estado": "Sin impacto directo en TMF.", "Comercializado": "Se resuelve en la presentación comercial/AMPP; no es un campo TMF independiente aquí.", "Observación": "Sin impacto directo en TMF.",
    "Terminología (mapeo)": "Mapeos → NNE + código → TMF · Medicamento / Genérico, según el catálogo de fármaco genérico.", "Etiqueta SAF": "Etiquetas SAF → atributo SAF de TMF · Medicamento."
  },
  vmpp: {
    "Término Preferido (P)": "Nombre de la presentación DICCMED; no se replica como campo TMF independiente.", "Distintivo": "Sin campo TMF independiente; participa en el nombre si corresponde.", "Sinónimo": "Sin impacto directo en TMF.",
    "VMP": "TMF · Genérico con envase → referencia al Medicamento genérico del que proviene el envase.", "Cantidad": "TMF · Genérico con envase → cantidad del empaque del fármaco comercial.", "Tipo VMPP": "Determina el tipo de presentación; no se replica como campo TMF independiente si la maqueta no lo requiere.",
    "Unidad de medida": "TMF · Envase / Genérico con envase → unidad de medida del envase del fármaco genérico.", "Pack multi (cant. / unidad)": "Sin impacto directo en la representación mínima TMF definida hasta ahora.", "Volumen total (cant. / unidad)": "TMF · Genérico con envase → volumen total: cantidad del envase del fármaco genérico.", "Unidad volumen": "TMF · Genérico con envase → unidad de volumen del envase del fármaco genérico.", "Dosis (cantidad / unidad)": "Sin impacto directo en la representación mínima TMF definida hasta ahora.",
    "Revisado": "Sin impacto directo en TMF.", "Consultar": "Sin impacto directo en TMF.", "Estado": "Sin impacto directo en TMF.", "Comercializado": "Se resuelve en AMPP; no es un campo TMF independiente del genérico con envase.", "Observación": "Sin impacto directo en TMF.", "Terminología (mapeo)": "Mapeos → NNE + código → catálogo de fármaco genérico / TMF · Genérico con envase.", "Etiqueta": "Sin impacto directo en TMF."
  },
  tf: {
    "Término Preferido (P)": "Trade Family no aplica directamente a TMF.", "Sinónimo": "Trade Family no aplica directamente a TMF.", "Revisado": "Trade Family no aplica directamente a TMF.", "Consultar": "Trade Family no aplica directamente a TMF.", "Estado": "Trade Family no aplica directamente a TMF.", "Comercializado": "Trade Family no aplica directamente a TMF.", "Observación": "Trade Family no aplica directamente a TMF.", "Terminología (mapeo)": "Trade Family no aplica directamente a TMF.", "Etiqueta": "Trade Family no aplica directamente a TMF."
  },
  amp: {
    "Término Preferido (P)": "AMP no se representa directamente como entidad TMF.", "Distintivo": "AMP no se representa directamente como entidad TMF.", "Sinónimo": "AMP no se representa directamente como entidad TMF.", "Trade Family (TF)": "AMP no se representa directamente; el vínculo pertenece al modelo DICCMED.", "VMP": "AMP no se representa directamente; identifica el medicamento de origen.",
    "Laboratorio": "TMF · Producto Comercial → Laboratorio. El laboratorio del AMP es el origen del laboratorio del producto comercial.", "FFE": "AMP no se representa directamente como entidad TMF.", "VCD": "AMP no se representa directamente como entidad TMF.", "Cualidad": "AMP no se representa directamente como entidad TMF.", "Especial": "AMP no se representa directamente como entidad TMF.", "Refrigerado": "AMP no se representa directamente como entidad TMF.",
    "Dispositivo": "Sin impacto directo en la representación TMF mínima definida hasta ahora.", "Capacidad": "Sin impacto directo en TMF.", "Unidad": "Sin impacto directo en TMF.", "Graduación": "Sin impacto directo en TMF.", "Unidad escala": "Sin impacto directo en TMF.", "Confiabilidad graduación": "Sin impacto directo en TMF.", "Fuente": "Sin impacto directo en TMF.",
    "Revisado": "AMP no se representa directamente como entidad TMF.", "Consultar": "AMP no se representa directamente como entidad TMF.", "Estado": "AMP no se representa directamente como entidad TMF.", "Comercializado": "AMP no se representa directamente como entidad TMF.", "Observación": "AMP no se representa directamente como entidad TMF.", "Terminología": "AMP no se representa directamente como entidad TMF.", "Etiqueta": "AMP no se representa directamente como entidad TMF."
  },
  ampp: {
    "Término Preferido (P)": "TMF · Producto Comercial → Denominación, cuando el nombre comercial forme parte de la representación.", "Distintivo": "Puede participar en la denominación; no es un campo TMF independiente.", "Sinónimo": "Sin impacto directo en TMF.",
    "AMP": "TMF · Producto Comercial → origen comercial; el AMP aporta el laboratorio del producto comercial.", "VMPP": "TMF · Producto Comercial → Fármaco genérico con envase. Relación AMPP.COMPONENTES.VMPP.",
    "Pack envase cant.": "Se utiliza para completar la presentación comercial cuando corresponda; no es un campo TMF independiente en la maqueta mínima definida.", "Unidad pack envase": "Se utiliza para completar la presentación comercial cuando corresponda; no es un campo TMF independiente en la maqueta mínima definida.", "Código fabricante": "Sin impacto directo en la maqueta TMF mínima definida hasta ahora.",
    "GTIN adicional": "TMF · Producto Comercial → GTIN, cuando corresponda como GTIN adicional.", "Id presentación Kairos": "Sin impacto directo en TMF.", "Id producto Kairos": "Sin impacto directo en TMF.",
    "Revisado": "Sin impacto directo en TMF.", "Consultar": "Sin impacto directo en TMF.", "Estado": "TMF · Producto Comercial → Estado, si se utiliza en la maqueta.", "Comercializado": "TMF · Producto Comercial → comercialización/estado, según la maqueta.", "Observación": "Sin impacto directo en TMF.", "Terminología (mapeo)": "Mapeo del producto comercial; no es el vínculo principal definido para completar TMF.", "Etiqueta": "Sin impacto directo en TMF."
  }
};

function tmfFieldMapping(entity, field){
  return TMF_FIELD_MAP[entity]?.[field] || "Sin impacto directo en TMF / relación todavía no definida.";
}

function tmfFormaExamples(){
  const examples = [
    {forma:"Aerosol para inhalación", ejemplo:"salbutamol 100 mcg/dosis aerosol para inhalación", via:"inhalatoria", envase:"1 envase · 250 dosis", compos:"Salbutamol · 100 mcg/dosis", tmf:"Medicamento → aerosol para inhalación · composición con denominador por dosis"},
    {forma:"Crema cutánea", ejemplo:"cannabidiol crema cutánea", via:"tópica", envase:"1 envase · 50 mililitros", compos:"Según composición del VMP", tmf:"Medicamento → crema cutánea · composición según sustancia/potencia"},
    {forma:"Jarabe oral", ejemplo:"ácido valproico 250 mg/5 mL jarabe oral", via:"oral", envase:"1 frasco · 120 mililitros", compos:"Ácido valproico · 250 mg/5 mL", tmf:"Medicamento → jarabe oral · continuo: numerador + denominador"},
    {forma:"Solución oral", ejemplo:"lamivudina 50 mg/5 mL solución oral", via:"oral", envase:"1 frasco · 240 mililitros", compos:"Lamivudina · 50 mg/5 mL", tmf:"Medicamento → solución oral · continuo: numerador + denominador"},
    {forma:"Solución inyectable", ejemplo:"fluorocolina (18F) 16502 MBq/20 mL solución inyectable", via:"intravenosa", envase:"1 frasco-ampolla · 20 mililitros", compos:"Fluorocolina (18F) · 16502 MBq/20 mL", tmf:"Medicamento → solución inyectable · continuo: numerador + denominador"},
    {forma:"Ungüento cutáneo", ejemplo:"fluorouracilo 5% (50 mg/g) ungüento cutáneo", via:"tópica", envase:"1 envase · 20 gramos", compos:"Fluorouracilo · 5 g/100 g", tmf:"Medicamento → ungüento cutáneo · continuo por masa"},
    {forma:"Polvo liofilizado para solución inyectable", ejemplo:"paclitaxel 100 mg polvo liofilizado para solución inyectable", via:"intravenosa", envase:"1 ampolla", compos:"Paclitaxel · 100 mg", tmf:"Medicamento → polvo liofilizado para solución inyectable · autocontenido"},
    {forma:"Cápsula oral", ejemplo:"gabapentina 300 mg cápsula oral", via:"oral", envase:"100 cápsulas", compos:"Gabapentina · 300 mg", tmf:"Medicamento → cápsula oral · autocontenido: denominador"},
    {forma:"Comprimido oral", ejemplo:"polivitamínico + minerales comprimido recubierto oral", via:"oral", envase:"30 comprimidos", compos:"Según composición del VMP", tmf:"Medicamento → comprimido oral · autocontenido"},
    {forma:"Suspensión oral", ejemplo:"ibuprofeno 100 mg/5 mL suspensión oral", via:"oral", envase:"1 frasco · 100 mililitros", compos:"Ibuprofeno · 100 mg/5 mL", tmf:"Medicamento → suspensión oral · continuo: numerador + denominador"},
    {forma:"Solución oftálmica", ejemplo:"ketorolac 5 mg/mL solución oftálmica", via:"oftálmica", envase:"1 frasco · 5 mililitros", compos:"Ketorolac · 5 mg/1 mL", tmf:"Medicamento → solución oftálmica · continuo: numerador + denominador"},
    {forma:"Gel cutáneo", ejemplo:"adapaleno 0,1% + peróxido de benzoílo 2,5% gel cutáneo", via:"tópica", envase:"1 envase · 30 gramos", compos:"Adapaleno + peróxido de benzoílo", tmf:"Medicamento → gel cutáneo · composición múltiple, continuo"},
    {forma:"Spray nasal", ejemplo:"fluticasona 27,5 mcg spray nasal", via:"nasal", envase:"1 envase · 120 dosis", compos:"Fluticasona · 27,5 mcg/dosis", tmf:"Medicamento → spray nasal · continuo por dosis"},
    {forma:"Óvulo vaginal", ejemplo:"clindamicina 100 mg + ketoconazol 400 mg óvulo vaginal", via:"vaginal", envase:"7 óvulos", compos:"Clindamicina 100 mg + ketoconazol 400 mg", tmf:"Medicamento → óvulo vaginal · composición múltiple, autocontenido"},
    {forma:"Solución para infusión intravenosa", ejemplo:"agua para inyectables solución para infusión intravenosa", via:"intravenosa", envase:"1 sachet · 500 mililitros", compos:"Agua para inyectables", tmf:"Medicamento → solución para infusión intravenosa · continuo por volumen"}
  ];
  window.__DICCMED_CASES__ = examples;
  return `<section class="forma-examples"><div class="forma-examples-head"><div><h4>Ejemplos representativos de forma farmacéutica</h4><p>Ejemplos tomados del listado cargado para mostrar cómo el dato DICCMED termina representándose en TMF.</p></div><span class="forma-count">${examples.length} ejemplos</span></div>
    <div class="forma-examples-grid">${examples.map((x,i)=>`<article class="forma-example" data-forma-example="${i}"><div class="forma-example-title"><strong>${x.forma}</strong><span>${x.via}</span></div><div class="forma-line"><b>DICCMED · VMP</b><span>${x.ejemplo}</span></div><div class="forma-line"><b>Envase</b><span>${x.envase}</span></div><div class="forma-line"><b>Composición</b><span>${x.compos}</span></div><div class="forma-tmf"><b>TMF</b><span>${x.tmf}</span></div><a class="forma-example-action" href="casos_uso.html?mode=nuevo&caso=${i}">Ver caso completo DICCMED → TMF</a></article>`).join('')}</div>
    <div id="forma-example-modal-root"></div></section>`;
}

function openDICCMEDCase(index){
  const examples=window.__DICCMED_CASES__||[];
  const x=examples[Number(index)];
  if(x) renderFullCaseModal(x);
}


function renderFormaExampleModal(x){
  const root=document.getElementById('forma-example-modal-root'); if(!root) return;
  const continuous=/\//.test(x.compos)||/continuo/i.test(x.tmf);
  const fields=[
    ['Término preferido',x.ejemplo],['Forma farmacéutica',x.forma],['Vía',x.via],['Unidad asistencial',/dosis/i.test(x.compos)||/dosis/i.test(x.ejemplo)?'dosis':/mL|mililitro/i.test(x.compos)||/mililitro/i.test(x.envase)?'mL':/mg|gramo/i.test(x.compos)||/gramo/i.test(x.envase)?'mg':'unidad'],
    ['Composición',x.compos],['Tipo de composición',continuous?'Continuo · numerador + denominador':'Autocontenido · denominador'],['Envase',x.envase],['Cantidad / volumen','Según presentación del ejemplo']
  ];
  const tmfFields=[
    ['Medicamento',x.ejemplo],['Forma farmacéutica',x.forma],['Vía',x.via],['Unidad asistencial',/dosis/i.test(x.compos)||/dosis/i.test(x.ejemplo)?'dosis':/mL|mililitro/i.test(x.compos)||/mililitro/i.test(x.envase)?'mL':/mg|gramo/i.test(x.compos)||/gramo/i.test(x.envase)?'mg':'unidad'],
    ['Composición',continuous?'Numerador + denominador':'Denominador'],['Tipo',continuous?'Continuo':'Autocontenido'],['Presentación / envase',x.envase]
  ];
  root.innerHTML=`<div class="example-modal-backdrop" data-close-example><div class="example-modal" role="dialog" aria-modal="true" aria-label="Ejemplo ${x.forma}">
    <div class="example-modal-head"><div><h3>${x.forma}</h3><p>Ejemplo completo de carga y representación DICCMED → TMF</p></div><button class="example-modal-close" data-close-example aria-label="Cerrar">×</button></div>
    <div class="example-modal-body"><div class="example-columns">
      <section class="example-panel"><div class="example-panel-head">DICCMED · VMP</div><div class="example-panel-body">${fields.map(f=>`<div class="example-field"><label>${f[0]}</label><div class="example-value">${f[1]}</div></div>`).join('')}</div></section>
      <section class="example-panel"><div class="example-panel-head">TMF · Medicamento</div><div class="example-panel-body">${tmfFields.map(f=>`<div class="example-field"><label>${f[0]}</label><div class="example-value">${f[1]}</div></div>`).join('')}</div></section>
    </div><div class="example-flow"><strong>Cómo se representa</strong><span>DICCMED VMP → ${x.forma} → TMF Medicamento → ${continuous?'Composición continua: numerador + denominador':'Composición autocontenida: denominador'}.</span></div>
    <div class="full-case-cta"><div><strong>¿Querés ver el caso completo?</strong><p>Desde Sustancia, VTM, VMP, VMPP, Trade Family, AMP y AMPP hasta Farmaco Sustancia, Fármaco Genérico, su Composición y Fármaco Comercial en TMF.</p></div><button type="button" class="btn btn-pri" data-open-full-case>Ver carga completa DICCMED → TMF</button></div></div>
  </div></div>`;
  root.querySelector('[data-close-example]').addEventListener('click',e=>{if(e.target===e.currentTarget || e.target.closest('[data-close-example-btn]')) root.innerHTML='';});
  root.querySelector('[data-open-full-case]')?.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();renderFullCaseModal(x);});
}

function buildFullCaseData(x){
  const continuous=/\//.test(x.compos)||/continuo/i.test(x.tmf);
  const unit=/dosis/i.test(x.compos)||/dosis/i.test(x.ejemplo)?'dosis':/mL|mililitro/i.test(x.compos)||/mililitro/i.test(x.envase)?'mL':/mg|gramo/i.test(x.compos)||/gramo/i.test(x.envase)?'mg':'unidad';
  const num = continuous ? (x.compos.match(/^[^·]+·\s*([^/]+)\//)?.[1]?.trim() || '100 mg') : '—';
  const den = continuous ? (x.compos.match(/\/\s*(.+)$/)?.[1]?.trim() || (unit==='dosis'?'1 dosis':unit==='mL'?'5 mL':'1 unidad')) : (x.compos.split(' · ')[1]?.trim() || '300 mg');
  const genericId='1000'+(x.forma.length%90);
  const vmppId='VMPP-'+(2000+(x.forma.length%90));
  const envaseValue=x.envase || '1 envase';
  const envaseCantidad=(x.envase.match(/^[^·]+/)?.[0]||'1').trim();
  const envaseUnit=/dosis/i.test(x.envase)?'dosis':/mililitro|mL/i.test(x.envase)?'mL':/gramo|gramos/i.test(x.envase)?'g':'unidad';
  const diccmedUsed = {
    sus: new Set(['Término Preferido (P)']),
    vtm: new Set([]),
    vmp: new Set(['Término Preferido (P)','FFA / Forma farmacéutica','Unidad asistencial','Cantidad','Volumen total (cant. / unidad)','Vías de administración','Unidad de prescripción','Sustancias (potencias)','Terminología (mapeo)','Etiqueta SAF']),
    vmpp: new Set(['VMP','Cantidad','Unidad de medida','Volumen total (cant. / unidad)','Unidad volumen','Cantidad envase','Terminología (mapeo)']),
    tf: new Set([]),
    amp: new Set(['Laboratorio']),
    ampp: new Set(['VMPP','AMP','GTIN adicional'])
  };
  const valueForField = (entity, field) => {
    const substance = x.compos.split(' · ')[0] || x.ejemplo.split(' ')[0];
    const genericName = x.ejemplo;
    const volumeMatch = x.envase.match(/(?:·|\s)\s*(\d+(?:[.,]\d+)?)\s*(dosis|mililitros|mL|gramos|g|cápsulas|comprimidos|óvulos|ampollas|unidades?)/i);
    const packQty = (x.envase.match(/^(\d+(?:[.,]\d+)?)/)?.[1] || '1');
    const packUnit = /dosis/i.test(x.envase)?'dosis':/mililitros|mL/i.test(x.envase)?'mL':/gramos|\bg\b/i.test(x.envase)?'g':/cápsulas/i.test(x.envase)?'cápsula':/comprimidos/i.test(x.envase)?'comprimido':/óvulos/i.test(x.envase)?'óvulo':'unidad';
    const volumeValue = volumeMatch ? volumeMatch[1] : packQty;
    const volumeUnit = volumeMatch ? volumeMatch[2].replace('mililitros','mL').replace('gramos','g') : packUnit;
    const base = {
      'Término Preferido (P)': genericName, 'Distintivo':'—', 'Cómo se arma el preferido':'Auto-generado', 'Sinónimo':'—',
      'Riesgo teratogénico':'No informado', 'Revisado':'No', 'Consultar':'No', 'Estado':'Activo', 'Comercializado':'Sí', 'Observación':'—',
      'Terminología (mapeo)': `NNE · código ${genericId}`, 'Etiqueta':'Etiqueta vigente', 'Etiqueta SAF':'SAF · según producto',
      'Especial (comodín)':'No', 'Especial (comodín) – select':'No', 'Separador de sustancias':'—', 'Sustancias':substance,
      'VTM': substance, 'FFA / Forma farmacéutica':x.forma, 'Unidad asistencial':unit, 'Cantidad':packQty, 'Volumen total (cant. / unidad)':volumeValue,
      'Condición de expendio':'Venta bajo receta', 'Estado de prescripción':'Prescripción', 'Tipo de producto ANMAT':'Medicamento',
      'Vías de administración':x.via, 'Unidad de prescripción':unit, 'Unidad de despacho':unit, 'Factores de conversión propios':'—',
      'Método de dosis':'Dosis fija', 'Redondeo':'Unidad entera', 'Confiabilidad':'Convención', 'Techos':'Sin máximos', 'Fuente':'Carga de caso de uso', 'Observación (dosificación)':'—', 'Pautas de la ficha':'—',
      'Sustancias (potencias)':x.compos, 'VMP':genericName, 'Tipo VMPP':'Presentación estándar', 'Unidad de medida':packUnit, 'Pack multi (cant. / unidad)':'—', 'Unidad volumen':volumeUnit, 'Dosis (cantidad / unidad)':'—',
      'Término preferido':'', 'Trade Family (TF)':'Familia comercial de '+substance, 'Laboratorio':'Laboratorio Demo Pharma', 'FFE':x.forma, 'VCD':'—', 'Cualidad':'—', 'Especial':'No', 'Refrigerado':'No',
      'Dispositivo':'—', 'Capacidad':'—', 'Unidad':'—', 'Graduación':'—', 'Unidad escala':'—', 'Confiabilidad graduación':'—',
      'Terminología':'NNE · código '+genericId, 'GTIN adicional':'0777000000000', 'Id presentación Kairos':'KAI-001', 'Id producto Kairos':'KAI-P-001',
      'Pack envase cant.':packQty, 'Cantidad envase':packQty, 'Unidad pack envase':packUnit, 'Código fabricante':'FAB-001', 'AMP':'Producto comercial + laboratorio', 'VMPP':vmppId,
      'Comercializado':'Sí'
    };
    if(entity==='sus' && field==='Término Preferido (P)') return substance;
    if(entity==='vtm' && field==='Sustancias') return substance;
    if(entity==='vtm' && field==='Término Preferido (P)') return substance;
    if(entity==='tf' && field==='Término Preferido (P)') return 'Familia comercial de '+substance;
    if(entity==='amp' && field==='Término Preferido (P)') return 'Marca '+substance;
    if(entity==='ampp' && field==='Término Preferido (P)') return 'Marca '+substance+' '+envaseValue;
    if(field==='Terminología (mapeo)') return `NNE · código ${genericId}`;
    return base[field] ?? '—';
  };
  const allFieldsFor = (entity) => {
    const cfg = PAGE_CONFIG[entity];
    const seen = new Set(), out=[];
    (cfg?.rows || []).forEach(group => group.forEach(row => {
      const field = row[0];
      if(field && !seen.has(field)) { seen.add(field); out.push([field, valueForField(entity, field), diccmedUsed[entity]?.has(field) || false]); }
    }));
    return out;
  };
  const caseData={
    sus:{title:'Sustancia',subtitle:'Formulario DICCMED completo · antecedente de Fármaco Sustancia',fields:allFieldsFor('sus')},
    vtm:{title:'VTM',subtitle:'Formulario DICCMED completo · no tiene representación directa en TMF',fields:allFieldsFor('vtm')},
    vmp:{title:'VMP · Genérico',subtitle:'Formulario DICCMED completo · principal fuente del Fármaco Genérico',fields:allFieldsFor('vmp')},
    vmpp:{title:'VMPP · Genérico con envase',subtitle:'Formulario DICCMED completo · presentación/envase del genérico',fields:allFieldsFor('vmpp')},
    tf:{title:'Trade Family',subtitle:'Formulario DICCMED completo · antecedente comercial sin aplicación directa en TMF',fields:allFieldsFor('tf')},
    amp:{title:'AMP · Producto comercial',subtitle:'Formulario DICCMED completo · aporta principalmente laboratorio al comercial',fields:allFieldsFor('amp')},
    ampp:{title:'AMPP · Presentación comercial',subtitle:'Formulario DICCMED completo · vincula VMPP + AMP y aporta el GTIN',fields:allFieldsFor('ampp')}
  };
  const order=['sus','vtm','vmp','vmpp','tf','amp','ampp'];
  const card=k=>{const d=caseData[k];return `<section class="full-case-card"><div class="full-case-card-head"><div><span class="full-case-step">${order.indexOf(k)+1}</span><div><h4>${d.title}</h4><p>${d.subtitle}</p></div></div></div><div class="full-case-fields">${d.fields.map(f=>`<div class="full-case-field ${f[2]?'is-tmf-used':''}"><label>${f[0]}${f[2]?'<span class="tmf-use-badge">SE USA EN TMF</span>':''}</label><div>${f[1]}</div></div>`).join('')}</div></section>`};
  const compositionRows=continuous
    ? `<div class="tmf-composition-box"><div class="tmf-composition-title">Composición · Continuo</div><div class="tmf-composition-row"><span>Numerador</span><strong>${num}</strong></div><div class="tmf-composition-row"><span>Denominador</span><strong>${den}</strong></div></div>`
    : `<div class="tmf-composition-box"><div class="tmf-composition-title">Composición · Autocontenido</div><div class="tmf-composition-row"><span>Numerador</span><strong>—</strong></div><div class="tmf-composition-row"><span>Denominador</span><strong>${den}</strong></div></div>`;
  const tmf=[
    {title:'Fármaco Sustancia',desc:'Se representa desde DICCMED Sustancia.',fields:[['ID / vínculo','ID Sustancia ↔ código TMF'],['Nombre',x.compos.split(' · ')[0]||'Sustancia'],['Riesgo teratogénico','— · no se representa']]},
    {title:'Fármaco Genérico',desc:'Se construye principalmente desde VMP + VMPP.',fields:[['ID_FARMACO_GENERICO',genericId],['ID_VIA_ADMINISTRACION',x.via],['ID_FORMA_FARMACEUTICA',x.forma],['TRAZABLE','Sí'],['FACTURABLE','Sí'],['REFRIGERABLE','No'],['FECHA_ULTIMA_MODIFICACION','—'],['FECHA_BAJA','—'],['ESTADO','Activo'],['FECHA_ALTA','Hoy'],['CANTIDAD',envaseCantidad],['ID_UNIDAD_MEDIDA',unit],['ID_FARMACO_ENVASE','Envase '+envaseValue],['TIPO_PRODUCTO','Medicamento'],['SAF','SAF · según producto'],['ID_UNIDAD_ASISTENCIAL',unit]]},
    {title:'Fármaco Genérico · Composición',desc:'Cada componente se muestra con numerador y denominador para hacer visible la diferencia entre Continuo y Autocontenido.',fields:[['ID_FARMACO_GENERICO',genericId],['Componente',x.compos.split(' · ')[0]||'Sustancia'],['Tipo',continuous?'Continuo':'Autocontenido']]},
    {title:'Envase',desc:'En TMF la representación de envase queda reducida a los tres valores definidos.',fields:[['Envase',envaseValue],['Volumen',envaseValue],['Unidad de volumen',envaseUnit]]},
    {title:'Fármaco Comercial',desc:'Se completa a partir de AMPP, usando VMPP + AMP.',fields:[['ID_FARMACO_COMERCIAL','FC-'+genericId],['DESCRIPCION','Marca '+x.compos.split(' · ')[0]],['ID_LABORATORIO','LAB-001'],['EMPAQUE',envaseValue],['GTIN','0777000000000'],['REFRIGERABLE','No'],['ID_FARMACO_GENERICO',genericId],['FECHA_ALTA','Hoy'],['FECHA_ULTIMA_MODIFICACION','—'],['FECHA_BAJA','—'],['ESTADO','Activo'],['PRECIO','—'],['FECHA_ULTIMA_MODIFICACION_PRECIO','—'],['ID_SNOMED','—'],['ID_ALFABETA','—'],['ID_KAIROS','—']]}
  ];
  const pair=(leftKeys,rightIndex,note='')=>`<div class="mapping-pair"><div class="mapping-side mapping-diccmed"><div class="mapping-side-title"><span>DICCMED</span><small>Campo · valor</small></div>${leftKeys.map(k=>card(k)).join('')}${note?`<div class="mapping-note">${note}</div>`:''}</div><div class="mapping-connector" aria-hidden="true">→</div><div class="mapping-side mapping-tmf"><div class="mapping-side-title"><span>TMF</span><small>Campo del diccionario · valor</small></div>${(()=>{const d=tmf[rightIndex];return `<section class="tmf-result-card"><h4>${d.title}</h4><p>${d.desc}</p>${d.fields.map(f=>`<div class="tmf-result-field"><label>${f[0]}</label><strong>${f[1]}</strong></div>`).join('')}${d.title==='Fármaco Genérico · Composición'?compositionRows:''}</section>`;})()}</div></div>`;
  return {continuous, html:`<div class="full-case-view">
    <div class="full-case-view-head"><div><div class="case-kicker">CASO END-TO-END</div><h2>${x.forma}</h2><p>Una carga completa de AMPP, reconstruyendo todos sus antecedentes DICCMED y mostrando al lado cómo se representa en TMF.</p></div><a class="btn btn-sec" href="casos_uso.html?mode=nuevo">← Volver a casos de uso</a></div>
    <div class="full-case-intro"><strong>Cómo leerlo:</strong> cada bloque relaciona lo que se carga en DICCMED con los campos concretos de TMF. <b>Los campos marcados en rojo son los datos de DICCMED que efectivamente se utilizan para construir o completar TMF.</b> El resto se muestra para que el caso quede completo, pero no alimenta directamente el resultado TMF.</div>
    <div class="full-case-legend"><span class="legend-red"></span><strong>Se usa en TMF</strong><span>El campo DICCMED marcado en rojo es tomado, transformado o utilizado como antecedente para el resultado TMF.</span></div>
    <div class="full-case-section"><div class="full-case-section-title"><span>1</span> DICCMED ↔ TMF: correspondencia completa</div>
      <div class="mapping-header"><div>DICCMED · antecedentes cargados</div><div></div><div>TMF · campos resultantes</div></div>
      <div class="mapping-stack">
        ${pair(['sus','vtm'],0,'Sustancia se representa en Fármaco Sustancia. VTM no se representa directamente; queda como antecedente del VMP.')}
        ${pair(['vmp','vmpp'],1,'VMP aporta los datos farmacológicos del genérico. VMPP aporta la presentación y los datos de envase; Cantidad envase es el dato que luego alimenta el empaque comercial.')}
        <div class="mapping-pair"><div class="mapping-side mapping-diccmed"><div class="mapping-side-title"><span>DICCMED</span></div>${card('vmp')}</div><div class="mapping-connector">→</div><div class="mapping-side mapping-tmf"><div class="mapping-side-title"><span>TMF</span></div><section class="tmf-result-card"><h4>Fármaco Genérico · Composición</h4><p>La composición queda explícita como filas de numerador y denominador.</p><div class="tmf-result-field"><label>Tipo de composición</label><strong>${continuous?'Continuo':'Autocontenido'}</strong></div>${compositionRows}</section></div></div>
        ${pair(['tf','amp'],4,'Trade Family no aplica directamente. AMP aporta principalmente laboratorio y antecedentes comerciales al AMPP / Fármaco Comercial.')}
        ${pair(['ampp'],4,'AMPP vincula VMPP + AMP. El campo Empaque del comercial se completa desde la presentación/cantidad de envase.')}
      </div>
    </div>
  </div>`};
}

function renderFullCaseModal(x){
  const root=document.getElementById('forma-example-modal-root'); if(!root) return;
  const built=buildFullCaseData(x);
  root.innerHTML=`<div class="example-modal-backdrop" data-full-close><div class="full-case-modal" role="dialog" aria-modal="true" aria-label="Caso completo DICCMED TMF">${built.html}</div></div>`;
  root.querySelector('[data-full-close]')?.addEventListener('click',e=>{if(e.target===e.currentTarget) root.innerHTML='';});
}

function renderFullCaseInline(x){
  const app=document.getElementById('app'); if(!app) return;
  const built=buildFullCaseData(x);
  app.innerHTML=`<section class="use-cases-page"><div class="use-cases-wrap">${built.html}</div></section>`;
  window.scrollTo({top:0,behavior:'instant'});
}

let ACTIVE_TAB=parseInt(location.hash.slice(1))||0, LISTENERS_READY=false;


function renderUseCasesPage(){
  const app=document.getElementById('app');
  if(!app || entityFromBody()!=='casos') return false;
  // Inicializar los casos antes de leer ?caso= para que la vista directa
  // pueda abrir el detalle aun cuando se entra por URL sin pasar por la grilla.
  tmfFormaExamples();
  const params=new URLSearchParams(location.search);
  const rawCase=params.get('caso');
  if(rawCase!==null && window.__DICCMED_CASES__){
    const idx=Number(rawCase);
    const x=window.__DICCMED_CASES__[idx];
    if(x){ renderFullCaseInline(x); return true; }
  }
  app.innerHTML=`<section class="use-cases-page"><div class="use-cases-wrap">
    <div class="use-cases-head"><div><div class="case-kicker">CASOS DE USO</div><h1>Casos completos DICCMED → TMF</h1><p>Seleccioná una forma farmacéutica para ver un caso cargado de punta a punta: Sustancia, VTM, VMP, VMPP, Trade Family, AMP y AMPP, y cómo esos datos terminan representados en Fármaco Sustancia, Fármaco Genérico, Composición y Fármaco Comercial.</p></div></div>
    ${tmfFormaExamples().replace('<section class="forma-examples">','<section class="forma-examples use-cases-examples">')}
  </div></section>`;
  return true;
}

function renderSpecializedPage(){
  const entity=entityFromBody(), cfg=PAGE_CONFIG[entity], app=document.getElementById("app");
  if(!cfg || !app) return false;
  const i=Math.min(ACTIVE_TAB,cfg.tabs.length-1), mode=document.body.dataset.mode;
  const tpl=document.getElementById("t"+i);
  let rowsHtml="";
  cfg.rows.slice(0,i+1).forEach((group,g)=>group.forEach((row,r)=>{
    rowsHtml += `<tr class="${g===i?"cur":""}">
      ${editCell(row[0],g,r,0,"f")}
      <td class="c">${badge(row[1],g,r,1)}</td>
      <td class="c">${badge(row[2],g,r,2)}</td>
      <td class="c">${badge(row[4] ?? "No",g,r,4)}</td>
      ${editCell(row[3],g,r,3)}
    </tr>`;
  }));
  const tabs=cfg.tabs.map((t,j)=>`<div class="tab ${j===i?"active":""}" data-tab="${j}" role="tab" tabindex="0">${t}</div>`).join("");
  const action=mode==="edicion"?"Guardar cambios":"Crear "+cfg.label;
  const title=mode==="edicion"?"Editar "+cfg.label:cfg.title;
  app.innerHTML=`<section class="page-shell"><div class="wrap">
    <div class="modal">
      <div class="m-header"><div class="m-title">${title} <span class="info">i</span></div><svg width="22" height="22"><use href="#x"/></svg></div>
      <div class="tabs" role="tablist">${tabs}</div>
      <div class="body ${tpl?.dataset.cls||""}">${tpl?tpl.innerHTML:""}</div>
      <div class="m-footer"><div class="check"><span class="box"></span>Prueba</div>
        <div class="f-right"><div class="missing"><span class="dot">!</span>Faltan: revise los campos obligatorios</div>
          <div class="btn btn-sec">Cancelar</div><div class="btn btn-pri">${action}</div>
        </div>
      </div>
    </div>
    <div class="aside"><div class="aside-head"><div><h3>Resumen de campos</h3><p>Cómo se representa cada dato de DICCMED en TMF</p></div></div>
      <table><thead><tr><th>Campo</th><th class="c">Obligatorio (campo)</th><th class="c">Necesario (SP)</th><th class="c">SP validar</th><th>Representación en TMF</th></tr></thead>
      <tbody>${cfg.rows.slice(0,i+1).map((group,g)=>group.map((row,r)=>`<tr class="${g===i?"cur":""}">${editCell(row[0],g,r,0,"f")}<td class="c">${badge(row[1],g,r,1)}</td><td class="c">${badge(row[2],g,r,2)}</td><td class="c">${badge(row[4] ?? "No",g,r,4)}</td><td class="tmf-map-cell">${tmfFieldMapping(entity,row[0])}</td></tr>`).join('')).join('')}</tbody></table>
    </div></div></section>`;
  if(!LISTENERS_READY){initSummaryInteractions(app,cfg);LISTENERS_READY=true;}
  return true;
}

function goTab(n){
  ACTIVE_TAB=n; history.replaceState(null,"","#"+n); renderSpecializedPage();
}

function initSummaryInteractions(app,cfg){
  app.addEventListener("click",e=>{
    const t=e.target.closest(".tab[data-tab]");
    if(t){goTab(Number(t.dataset.tab));return;}
    const b=e.target.closest(".tg"); if(!b) return;
    const row=cfg.rows[Number(b.dataset.g)][Number(b.dataset.r)];
    const c=Number(b.dataset.c);
    row[c]=(row[c]??"No")==="Si"?"No":"Si";
    renderSpecializedPage();
  });
  app.addEventListener("keydown",e=>{
    const t=e.target.closest?.(".tab[data-tab]");
    if(t && (e.key==="Enter"||e.key===" ")){e.preventDefault();goTab(Number(t.dataset.tab));return;}
    if(e.key==="Enter" && e.target.isContentEditable){e.preventDefault();e.target.blur();}
  });
  app.addEventListener("focusout",e=>{
    const t=e.target; if(!t.isContentEditable) return;
    const g=Number(t.dataset.g),r=Number(t.dataset.r),c=Number(t.dataset.c);
    const value=t.textContent.trim();
    if(cfg.rows[g][r][c]!==value){cfg.rows[g][r][c]=value;renderSpecializedPage();}
  });
}

/* =========================================================
   SECCIÓN TMF — réplica de las pantallas del Maestro de Fármacos
   (Componente, Medicamento autocontenido / continuo, Producto Médico)
   ========================================================= */
const TMF_ICON={tmfcomp:"⁘",tmfmed:"✚",tmfpm:"⚕",tmfpc:"🛍",tmflab:"⌂",tmfum:"↔",tmfforma:"◫",tmfaccion:"✦",tmfenv:"▣",tmfua:"⌂",tmfnov:"🛍"};
const TMF_TABS={}; // estado de pestañas por grupo
let TMF_CONT=location.hash==="#continuo";

const tIn=(label,val="",cls="")=>`<div class="tmf-in ${val?"has":""} ${cls}"><small>${label}</small>${val?`<span>${val}</span>`:""}</div>`;
const tSel=(label,val="",cls="")=>`<div class="tmf-in tmf-sel ${val?"has":""} ${cls}"><small>${label}</small>${val?`<span>${val}</span>`:""}<i>▾</i></div>`;
const tAuto=(val="")=>`<div class="tmf-in tmf-auto has"><small>Nombre</small><span>${val}</span><em>Este campo se completa automáticamente</em></div>`;
const tEstado=()=>`<div class="tmf-estado">Estado <span class="tmf-sw"></span><span class="tmf-baja">BAJA</span></div>`;
const tWarn=t=>`<div class="tmf-warn">⚠ ${t}</div>`;
const tBtn=(t,off)=>`<div class="tmf-btn ${off?"off":""}">＋ ${t}</div>`;
const tCard=(title,body)=>`<div class="tmf-card">${title?`<h2>${title}</h2>`:""}<div class="tmf-body">${body}</div></div>`;
function tTabs(id,names,panels){
  const a=TMF_TABS[id]||0;
  return `<div class="tmf-card"><div class="tmf-tabs">${names.map((n,i)=>`<div class="tmf-tab ${i===a?"active":""}" data-tg="${id}" data-ti="${i}">${n}</div>`).join("")}</div>
  <div class="tmf-body">${panels[a]||`<div class="tmf-sinmaquetar">Pestaña sin maquetar</div>`}</div></div>`;
}
const tCatalogo=()=>tTabs("cat",["Catálogo Caba","Codigo Alfa Beta","Codigo Snomed"],[
  `<div class="tmf-row">${tIn("Código","","w160")}${tIn("Descripción","","w280")}${tIn("Sku","","w160")}${tSel("Tipo De Oca","","w280 dis")}<span class="tmf-trash">🗑</span></div>${tBtn("Agregar Registro")}`]);
let TMF_MODAL=null;
const tComposicion=(off,continuous=false)=>tTabs("comp",["Composición","Datos Ampliados","Productos Comerciales"],[
  `<div class="tmf-composition-head"><div><b>Elementos de composición</b><small>${continuous?"Medicamento continuo: numerador + denominador":"Medicamento autocontenido: denominador"}</small></div></div>
   ${tWarn("Aun no ha sido definida una Composición.")}${tBtn("Agregar Componente",off)}`]);

function tmfCompositionModal(continuous){
  return `<div class="tmf-modal-backdrop" data-modal-close>
    <div class="tmf-modal" role="dialog" aria-modal="true" aria-label="Agregar componente">
      <div class="tmf-modal-head">Agregar componente</div>
      <div class="tmf-modal-body">
        <div class="tmf-modal-field"><label>Componente</label><input placeholder="Componente"></div>
        <div class="tmf-modal-potency">
          <div><label>Denominador</label><div class="tmf-pot-row"><input value="0,00"><select><option></option><option>mg</option><option>g</option><option>mL</option></select></div></div>
          ${continuous?`<span class="tmf-divisor">/</span><div><label>Numerador</label><div class="tmf-pot-row"><input value="0,00"><select><option></option><option>mg</option><option>g</option><option>mL</option></select></div></div>`:""}
        </div>
      </div>
      <div class="tmf-modal-foot"><button class="tmf-cancel" data-modal-close>Cancelar</button><button class="tmf-add off">Agregar</button></div>
    </div>
  </div>`;
}


const NOV_DATA=[{usuario:"20400062650",fecha:"15/09/2026 09:54",nombre:"PRUEBA - ANIDUSTATERA - ANIDULAFUNGINA 100 MG-POLVO LIOFILIZADO PARA INFUSION ENDOVENOSA - 1 FRASCO AMPOLLA por 100 MG DE ANIDULAFUNGINA",presentacion:"1 FRASCO AMPOLLA por 100 MG DE ANIDULAFUNGINA",potencia:"100 mg",uEmpaque:"1",uAsist:"FRASCO AMPOLLA",gtin:"07790000000000",generico:"ANIDULAFUNGINA",nne:"9058261",cuit:"30-71220533-0",lab:"LABORATORIOS JAYOR SRL",refrig:"S",estado:"DESESTIMADO",obs:"Item de prueba para validar flujo completo",fResol:"15/09/2026 10:22",uResol:"20400062650"}];
const NOV_COLS=[["Usuario<br>Proveedor","usuario"],["Fecha Ingreso","fecha"],["Nombre Comercial","nombre"],["Presentación","presentacion"],["Potencia","potencia"],["Unidad<br>Empaque","uEmpaque"],["Unidad<br>Asistencial","uAsist"],["GTIN","gtin"],["Nombre Genérico","generico"],["NNE","nne"],["CUIT<br>Laboratorio","cuit"],["Nombre<br>Laboratorio","lab"],["Refrigerable","refrig"],["Estado","estado"],["Observaciones","obs"],["Fecha Resolución","fResol"],["Usuario<br>Resolución","uResol"]];
let NOV_ESTADO="DESESTIMADO";
function tmfNovedades(){
  const n=e=>NOV_DATA.filter(r=>r.estado===e).length;
  const rows=NOV_DATA.filter(r=>!NOV_ESTADO||r.estado===NOV_ESTADO);
  const cell=(k,r)=>k==="estado"?`<span class="nov-estado ${r.estado.toLowerCase()}">${r.estado}</span>`:r[k];
  return `<div class="nov-chips"><span class="nov-chip pend">PENDIENTE: ${n("PENDIENTE")}</span><span class="nov-chip res">RESUELTO: ${n("RESUELTO")}</span><span class="nov-chip des">DESESTIMADO: ${n("DESESTIMADO")}</span></div>
  <div class="tmf-card"><div class="tmf-body nov-filtros"><div class="tmf-in w230"><small>Fecha Ingreso Desde - Hasta</small><i class="nov-cal">📅</i></div>
    <label class="tmf-in tmf-sel has w200"><small>Estado</small><select id="nov-estado">${["","PENDIENTE","RESUELTO","DESESTIMADO"].map(v=>`<option value="${v}" ${v===NOV_ESTADO?"selected":""}>${v||"TODOS"}</option>`).join("")}</select></label>
    <button class="nov-limpiar" id="nov-limpiar">Limpiar</button></div></div>
  <div class="tmf-tablewrap nov-wrap"><table class="tmf-table nov"><thead><tr>${NOV_COLS.map(c=>`<th>${c[0]}</th>`).join("")}</tr></thead>
  <tbody>${rows.length?rows.map(r=>`<tr>${NOV_COLS.map(c=>`<td>${cell(c[1],r)}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="${NOV_COLS.length}" class="tmf-empty">Sin resultados</td></tr>`}</tbody></table></div>`;
}
const TMF_AUX_FIELDS={
  tmfpc:["Código","Nombre Producto Comercial","Laboratorio","Estado"],
  tmflab:["Código","Nombre Laboratorio","CUIT","Estado","Observaciones"],
  tmfum:["Código","Nombre Unidad","Abreviatura","Estado"],
  tmfforma:["Código","Nombre Forma Farmacéutica","Descripción","Estado"],
  tmfaccion:["Código","Nombre Acción Farmacológica","Descripción","Estado"],
  tmfenv:["Código","Nombre Envase","Tipo","Estado"],
  tmfua:["Código","Nombre Unidad Asistencial","Tipo","Estado"]
};
const tmfAuxMaqueta=(entity)=>{
  const meta=ENTITY_META[entity], fields=TMF_AUX_FIELDS[entity]||[];
  return tCard(meta.label,`<div class="tmf-grid">${fields.map(f=>tIn(f)).join("")}</div>${tEstado()}`);
};
function tmfExtraBody(entity){
  if(entity==="tmfnov") return tmfNovedades();
  if(TMF_AUX_FIELDS[entity]) return [tmfAuxMaqueta(entity)].join("");
  return null;
}function tmfBody(entity){
  const extra=tmfExtraBody(entity); if(extra!==null) return extra;
  if(entity==="tmfcomp") return [
    tCard("Datos del Componente",`${tIn("Nombre *")}${tEstado()}`),
    tCard("Medicamentos/Productos Médicos Asociados",tWarn("No hay componentes asociados a esta Sustancia")),
    tCard("Acciones Farmacológicas",`${tWarn("No hay acciones farmacológicas asociadas a esta Sustancia.")}${tBtn("Asociar Acción Farmacológica")}`),
    tTabs("snomed",["Snomed"],[`${tIn("Código","","w180")}`])
  ].join("");
  if(entity==="tmfpm") return [
    tCard("Datos del Producto Médico",`${tAuto()}${tIn("Denominación TMF")}${tEstado()}`),
    tComposicion(false), tCatalogo()
  ].join("");
  const c=TMF_CONT; // medicamento
  return [
    tCard("Datos del Medicamento",`${tAuto(c?"SOLUCION INYECTABLE DE LIBERACION CONVENCIONAL":"")}${tIn("Denominación TMF")}${tEstado()}
      ${tSel("Forma Farmacéutica *",c?"SOLUCION INYECTABLE DE LIBERACION CONVENCIONAL":"")}
      <div class="tmf-col">${tSel("Unidad Asistencial *","","w300")}${tSel("Via de Administracion preferida","","w300")}${c?tSel("Envase","","w300"):""}</div>
      ${c?`<div class="tmf-cant">Cantidad: <span class="tmf-mini">0,00</span><span class="tmf-mini w120">▾</span></div>`:""}`),
    tComposicion(false,c), tCatalogo()
  ].join("");
}

function renderTmfPage(){
  const entity=entityFromBody(), meta=ENTITY_META[entity], app=document.getElementById("app");
  if(!app || meta?.section!=="tmf") return false;
  const edit=document.body.dataset.mode==="edicion";
  const AUXT={tmfpc:"Producto Comercial",tmfnov:"Servicio NOV Proveedores"};
  const title=AUXT[entity]||((edit?"Editar ":"Crear ")+meta.label);
  const acts=`<div class="tmf-acts"><span class="tmf-cancel">Cancelar</span><span class="tmf-save">Guardar</span></div>`;
  const ro=false;
  const variant=entity==="tmfmed"?`<div class="tmf-variant">Vista:
      <button data-cont="0" class="${TMF_CONT?"":"on"}">Autocontenido</button><button data-cont="1" class="${TMF_CONT?"on":""}">Continuo</button></div>`:"";
  app.innerHTML=`<section class="tmf"><div class="tmf-top"><div class="tmf-title">${TMF_ICON[entity]} ${title}</div>${variant}${ro?"":acts}</div>
    ${tmfBody(entity)}${ro?"":`<div class="tmf-bottom">${acts}</div>`}</section>`;
  if(TMF_MODAL && entity==="tmfmed") app.insertAdjacentHTML("beforeend",tmfCompositionModal(TMF_CONT));
  if(!app.dataset.tmf){
    app.dataset.tmf="1";
    app.addEventListener("change",e=>{ if(e.target.id==="nov-estado"){NOV_ESTADO=e.target.value;renderTmfPage();} });
    app.addEventListener("click",e=>{
      const t=e.target.closest(".tmf-tab"); if(t){TMF_TABS[t.dataset.tg]=Number(t.dataset.ti);renderTmfPage();return;}
      if(e.target.id==="nov-limpiar"){NOV_ESTADO="";renderTmfPage();return;}
      if(e.target.closest("[data-modal-close]") && !e.target.closest(".tmf-modal")){TMF_MODAL=null;renderTmfPage();return;}
      if(e.target.closest(".tmf-modal-foot [data-modal-close]")){TMF_MODAL=null;renderTmfPage();return;}
      const add=e.target.closest(".tmf-btn:not(.off)");
      if(add && entity==="tmfmed" && add.textContent.includes("Agregar Componente")){TMF_MODAL=true;renderTmfPage();return;}
      const v=e.target.closest("[data-cont]"); if(v){TMF_CONT=v.dataset.cont==="1";TMF_MODAL=null;history.replaceState(null,"",TMF_CONT?"#continuo":"#");renderTmfPage();}
    });
  }
  return true;
}

document.addEventListener("DOMContentLoaded",()=>{buildGlobalNav();renderUseCasesPage()||renderSpecializedPage()||renderTmfPage();});
