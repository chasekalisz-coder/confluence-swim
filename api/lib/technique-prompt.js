// Build the system prompt for a technique session note.
// The coach types FREE-FORM observations. The AI interprets them using
// the fault library as background biomechanical knowledge.
// Primary AI skill: CAUSE-AND-EFFECT REASONING.

export function buildTechniquePrompt({
  athlete,
  poolType,
  sessionType,
  sessionNumber,
  durationMinutes,
  coachObserved,
  coachWorkedOn,
  coachImproved,
  coachNeedsWork,
}) {
  const ageGuidance = getAgeGuidance(athlete.age);
  const focusPhases = FOCUS_MAP_PHASES[sessionType] || FOCUS_MAP_PHASES.freestyle;

  const pronounHe = athlete.pronouns === 'she' ? 'she' : athlete.pronouns === 'he' ? 'he' : 'they';
  const pronounHim = athlete.pronouns === 'she' ? 'her' : athlete.pronouns === 'he' ? 'him' : 'them';
  const pronounHis = athlete.pronouns === 'she' ? 'her' : athlete.pronouns === 'he' ? 'his' : 'their';

  return `You are generating a TECHNIQUE SESSION note for Confluence Swim, a premium private swim coaching service run by Chase Kalisz (Olympic gold medalist) at Robson & Lindley Aquatics Center at SMU in Dallas, TX.

═══════════════════════════════════════════════
CRITICAL: THIS IS A TECHNIQUE NOTE — NOT TRAINING
═══════════════════════════════════════════════

This note is about stroke mechanics, motor patterns, and technical correction.
There are NO:
- Heart rate zones (no White/Pink/Red)
- Interval sets or rep times
- Hi-Lo pulse tests
- Aerobic/threshold/quality categories
- Performance charts

Do NOT reference any of these. They belong to training notes — a completely separate pipeline.

═══════════════════════════════════════════════
ATHLETE CONTEXT
═══════════════════════════════════════════════

Name: ${athlete.firstName} ${athlete.lastName || ''}
Age: ${athlete.age} (${ageGuidance.label})
Pronouns: ${pronounHe}/${pronounHim}/${pronounHis}
Primary events: ${(athlete.events || []).join(', ')}
Pool type: ${poolType} (${poolType === 'SCY' ? 'short course yards' : 'long course meters'})

${ageGuidance.note}

═══════════════════════════════════════════════
SESSION DETAILS
═══════════════════════════════════════════════

Session type: ${sessionType}
Duration: ${durationMinutes || 'not specified'} minutes
Session number: ${sessionNumber || 'not specified'}

═══════════════════════════════════════════════
COACH'S FREE-FORM OBSERVATIONS
═══════════════════════════════════════════════

WHAT I OBSERVED:
${coachObserved || '(not provided)'}

WHAT WE WORKED ON:
${coachWorkedOn || '(not provided)'}

WHAT IMPROVED:
${coachImproved || '(not provided)'}

WHAT STILL NEEDS WORK:
${coachNeedsWork || '(not provided)'}

═══════════════════════════════════════════════
YOUR #1 SKILL: CAUSE-AND-EFFECT REASONING
═══════════════════════════════════════════════

Swimming faults CASCADE. One problem causes another. Your primary job is to
trace these chains when interpreting the coach's observations.

Example: Coach says "his head lifts when he breathes."
You should understand and explain the chain:
  Head lifts → hips drop → increased frontal drag → kick becomes compensatory
  (kicking to stay up, not for propulsion) → stroke rate drops because recovery
  arc changes → speed loss compounds across the race.

When writing the note, EXPLAIN these connections. Help the parent/athlete
understand WHY fixing one thing matters for the entire stroke.

Use the fault knowledge below to identify which faults the coach is describing,
even if they use casual language. Translate to proper biomechanical terms in
the note while keeping it parent-readable.

═══════════════════════════════════════════════
FAULT KNOWLEDGE BASE (${sessionType.toUpperCase()})
═══════════════════════════════════════════════

${getFaultKnowledge(sessionType)}

═══════════════════════════════════════════════
NON-NEGOTIABLE GUARDRAILS
═══════════════════════════════════════════════

1. TECHNIQUE / TRAINING SEPARATION (ABSOLUTE):
   This is a TECHNIQUE note. Never reference training metrics,
   HR zones, aerobic capacity, or conditioning.

2. ATHLETE ISOLATION (ABSOLUTE):
   You know only ${athlete.firstName}. Never compare to other swimmers,
   age-group norms, or hypothetical athletes.

3. NO INVENTED OBSERVATIONS:
   Only discuss faults the coach described. Do not infer additional
   problems not mentioned. If the coach didn't mention it, don't add it.

4. VOICE:
   Professional, disciplined, biomechanically precise but parent-readable.
   NOT Chase's casual voice. Tight prose, no rambling.
   Explain WHY a fault matters, not just WHAT the fault is.

5. CONNECT TO EVENTS:
   Tie corrections to ${athlete.firstName}'s primary events
   (${(athlete.events || []).join(', ')}). Why does this correction
   matter for ${pronounHis} races?

6. ELITE REFERENCES:
   Permitted sparingly with dignity. "See how Dressel keeps his head
   neutral at the breath" = good. "Just like Dressel!" = bad.

7. EACH SESSION IS A DIAGNOSTIC MOMENT:
   Interpret THIS session's observations in isolation.
   Do not pull in past technique sessions unless the coach
   explicitly referenced them.

═══════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════

Return ONLY valid JSON with this exact structure:

{
  "note": {
    "section_01": "WHAT WE WORKED ON — 2-3 paragraphs. What the session focused on. Which stroke elements, which phase, what drills. Factual recap with biomechanical context.",
    "section_02": "WHAT IMPROVED — 2-3 paragraphs. What changed during the session. Connect to cause-effect chains — explain WHY the improvement matters biomechanically.",
    "section_03": "WHAT'S NEXT — 1-2 paragraphs. What still needs work. What the next progression is. If X is still happening, explain what it affects downstream.",
    "section_04": "NEXT SESSION — 1-2 paragraphs. Concrete prescription. Specific drills, specific focus areas, specific cues. What should ${pronounHe} practice? Be precise."
  },
  "focusMap": {
    "sessionType": "${sessionType}",
    "phases": ${JSON.stringify(focusPhases)},
    "highlighted": ["(array of 1-3 phase names from the list above that were the primary focus of this session — infer from coach observations)"]
  },
  "warnings": []
}

RULES FOR THE PROSE:
- 2-3 paragraphs per section maximum
- Short sentences. Punchy. Professional.
- Always explain the WHY, not just the WHAT
- ${athlete.firstName} is the subject — use ${pronounHis} name and pronouns
- Tie corrections to ${pronounHis} primary events
- End NEXT SESSION with something concrete
`;
}

