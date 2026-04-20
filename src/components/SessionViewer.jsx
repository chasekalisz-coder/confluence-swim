

import { fullName } from '../data/athletes.js'

// The Confluence Swim logo as a tiny placeholder — the real base64 logo is too large
// for a React component. We use a text-based header instead that matches the design.

const SECTION_TITLES_TRAINING = {
  section_01: 'WHAT WE DID TODAY',
  section_02: 'THE BREAKDOWN',
  section_03: 'WHAT IT MEANS',
  section_04: "WHAT WE'RE BUILDING TOWARD",
  section_05: 'NEXT SESSION',
}

const SECTION_TITLES_TECHNIQUE = {
  section_01: 'WHAT WE WORKED ON',
  section_02: 'WHAT IMPROVED',
  section_03: "WHAT'S NEXT",
}

const NOTE_TYPE_LABELS = {
  training: 'Training',
  meetprep: 'Meet Prep',
  technique: 'Technique',
  workout: 'Workout',
}

const ZONE_COLORS = {
  white: '#94a3b8',
  pink: '#fb7185',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7',
}

function getSectionTitles(noteType) {
  if (noteType === 'technique') return SECTION_TITLES_TECHNIQUE
  return SECTION_TITLES_TRAINING
}

export default function SessionViewer({ session, athlete, onBack }) {
  if (!session || !session.data) {
    return (
      <div className="page">
        <button className="back-link" onClick={onBack}>← Back to {fullName(athlete)}</button>
        <p className="muted">Session data not available.</p>
      </div>
    )
  }

  const data = session.data
  const note = data.note || {}
  const noteType = data.noteType || (session.category === 'technique' ? 'technique' : session.category === 'meet_prep' ? 'meetprep' : 'training')
  const poolType = data.poolType || ''
  const typeLabel = NOTE_TYPE_LABELS[noteType] || 'Session'

  // Set PDF title
  const name = fullName(athlete)
  if (name) {
    const parts = name.split(' ')
    const f = parts[0] || ''
    const l = parts.slice(1).join(' ') || ''
    const now = new Date()
    document.title = f.charAt(0) + '.' + l + ' ' + String(now.getMonth()+1).padStart(2,'0') + '/' + String(now.getDate()).padStart(2,'0') + '/' + now.getFullYear()
  }

  return (
    <div className="page">
      <button className="back-link" onClick={onBack}>← Back to {fullName(athlete)}</button>

      <div className="session-viewer-actions">
        <button className="btn btn-outline" onClick={() => window.print()}>Print / Save PDF</button>
      </div>

      <div className="session-viewer-note" id="printable-note">
        {/* Header */}
        <div className="sv-header-row">
          <div className="sv-logo-text">Confluence Swim</div>
          <div className="sv-meta-col">
            <div className="sv-meta-date">{session.date}</div>
            <div className="sv-meta-type">{typeLabel} · {poolType}</div>
            <div className="sv-meta-facility">Robson & Lindley · SMU</div>
          </div>
        </div>

        {/* Athlete */}
        <div className="sv-athlete">
          <div className="sv-athlete-label">Athlete</div>
          <h1 className="sv-athlete-name">{fullName(athlete)}</h1>
          <div className="sv-gold-rule" />
          <div className="sv-meta-tags">
            {typeLabel}<span className="sv-sep">·</span>{poolType}<span className="sv-sep">·</span>{session.date}
          </div>
        </div>

        {/* Set Overview (training only) */}
        {noteType === 'training' && data.setOverview && (
          <div className="sv-set-overview">
            <div className="sv-set-overview-label">Session Overview</div>
            <pre className="sv-set-overview-text">{data.setOverview}</pre>
          </div>
        )}

        {/* Note content by type */}
        {noteType === 'meetprep' ? (
          <MeetPrepNote note={note} />
        ) : noteType === 'workout' ? (
          <WorkoutNote note={note} />
        ) : (
          <StandardNote note={note} sectionTitles={getSectionTitles(noteType)} />
        )}

        {/* Training charts */}
        {noteType === 'training' && <TrainingCharts data={data} />}

        {/* Technique focus areas */}
        {noteType === 'technique' && data.topicSummary && (
          <TechniqueTopics topics={data.topicSummary} />
        )}

        {/* Video references */}
        <VideoReferences videos={data.videoReferences} />

        <div className="sv-footer">
          <span>confluencesport.com · Dallas, TX</span>
          <span>Athlete & Family Use Only</span>
        </div>
      </div>
    </div>
  )
}

