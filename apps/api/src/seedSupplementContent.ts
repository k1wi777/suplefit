/** Contenido orientativo ampliado para beneficios, protocolo y advertencias */
export const supplementContentBySlug: Record<
  string,
  { beneficios: string; modoUso: string; advertencias: string }
> = {
  creatina: {
    beneficios:
      "Fuerza y potencia: Puede apoyar el rendimiento en series cortas e intensas.\nRecuperación: Ayuda a reponer fosfocreatina entre esfuerzos.\nMasa muscular: Complemento habitual en planes de hipertrofia con entrenamiento y dieta adecuados.\nUso sostenido: Se usa de forma continua, no solo días de entreno.",
    modoUso:
      "Dosis habitual: 3–5 g diarios de creatina monohidratada.\nMomento: A la misma hora cada día; no depende de tomarla justo antes del gym.\nPreparación: Disolver en agua o mezclar con batido.\nHidratación: Aumentar ingesta de líquidos de forma habitual.",
    advertencias:
      "No sustituye alimentación ni indicación profesional.\nConsultar si tienes enfermedad renal o tomas medicación.\nAlgunas personas pueden notar retención de líquido leve al inicio.",
  },
  "whey-protein": {
    beneficios:
      "Aporte proteico: Ayuda a cubrir requerimientos diarios de proteína.\nRecuperación: Opción práctica tras entrenamiento de fuerza.\nSaciedad: Puede colaborar al control del apetito entre comidas.\nVersatilidad: Se mezcla con agua, leche o preparaciones.",
    modoUso:
      "Dosis habitual: 1 porción (25–30 g) según etiqueta del fabricante.\nMomento: Tras entrenar o entre comidas según tu plan nutricional.\nPreparación: Agitar 30 s en 250–300 ml de líquido.\nDuración: Uso continuo según objetivo y dieta.",
    advertencias:
      "No sustituye una dieta equilibrada ni valoración profesional.\nRevisar ingredientes si eres alérgico a lácteos o intolerante.\nNo exceder las porciones recomendadas en el envase.",
  },
  "mass-gainer": {
    beneficios:
      "Calorías y proteína: Pensado para quienes les cuesta alcanzar superávit calórico.\nApoyo al volumen: Complemento en etapas de ganancia de peso controlada.\nPracticidad: Una toma concentra nutrientes vs. varias comidas extra.\nEnergía: Aporta carbohidratos junto con proteína.",
    modoUso:
      "Dosis habitual: 1 porción según etiqueta (suele ser mayor que un whey estándar).\nMomento: Post-entreno o como comida complementaria.\nPreparación: Mezclar con agua o leche hasta textura deseada.\nAjuste: Reducir si aparece ganancia de grasa no deseada.",
    advertencias:
      "No es para quien busca definición sin superávit.\nAjustar según tolerancia digestiva.\nConsultar si tienes diabetes o condiciones metabólicas.",
  },
  "l-carnitina": {
    beneficios:
      "Metabolismo de grasas: Participa en el transporte de ácidos grasos a la mitocondria.\nDefinición: Complemento habitual en etapas de recomposición con dieta y cardio.\nEnergía: Algunos lo usan antes de sesiones de resistencia moderada.\nComplemento: No reemplaza déficit calórico ni entrenamiento.",
    modoUso:
      "Dosis habitual: 500–2000 mg al día según producto y tolerancia.\nMomento: 30–60 min antes de cardio o según indicación del envase.\nDuración: Ciclos según objetivo; no es obligatorio todo el año.\nCombinación: Puede tomarse con comidas.",
    advertencias:
      "Efecto individual variable; no garantiza pérdida de grasa.\nEvitar si hay contraindicación médica o embarazo sin supervisión.\nNo combinar sin criterio con otros estimulantes.",
  },
  "soporte-nutricional": {
    beneficios:
      "Energía: Puede aportar ingredientes que apoyan el enfoque en entrenos.\nComplemento deportivo: Diseñado para rutinas activas, no como medicamento.\nPracticidad: Formato habitual en cápsulas o polvo según producto.\nApoyo nutricional: Complementa dieta y descanso.",
    modoUso:
      "Dosis habitual: Seguir estrictamente la etiqueta del fabricante.\nMomento: Generalmente antes del entrenamiento si contiene estimulantes.\nDuración: No usar de forma continua sin pausas si incluye estimulantes.\nHidratación: Beber agua antes y durante la sesión.",
    advertencias:
      "Revisar cafeína y estimulantes si eres sensible o tomas presión alta.\nNo apto para menores ni embarazo sin indicación médica.\nNo sustituye descanso ni alimentación adecuada.",
  },
  "proteina-aislada": {
    beneficios:
      "Proteína filtrada: Menor lactosa y grasa que concentrados estándar.\nDefinición: Opción frecuente en etapas de mantenimiento de masa magra.\nDigestión: Mejor tolerancia en algunas personas sensibles al whey clásico.\nVersatilidad: Batidos, pancakes proteicos, etc.",
    modoUso:
      "Dosis habitual: 1 scoop (20–30 g proteína) según etiqueta.\nMomento: Tras entreno o distribuido en el día.\nPreparación: Líquido frío mejora sabor y textura.\nAjuste: Adaptar a tu requerimiento proteico total diario.",
    advertencias:
      "Verificar alérgenos (lácteos/soya según origen).\nNo exceder proteína total diaria sin criterio profesional.\nNo sustituye comidas completas de forma habitual.",
  },
  electrolitos: {
    beneficios:
      "Hidratación: Repone sodio, potasio y magnesio perdidos con sudor.\nRendimiento: Puede reducir calambres en sesiones largas o calor.\nRecuperación: Apoyo tras entrenos de alta sudoración.\nPracticidad: Sobres o bebidas listas para diluir.",
    modoUso:
      "Dosis habitual: 1 porción en 500 ml de agua.\nMomento: Antes, durante o después del entrenamiento intenso.\nClima: Más útil en calor o alta humedad.\nUso diario: Solo si sudoración elevada; no es obligatorio en reposo.",
    advertencias:
      "No abusar en personas con restricción de sodio o presión arterial.\nNo sustituye agua simple en el día a día.\nConsultar si tienes insuficiencia renal.",
  },
  bcaa: {
    beneficios:
      "Aminoácidos ramificados: Leucina, isoleucina y valina.\nRecuperación: Uso frecuente intra o post entreno en deportes de resistencia.\nComplemento: Útil si ayuno de entreno o baja ingesta proteica en esa ventana.\nSabor: Formatos aromatizados para hidratarse en sesión.",
    modoUso:
      "Dosis habitual: 5–10 g según etiqueta.\nMomento: Durante entrenamiento o inmediatamente después.\nPreparación: Diluir en 500–750 ml de agua.\nPrioridad: Si ya cubres proteína diaria, puede no ser imprescindible.",
    advertencias:
      "No sustituye proteína completa de alimentos o whey.\nRevisar si contiene edulcorantes que no toleras.\nEfectos reales menores si dieta proteica ya es alta.",
  },
  "pre-entrenos": {
    beneficios:
      "Enfoque: Ingredientes como cafeína pueden aumentar alerta pre-sesión.\nEnergía subjetiva: Sensación de preparación para entrenar.\nRendimiento agudo: Algunos mejoran repeticiones en sesión concreta.\nRitual: Ayuda a rutina pre-entreno si se usa con criterio.",
    modoUso:
      "Dosis habitual: 1 porción 30–45 min antes del entrenamiento.\nTolerancia: Empezar con media dosis si eres sensible a estimulantes.\nCiclado: Evitar uso diario prolongado para no elevar tolerancia a cafeína.\nNo tomar tarde si afecta el sueño.",
    advertencias:
      "No usar si padeces hipertensión, arritmias o ansiedad sin aval médico.\nProhibido en menores. Cautela en embarazo y lactancia.\nRevisar interacción con otros productos con cafeína.",
  },
  "proteina-vegana": {
    beneficios:
      "Origen vegetal: Guisante, arroz, soja u otras fuentes según fórmula.\nSin lactosa: Alternativa para veganos o intolerantes.\nProteína completa: Mezclas bien formuladas cubren aminoácidos clave.\nSostenibilidad: Opción alineada con dieta plant-based.",
    modoUso:
      "Dosis habitual: 1 scoop según etiqueta (25–30 g proteína).\nMomento: Post-entreno o entre comidas.\nPreparación: Mezclar con bebida vegetal para mejor sabor.\nCombinación: Complementar con legumbres y cereales en comidas.",
    advertencias:
      "Revisar alérgenos (soja, gluten según producto).\nSabor y textura distintos al whey; probar marcas.\nNo sustituye planificación dietética vegana equilibrada.",
  },
  "omega-3": {
    beneficios:
      "EPA y DHA: Ácidos grasos asociados a salud cardiovascular.\nArticulaciones: Uso habitual como complemento general.\nCerebro y visión: DHA relevante en dieta global.\nAntiinflamatorio leve: Complemento en deportistas con alta carga.",
    modoUso:
      "Dosis habitual: 1–2 cápsulas con comidas (según concentración del producto).\nMomento: Con desayuno o cena para mejor tolerancia.\nCalidad: Preferir productos con certificación de pureza.\nDuración: Uso prolongado habitual en muchos adultos.",
    advertencias:
      "Consultar si tomas anticoagulantes.\nNo exceder dosis altas sin indicación.\nGuardar en lugar fresco; revisar fecha de caducidad.",
  },
  zma: {
    beneficios:
      "Minerales: Zinc y magnesio involucrados en muchas funciones corporales.\nDescanso: Algunos reportan mejor sueño con magnesio nocturno.\nRecuperación: Complemento nocturno en deportistas con déficit.\nVitamina B6: Incluida en fórmulas ZMA clásicas.",
    modoUso:
      "Dosis habitual: 2–3 cápsulas 30–60 min antes de dormir.\nEstómago: Preferible en ayunas o lejos de comidas muy copiosas.\nDuración: Ciclos de 4–8 semanas o según necesidad.\nCalcio: Separar de suplementos altos en calcio por absorción.",
    advertencias:
      "No sustituye higiene del sueño ni manejo del estrés.\nExceso de zinc puede causar molestias digestivas.\nConsultar si tomas otros suplementos con minerales.",
  },
  multivitaminico: {
    beneficios:
      "Cobertura general: Vitaminas y minerales en dosis moderadas.\nVitalidad: Complemento cuando dieta es variada pero irregular.\nDefensas: Apoyo en temporadas de alto estrés o carga.\nPracticidad: Una toma diaria sencilla.",
    modoUso:
      "Dosis habitual: 1 comprimido o cápsula con el desayuno.\nMomento: Con comida que contenga algo de grasa para vitaminas liposolubles.\nDuración: Uso continuo o temporadas según dieta.\nNo duplicar con otros multis.",
    advertencias:
      "No sustituye frutas, verduras ni alimentos reales.\nNo exceder dosis; más no es mejor.\nConsultar si tomas medicación crónica por interacciones.",
  },
  colageno: {
    beneficios:
      "Colágeno hidrolizado: Péptidos para articulaciones, piel y tejidos.\nArticulaciones: Complemento en deportes de impacto.\nPiel y uñas: Uso cosmético-nutricional habitual.\nCombinación: A menudo con vitamina C en fórmulas.",
    modoUso:
      "Dosis habitual: 10 g diarios disueltos en bebida.\nMomento: Cualquier hora; constancia más importante que timing.\nPreparación: Agua, café o batido; mezcla lenta en frío.\nDuración: Mínimo 8–12 semanas para valorar percepción.",
    advertencias:
      "Evidencia variable según objetivo; expectativas realistas.\nEmbarazo y lactancia: consultar profesional.\nOrigen bovino/marino: revisar si tienes restricciones dietéticas.",
  },
  glutamina: {
    beneficios:
      "Aminoácido más abundante: Reservas musculares y inmune.\nRecuperación: Uso post-entreno en volumen alto de trabajo.\nIntestino: Algunos lo usan por tolerancia digestiva.\nComplemento: Menor prioridad si proteína diaria ya es alta.",
    modoUso:
      "Dosis habitual: 5 g post-entreno o antes de dormir.\nMomento: Separado de proteína whey si se desea ventana específica.\nPreparación: Agua o jugo.\nCarga: No requiere fase de carga.",
    advertencias:
      "No necesario para la mayoría de usuarios recreativos.\nMolestias digestivas leves en dosis altas.\nConsultar en enfermedad hepática o renal grave.",
  },
  snacks: {
    beneficios:
      "Proteína rápida: Merienda práctica entre comidas.\nSaciedad: Puede ayudar a evitar picoteo menos saludable.\nPortabilidad: Formato barra para trabajo o viaje.\nControl: Porción individual definida.",
    modoUso:
      "Dosis habitual: 1 barra como snack (revisar proteína y kcal en etiqueta).\nMomento: Media mañana o tarde según hambre.\nHidratación: Acompañar con agua.\nLímite: 1–2 al día según plan calórico.",
    advertencias:
      "Revisar edulcorantes y polioles (pueden laxar en exceso).\nNo sustituye comida principal.\nContiene alérgenos frecuentes (leche, soya, frutos secos).",
  },
  adaptogenos: {
    beneficios:
      "Adaptógenos: Ashwagandha u otras hierbas según fórmula.\nEstrés: Pueden apoyar percepción de calma y recuperación.\nSueño: Algunas fórmulas orientadas a descanso nocturno.\nComplemento: Junto con higiene del sueño y gestión de carga.",
    modoUso:
      "Dosis habitual: Según extracto estandarizado en etiqueta (ej. 300–600 mg).\nMomento: Tarde o noche si objetivo es descanso.\nDuración: 4–8 semanas y reevaluar.\nConsistencia: Tomar a la misma hora.",
    advertencias:
      "Consultar si tomas tiroides, ansiolíticos o antidepresivos.\nEmbarazo: evitar sin supervisión.\nEfectos individuales; no sustituye tratamiento médico de ansiedad.",
  },
};