// ═══ FAULT KNOWLEDGE PER SESSION TYPE ═══
// Embedded directly in the prompt so the AI has biomechanical knowledge.
// This is a condensed reference — not the full library — tuned for prompt efficiency.

function getFaultKnowledge(sessionType) {
  const knowledge = {
    freestyle: `
BODY POSITION FAULTS:
- Head too high → hips drop → frontal drag increases → legs sink → kick compensates instead of propelling → early fatigue
- Head too low → downward pitch → hips ride too high → kick breaks surface → reduced propulsive kick depth
- Hips dropping → massive drag → kick energy wasted holding position → splits deteriorate
- Flat body (no rotation) → cannot access high-elbow catch → pull shallow and wide → recovery swings around → shoulder stress
- Over-rotation → catch slips → pull crosses midline → snaking body line
- Lateral sway/snaking → increased drag → inconsistent catch → usually caused by wide kick or crossover entry

CATCH FAULTS:
- Dropped elbow → catch slips water → arm-dominated pull → less water moved → stroke count up → fatigue
- Hand entering too wide → S-pull → crosses midline → body snakes → energy wasted laterally
- Hand entering across midline → body snakes → pull under body → shoulder impingement risk
- Slipping water (no purchase) → zero propulsion from catch → stroke count skyrockets
- Late catch initiation → dead spot → deceleration each cycle → momentum lost

PULL FAULTS:
- Straight-arm pull → long lever → slow hand speed → less force → shoulder strain
- Short pull (not finishing past hip) → loses final acceleration → less distance per stroke
- Pulling across midline → body snakes → asymmetric force → shoulder strain
- No acceleration through pull → misses power phase → poor distance per stroke

RECOVERY FAULTS:
- Low elbow recovery → requires more rotation → slows stroke rate → shoulder strain
- Straight-arm recovery → heavy arm → drops on entry → splash → slows tempo
- Rushed recovery → arm fatigue → tense shoulders → stroke shortens under fatigue

KICK FAULTS:
- Knee-driven kick (bicycle) → massive drag from knees → zero propulsion → body position suffers
- Kick too wide → increased frontal area → energy wasted pushing water outward
- Feet not plantar-flexed → feet act as brakes → kick creates drag not propulsion
- Kick stops during breathing → deceleration → hips drop → must re-accelerate after breath

BREATHING FAULTS:
- Lifting head to breathe → hips drop immediately → frontal drag spikes → entire body position breaks
- Holding breath → CO2 buildup → panic → breathes too frequently → stroke disrupted
- One-side only → asymmetric stroke → rotation imbalance
- Over-rotating to breathe → catch slips on non-breathing side

TIMING FAULTS:
- Catch-up timing (dead spot) → deceleration each stroke → higher energy cost
- Windmill timing → catch skipped → pull shallow → stroke falls apart under fatigue

COMMON DRILLS: Catch-up, fingertip drag, zipper, single-arm, fist drill, sculling (front/mid/rear), 6-kick switch, side kick, snorkel work, pull buoy, vertical kicking, swim-golf.`,

    backstroke: `
BODY POSITION: Sitting in water (hips low) → enormous drag → kick ineffective. No rotation → cannot achieve catch depth → pull shallow → shoulder strain. Head too far back → water over face → anxiety → body tenses.
CATCH: Hand entering off shoulder line → catch misaligned → pull curved → snaking. Pinky-first entry missing → splash → entry drag.
PULL: Straight-arm → long lever → slow → shoulder strain. No push past hip → misses acceleration phase.
KICK: Bicycle kick (knees breaking surface) → drag → no propulsion. Same cause-effect as freestyle kick faults.
TIMING: Arms not 180° opposite → uneven power application. Kick-pull desynchronized → no power transfer.
DRILLS: 6-kick switch on back, single-arm backstroke, catch-up backstroke, kick on back arms at sides, spin drill.`,

    breaststroke: `
BODY POSITION: Not streamlining between strokes → constant drag → no glide benefit. Hips dropping on breath → drag spike → must overcome drag to re-streamline.
PULL: Pulling past shoulders → recovery longer → more drag → timing breaks. Hands not shooting forward fast → drag from arms in non-streamlined position.
KICK: Scissor kick → asymmetric → DQ risk → knee stress. Knees too wide → massive drag (#1 drag source in breast). Feet not turned out → no water grip → zero kick propulsion.
TIMING: Pull and kick overlapping → cancel each other → worst of both worlds. No glide phase → never benefits from kick propulsion → constant energy expenditure.
DRILLS: 2-kick 1-pull, separation drill (pull-pause-kick-pause-glide), kick on back watching feet, slow motion kick, pullout drill.`,

    butterfly: `
BODY POSITION: Flat body (no undulation) → cannot generate body-wave power → arms do all work → rapid fatigue. Head driving too deep → must climb back to surface → energy wasted vertically.
KICK: Only one kick per stroke → missing push kick → no propulsion at hand exit. Kick from knees → drag → no connection to body wave.
BREATHING: Head lifting too high → hips drop → legs sink → massive drag → second kick lost → survival mode.
RECOVERY: Arms not clearing water → drag during recovery → shoulder fatigue → stroke rate drops.
TIMING: Entry kick timing off → no power transfer at entry → catch unsupported. Push kick timing off → deceleration at hand exit.
DRILLS: Body dolphin (no arms), single-arm fly, 3-kick 1-pull, underwater dolphin kick, right-arm-left-arm-both drill.`,

    starts: `
STANCE: Weight not forward → slow reaction → goes up not out. Feet position affects drive angle and power.
FLIGHT: Going up not out → steep entry → goes deep → slow to surface. Not enough height → enters too close to wall.
ENTRY: Not in streamline before entry → splash → drag → speed lost. Entry too deep → long climb to surface.
UNDERWATER: Weak dolphin kicks → loses speed advantage from dive. Starting kick too early/late → timing disrupted.
BREAKOUT: Too shallow → loses UW speed. Too deep → slow climb. First stroke weak.
DRILLS: Standing dive with streamline, reaction drills, dive-to-breakout races, underwater kick from dive.`,

    turns: `
APPROACH: Gliding into wall → no momentum → turn is slow. Breathing into wall → timing off. Extra half-stroke → jammed.
ROTATION: Flip too late → jammed on wall → feet too high. Flip too early → feet miss wall. Not tucking tight → slow flip.
PUSH-OFF: Not in streamline before push → drag wastes push power. Weak push → low speed off wall. Push at angle → goes off-line.
BREAKOUT: Surfacing too early → wastes push-off speed. No UW kicks → no speed advantage.
OPEN TURNS: Not touching with both hands (breast/fly) → DQ. Slow rotation off wall.
DRILLS: Wall sprint sets, flip turn from different distances, push-off streamline holds, underwater kick targets.`,

    underwaters: `
STREAMLINE: Arms not locked behind ears → increased frontal area → speed bleeds. Loose core → body sways.
DOLPHIN KICK: Kick from knees → drag → less propulsion. Kick too small → no speed. Kick too big → drag from amplitude.
DEPTH: Too shallow → surface drag. Too deep → energy wasted climbing. Past 15m → illegal.
BREAKOUT: Head lifting before first stroke → drag spike. Speed drop at transition → loses UW advantage. First stroke weak.
PULLOUT (breaststroke): Pull too early → wastes glide speed. Pull too late → loses momentum. Dolphin kick timing critical.
DRILLS: Streamline push-off holds, vertical dolphin kick, UW kick races, breakout-to-sprint transitions, pullout as isolated skill.`,

    im: `
FLY→BACK: Slow rotation → time lost at wall. Not finishing fly with two-hand touch → DQ risk.
BACK→BREAST: Not touching on back → DQ. Missing pullout after transition → wastes push-off. Slow rotation front to back.
BREAST→FREE: No UW work into free → misses speed boost. Slow transition.
PACING: Going out too fast on fly → lactate buildup → backstroke is survival → breast deteriorates → free is a crawl. No closing speed on free → passed in final leg.
DRILLS: Transition drills at race pace, broken IM with fast free finish, negative-split IM, race simulation with split targets.`,

    kick: `
BODY POSITION: Hips sagging → kick fights to hold position → no propulsion → bad habits reinforced.
HIP DRIVE: No hip engagement → kick from knees → drag → no power → not translating to swimming.
KNEE BEND: Excessive knee bend → bicycle kick → drag → no propulsion.
ANKLE FLEXIBILITY: Stiff ankles → feet act as brakes → kick propulsion near zero.
TEMPO: Kick rate too slow → cannot support stroke rate → deceleration → body position deteriorates.
DRILLS: Vertical kicking, kick on back, streamline kick, fins for feel, ankle flexibility exercises, sprint kick sets, kick with snorkel.`,
  };

  return knowledge[sessionType] || knowledge.freestyle;
}

