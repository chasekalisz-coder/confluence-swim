import { useState, useMemo } from 'react'
import { ELITE_SPLITS, RACE_INSIGHTS, DANGER_SPLITS } from '../data/elite-splits.js'

const COURSE_FULL = { scy: 'Short Course Yards', lcm: 'Long Course Meters', scm: 'Short Course Meters' }

function parseTime(s) {
  if (!s) return null
  s = s.trim().replace(/[^\d:.]/g, '')
  if (s.includes(':')) { const p = s.split(':'); return parseFloat(p[0]) * 60 + parseFloat(p[1]) }
  return parseFloat(s) || null
}

function fmtTime(s) {
  if (s >= 60) { const m = Math.floor(s / 60), sc = (s % 60).toFixed(2).padStart(5, '0'); return `${m}:${sc}` }
  return s.toFixed(2)
}

function fmtPace(s) {
  if (s >= 60) { const m = Math.floor(s / 60), sc = (s % 60).toFixed(1).padStart(4, '0'); return `${m}:${sc}` }
  return s.toFixed(1)
}

export default function RacePaceCalculator() {
  const [course, setCourse] = useState('scy')
  const [gender, setGender] = useState('men')
  const [event, setEvent] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [result, setResult] = useState(null)

  const events = useMemo(() => Object.keys(ELITE_SPLITS[course]?.[gender] || {}), [course, gender])

  const generate = () => {
    const totalSec = parseTime(`${minutes || '0'}:${seconds || '0'}`)
    if (!event || !totalSec || totalSec <= 0) return
    const pcts = ELITE_SPLITS[course]?.[gender]?.[event]
    if (!pcts) return
    setResult({ event, course, gender, totalSec, pcts })
  }

  const resetEvent = () => { setEvent(''); setResult(null) }

  const btn = (active, onClick, label) => (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px', borderRadius: 8, border: '1px solid',
        cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
        background: active ? 'var(--v2-gold)' : 'transparent',
        borderColor: active ? 'var(--v2-gold)' : 'rgba(148,163,184,0.2)',
        color: active ? '#000' : 'var(--text-primary)',
      }}
    >{label}</button>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 0 40px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--v2-gold)', fontWeight: 500, marginBottom: 8 }}>TOOL</div>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>Race Pace Calculator</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          Target race splits modeled from elite performance data across NCAA and World Championship finals.
        </p>
        <div style={{ marginTop: 10, display: 'inline-block', background: 'rgba(0,186,230,0.08)', border: '1px solid rgba(0,186,230,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#00bae6' }}>
          50+ elite performances per event · 3 courses
        </div>
      </div>

      {/* Course */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>COURSE</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['scy','lcm','scm'].map(c => btn(course === c, () => { setCourse(c); resetEvent() }, c.toUpperCase()))}
        </div>
      </div>

      {/* Gender */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>GENDER</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {btn(gender === 'men', () => { setGender('men'); resetEvent() }, 'Men')}
          {btn(gender === 'women', () => { setGender('women'); resetEvent() }, 'Women')}
        </div>
      </div>

      {/* Event */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>EVENT</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {events.map(e => btn(event === e, () => { setEvent(e); setResult(null) }, e))}
        </div>
      </div>

      {/* Goal time */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>GOAL TIME</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(8,12,22,0.9)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, padding: '0 4px' }}>
            <input
              type="text" placeholder="M" maxLength={2} value={minutes}
              onChange={e => setMinutes(e.target.value.replace(/\D/g, ''))}
              style={{ width: 48, padding: '14px 8px', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 20, fontWeight: 600, fontFamily: 'monospace', letterSpacing: 2, outline: 'none', textAlign: 'center' }}
            />
            <span style={{ fontSize: 22, fontWeight: 700, color: '#334155', fontFamily: 'monospace' }}>:</span>
            <input
              type="text" placeholder="SS.00" maxLength={5} value={seconds}
              onChange={e => setSeconds(e.target.value.replace(/[^\d.]/g, ''))}
              style={{ flex: 1, padding: '14px 8px', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 20, fontWeight: 600, fontFamily: 'monospace', letterSpacing: 2, outline: 'none' }}
            />
          </div>
          <button
            onClick={generate}
            disabled={!event || (!minutes && !seconds)}
            style={{
              padding: '14px 28px', borderRadius: 8, border: 'none', cursor: event && (minutes || seconds) ? 'pointer' : 'not-allowed',
              background: event && (minutes || seconds) ? 'var(--v2-gold)' : 'rgba(212,168,83,0.3)',
              color: event && (minutes || seconds) ? '#000' : 'rgba(212,168,83,0.5)',
              fontSize: 15, fontWeight: 600, transition: 'all 0.15s',
            }}
          >Generate</button>
        </div>
      </div>

      {/* Results */}
      {result && <Results result={result} />}
    </div>
  )
}

