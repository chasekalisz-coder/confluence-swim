// Progression demo fixture — Chase Kalisz's career LCM progression for
// 200 Fly, 200 IM, 400 IM (10 entries each, 2016–2024). Shown on the
// Progression section to non-Silver/non-Gold tiers as a "DEMO · Chase
// Kalisz" preview so families see what tracked progression looks like
// at the elite level.
//
// Source: api/data/ath_chase.json. Three events were chosen because
// they're Chase's career story (200 Fly was a warm-up event, 200 IM
// is where he medaled at Worlds, 400 IM is his Olympic-medal event).
// LCM only — international standard, the right course for an Olympic
// progression story.
//
// The shape matches what ProgressionChart consumes from
// athlete.progression: array of { event, time, date }. So passing this
// directly as the `data` prop just works.

export const PROGRESSION_DEMO_DATA = [
  {
    "event": "200 Fly LCM",
    "time": "1:55.82",
    "date": "2017-04-15"
  },
  {
    "event": "200 Fly LCM",
    "time": "1:55.94",
    "date": "2017-05-07"
  },
  {
    "event": "200 Fly LCM",
    "time": "1:54.79",
    "date": "2017-06-27"
  },
  {
    "event": "200 Fly LCM",
    "time": "1:55.60",
    "date": "2017-06-27"
  },
  {
    "event": "200 Fly LCM",
    "time": "1:55.63",
    "date": "2018-01-12"
  },
  {
    "event": "200 Fly LCM",
    "time": "1:55.78",
    "date": "2018-03-03"
  },
  {
    "event": "200 Fly LCM",
    "time": "1:55.72",
    "date": "2018-05-19"
  },
  {
    "event": "200 Fly LCM",
    "time": "1:55.42",
    "date": "2018-07-25"
  },
  {
    "event": "200 Fly LCM",
    "time": "1:56.03",
    "date": "2022-04-26"
  },
  {
    "event": "200 Fly LCM",
    "time": "1:55.97",
    "date": "2024-04-11"
  },
  {
    "event": "200 IM LCM",
    "time": "1:56.51",
    "date": "2017-07-01"
  },
  {
    "event": "200 IM LCM",
    "time": "1:55.88",
    "date": "2017-07-26"
  },
  {
    "event": "200 IM LCM",
    "time": "1:56.48",
    "date": "2017-07-26"
  },
  {
    "event": "200 IM LCM",
    "time": "1:55.56",
    "date": "2017-07-27"
  },
  {
    "event": "200 IM LCM",
    "time": "1:55.73",
    "date": "2018-07-29"
  },
  {
    "event": "200 IM LCM",
    "time": "1:55.40",
    "date": "2018-08-11"
  },
  {
    "event": "200 IM LCM",
    "time": "1:56.21",
    "date": "2022-04-30"
  },
  {
    "event": "200 IM LCM",
    "time": "1:56.76",
    "date": "2022-06-21"
  },
  {
    "event": "200 IM LCM",
    "time": "1:56.43",
    "date": "2022-06-22"
  },
  {
    "event": "200 IM LCM",
    "time": "1:56.52",
    "date": "2022-12-01"
  },
  {
    "event": "400 IM LCM",
    "time": "4:06.75",
    "date": "2016-08-06"
  },
  {
    "event": "400 IM LCM",
    "time": "4:08.12",
    "date": "2016-08-06"
  },
  {
    "event": "400 IM LCM",
    "time": "4:06.99",
    "date": "2017-06-29"
  },
  {
    "event": "400 IM LCM",
    "time": "4:05.90",
    "date": "2017-07-30"
  },
  {
    "event": "400 IM LCM",
    "time": "4:08.92",
    "date": "2018-03-02"
  },
  {
    "event": "400 IM LCM",
    "time": "4:08.25",
    "date": "2018-07-27"
  },
  {
    "event": "400 IM LCM",
    "time": "4:07.95",
    "date": "2018-08-09"
  },
  {
    "event": "400 IM LCM",
    "time": "4:09.09",
    "date": "2021-06-13"
  },
  {
    "event": "400 IM LCM",
    "time": "4:07.47",
    "date": "2022-06-18"
  },
  {
    "event": "400 IM LCM",
    "time": "4:08.22",
    "date": "2023-06-29"
  }
]


// ────────────────────────────────────────────────────────────
// Range / Specialty Bloom demo data
//
// Chase Kalisz's career best times per event, derived from the
// same source as PROGRESSION_DEMO_DATA. Used by the Range section
// for non-Gold tiers — feeds the SpecialtyBloom bestTimes prop
// so Skills/Bronze/Silver viewers see Chase's bloom (a fully
// developed flower spanning all five strokes) instead of their
// athlete's.
//
// CHASE_DEMO_AGE = 32 routes the bloom to the OPEN/Senior age
// bucket in the standards lookup, which is the right comparison
// for adult/post-college times.
// ────────────────────────────────────────────────────────────

export const CHASE_DEMO_AGE = 32
export const CHASE_DEMO_GENDER = 'M'
export const CHASE_DEMO_FIRST_NAME = 'Chase'

export const CHASE_BEST_TIMES = {
  "100 Back LCM": "56.08",
  "100 Back SCY": "48.74",
  "100 Breast LCM": "1:01.64",
  "100 Breast SCY": "52.31",
  "100 Fly LCM": "53.52",
  "100 Fly SCY": "47.21",
  "100 Free LCM": "50.05",
  "100 Free SCY": "45.10",
  "1000 Free SCY": "9:14.54",
  "1500 Free LCM": "15:25.52",
  "1650 Free SCY": "15:45.32",
  "200 Back LCM": "1:58.69",
  "200 Back SCY": "1:42.76",
  "200 Breast LCM": "2:09.90",
  "200 Breast SCY": "1:53.83",
  "200 Fly LCM": "1:54.79",
  "200 Fly SCY": "1:40.38",
  "200 Free LCM": "1:48.64",
  "200 Free SCY": "1:36.60",
  "200 IM LCM": "1:55.40",
  "200 IM SCY": "1:41.19",
  "400 Free LCM": "3:52.37",
  "400 IM LCM": "4:05.90",
  "400 IM SCY": "3:33.42",
  "50 Free LCM": "22.96",
  "50 Free SCY": "20.23",
  "500 Free SCY": "4:24.27",
  "800 Free LCM": "8:18.76",
}

// Demo athlete shape — passed as the `athlete` prop to SpecialtyBloom
// for non-Gold viewers. SpecialtyBloom only reads athlete.first from
// it (for tooltip text), but giving it a complete-looking object means
// future fields don't crash if the component starts reading more.
export const CHASE_DEMO_ATHLETE = {
  id: 'demo_chase',
  first: CHASE_DEMO_FIRST_NAME,
  last: 'Kalisz',
  age: CHASE_DEMO_AGE,
  gender: CHASE_DEMO_GENDER,
}
