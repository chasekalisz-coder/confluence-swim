// The 9 Confluence Swim athletes.
// Seeded into Neon on first load if the table is empty.

export const ATHLETES = [
  {
    id: "ath_jon", first: "Jon", last: "Pomper", age: 12, dob: "June 4",
    gender: "M", pronouns: "he",
    showChampionshipCuts: true,
    events: ["100 Fly", "200 IM", "200 Fly", "200 Back", "200 Breast", "100 Back"],
    meetTimes: [
      { event: "50 Free SCY", time: "26.22" }, { event: "100 Free SCY", time: "57.14" },
      { event: "200 Free SCY", time: "2:00.88" }, { event: "500 Free SCY", time: "5:20.71" },
      { event: "1000 Free SCY", time: "11:04.99" }, { event: "1650 Free SCY", time: "18:07.49" },
      { event: "50 Back SCY", time: "30.61" }, { event: "100 Back SCY", time: "1:04.55" },
      { event: "200 Back SCY", time: "2:16.90" }, { event: "50 Breast SCY", time: "34.74" },
      { event: "100 Breast SCY", time: "1:14.47" }, { event: "200 Breast SCY", time: "2:35.92" },
      { event: "50 Fly SCY", time: "28.41" }, { event: "100 Fly SCY", time: "1:02.91" },
      { event: "200 Fly SCY", time: "2:16.46" }, { event: "100 IM SCY", time: "1:03.11" },
      { event: "200 IM SCY", time: "2:15.96" }, { event: "400 IM SCY", time: "4:50.04" },
      { event: "50 Free LCM", time: "30.11" }, { event: "100 Free LCM", time: "1:05.82" },
      { event: "200 Free LCM", time: "2:17.37" }, { event: "400 Free LCM", time: "4:44.41" },
      { event: "50 Back LCM", time: "35.08" }, { event: "100 Back LCM", time: "1:13.56" },
      { event: "200 Back LCM", time: "2:33.04" }, { event: "50 Breast LCM", time: "44.33" },
      { event: "100 Breast LCM", time: "1:27.28" }, { event: "200 Breast LCM", time: "3:17.57" },
      { event: "50 Fly LCM", time: "32.95" }, { event: "100 Fly LCM", time: "1:14.44" },
      { event: "200 Fly LCM", time: "2:42.69" }, { event: "200 IM LCM", time: "2:35.51" },
      { event: "400 IM LCM", time: "5:51.86" }
    ],

    // Championship Goals (Aug 4 target) — Chase-set goal times per event.
    // "Goal" column only (ceiling times not tracked here). Stored as array
    // of {event, time} to match the admin edit UI format and the shape
    // athlete-context.js consumes for AI prompts. FamilyProfile normalizes
    // to a map internally for lookups.
    goalTimes: [
      // SCY
      { event: "50 Free SCY",     time: "25.6" },
      { event: "100 Free SCY",    time: "55.8" },
      { event: "200 Free SCY",    time: "1:57.2" },
      { event: "500 Free SCY",    time: "5:13.4" },
      { event: "1000 Free SCY",   time: "10:43.9" },
      { event: "1650 Free SCY",   time: "17:42.9" },
      { event: "100 Back SCY",    time: "1:02.5" },
      { event: "200 Back SCY",    time: "2:12.9" },
      { event: "100 Breast SCY",  time: "1:12.7" },
      { event: "200 Breast SCY",  time: "2:33.2" },
      { event: "100 Fly SCY",     time: "1:00.9" },
      { event: "200 Fly SCY",     time: "2:11.4" },
      { event: "200 IM SCY",      time: "2:11.1" },
      { event: "400 IM SCY",      time: "4:42.8" },
      // LCM
      { event: "50 Free LCM",     time: "29.0" },
      { event: "100 Free LCM",    time: "1:03.3" },
      { event: "200 Free LCM",    time: "2:12.8" },
      { event: "400 Free LCM",    time: "4:36.8" },
      { event: "100 Back LCM",    time: "1:10.9" },
      { event: "200 Back LCM",    time: "2:28.4" },
      { event: "100 Breast LCM",  time: "1:24.8" },
      { event: "200 Breast LCM",  time: "3:11.5" },
      { event: "100 Fly LCM",     time: "1:11.3" },
      { event: "200 Fly LCM",     time: "2:35.8" },
      { event: "200 IM LCM",      time: "2:29.8" },
      { event: "400 IM LCM",      time: "5:39.8" },
    ],

    // ⚠️ PLACEHOLDER DATA — see PLACEHOLDERS.md
    // Mock upcoming meets for walkthrough. Replace with real schedule.
    upcomingMeets: [
      {
        name: "North Texas Sectionals",
        location: "SMU · Dallas, TX",
        startDate: "2026-05-01",
        endDate: "2026-05-03",
        entries: [
          { event: "100 Fly",    seed: "1:02.91" },
          { event: "200 IM",     seed: "2:15.96" },
          { event: "200 Fly",    seed: "2:16.46" },
          { event: "200 Back",   seed: "2:16.90" },
          { event: "100 Back",   seed: "1:04.55" },
          { event: "200 Breast", seed: "2:35.92" },
        ],
      },
      {
        name: "Speedo Summer Invitational",
        location: "Austin, TX",
        startDate: "2026-06-05",
        endDate: "2026-06-07",
        entries: [
          { event: "100 Fly",    seed: "1:14.44" },
          { event: "200 IM",     seed: "2:35.51" },
          { event: "200 Fly",    seed: "2:42.69" },
          { event: "100 Back",   seed: "1:13.56" },
          { event: "200 Back",   seed: "2:33.04" },
        ],
      },
      {
        name: "TAGs Long Course",
        location: "San Antonio, TX",
        startDate: "2026-07-24",
        endDate: "2026-07-28",
        entries: [
          { event: "100 Fly",  seed: "1:14.44" },
          { event: "200 IM",   seed: "2:35.51" },
          { event: "400 IM",   seed: "5:51.86" },
          { event: "200 Fly",  seed: "2:42.69" },
        ],
      },
    ],

    // ⚠️ PLACEHOLDER DATA — see PLACEHOLDERS.md
    // Mock past meets for walkthrough. Replace with real meet history.
    pastMeets: [
      {
        name: "TAGs Championships",
        location: "San Antonio, TX",
        startDate: "2026-03-05",
        endDate: "2026-03-08",
        results: [
          { event: "200 Free", round: "Finals",  time: "2:00.88", delta: -1.69, standard: "AAA", place: "12th", pb: true },
          { event: "200 Fly",  round: "Finals",  time: "2:16.46", delta: -3.12, standard: "AAA", place: "7th",  pb: true },
          { event: "100 IM",   round: "Finals",  time: "1:03.11", delta: -2.09, standard: "AAA", place: "13th", pb: true },
          { event: "500 Free", round: "",        time: "5:20.87", delta: 0.16,  standard: "AA",  place: "10th" },
          { event: "200 Breast", round: "Prelims", time: "2:38.47", delta: 2.55, standard: "AA",  place: "25th" },
          { event: "200 IM",   round: "Finals",  time: "2:16.47", delta: 0.51,  standard: "AAA", place: "13th" },
        ],
      },
      {
        name: "Dallas Mustangs Invitational",
        location: "SMU · Dallas, TX",
        startDate: "2026-01-30",
        endDate: "2026-02-01",
        results: [
          { event: "50 Free",   time: "26.22", delta: -0.24, standard: "AA",  place: "8th", pb: true },
          { event: "100 Free",  time: "57.14", delta: -0.87, standard: "AA",  place: "6th", pb: true },
          { event: "100 Back",  time: "1:04.55", delta: -0.33, standard: "AAA", place: "4th" },
        ],
      },
      {
        name: "Lakeside Winter Classic",
        location: "Frisco, TX",
        startDate: "2025-12-05",
        endDate: "2025-12-07",
        results: [
          { event: "200 IM",   time: "2:16.47", delta: -1.42, standard: "AAA", place: "3rd", pb: true },
          { event: "100 Fly",  time: "1:04.31", delta: 1.40,  standard: "AA",  place: "5th" },
        ],
      },
      {
        name: "North Texas Fall Championships",
        location: "Frisco, TX",
        startDate: "2025-10-24",
        endDate: "2025-10-26",
        results: [
          { event: "50 Fly",   time: "29.30", delta: -0.55, standard: "AA",  place: "4th", pb: true },
          { event: "100 Fly",  time: "1:05.71", delta: -0.89, standard: "AA",  place: "6th" },
          { event: "200 Fly",  time: "2:19.58", delta: -2.04, standard: "AAA", place: "2nd", pb: true },
        ],
      },
    ],

    // ⚠️ PLACEHOLDER DATA — see PLACEHOLDERS.md
    // Mock meet-history tuples to populate the Progression chart.
    // Each tuple: event + date + time (seconds). Oldest → newest.
    progression: [
      // 100 Fly SCY — showing steady drop over 2 seasons
      { event: "100 Fly SCY", date: "2024-11-15", time: "1:12.44" },
      { event: "100 Fly SCY", date: "2025-02-08", time: "1:09.87" },
      { event: "100 Fly SCY", date: "2025-05-22", time: "1:07.21" },
      { event: "100 Fly SCY", date: "2025-08-14", time: "1:06.08" },
      { event: "100 Fly SCY", date: "2025-11-07", time: "1:04.31" },
      { event: "100 Fly SCY", date: "2026-02-14", time: "1:03.55" },
      { event: "100 Fly SCY", date: "2026-03-07", time: "1:02.91" },
      // 200 IM SCY
      { event: "200 IM SCY", date: "2024-11-15", time: "2:31.44" },
      { event: "200 IM SCY", date: "2025-02-08", time: "2:26.77" },
      { event: "200 IM SCY", date: "2025-05-22", time: "2:22.91" },
      { event: "200 IM SCY", date: "2025-08-14", time: "2:20.18" },
      { event: "200 IM SCY", date: "2025-11-07", time: "2:17.89" },
      { event: "200 IM SCY", date: "2026-02-14", time: "2:16.47" },
      { event: "200 IM SCY", date: "2026-03-07", time: "2:15.96" },
      // 200 Fly SCY
      { event: "200 Fly SCY", date: "2024-11-15", time: "2:32.48" },
      { event: "200 Fly SCY", date: "2025-02-08", time: "2:27.11" },
      { event: "200 Fly SCY", date: "2025-05-22", time: "2:23.67" },
      { event: "200 Fly SCY", date: "2025-08-14", time: "2:20.93" },
      { event: "200 Fly SCY", date: "2025-10-25", time: "2:19.58" },
      { event: "200 Fly SCY", date: "2025-12-06", time: "2:18.44" },
      { event: "200 Fly SCY", date: "2026-03-07", time: "2:16.46" },
    ],

    // ⚠️ PLACEHOLDER DATA — see PLACEHOLDERS.md
    // Mock session notes to populate Session Notes feed for walkthrough.
    // Each mock has a distinct category so every filter tab has content.
    // Real DB sessions always take precedence; mocks never overwrite real data.
    mockSessions: [
      {
        id: 'aerobic_1', category: 'aerobic', date: '2026-04-15',
        data: {
          title: 'Aerobic base — pull, kick, swim rotation',
          summary: 'Long aerobic set of 8x200 free on 2:50, holding consistent pacing across the set. Followed with 4x100 IM kick at moderate effort.',
          totalYardage: 4500,
        },
      },
      {
        id: 'threshold_1', category: 'threshold', date: '2026-04-12',
        data: {
          title: 'Threshold broken swims',
          summary: '5x200 IM broken at the 100 with 10 seconds rest, holding target pace. Strong fly legs throughout.',
          totalYardage: 3200,
        },
      },
      {
        id: 'quality_1', category: 'quality', date: '2026-04-09',
        data: {
          title: 'Quality race-pace work',
          summary: '4x100 fly at 200 pace effort with full recovery. Clean splits, final rep fastest.',
          totalYardage: 2800,
        },
      },
      {
        id: 'sprint_1', category: 'sprint', date: '2026-04-07',
        data: {
          title: 'Sprint and power — 25s and underwaters',
          summary: 'Max effort 12x25 off blocks with full recovery. Underwater dolphin kick focus — averaged 9 kicks per wall.',
          totalYardage: 1800,
        },
      },
      {
        id: 'power_1', category: 'power', date: '2026-04-05',
        data: {
          title: 'Dryland power — plyometrics and core',
          summary: 'Box jumps, medicine ball slams, weighted pull-ups, and anti-rotation core work. Focus on explosiveness.',
        },
      },
      {
        id: 'active_rest_1', category: 'active_rest', date: '2026-04-14',
        data: {
          title: 'Active recovery — easy swim and mobility',
          summary: 'Easy 2000 free choice between strokes, finishing with foam rolling and shoulder mobility work.',
          totalYardage: 2000,
        },
      },
      {
        id: 'technique_1', category: 'technique', date: '2026-04-10',
        data: {
          title: 'Butterfly stroke technique — body position',
          summary: 'Worked on holding higher body position and reducing drag phase. Video review mid-session showed improved hip drive.',
        },
      },
      {
        id: 'meetprep_1', category: 'meetprep', date: '2026-04-20',
        data: {
          title: 'Meet prep — Sectionals race plan',
          summary: 'Event-by-event race plan for North Texas Sectionals. Reviewed splits targets, warm-up routine, and between-race recovery protocol.',
        },
      },
    ]
  },
  {
    id: "ath_lana", first: "Lana", last: "Pomper", age: 9, dob: "March 25",
    gender: "F", pronouns: "she",
    events: ["50 Free", "100 Free", "50 Fly", "100 Fly", "200 IM", "100 Back", "100 Breast"],
    meetTimes: [
      { event: "50 Free SCY", time: "38.44" }, { event: "100 Free SCY", time: "1:21.08" },
      { event: "200 Free SCY", time: "2:50.11" }, { event: "500 Free SCY", time: "7:24.07" },
      { event: "50 Back SCY", time: "43.76" }, { event: "100 Back SCY", time: "1:36.58" },
      { event: "50 Breast SCY", time: "52.93" }, { event: "100 Breast SCY", time: "1:51.58" },
      { event: "50 Fly SCY", time: "41.92" }, { event: "100 Fly SCY", time: "1:33.84" },
      { event: "100 IM SCY", time: "1:32.98" }, { event: "200 IM SCY", time: "3:12.11" },
      { event: "50 Free LCM", time: "46.00" }, { event: "100 Free LCM", time: "1:37.63" },
      { event: "200 Free LCM", time: "3:20.94" }, { event: "50 Back LCM", time: "53.29" },
      { event: "100 Back LCM", time: "1:51.08" }, { event: "50 Breast LCM", time: "1:08.03" },
      { event: "100 Breast LCM", time: "2:20.08" }, { event: "50 Fly LCM", time: "50.86" },
      { event: "100 Fly LCM", time: "1:55.04" }, { event: "200 IM LCM", time: "3:47.33" }
    ]
  },
  {
    id: "ath_ben", first: "Ben", last: "Pomper", age: 12, dob: "March",
    gender: "M", pronouns: "he",
    events: ["50 Free", "100 Free", "200 Free", "50 Fly", "100 Fly", "200 IM", "100 Back"],
    meetTimes: [
      { event: "50 Free SCY", time: "33.84" }, { event: "100 Free SCY", time: "1:12.78" },
      { event: "200 Free SCY", time: "2:28.13" }, { event: "500 Free SCY", time: "6:26.35" },
      { event: "50 Back SCY", time: "38.40" }, { event: "100 Back SCY", time: "1:21.23" },
      { event: "50 Breast SCY", time: "44.80" }, { event: "100 Breast SCY", time: "1:34.56" },
      { event: "50 Fly SCY", time: "34.93" }, { event: "100 Fly SCY", time: "1:20.39" },
      { event: "100 IM SCY", time: "1:19.45" }, { event: "200 IM SCY", time: "2:45.37" },
      { event: "50 Free LCM", time: "37.85" }, { event: "100 Free LCM", time: "1:21.97" },
      { event: "200 Free LCM", time: "2:47.88" }, { event: "400 Free LCM", time: "5:51.18" },
      { event: "50 Back LCM", time: "45.24" }, { event: "100 Back LCM", time: "1:35.19" },
      { event: "50 Breast LCM", time: "51.41" }, { event: "100 Breast LCM", time: "1:47.29" },
      { event: "50 Fly LCM", time: "41.28" }, { event: "200 IM LCM", time: "3:13.28" }
    ]
  },
  {
    id: "ath_kaden", first: "Kaden", last: "Sun", age: 10, dob: "April 4",
    gender: "M", pronouns: "he",
    events: ["50 Free", "100 Free", "50 Fly", "100 IM", "200 IM", "50 Breast", "100 Breast"],
    // Best times — updated April 2026 from Chase's Kaden_Goal_Time spreadsheet.
    meetTimes: [
      // SCY
      { event: "50 Free SCY", time: "30.48" }, { event: "100 Free SCY", time: "1:06.85" },
      { event: "200 Free SCY", time: "2:34.49" }, { event: "500 Free SCY", time: "6:24.30" },
      { event: "50 Back SCY", time: "35.67" }, { event: "100 Back SCY", time: "1:15.18" },
      { event: "50 Breast SCY", time: "37.60" }, { event: "100 Breast SCY", time: "1:24.34" },
      { event: "50 Fly SCY", time: "37.86" }, { event: "100 IM SCY", time: "1:13.76" },
      { event: "200 IM SCY", time: "2:40.08" },
      // LCM
      { event: "50 Free LCM", time: "35.52" }, { event: "100 Free LCM", time: "1:16.74" },
      { event: "200 Free LCM", time: "2:40.63" }, { event: "50 Back LCM", time: "59.18" },
      { event: "100 Back LCM", time: "1:29.04" }, { event: "50 Breast LCM", time: "42.01" },
      { event: "100 Breast LCM", time: "1:34.21" }, { event: "50 Fly LCM", time: "1:02.01" },
      { event: "200 IM LCM", time: "3:04.14" }
    ],
    // Goal times — Chase-set from the April 2026 goal-time spreadsheet.
    // Stored as array of {event, time} to match the admin edit UI format
    // and the shape athlete-context.js consumes for AI prompts.
    goalTimes: [
      // SCY
      { event: "50 Free SCY", time: "27.01" }, { event: "100 Free SCY", time: "59.20" },
      { event: "200 Free SCY", time: "2:07.00" }, { event: "500 Free SCY", time: "5:46.91" },
      { event: "50 Back SCY", time: "30.67" }, { event: "100 Back SCY", time: "1:05.00" },
      { event: "50 Breast SCY", time: "34.01" }, { event: "100 Breast SCY", time: "1:15.00" },
      { event: "50 Fly SCY", time: "28.29" }, { event: "100 IM SCY", time: "1:07.45" },
      { event: "200 IM SCY", time: "2:25.56" },
      // LCM
      { event: "50 Free LCM", time: "30.17" }, { event: "100 Free LCM", time: "1:04.85" },
      { event: "200 Free LCM", time: "2:20.68" }, { event: "50 Back LCM", time: "35.27" },
      { event: "100 Back LCM", time: "1:16.08" }, { event: "50 Breast LCM", time: "39.50" },
      { event: "100 Breast LCM", time: "1:24.60" }, { event: "50 Fly LCM", time: "31.32" },
      { event: "200 IM LCM", time: "2:40.60" }
    ]
  },
  {
    id: "ath_farris", first: "Farris", last: "", age: 9, dob: null,
    gender: "M", pronouns: "he",
    events: ["50 Free", "50 Fly", "50 Back", "50 Breast", "100 IM"],
    meetTimes: []
  },
  {
    id: "ath_hannah", first: "Hannah", last: "Montgomery", age: 12, dob: null,
    gender: "F", pronouns: "she",
    events: ["50 Free", "100 Free", "50 Fly", "100 IM", "100 Back", "50 Breast"],
    meetTimes: [
      { event: "50 Free SCY", time: "44.44" }, { event: "100 Free SCY", time: "1:36.74" },
      { event: "50 Back SCY", time: "53.05" }, { event: "100 Back SCY", time: "1:58.29" },
      { event: "50 Breast SCY", time: "55.19" }, { event: "100 Breast SCY", time: "2:02.95" },
      { event: "50 Fly SCY", time: "1:05.58" }, { event: "100 IM SCY", time: "1:52.75" },
      { event: "100 Free LCM", time: "2:15.47" }, { event: "100 Back LCM", time: "2:29.59" }
    ]
  },
  {
    id: "ath_grace", first: "Grace", last: "Montgomery", age: 12, dob: null,
    gender: "F", pronouns: "she",
    events: ["50 Free", "100 Free", "50 Fly", "100 IM", "100 Back", "50 Breast"],
    meetTimes: [
      { event: "50 Free SCY", time: "46.39" }, { event: "100 Free SCY", time: "1:43.32" },
      { event: "50 Back SCY", time: "54.61" }, { event: "100 Back SCY", time: "2:00.40" },
      { event: "50 Breast SCY", time: "1:01.40" }, { event: "100 Breast SCY", time: "2:14.74" },
      { event: "50 Fly SCY", time: "1:04.51" }, { event: "100 IM SCY", time: "1:59.35" },
      { event: "100 Free LCM", time: "2:00.69" }, { event: "100 Back LCM", time: "2:21.07" }
    ]
  },
  {
    id: "ath_marley", first: "Marley", last: "Taylor", age: 14, dob: "June",
    gender: "F", pronouns: "she",
    events: ["50 Free", "100 Free", "50 Fly", "100 Fly", "200 IM", "100 Back", "100 Breast"],
    meetTimes: [
      { event: "50 Free SCY", time: "25.37" }, { event: "100 Free SCY", time: "56.58" },
      { event: "200 Free SCY", time: "2:08.41" }, { event: "500 Free SCY", time: "5:55.89" },
      { event: "50 Back SCY", time: "29.79" }, { event: "100 Back SCY", time: "1:07.37" },
      { event: "200 Back SCY", time: "2:34.84" }, { event: "50 Breast SCY", time: "33.47" },
      { event: "100 Breast SCY", time: "1:12.47" }, { event: "200 Breast SCY", time: "2:44.97" },
      { event: "50 Fly SCY", time: "28.02" }, { event: "100 Fly SCY", time: "1:05.46" },
      { event: "100 IM SCY", time: "1:11.67" }, { event: "200 IM SCY", time: "2:26.00" },
      { event: "50 Free LCM", time: "29.81" }, { event: "100 Free LCM", time: "1:05.24" },
      { event: "200 Free LCM", time: "2:35.01" }, { event: "50 Back LCM", time: "38.77" },
      { event: "100 Back LCM", time: "1:27.63" }, { event: "50 Breast LCM", time: "37.88" },
      { event: "100 Breast LCM", time: "1:24.22" }, { event: "50 Fly LCM", time: "31.37" },
      { event: "100 Fly LCM", time: "1:18.44" }, { event: "200 IM LCM", time: "2:49.60" }
    ]
  },
  {
    id: "ath_liam", first: "Liam", last: "Aikey", age: 10, dob: "April 8",
    gender: "M", pronouns: "he",
    events: ["50 Free", "50 Breast", "50 Fly"],
    meetTimes: [
      { event: "50 Free SCY", time: "45.73" },
      { event: "50 Breast SCY", time: "53.63" },
      { event: "50 Fly SCY", time: "1:26.41" }
    ]
  }
]

export function fullName(a) {
  return a.last ? `${a.first} ${a.last}` : a.first
}

export function initials(a) {
  const f = a.first?.[0] || ''
  const l = a.last?.[0] || ''
  return (f + l).toUpperCase()
}

export function primaryEvents(a) {
  return a.events.slice(0, 3).join(' · ')
}
