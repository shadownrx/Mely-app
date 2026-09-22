# MELY — Estrategia UX: "Esto no es Tinder"

Fecha: 2026-09-22. Base verificada en código real (`src/`).

## 1. Product vision

**MELY no es un catálogo de personas. Es el pasaporte de tus citas de verdad.**

El loop actual ya tiene la semilla correcta y casi ninguna dating app la tiene end-to-end:

`descubrir (cupo diario) → match → proponer plan → cita verificada con QR → sello souvenir`

La visión: **del match al plan en minutos, del plan al recuerdo para siempre**. Todo lo que no acerque a una cita real (scroll infinito, validación por volumen, chat eterno que muere) es fricción a eliminar. Todo lo que acerque (intención visible, lugar verificado, icebreaker con contexto, QR + sello) es identidad a amplificar.

Frase de prueba: alguien abre MELY y dice *"¿qué carajo es esto? Está buenísima"* cuando ve que un perfil cuenta una historia, que el match propone un café verificado en dos taps, y que la cita deja un sello en su pasaporte.

## 2. Competitive analysis (resumen operativo)

- **Tinder**: swipe → like → match → chat. Mecánicas explotadas: Super Like, Boost, paywall de Likes. Engagement > conexión. Burnout documentado (~78%). Genérico por: mazo infinito, decisión en 1 foto, chat sin contexto.
- **Bumble**: mujeres hablan primero + límite 24h. Bueno contra el chat muerto, pero la presión temporal genera ansiedad y el mazo sigue siendo catálogo.
- **Hinge**: "diseñada para borrarse". Acierto real: **like por fragmento** (reaccionar a una foto/prompt concreto) + prompts obligatorios. Es lo más cercano a "descubrir a alguien". Su límite: sigue terminando en chat sin plan.
- **Badoo**: verificación + gente cerca + live/credits. Confianza como feature, pero UX recargada y monetización agresiva.
- **OkCupid**: cuestionario largo = compatibilidad declarada. Potente en intención, pesado en onboarding.
- **Feeld**: nichos e inclusividad. Diferenciación por comunidad, no por mecánica.
- **Coffee Meets Bagel**: 1 bagel diario = anti-catálogo por escasez. Valida nuestro cupo diario y Persona del día.
- **Señales 2025-26**: Thursday (solo jueves, IRL), citas con verificación de lugar, audio-bio, blind dating, fatiga del swipe.

**Oportunidades abiertas para MELY**: nadie conecta match → plan verificado → recuerdo en un solo loop. Nadie explica *por qué* te muestra a alguien. Nadie convierte la seguridad en algo cálido (lugar público verificado, consentimiento progresivo, reporte en 1 tap).

## 3. UX problems (encontrados en este repo)

1. **Discover sigue hablando Tinder aunque el producto no lo sea** ([DiscoverView.tsx](/home/salvador/Documentos/Mely-app/src/components/DiscoverView.tsx:748)): fila small-big-small pasar/like/super + sellos CONECTAR/PASAR. El "cuaderno" (bio, audio, prompts) vive **detrás de un chevron** ([DiscoverView.tsx](/home/salvador/Documentos/Mely-app/src/components/DiscoverView.tsx:681)) — por defecto solo hay foto + nombre. Primera información = superficie, no historia.
2. **Sin "por qué este perfil"**: el backend devuelve intereses, verificación, distancia, audio y prompts ([types.ts](/home/salvador/Documentos/Mely-app/src/types.ts:49)), pero la UI nunca explica la afinidad. Se pierde curiosidad y confianza.
3. **Like binario a toda la persona**: Hinge demostró que reaccionar a un fragmento (un prompt, un interés) inicia mejor conversación. Nuestro `POST /discover/like/:userId` ([src/lib/api/discover.ts]()) solo acepta persona completa — la UI ni siquiera registra *qué* te gustó.
4. **Match celebra y abandona**: [MatchCelebrationModal.tsx](/home/salvador/Documentos/Mely-app/src/components/MatchCelebrationModal.tsx:191) solo ofrece "Enviar mensaje" / "Seguir explorando". El diferenciador real (proponer plan → QR → sello) queda a 3 pantallas de distancia.
5. **Icebreakers desconectados**: [IcebreakerWheelModal.tsx](/home/salvador/Documentos/Mely-app/src/components/IcebreakerWheelModal.tsx:1) y `ICEBREAKER_QUESTIONS` ([mockData.ts](/home/salvador/Documentos/Mely-app/src/data/mockData.ts:113)) existen pero no aparecen en el chat vacío, justo donde mueren las conversaciones.
6. **Reporte lejos del descubrimiento**: [ReportBlockSheet.tsx](/home/salvador/Documentos/Mely-app/src/components/ReportBlockSheet.tsx:1) existe y está bien diseñado, pero Discover no lo invoca — hay que matchear/ir al chat para reportar.
7. **Techo mobile**: `.app-page { max-width: 440px }` ([index.css](/home/salvador/Documentos/Mely-app/src/index.css:323)) + BottomNav `max-w-[440px]`. En desktop 2026 la app es una columna flotando en vacío.
8. **Detalles de a11y**: textos de 9-11px en badges/nav, focos discretos, skeletons solo en algunos listados.

