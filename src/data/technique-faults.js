// ═══════════════════════════════════════════════════════════════
// TECHNIQUE FAULT LIBRARY — AI BACKGROUND KNOWLEDGE ONLY
// ═══════════════════════════════════════════════════════════════
//
// NEVER surfaced in the UI. No checkboxes, no chips, no pick-lists.
// Coach types free-form. AI uses this to:
//   1. Translate casual observations → biomechanical terms
//   2. Trace cause-and-effect chains
//   3. Suggest drills and progressions
//   4. Calibrate language by age group
//
// Embedded directly in the system prompt for the AI.

export const FOCUS_MAP_PHASES = {
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

export const SESSION_TYPES = [
  { id: 'freestyle', label: 'Freestyle' },
  { id: 'backstroke', label: 'Backstroke' },
  { id: 'breaststroke', label: 'Breaststroke' },
  { id: 'butterfly', label: 'Butterfly' },
  { id: 'im', label: 'IM' },
  { id: 'kick', label: 'Kick' },
  { id: 'turns', label: 'Turns' },
  { id: 'starts', label: 'Starts' },
  { id: 'underwaters', label: 'Underwaters / Breakouts / Finishes' },
];