function StandardNote({ note, sectionTitles }) {
  const sectionKeys = ['section_01', 'section_02', 'section_03', 'section_04', 'section_05']
  return (
    <div className="sv-sections">
      {sectionKeys.map((key, i) => {
        const text = note[key]
        if (!text) return null
        const num = String(i + 1).padStart(2, '0')
        const title = sectionTitles[key] || key
        return (
          <div key={key} className="sv-section">
            <div className="sv-section-num">{num}</div>
            <div className="sv-section-content">
              <div className="sv-section-title">{title}</div>
              {renderProse(text)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MeetPrepNote({ note }) {
  const overview = note.overview
  const events = note.events || []
  const closing = note.closing

  return (
    <div className="sv-sections">
      {overview && (
        <div className="sv-overview">
          <div className="sv-section-title">SESSION OVERVIEW</div>
          {renderProse(overview)}
        </div>
      )}
      {events.map((ev, i) => {
        const num = String(i + 1).padStart(2, '0')
        return (
          <div key={i} className="sv-section">
            <div className="sv-section-num">{num}</div>
            <div className="sv-section-content">
              <div className="sv-section-title">RACE STRATEGY</div>
              <div className="sv-event-name">{ev.eventName}</div>
              {ev.bestTime && <div className="sv-event-meta">Best: {ev.bestTime}</div>}
              {renderProse(ev.strategy)}
            </div>
          </div>
        )
      })}
      {closing && (
        <div className="sv-overview sv-closing">
          {renderProse(closing)}
        </div>
      )}
    </div>
  )
}

function WorkoutNote({ note }) {
  const workout = note.workout
  if (!workout) return <p className="muted">Workout data not available.</p>

  return (
    <div className="sv-sections">
      {(workout.sections || []).map((sec, i) => (
        <div key={i} className="sv-workout-section">
          <div className="sv-section-title">{sec.label}{sec.title ? ` — ${sec.title}` : ''}</div>
          {(sec.entries || []).map((entry, j) => (
            <div key={j} className="sv-workout-entry">
              <span className="sv-workout-reps">{entry.reps}×{entry.distance}</span>
              <span className="sv-workout-stroke">{entry.stroke}</span>
              {entry.effort && <span className="sv-workout-effort">{entry.effort}</span>}
              {entry.interval && <span className="sv-workout-interval">@ {entry.interval}</span>}
              {entry.description && <span className="sv-workout-desc">{entry.description}</span>}
            </div>
          ))}
        </div>
      ))}
      {workout.totalYardage && (
        <div className="sv-workout-total">Total: {workout.totalYardage.toLocaleString()} yards</div>
      )}
    </div>
  )
}

function TrainingCharts({ data }) {
  const mainSet = data.mainSet
  const sets = data.sets || (mainSet ? [mainSet] : [])
  const hiLo = data.hiLo

  if (sets.length === 0 && !hiLo) return null

  return (
    <div className="sv-charts">
      <div className="sv-section-title">PERFORMANCE DATA</div>

      {sets.map((set, si) => {
        const reps = set.reps || []
        if (reps.length === 0) return null
        return (
          <div key={si} className="sv-chart-block">
            <div className="sv-chart-set-name">{set.label || set.name || `Set ${si + 1}`}</div>

            {/* Rep Times Bar Chart (SVG) */}
            <RepTimesChart reps={reps} zone={set.zone} setName={set.name} />

            {/* HR Line Chart (SVG) — only if HR data exists */}
            {reps.some(r => r.hr) && <HRLineChart reps={reps} />}

            {/* Rep Detail Cards */}
            <div className="sv-rep-cards">
              {reps.map((r, ri) => (
                <div key={ri} className="sv-rep-card">
                  <div className="sv-rep-num">#{r.rep}</div>
                  <div className="sv-rep-time">{r.time || '—'}</div>
                  {r.hr && <div className="sv-rep-hr">HR: {r.hr}</div>}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Hi-Lo Recovery */}
      {hiLo && (
        <div className="sv-hilo">
          <div className="sv-hilo-grid">
            <div className="sv-hilo-item">
              <div className="sv-hilo-label">HI PULSE</div>
              <div className="sv-hilo-val">{hiLo.hi}</div>
            </div>
            <div className="sv-hilo-item">
              <div className="sv-hilo-label">LO · 1 MIN</div>
              <div className="sv-hilo-val">{hiLo.lo}</div>
            </div>
            <div className="sv-hilo-item">
              <div className="sv-hilo-label">DROP</div>
              <div className={'sv-hilo-val ' + (hiLo.drop >= 10 ? 'sv-hilo-good' : 'sv-hilo-building')}>
                {hiLo.drop >= 0 ? '−' : ''}{Math.abs(hiLo.drop)}
              </div>
            </div>
          </div>
          <div className="sv-hilo-text">
            {hiLo.drop >= 10
              ? 'Strong recovery. Aerobic engine responding well.'
              : 'Building toward the 10-count target.'}
          </div>
        </div>
      )}
    </div>
  )
}

function RepTimesChart({ reps, zone }) {
  if (!reps || reps.length === 0) return null

  // Convert times to seconds for bar heights
  const seconds = reps.map(r => timeToSeconds(r.time))
  const validSeconds = seconds.filter(s => s > 0)
  if (validSeconds.length === 0) return null

  const maxSec = Math.max(...validSeconds)
  const minSec = Math.min(...validSeconds)
  const range = maxSec - minSec || 1

  const chartW = 600
  const chartH = 200
  const barW = Math.min(50, (chartW - 40) / reps.length - 4)
  const padLeft = 20

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH + 40}`} className="sv-chart-svg" xmlns="http://www.w3.org/2000/svg">
      {reps.map((r, i) => {
        const sec = seconds[i]
        if (sec <= 0) return null
        const barH = ((sec - minSec + range * 0.1) / (range * 1.2)) * chartH
        const x = padLeft + i * ((chartW - 40) / reps.length) + 2
        const y = chartH - barH + 20
        const color = ZONE_COLORS[zone] || ZONE_COLORS[r.zone] || '#94a3b8'
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx="2" />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#333">{r.time}</text>
            <text x={x + barW / 2} y={chartH + 34} textAnchor="middle" fontSize="9" fill="#999">#{r.rep}</text>
          </g>
        )
      })}
    </svg>
  )
}

function HRLineChart({ reps }) {
  const hrReps = reps.filter(r => r.hr)
  if (hrReps.length < 2) return null

  const chartW = 600
  const chartH = 120
  const maxHR = Math.max(...hrReps.map(r => r.hr))
  const minHR = Math.min(...hrReps.map(r => r.hr))
  const range = maxHR - minHR || 1

  const points = hrReps.map((r, i) => {
    const x = 30 + (i / (hrReps.length - 1)) * (chartW - 60)
    const y = chartH - 20 - ((r.hr - minHR) / range) * (chartH - 40)
    return { x, y, hr: r.hr, rep: r.rep }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${chartH - 20} L ${points[0].x} ${chartH - 20} Z`

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH + 10}`} className="sv-chart-svg" xmlns="http://www.w3.org/2000/svg">
      <path d={areaPath} fill="rgba(239,68,68,0.1)" />
      <path d={linePath} fill="none" stroke="#ef4444" strokeWidth="2" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#ef4444" />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="10" fill="#333">{p.hr}</text>
        </g>
      ))}
    </svg>
  )
}

function TechniqueTopics({ topics }) {
  if (!topics || topics.length === 0) return null
  return (
    <div className="sv-tech-topics">
      <div className="sv-section-title">FOCUS AREAS</div>
      {topics.map((t, i) => (
        <div key={i} className="sv-tech-topic">
          <div className="sv-tech-topic-name">{t.topic || t.topicLabel} · {t.category || t.categoryLabel}</div>
          <div className="sv-tech-faults">
            {(t.faultsObserved || t.faults || []).map((f, fi) => (
              <span key={fi} className="sv-tech-fault-chip">{f}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function VideoReferences({ videos }) {
  if (!videos || videos.length === 0) return null
  return (
    <div className="sv-video-section">
      <div className="sv-section-title">VIDEO REFERENCES</div>
      <div className="sv-video-list">
        {videos.map((v, i) => (
          <div key={i} className="sv-video-item">
            <div className="sv-video-label">{v.label || `Clip ${i + 1}`}</div>
            <video className="sv-video-player" src={v.url} controls preload="metadata" playsInline />
            <a className="sv-video-link" href={v.url} target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderProse(text) {
  if (!text) return null
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
  return paragraphs.map((p, i) => (
    <p key={i} className="sv-prose" dangerouslySetInnerHTML={{ __html: escapeHtml(p).replace(/\n/g, '<br>') }} />
  ))
}

function escapeHtml(s) {
  if (!s) return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function timeToSeconds(t) {
  if (!t) return 0
  const str = String(t).trim()
  if (str.includes(':')) {
    const parts = str.split(':')
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1])
  }
  return parseFloat(str) || 0
}