Lo que se **preserva**: sistema coral/midnight/canvas + Fraunces/Manrope/Space Mono ([index.css](/home/salvador/Documentos/Mely-app/src/index.css:15)), tickets/perforaciones/sellos, cupo diario + Persona del día (anti-catálogo real), spots verificados, QR/check-in, audio-bio, blind mode, sonidos con respeto a `prefers-reduced-motion`.

## 4. New opportunities (top 5, priorizadas por potencial)

1. **Plan contextual como objeto de primera clase**: el match propone "café en Lattente, mañana 17h" en 2 taps con spot verificado. Ya existe el backend (`/dates/*`); falta llevarlo al frente.
2. **Explicador de afinidad**: "Te la mostramos por: café de especialidad + verificada + a 2km". Genera curiosidad y confianza sin IA mágica — es aritmética con datos que ya tenemos.
3. **Reacción por fragmento** (UI ahora, backend después): tocar el corazón de un prompt/interés hace el mismo `like` actual pero recuerda el contexto y lo muestra en el match ("Te gustó su respuesta sobre…"). Backend futuro: `POST /discover/like/:id {fragment}`.
4. **Rituales síncronos + intención temporal**: "Esta semana quiero: café / caminar / vino" + Persona del día + blind mode como ritual diario, no como filtros escondidos.
5. **Seguridad cálida**: capas de verificación visibles, reporte en 1 tap desde Discover y chat, consentimiento progresivo (revelar mirada/audio a tu ritmo), cita siempre en lugar público verificado.

IA al servicio de la conexión (nunca chatbot genérico): explicador de compatibilidad con datos reales, facilitador de plan (lugar+hora según ambos), detector de conversación moribunda que sugiere 1 plan o 1 icebreaker con contexto, redactor de bio que ordena lo que ya escribiste. Todo documentado como propuesta salvo el explicador determinista, que ya se implementa.

## 5. Proposed experience

- **Onboarding**: secuencia actual (perfil → prompts → fotos) + intención temporal ("esta semana busco…") + verificación desde el día 1 como orgullo, no trámite.
- **Discovery**: una conexión a la vez, cupo visible, Persona del día arriba, cada card abre con *intención + afinidad explicada*, foto después, cuaderno a un tap, reacción por fragmento, reporte en el menú.
- **Profile**: prompts + audio + sellos + verificación por capas; la bio se lee como historia, no como specs.
- **Interest**: reacciono a algo concreto, no a "toda la persona".
- **Match**: celebración breve → CTA primario **Proponer un plan** (secundario: mensaje). Contexto del fragmento visible.
- **Conversation**: chat vacío con 3 caminos (icebreaker con contexto / proponer plan / audio), typing + reply + foto ya existentes, facilitador de plan cuando la charla se enfría.
- **Connection**: propuesta → contrapropuesta → QR en lugar verificado → confirmación mutua → **sello souvenir** + nota post-cita. El pasaporte es la retención, no el streak.

