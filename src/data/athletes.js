// The 9 Confluence Swim athletes.
// Seeded into Supabase on first load if the table is empty.

export const ATHLETES = [
  {
    id: "ath_jon", first: "Jon", last: "Pomper", age: 12, dob: "June 4",
    gender: "M", pronouns: "he",
    showChampionshipCuts: true,
    events: ["100 Fly", "200 IM", "200 Fly", "200 Back", "200 Breast", "100 Back"],
    meetTimes: [
      { event: "50 Free SCY", time: "26.22" }, { event: "100 Free SCY", time: "57.14" },
      { event: "200 Free SCY", time: "2:00.88" }, { event: "500 Free SCY", time: "5:20.71" },
      { event: "1000 Free SCY", time: "10:57.49" }, { event: "1650 Free SCY", time: "18:07.89" },
      { event: "50 Back SCY", time: "30.75" }, { event: "100 Back SCY", time: "1:04.55" },
      { event: "200 Back SCY", time: "2:16.90" }, { event: "50 Breast SCY", time: "35.35" },
      { event: "100 Breast SCY", time: "1:19.22" }, { event: "200 Breast SCY", time: "2:35.92" },
      { event: "50 Fly SCY", time: "29.30" }, { event: "100 Fly SCY", time: "1:02.91" },
      { event: "200 Fly SCY", time: "2:16.46" }, { event: "100 IM SCY", time: "1:03.11" },
      { event: "200 IM SCY", time: "2:15.96" }, { event: "400 IM SCY", time: "5:12.36" },
      { event: "50 Free LCM", time: "30.11" }, { event: "100 Free LCM", time: "1:05.82" },
      { event: "200 Free LCM", time: "2:17.37" }, { event: "400 Free LCM", time: "4:44.41" },
      { event: "50 Back LCM", time: "35.08" }, { event: "100 Back LCM", time: "1:13.56" },
      { event: "200 Back LCM", time: "2:33.04" }, { event: "50 Breast LCM", time: "42.00" },
      { event: "100 Breast LCM", time: "1:27.28" }, { event: "200 Breast LCM", time: "3:17.57" },
      { event: "50 Fly LCM", time: "32.95" }, { event: "100 Fly LCM", time: "1:14.44" },
      { event: "200 Fly LCM", time: "2:42.69" }, { event: "200 IM LCM", time: "2:35.51" },
      { event: "400 IM LCM", time: "5:51.86" }
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
    meetTimes: [
      { event: "50 Free SCY", time: "30.91" }, { event: "100 Free SCY", time: "1:07.76" },
      { event: "200 Free SCY", time: "2:34.49" }, { event: "50 Back SCY", time: "38.48" },
      { event: "100 Back SCY", time: "1:24.18" }, { event: "50 Breast SCY", time: "37.60" },
      { event: "100 Breast SCY", time: "1:25.31" }, { event: "50 Fly SCY", time: "39.38" },
      { event: "100 IM SCY", time: "1:13.76" }, { event: "200 IM SCY", time: "2:41.38" },
      { event: "50 Free LCM", time: "36.44" }, { event: "100 Free LCM", time: "1:20.18" },
      { event: "200 Free LCM", time: "2:54.25" }, { event: "50 Back LCM", time: "59.18" },
      { event: "50 Breast LCM", time: "46.16" }, { event: "100 Breast LCM", time: "1:46.25" },
      { event: "50 Fly LCM", time: "1:02.01" }
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