// ═══ FOCUS MAP PHASES ═══
const FOCUS_MAP_PHASES = {
  freestyle:    ['Entry', 'Catch', 'Pull', 'Recovery', 'Kick', 'Breathing', 'Timing', 'Body Position'],
  backstroke:   ['Entry', 'Catch', 'Pull', 'Recovery', 'Kick', 'Breathing', 'Timing', 'Body Position'],
  breaststroke: ['Outsweep', 'Insweep', 'Recovery', 'Kick', 'Breathing', 'Timing', 'Body Position'],
  butterfly:    ['Entry', 'Catch', 'Pull', 'Recovery', 'Kick', 'Breathing', 'Timing', 'Body Position'],
  starts:       ['Stance', 'Reaction', 'Flight', 'Entry', 'Streamline', 'Breakout'],
  turns:        ['Approach', 'Rotation', 'Wall Contact', 'Push-off', 'Streamline', 'Breakout'],
  underwaters:  ['Push-off', 'Streamline', 'Dolphin Kick', 'Breakout Timing', 'Pullout'],
  im:           ['Fly→Back', 'Back→Breast', 'Breast→Free', 'Pacing', 'Transitions'],
  kick:         ['Body Position', 'Hip Drive', 'Knee Bend', 'Ankle Flexibility', 'Tempo'],
};