## 6. Design direction 2026

Evolucionar, no rebrandear: coral `#FF8A65`/`#F16B48` sobre midnight `#0A1120`, Fraunces solo para wordmark y titulares editoriales, Manrope para todo lo demás, Space Mono para datos (cupo, distancia, sellos). Radios `--radius-sm/md/lg/xl/pill`, sombras tintadas midnight, ticket-edges y perforaciones como firma. Motion con springs `cubic-bezier(0.16,1,0.3,1)`, 180-320ms, siempre con `prefers-reduced-motion`. Jerarquía: intención > afinidad > historia > foto > acciones. Estados vacíos que proponen el siguiente paso, skeletons en cada lista, focos visibles, mínimo 13px en cuerpo, desktop con columna de descubrimiento + panel de plan.

## 7. Priority

- **Must have** (implementado en esta pasada): explicador de afinidad client-side, intención visible primero en la card, reacción por fragmento (contexto local), reporte desde Discover, CTA "Proponer plan" en match, atajos de icebreaker/plan en chat vacío (cuando el código lo permite sin romper backend), responsive desktop básico, focos y tamaños mínimos.
- **High impact** (siguiente): intención temporal + ritual diario, like con fragmento persistido (requiere campo backend), facilitador de plan con spots, verificación por capas visible.
- **Experimental**: cita a ciegas total por defecto una noche/semana, planes abiertos (publicar "quiero ir a X" y que se sumen), cadena de sellos por barrio.
- **Future**: upload real de stickers/fotos (hoy `::sticker::` sin upload), live, moneda/premium sin dark patterns, verificación biométrica.

---

# Ronda 2 (2026-09-22): el loop MELY

Pregunta guía: ¿cuál es el loop que hace a MELY reconocible como MELY?

**Respuesta: Intención → Historia → Plan → Recuerdo → Intención.**

- Declaro qué quiero esta semana (**intención**).
- Descubro historias, no fichas, cada una con un plan posible (**historia + plan sugerido**).
- Reacciono a algo concreto y ese contexto viaja (**fragmento → match → nota del plan**).
- Vivo la cita verificada y me queda un sello (**recuerdo**).
- El recuerdo alimenta la próxima intención (futuro server-side).

Nada de esto es "Tinder con X": Tinder optimiza volumen de personas; MELY optimiza velocidad hacia un plan concreto con contexto.

## Los 3 pilares (descarte incluido)

Se descartó explícitamente: boosts/super-swipes pagos extra, límite de 24h tipo Bumble (ansiedad), cuestionario largo tipo OkCupid (fricción), feed de fotos infinito, "modo invisible" premium. Todo eso es engagement, no conexión.

### Pilar 1 — "La intención manda" (implementado, backend actual)

- Problema: los filtros son specs estáticas; el deseo es temporal y cambia por semana.
- Concepto: ritual semanal en un tap que se vuelve el lente del descubrimiento.
- UX: chips "Café tranqui / Salir de noche / Aire libre / Cultura / Charla profunda" sobre Discover + banner con estado; tocar filtros manuales pausa la intención con aviso.
- Ejemplo: elijo "Café tranqui" → el mazo filtra por slugs reales (café, merienda, mate…) y el banner dice "Esta semana buscás: café tranqui".
- Impacto: alto — convierte el mazo en "personas en mi sintonía" y mata el catálogo.
- Complejidad: baja (utils + estado + chips).
- Datos: catálogo de `GET /interests` en runtime + localStorage. Sin slugs inventados: si nada matchea, no se filtra.
- Backend actual: sí (`GET /discover?interests=` ya existía).
- Backend futuro: `weeklyIntention` en el perfil + boost server-side + expiración automática.

### Pilar 2 — "El plan es el perfil" (sugerencia implementada, feed a futuro)

