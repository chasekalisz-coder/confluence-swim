
// Build the system prompt for a technique session note.
// Accepts topicBlocks from the fault-chip UI.
// Primary AI skill: CAUSE-AND-EFFECT REASONING.

export function buildTechniquePrompt({
  athlete,
  poolType,
  sessionNumber,
  durationMinutes,
  topicBlocks,
}) {
  const ageGuidance = getAgeGuidance(athlete.age);

  const pronounHe = athlete.pronouns === 'she' ? 'she' : athlete.pronouns === 'he' ? 'he' : 'they';
  const pronounHim = athlete.pronouns === 'she' ? 'her' : athlete.pronouns === 'he' ? 'him' : 'them';
  const pronounHis = athlete.pronouns === 'she' ? 'her' : athlete.pronouns === 'he' ? 'his' : 'their';

  // Determine session types covered
  const sessionTypes = [...new Set(topicBlocks.map(tb => tb.topicId || tb.topicLabel))];

  // Build the technique topic blocks description
  const topicBlocksDesc = topicBlocks.map((tb, i) => {
    const faultsList = (tb.faults || []).map(f => `    - ${f}`).join('\n');
    return `TOPIC ${i + 1}: ${tb.topicLabel} — ${tb.categoryLabel}
  Faults observed:
${faultsList || '    (none selected)'}
  What improved: ${tb.whatImproved || 'not specified'}
  What needs work: ${tb.whatNeedsWork || 'not specified'}`;
  }).join('\n\n');

  // Get fault knowledge for the session types covered
  const knowledgeSections = sessionTypes.map(st => {
    const k = getFaultKnowledge(st.toLowerCase());
    return k ? `\n--- ${st.toUpperCase()} FAULT KNOWLEDGE ---\n${k}` : '';
  }).join('\n');

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

Duration: ${durationMinutes || 'not specified'} minutes
Session number: ${sessionNumber || 'not specified'}
Number of technique topics covered: ${topicBlocks.length}

═══════════════════════════════════════════════
TECHNIQUE OBSERVATIONS FROM COACH
═══════════════════════════════════════════════

${topicBlocksDesc}

═══════════════════════════════════════════════
YOUR #1 SKILL: CAUSE-AND-EFFECT REASONING
═══════════════════════════════════════════════

Swimming faults CASCADE. One problem causes another. Your primary job is to
trace these chains when interpreting the coach's selected faults.

Example: "Dropped elbow on entry" is not just an elbow problem. It causes:
  Catch slips water → pull is arm-dominated not forearm-dominated → less water
  moved per stroke → stroke count increases → earlier fatigue → splits die.

When writing the note, EXPLAIN these connections. Help the parent/athlete
understand WHY fixing one thing matters for the entire stroke.

Use the fault knowledge below to understand downstream effects of each
selected fault. The coach picked specific faults — trace their chains.

═══════════════════════════════════════════════
FAULT KNOWLEDGE BASE
═══════════════════════════════════════════════
${knowledgeSections}

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
   Only discuss faults the coach selected. Do not infer additional
   problems not checked. If the coach didn't select it, don't add it.

4. NO COACH REFERENCES:
   NEVER say "Coach Chase", "the coach noted", "the coach observed",
   or any third-person coach reference. Write in first person ("I noticed",
   "We worked on") or direct observation ("His elbow dropped").
   The coach is the AUTHOR, not a character in the note.

5. VOICE:
   Professional, disciplined, biomechanically precise but parent-readable.
   CONCISE. Each section should be 1-2 short paragraphs, 3-4 sentences each.
   Every sentence must contain a specific observation or biomechanical fact.
   Cut anything that doesn't add new information. No rambling, no filler.
   Explain WHY a fault matters, not just WHAT the fault is.

6. CONNECT TO EVENTS:
   Tie corrections to ${athlete.firstName}'s primary events
   (${(athlete.events || []).join(', ')}). Why does this correction
   matter for ${pronounHis} races?

7. ELITE REFERENCES:
   Permitted sparingly with dignity. "See how Dressel keeps his head
   neutral at the breath" = good. "Just like Dressel!" = bad.

═══════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════

Return ONLY valid JSON with this exact structure:

{
  "note": {
    "section_01": "WHAT WE WORKED ON — 1-2 paragraphs. Cover each topic/fault area the coach selected. Be specific about drills, cues, and focus. Reference the specific faults by name. Trace cause-effect chains.",
    "section_02": "WHAT IMPROVED — 1-2 paragraphs. Focus on the 'what improved' notes. Describe what the correction looked like in practice. Connect to biomechanics — why does this improvement matter?",
    "section_03": "WHAT'S NEXT — 1-2 paragraphs. Based on 'what needs work' notes, describe what ${pronounHe} should focus on. If X is still happening, explain what it affects downstream."
  },
  "topicSummary": [
    {
      "topic": "Freestyle",
      "category": "Catch",
      "faultsObserved": ["Dropped elbow on entry", "Hand entering too wide"],
      "improved": "brief summary of what improved",
      "needsWork": "brief summary of what still needs work"
    }
  ],
  "warnings": []
}

RULES FOR THE PROSE:
- Reference specific faults by name, not vaguely
- 1-2 paragraphs per section, 3-4 sentences each. Cut filler ruthlessly.
- Short sentences. Punchy. Professional.
- Always explain the WHY, not just the WHAT
- ${athlete.firstName} is the subject — use ${pronounHis} name and pronouns
- Tie corrections to ${pronounHis} primary events
- NEVER say "Coach Chase", "the coach", or any third-person coach reference
- 3 sections only. Do NOT include a 4th section.
`;
}

// ═══ FAULT KNOWLEDGE PER SESSION TYPE ═══
function getFaultKnowledge(sessionType) {
  const knowledge = {
    freestyle: `
BODY POSITION FAULTS:
- Head too high → hips drop → frontal drag increases → legs sink → kick compensates → early fatigue
- Hips dropping → massive drag → kick energy wasted holding position → splits deteriorate
- Flat body (no rotation) → cannot access high-elbow catch → pull shallow and wide → shoulder stress
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

COMMON DRILLS: Catch-up, fingertip drag, zipper, single-arm, fist drill, sculling, 6-kick switch, side kick, snorkel work, pull buoy, vertical kicking, swim-golf.`,

    backstroke: `
BODY POSITION: Sitting in water (hips low) → enormous drag → kick ineffective. No rotation → cannot achieve catch depth → pull shallow → shoulder strain.
CATCH: Hand entering off shoulder line → catch misaligned → pull curved → snaking.
PULL: Straight-arm → long lever → slow → shoulder strain. No push past hip → misses acceleration phase.
KICK: Bicycle kick (knees breaking surface) → drag → no propulsion.
TIMING: Arms not 180° opposite → uneven power application. Kick-pull desynchronized.
DRILLS: 6-kick switch on back, single-arm backstroke, kick on back arms at sides, spin drill.`,

    breaststroke: `
BODY POSITION: Not streamlining between strokes → constant drag → no glide benefit. Hips dropping on breath → drag spike.
PULL: Pulling past shoulders → recovery longer → more drag. Hands not shooting forward fast → drag from arms.
KICK: Scissor kick → asymmetric → DQ risk. Knees too wide → massive drag (#1 drag source in breast). Feet not turned out → no water grip → zero kick propulsion.
TIMING: Pull and kick overlapping → cancel each other. No glide phase → never benefits from kick propulsion.
DRILLS: 2-kick 1-pull, separation drill, kick on back watching feet, pullout drill.`,

    butterfly: `
BODY POSITION: Flat body (no undulation) → cannot generate body-wave power → arms do all work → rapid fatigue. Head driving too deep → must climb back → energy wasted.
KICK: Only one kick per stroke → missing push kick → no propulsion at hand exit. Kick from knees → drag → no connection to body wave.
BREATHING: Head lifting too high → hips drop → legs sink → massive drag → survival mode.
RECOVERY: Arms not clearing water → drag during recovery → shoulder fatigue.
TIMING: Entry kick timing off → no power transfer at entry. Push kick timing off → deceleration at hand exit.
DRILLS: Body dolphin (no arms), single-arm fly, 3-kick 1-pull, underwater dolphin kick.`,

    starts: `
STANCE: Weight not forward → slow reaction → goes up not out.
FLIGHT: Going up not out → steep entry → goes deep → slow to surface.
ENTRY: Not in streamline before entry → splash → drag → speed lost.
UNDERWATER: Weak dolphin kicks → loses speed advantage from dive.
BREAKOUT: Too shallow → loses UW speed. Too deep → slow climb.
DRILLS: Standing dive with streamline, reaction drills, dive-to-breakout races.`,

    turns: `
APPROACH: Gliding into wall → no momentum → turn is slow. Breathing into wall → timing off.
ROTATION: Flip too late → jammed on wall → feet too high. Not tucking tight → slow flip.
PUSH-OFF: Not in streamline before push → drag wastes push power. Weak push → low speed off wall.
BREAKOUT: Surfacing too early → wastes push-off speed. No UW kicks → no speed advantage.
OPEN TURNS: Not touching with both hands (breast/fly) → DQ.
DRILLS: Wall sprint sets, flip turn from different distances, push-off streamline holds.`,

    underwaters: `
STREAMLINE: Arms not locked behind ears → increased frontal area → speed bleeds.
DOLPHIN KICK: Kick from knees → drag → less propulsion. Kick too small → no speed.
BREAKOUT: Head lifting before first stroke → drag spike. Speed drop at transition.
PULLOUT (breaststroke): Pull too early → wastes glide speed.
DRILLS: Streamline push-off holds, vertical dolphin kick, UW kick races, breakout-to-sprint transitions.`,

    im: `
FLY→BACK: Slow rotation → time lost at wall.
BACK→BREAST: Missing pullout after transition → wastes push-off.
BREAST→FREE: No UW work into free → misses speed boost.
PACING: Going out too fast on fly → lactate buildup → everything deteriorates. No closing speed on free.
DRILLS: Transition drills at race pace, broken IM, negative-split IM.`,
  };

  // Try direct match, then partial match for "IM Transitions" → "im", etc.
  const key = sessionType.toLowerCase().replace(/\s+/g, '_');
  if (knowledge[key]) return knowledge[key];
  // Try matching first word
  const firstWord = key.split('_')[0];
  if (knowledge[firstWord]) return knowledge[firstWord];
  // Default to freestyle knowledge as fallback
  return knowledge.freestyle;
}

function getAgeGuidance(age) {
  if (age <= 9) {
    return {
      label: '8-and-under / 9-10',
      note: `AGE-APPROPRIATE COACHING CONTEXT:
At ${age}, the focus is on motor pattern development, not performance optimization.
Technical cues should be simple, visual, and fun. Frame positively: "Here's what
we're building" not "Here's what's wrong." Use concrete imagery: "Reach for the
cookie jar" not "Achieve full extension."`,
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