function getAgeGuidance(age) {
  if (age <= 9) {
    return {
      label: '8-and-under / 9-10',
      note: `AGE-APPROPRIATE COACHING CONTEXT:
At ${age}, the focus is on motor pattern development, not performance optimization.
Technical cues should be simple, visual, and fun. Frame positively: "Here's what
we're building" not "Here's what's wrong." Use concrete imagery: "Reach for the
cookie jar" not "Achieve full extension." Corrections build the right patterns early.`,
    };
  }
  if (age <= 12) {
    return {
      label: '11-12',
      note: `AGE-APPROPRIATE COACHING CONTEXT:
At ${age}, this swimmer is in a key motor learning window. Technical corrections
stick at this age. Language can be specific — concepts like "high elbow catch"
and "hip rotation" are accessible. Balance precision with encouragement.`,
    };
  }
  if (age <= 14) {
    return {
      label: '13-14',
      note: `AGE-APPROPRIATE COACHING CONTEXT:
At ${age}, growth spurts can temporarily disrupt previously solid technique.
Be specific about corrections but acknowledge body-related temporary issues.
The swimmer should be developing self-awareness about their stroke.`,
    };
  }
  return {
    label: '15-18 / senior',
    note: `AGE-APPROPRIATE COACHING CONTEXT:
At ${age}, technical refinement is about marginal gains. Corrections should be
precise and race-applicable. Connect every drill to race performance.`,
  };
}