- Problema: "Proponer un plan" era un botón dentro del chat; descubrir personas no mostraba ningún futuro compartido.
- Concepto: cada perfil carga una hipótesis concreta de primera cita; a futuro, los planes abiertos son el objeto de descubrimiento.
- UX hoy: fila "Plan sugerido: {rincón verificado} · {motivo}" bajo la afinidad, que abre Rincones & Beneficios. Si nada matchea con datos reales, no se muestra nada.
- Ejemplo: "Plan sugerido: Lattente Café, Palermo Soho · por su interés en café de especialidad".
- Impacto: alto — el plan deja de ser un botón y pasa a ser el horizonte de cada tarjeta.
- Complejidad: baja hoy; alta el feed.
- Datos hoy: `VERIFIED_SPOTS` estático + intereses + `blindPrompt.idealDate`. Sin inventos.
- Backend actual: sí para la sugerencia.
- Backend futuro (el pilar completo): `GET /plans/open` — publicar "voy a X el sábado" y sumarse; el join crea el match. Esto SÍ es descubrir personas por planes.

### Pilar 3 — "El contexto viaja" (implementado en memoria, persistencia a futuro)

- Problema: el match nace en cero ("hola") aunque un fragmento concreto lo causó; la conversación muere y la experiencia no enseña nada.
- Concepto: el fragmento recorre todo el loop: like → celebración → nota del plan → (futuro) sello y afinidad futura.
- UX hoy: celebración muestra "Conectaron por: {fragmento}"; "Proponer un plan" desde ahí precarga la nota ("Nos conectó: …"). Store en memoria de sesión, se consume al usarse.
- Ejemplo: like al prompt "Mi cita 10/10" → match "Conectaron por: respuesta sobre…" → propuesta con nota precargada.
- Impacto: medio-alto — primer mensaje con contexto ataca directamente la muerte de conversaciones.
- Complejidad: baja hoy.
- Datos hoy: memoria de sesión. Sin backend.
- Backend futuro: `fragment` en `POST /discover/like/:id`, prefill de primer mensaje, sellos compartidos que boostean afinidad ("ya vivieron 2 cafés").

## Respuestas a las 9 preguntas (trazabilidad)

1. Historia no ficha: el cuaderno ya existía; el plan sugerido es su "capítulo siguiente". (Pilar 2)
2. Diversión sin swipe: ritual de intención semanal + Persona del día + blind mode como rituales, no filtros. (Pilar 1)
3. Match con contexto: celebración con fragmento. (Pilar 3, implementado)
4. Conversación que empieza sola: contexto hasta la nota del plan; prefill de primer mensaje queda a futuro con `fragment` persistido. (Pilar 3)
5. Plan como centro: sugerencia por perfil hoy, feed de planes abiertos mañana. (Pilar 2)
6. Planes como descubrimiento: feed `GET /plans/open` — propuesta documentada, requiere backend. (Pilar 2 futuro)
7. Experiencias que mejoran descubrimiento: sellos compartidos → boost de afinidad — propuesta documentada, requiere backend. (Pilar 3 futuro)
8. Información temporal: intención semanal implementada; "hoy estoy para…" queda como ritual diario futuro (mismo mecanismo, expiración 24h). (Pilar 1)
9. Anti-catálogo: cupo + Persona del día (ya existían) + lente de intención (nuevo). (Pilar 1)

---

# Ronda 3 (2026-09-22): pulido extraordinario, cero features backend

Meta: que todo lo que MELY ya hace se sienta extraordinariamente bien.

## Lenguaje de motion

Una curva (`--ease-mely: cubic-bezier(0.16,1,0.3,1)`) y cuatro duraciones
(`--dur-in 280ms`, `--dur-out 160ms`, `--dur-tap 150ms`, `--dur-celebrate 450ms`)
en [src/index.css](/home/salvador/Documentos/Mely-app/src/index.css).
Entradas suben 8-16px; salidas nunca roban atención; taps con overshoot leve;
celebración una sola vez. `MotionConfig reducedMotion="user"` en App apaga las
animaciones JS según el sistema (el CSS ya tenía su media query).