function Results({ result }) {
  const { event, course, gender, totalSec, pcts } = result

  const splitSets = []
  const unitLabels = { _25s: '25', _50s: '50', _100s: '100', _200s: '200', _500s: '500' }

  for (const [key, arr] of Object.entries(pcts)) {
    const unit = unitLabels[key]
    const vals = arr.map(p => p * totalSec / 100)
    const avg = totalSec / vals.length
    const minP = Math.min(...arr), maxP = Math.max(...arr)
    splitSets.push({ key, unit, vals, arr, avg, minP, maxP })
  }

  const insight = RACE_INSIGHTS[event]
  const danger = DANGER_SPLITS[event]

  // Practice paces
  const dist = parseInt(event)
  let p50 = null, p100 = null
  if (dist >= 100) {
    if (event.includes('1650')) { p50 = totalSec / 33; p100 = totalSec / 16.5 }
    else if (event.includes('1500')) { p50 = totalSec / 30; p100 = totalSec / 15 }
    else if (event.includes('800')) { p50 = totalSec / 16; p100 = totalSec / 8 }
    else { p50 = totalSec / (dist / 50); p100 = totalSec / (dist / 100) }
  }

  return (
    <div style={{ background: 'rgba(12,18,30,0.6)', border: '1px solid rgba(148,163,184,0.08)', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{event}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{COURSE_FULL[course]} · {result.gender === 'men' ? 'Men' : 'Women'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#00bae6', fontFamily: 'monospace' }}>{fmtTime(totalSec)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>GOAL TIME</div>
        </div>
      </div>

      {splitSets.map(({ key, unit, vals, arr, avg, minP, maxP }) => {
        const twoRows = vals.length > 10
        const half = twoRows ? Math.ceil(vals.length / 2) : vals.length
        const barColor = (p, idx) => {
          if (idx === 0) return '#00bae6'
          if (idx === vals.length - 1) return '#00e68a'
          const ratio = idx / (vals.length - 1)
          return `rgba(${Math.round(180 + ratio * 75)},${Math.round(210 - ratio * 50)},${Math.round(240 - ratio * 120)},0.85)`
        }

        const range = maxP - minP
        const safeRange = range < 0.01 ? 1 : range
        const minH = 20
        const span = 85
        const avgPct = arr.reduce((s, p) => s + p, 0) / arr.length
        const avgH = range < 0.01 ? minH + span/2 : minH + ((avgPct - minP) / safeRange) * span

        const renderBars = (slice, startIdx) => (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: avgH + 'px', borderTop: '2px dashed rgba(0,186,230,0.45)', zIndex: 2, pointerEvents: 'none' }}>
              <span style={{ position: 'absolute', right: 0, top: -16, fontSize: 9, color: 'rgba(0,186,230,0.7)', fontWeight: 600, fontFamily: 'monospace' }}>AVG</span>
            </div>
            {slice.map((v, i) => {
              const idx = startIdx + i
              const p = arr[idx]
              const h = range < 0.01 ? minH + span/2 : minH + ((p - minP) / safeRange) * span
              const col = barColor(p, idx)
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{fmtTime(v)}</span>
                  <div style={{ width: '100%', height: h, background: col, borderRadius: '3px 3px 0 0', minWidth: 20 }} />
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{unit}#{idx + 1}</span>
                </div>
              )
            })}
          </div>
        )

        return (
          <div key={key} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 12 }}>TARGET SPLITS — PER {unit}</div>
            {renderBars(vals.slice(0, half), 0)}
            {twoRows && <div style={{ marginTop: 16 }}>{renderBars(vals.slice(half), half)}</div>}
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
              AVG {fmtTime(avg)}/{unit}
            </div>
            {vals.length >= 2 && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,186,230,0.06)', border: '1px solid rgba(0,186,230,0.12)', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,186,230,0.15)', border: '1px solid rgba(0,186,230,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#00bae6', flexShrink: 0 }}>
                  {(avg - vals[0]).toFixed(1)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Go-Out Speed</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>First {unit} is {Math.abs(avg - vals[0]).toFixed(1)}s faster than average {unit} pace</div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {danger && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,71,87,0.06)', border: '1px solid rgba(255,71,87,0.15)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,71,87,0.15)', border: '1px solid rgba(255,71,87,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#ff4757', flexShrink: 0 }}>!</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Critical Split</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Split #{danger} is where the race separates. Hold here and the back half takes care of itself.</div>
          </div>
        </div>
      )}

      {(p50 || p100) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.06em', color: '#a78bfa', marginBottom: 12 }}>PRACTICE PACE</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[['Avg /50', p50], ['Avg /100', p100]].filter(([, v]) => v).map(([label, val]) => (
              <div key={label} style={{ flex: 1, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#a78bfa', fontFamily: 'monospace' }}>{fmtPace(val)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insight && (
        <div style={{ background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.08)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>RACE INTELLIGENCE</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{insight}</div>
        </div>
      )}
    </div>
  )
}
