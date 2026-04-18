

import { fullName } from '../data/athletes.js'

const NOTE_TYPE_LABELS = {
  training: 'Training',
  meetprep: 'Meet Prep',
  technique: 'Technique',
}

const SECTION_TITLES_TRAINING = {
  section_01: 'WHAT WE DID TODAY',
  section_02: 'WHAT IT MEANS',
  section_03: "WHAT WE'RE BUILDING TOWARD",
  section_04: 'NEXT SESSION',
}

const SECTION_TITLES_TECHNIQUE = {
  section_01: 'WHAT WE WORKED ON',
  section_02: 'WHAT IMPROVED',
  section_03: "WHAT'S NEXT",
  section_04: 'NEXT SESSION',
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
  const sectionTitles = getSectionTitles(noteType)
  const poolType = data.poolType || ''
  const typeLabel = NOTE_TYPE_LABELS[noteType] || 'Session'

  // For meet prep, the note structure is different (has overview + events)
  const isMeetPrep = noteType === 'meetprep'

  return (
    <div className="page">
      <button className="back-link" onClick={onBack}>← Back to {fullName(athlete)}</button>

      <div className="session-viewer-actions">
        <button className="btn btn-outline" onClick={() => window.print()}>Print / Save PDF</button>
      </div>

      <div className="session-viewer-note" id="printable-note">
        <div className="sv-header">
          <div>
            <div className="sv-type-label">{typeLabel}</div>
            <h1 className="sv-athlete-name">{fullName(athlete)}</h1>
            <div className="sv-gold-rule" />
            <div className="sv-meta-tags">
              {typeLabel}
              <span className="sv-sep">·</span>
              {poolType}
              <span className="sv-sep">·</span>
              {session.date}
            </div>
          </div>
        </div>

        {isMeetPrep ? (
          <MeetPrepNote note={note} />
        ) : (
          <StandardNote note={note} sectionTitles={sectionTitles} />
        )}

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
  const sectionKeys = ['section_01', 'section_02', 'section_03', 'section_04']

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
  // Meet prep has overview + events array with strategy per event
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

function VideoReferences({ videos }) {
  if (!videos || videos.length === 0) return null
  return (
    <div className="sv-video-section">
      <div className="sv-section-title">VIDEO REFERENCES</div>
      <div className="sv-video-list">
        {videos.map((v, i) => (
          <div key={i} className="sv-video-item">
            <div className="sv-video-label">{v.label || `Clip ${i + 1}`}</div>
            <video
              className="sv-video-player"
              src={v.url}
              controls
              preload="metadata"
              playsInline
            />
            <a className="sv-video-link" href={v.url} target="_blank" rel="noopener noreferrer">
              Open in new tab ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