## Decisiones de auditoría

- Discover: el overlay de "me gusta" muestra el fragmento elegido ("Te gustó: …")
  en vez de un corazón genérico; la afinidad re-anima por perfil; el plan
  sugerido lleva foto real del rincón; alturas con `dvh` para teléfonos chicos;
  nuevo estado de error con reintento que aclara que el cupo sigue intacto.
- Celebración: el "por qué" va primero (fragmento específico) y después lo
  compartido (interés en común); delays coreografiados 0.4/0.48.
- Chat vacío: tarjeta de punto de partida con avatar, contexto de origen si
  existe y dos caminos (pregunta inicial / proponer plan). El contexto vive en
  memoria de sesión por conversación y desaparece solo al hablar.
- Likes/Enviados: era un placeholder ("Muy pronto…"). Ahora es historial local
  del teléfono (el backend no expone likes enviados), con badge "A la espera".
- Citas: skeletons con forma de ticket en vez de spinner genérico; vacío con
  titular, explicación del loop y CTA a matches.
- Marca: el botón Fotos del adjunto usaba gradiente púrpura→índigo (fuera de
  sistema) y los destacados usaban emoji ⭐ — ambos pasados a coral y Material
  Symbols.
- Desktop: se mantiene columna centrada (600px máx). El two-column real
  (deck + panel de ritual/plan) queda como FUTURA porque exige reestructurar
  Discover junto al feed de planes abiertos del Pilar 2.

## FUTURAS (requieren backend)

- Two-column Discover en desktop + feed de planes abiertos.
- `fragment` persistido en el like y prefill del primer mensaje.
- "Hoy estoy para…" (ritual diario, mismo mecanismo que la intención semanal).
- Super Spark con significado: "ir con plan destacado" (hoy el endpoint existe pero su efecto no se comunica; no se promete nada que el server no garantice).

---

# Ronda 4 (2026-09-22): Discover como historia, no como ficha

## Auditoría de carga cognitiva

Antes: en una pantalla convivían header + cuota técnica + 5 chips + caption +
banner del día + strip de afinidad flotante + foto + bio truncada duplicada +
cuaderno escondido + 4 botones + menú. Tres lugares contaban media historia
cada uno y el % parecía magia. En 1s se veía foto+nombre+número; en 3s, ruido.

## 5 problemas y sus soluciones (todas implementadas, cero backend)

1. **Todo visible a la vez, nada progresivo.** → La tarjeta ahora tiene 3
   capítulos en un mismo espacio: foto (quién + intención + motivo), franja
   interna (resto de señales + % como sello que respalda, nunca protagonista),
   cuaderno (historia completa). La afinidad vive DENTRO del Card y sale con él.
2. **El % parecía arbitrario.** → Las razones humanas van primero en todos
   lados (overlay de foto, franja, celebración); el número es un sello
   secundario con `title` honesto. Nunca "Compatibilidad: 87%".
3. **Lenguaje heredado de Tinder.** → Fuera: bio duplicada, "Super Like" en
   aria, "92% compatible" falso en el welcome (ahora "Perfil verificado"),
   "Llegaste al límite" + "AMPLIAR EN LA TIENDA" (ahora "Por hoy está bien" +
   "Calidad antes que cantidad"), callejón "BUSCAR NUEVOS PERFILES" (ahora
   entiende si la intención filtra todo y ofrece pausarla).
4. **Cuatro decisiones simultáneas + superlike sin significado.** → El superlike
   no se toca funcionalmente (su efecto server-side no está documentado y no se
   promete nada), pero el camino principal ahora se enseña: pista única
   "Tocá el corazón en lo que te guste", que abre el cuaderno y desaparece para
   siempre con la primera acción. El chevron del cuaderno lleva promesa de
   contenido (contador de respuestas + audio).
5. **Transiciones entre espacios separados.** → Nada flota fuera de la tarjeta;
   la celebración continúa con la misma foto + el mismo contexto; el chat vacío
   retoma el fragmento. Discover → Match → Chat es un hilo, no tres páginas.

## Test de 30 segundos (verificado contra el código)

1. ¿Qué busco? Chips de intención + caption con estado. ✓
2. ¿Por qué apareció? Motivo humano sobre la foto en el primer segundo. ✓
3. ¿Qué tenemos en común? Señales en la franja interna. ✓
4. ¿Qué podría hacer? "Podrían ir a…" con rincón real. ✓
5. ¿Qué decirle? Corazones por fragmento + pista + punto de partida en el chat. ✓

## Ronda 8 (2026-09-22): Discover que se explica solo — sin abrir el cuaderno

Amenaza: si el usuario nunca abre el cuaderno, MELY parece fotos + botones.

Cambios (cero backend): el card revela UNA pieza de historia (la pregunta, no la
respuesta; la voz, no el audio) como nivel 3 tras motivo → afinidad → plan;
tocarla abre la profundidad. El motivo es hero (semibold blanco). El cuaderno
solo se ofrece si tiene contenido. Stamps y overlays sin glow neón (elevación
del sistema). Chat con una sola jerarquía: tarjeta inicial con 2 caminos, y el
atajo persistente de plan solo cuando ya hay conversación. Cuota: "N historias
hoy".

Decidido NO mostrar: bio completa en card (vive en el cuaderno), corazones en
el peek (el motivo es la única entrada; el peek promete, no decide), fanfarria
en el like común (sin fragmento no hay nada honesto que celebrar).

Deuda backend: expiración semanal real de intención, `fragment` persistido,
formato de distancia para fallback de motivo. Deuda frontend: validación física
en dispositivo.

Respuesta honesta: con el cuaderno cerrado para siempre, MELY sigue siendo
diferente — motivo + plan sugerido + peek visible sin entrar a nada. El
cuaderno es profundidad, ya no requisito.

## Ronda 7 (2026-09-22): los primeros 90 segundos — que MELY se explique sola

Simulación de usuario nuevo (sin conocer intención, fragmentos ni afinidad):

- 00:10 entiende el header ("Una conexión a la vez") pero la intención pide un
  acto de fe: los chips no dicen qué cambian. La caption ahora es honesta
  ("Queda guardada hasta que la cambies" — la expiración semanal real requiere
  backend y no se promete).
- 00:20 la primera persona comunica quién/intención/motivo en 1s, pero el
  motivo podía quedar vacío ("Seleccionada para vos hoy" = magia). Ahora hay
  cadena honesta: señal → ciudad → "Historia por descubrir".
- 00:40 la pista de fragmentos existía incluso sin fragmentos (enseñar lo
  imposible). Ahora solo aparece si hay algo a lo cual reaccionar.
- 01:00 el like común no confirma descubrimiento (aceptado: sin fragmento no
  hay nada honesto que decir; el overlay del fragmento sí lo hace).
- 01:10 el match sin contexto era Tinder ("les gustaron mutuamente" y dos
  botones). Ahora el motivo es obligatorio: fragmento → interés → señal de
  afinidad → misma búsqueda.
- 01:30 el chat vacío ya tenía punto de partida (ronda 3); el contexto viaja.
- Fricción: cuota "N para hoy" era críptica → "N historias hoy"; stamps en
  caps-neón → "Me gusta"/"Pasar" en voz humana (SUPER SPARK queda como marca).

Prueba de silencio: todo se entiende sin tooltips (intención por caption mínima
de 2 líneas, fragmentos por pista única, motivo por proximidad al nombre).
Prueba de memoria: los 3 comportamientos que quedan son reaccionar a algo
concreto, ver por qué conectamos y proponer un plan.

"Ah, ya entendí": el momento es el primer motivo sobre la foto ("café en
común") seguido del plan sugerido — ahí el swipe deja de ser el producto.
Mayor riesgo residual: si el usuario nunca abre el cuaderno, MELY parece fotos
con botones; la pista única y el contador del cuaderno son la única defensa, y
son de una sola oportunidad.

## Ronda 6 (2026-09-22): firma visual — gramática, no decoración

Hallazgo de auditoría: radios con sistema real (md/lg/pill + 20px burbujas y
28px modales, ambos justificados), H1 de 22px en 11 pantallas, iconografía
semántica consistente (close/arrow_back/verified/local_cafe/casino/shield/flag
sin duplicados). Lo roto era otro lado: 8 nombres de botón para 5 intenciones
(`default`≈`cherry`, `secondary` rosa vs `outline` con borde) y 51 gradientes
coral inline repetidos.

Gramática (misma intención = mismo lenguaje; el color lo pone la intención, el
radio el contexto): `primary` (gradiente coral = mover la historia),
`secondary` (borde = alternativa válida), `tertiary` (fantasma = contextual),
`destructive`, `special` (ticket dashed = identidad pasaporte), `link`.
`ui/button.tsx` es la única fuente; CTA grandes migrados a `primary`.

Gradientes que sobreviven (con función): legibilidad sobre fotos, CTA primario,
rings de avatar, temas de chat elegidos por el usuario. Eliminados: 4
burbujas same-color (= color plano disfrazado), superficies Store/stickers y 3
pulses decorativos (badge nav, cita a ciegas, ruleta). MELY se siente viva pero
tranquila.

Crítica honesta: el punto más Tinder que queda es el deck con drag físico y la
fila pasar/like/destacar — se conserva por usabilidad, pero el camino que se
enseña es el fragmento. Deuda: texto blanco sobre coral no llega a 4.5:1
(candidato `ink-on-coral`, ya usado en la celebración).

## Ronda 5 (2026-09-22): premium polish — criterio, no cantidad

Decisión marco: cada mejora refuerza INTENCIÓN, AFINIDAD, CONTEXTO,
DESCUBRIMIENTO, PLAN o CONEXIÓN. Lo que no aporta, no se toca.

Implementado (cero backend): fotos que nunca se rompen (placeholder + `onError`
que oculta, nunca ícono roto) en Discover/persona-del-día/chat; `lazy` +
`decoding=async` fuera del viewport; zonas de foto como botones reales con
aria-labels; targets táctiles ≥32px en fragmentos; prompts con `line-clamp-8` +
`break-words`; modal de match con ESC, `role=dialog`, scroll-lock y foco;
contraste: fuera `text-gray-400/500` en modo claro (→ `#5b6478`/`#a9b2c9` del
sistema) en inbox, placeholders, bandejas y campanita; grids de Likes a 3
columnas en desktop; emoji como iconos eliminados donde eran decoración.

Justificado y NO unificado (documentado, no ejecutado): `default` vs `cherry`
en ui/button son casi idénticos y los CTA grandes repiten el gradiente coral
inline — unificarlos cambia el look global y merece una pasada propia de
sistema de botones, no un apaño.

## Después de cuatro rondas: ¿qué hace MELY que una app genérica no hace?

Sin marketing, basado en código real:

1. **Declaro mi semana, no mis specs**: la intención temporal filtra el
   descubrimiento (`intentionId` → slugs reales de `/interests`).
2. **Cada persona trae su porqué**: afinidad determinista y explicada con datos
   del perfil, visible antes que la decisión.
3. **Reacciono a fragmentos, no a personas**: el like nace de un interés o una
   respuesta y ese contexto viaja hasta la nota del plan.
4. **Cada tarjeta trae un futuro**: plan sugerido con rincón verificado real o
   nada (nunca relleno).
5. **El match propone, no charla en el vacío**: celebración con contexto y CTA
   a plan con nota precargada; el chat vacío tiene punto de partida.
6. **La cita deja un objeto**: QR + check-in + sello souvenir en el pasaporte
   (`/dates/*`, `/me/stamps`). Ninguna genérica cierra el loop en el mundo real.
7. **El ritmo lo pone el ritual, no el casino**: cupo diario, persona del día,
   sin countdowns ni boosts. El límite se dice "Por hoy está bien".
