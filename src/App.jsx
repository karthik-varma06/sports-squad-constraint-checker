import { useState } from 'react'
import { ROSTER, DEFAULT_SELECTION, validateSquad } from './validator.js'
import './index.css'

// ── Helpers ─────────────────────────────────────────────────────────────────

function positionBadgeClass(pos) {
  return { GOALKEEPER: 'badge-gk', DEFENDER: 'badge-def', FORWARD: 'badge-fwd', UTILITY: 'badge-util' }[pos] ?? ''
}

/** True when two ID arrays represent the same set of players (order-independent). */
function sameSet(a, b) {
  if (a.length !== b.length) return false
  const setA = new Set(a)
  return b.every(id => setA.has(id))
}

// ── Formation View ──────────────────────────────────────────────────────────

const FORMATION_ROWS = [
  { label: 'FORWARD',    positions: ['FORWARD'],    zone: 'zone-fwd'  },
  { label: 'UTILITY',    positions: ['UTILITY'],    zone: 'zone-util' },
  { label: 'DEFENDER',   positions: ['DEFENDER'],   zone: 'zone-def'  },
  { label: 'GOALKEEPER', positions: ['GOALKEEPER'], zone: 'zone-gk'   },
]

function FormationView({ selectedPlayers }) {
  // group players by position, preserving roster order within each group
  const byPos = {}
  for (const row of FORMATION_ROWS) {
    for (const pos of row.positions) {
      byPos[pos] = selectedPlayers.filter(p => p.position === pos)
    }
  }

  return (
    <div className="card formation-card">
      <div className="card-title">Formation View</div>
      <div className="pitch">
        {FORMATION_ROWS.map(({ label, positions, zone }) => {
          const players = positions.flatMap(pos => byPos[pos])
          return (
            <div key={label} className={`pitch-zone ${zone}`}>
              <span className="pitch-zone-label">{label}</span>
              <div className="pitch-zone-players">
                {players.length === 0 ? (
                  <span className="pitch-empty">—</span>
                ) : (
                  players.map(p => (
                    <div key={p.id} className={`pitch-player pitch-player-${p.position.toLowerCase()}`}>
                      <div className="pitch-player-name">{p.name.split(' ')[0]}</div>
                      <div className="pitch-player-id">{p.id}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────

// Run the default selection once at startup so Reset can reuse it
const DEFAULT_RESULT = validateSquad(DEFAULT_SELECTION, ROSTER)

export default function App() {
  const [selected, setSelected]           = useState([...DEFAULT_SELECTION])
  const [validationResult, setValidation] = useState(DEFAULT_RESULT)  // show VALID on load
  const [snapshotIds, setSnapshotIds]     = useState([...DEFAULT_SELECTION])

  // "dirty" = result exists but selection set has since changed (order-independent)
  const isDirty =
    validationResult !== null &&
    !sameSet(selected, snapshotIds)

  // Live counts come straight from validateSquad — single source of truth
  // For INVALID_SELECTION_REFERENCE, counts is null; fall back to zeros
  const liveResult = validateSquad(selected, ROSTER)
  const counts = liveResult.counts ?? {
    squadSize: selected.length, goalkeeper: 0, defender: 0,
    forward: 0, utility: 0, YEAR_2: 0, YEAR_3: 0,
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleToggle(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    // don't clear result here — we show "dirty" note instead
  }

  function handleValidate() {
    const result = validateSquad(selected, ROSTER)
    setValidation(result)
    setSnapshotIds([...selected])
  }

  function handleReset() {
    setSelected([...DEFAULT_SELECTION])
    setValidation(DEFAULT_RESULT)        // show VALID immediately, no extra click needed
    setSnapshotIds([...DEFAULT_SELECTION])
  }

  // Selected player objects in roster order (for FormationView)
  const selectedSet = new Set(selected)
  const selectedPlayers = ROSTER.filter(p => selectedSet.has(p.id))

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      <h1 className="app-title">⚽ Sports Squad Constraint Checker</h1>

      <div className="columns">

        {/* ── Left: Roster table ─────────────────────────────────────────── */}
        <div className="card">
          <div className="card-title">Roster</div>
          <table className="roster-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Name</th>
                <th>Position</th>
                <th>Cohort</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {ROSTER.map(player => {
                const isChecked     = selected.includes(player.id)
                const isUnavailable = player.availability === 'UNAVAILABLE'
                return (
                  <tr
                    key={player.id}
                    className={[
                      isChecked     ? 'selected-row'    : '',
                      isUnavailable ? 'unavailable-row' : '',
                    ].join(' ').trim()}
                  >
                    <td>
                      <input
                        id={`chk-${player.id}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(player.id)}
                      />
                    </td>
                    <td><strong>{player.id}</strong></td>
                    <td>{player.name}</td>
                    <td>
                      <span className={`badge ${positionBadgeClass(player.position)}`}>
                        {player.position}
                      </span>
                    </td>
                    <td>{player.cohort}</td>
                    <td>
                      <span className={`badge ${isUnavailable ? 'badge-unavail' : 'badge-avail'}`}>
                        {player.availability}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── Right: Counts + actions + result ───────────────────────────── */}
        <div className="right-panel">

          {/* Live counts */}
          <div className="card">
            <div className="card-title">Squad Counts</div>

            <div className="section-label">Size</div>
            <div className="count-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className={`count-item ${counts.squadSize === 7 ? 'highlight-ok' : 'highlight-bad'}`}>
                <div className="count-label">Squad Size</div>
                <div className="count-value">{counts.squadSize}</div>
              </div>
            </div>

            <div className="section-label">Positions</div>
            <div className="count-grid">
              <div className={`count-item ${counts.goalkeeper === 1 ? 'highlight-ok' : 'highlight-bad'}`}>
                <div className="count-label">GK</div>
                <div className="count-value">{counts.goalkeeper}</div>
              </div>
              <div className={`count-item ${counts.defender >= 2 ? 'highlight-ok' : 'highlight-bad'}`}>
                <div className="count-label">DEF</div>
                <div className="count-value">{counts.defender}</div>
              </div>
              <div className={`count-item ${counts.forward >= 2 ? 'highlight-ok' : 'highlight-bad'}`}>
                <div className="count-label">FWD</div>
                <div className="count-value">{counts.forward}</div>
              </div>
              <div className="count-item">
                <div className="count-label">UTL</div>
                <div className="count-value">{counts.utility}</div>
              </div>
            </div>

            <div className="section-label">Cohort</div>
            <div className="count-grid">
              <div className={`count-item ${counts.YEAR_2 > 4 ? 'highlight-bad' : 'highlight-ok'}`}>
                <div className="count-label">YEAR 2</div>
                <div className="count-value">{counts.YEAR_2}</div>
              </div>
              <div className={`count-item ${counts.YEAR_3 > 4 ? 'highlight-bad' : 'highlight-ok'}`}>
                <div className="count-label">YEAR 3</div>
                <div className="count-value">{counts.YEAR_3}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button id="btn-validate" className="btn btn-primary" onClick={handleValidate}>
            Validate Squad
          </button>
          <button id="btn-reset" className="btn btn-secondary" onClick={handleReset}>
            Reset
          </button>

          {/* Validation result */}
          {validationResult && (
            isDirty ? (
              <div className="result-box result-dirty">
                ⚠ Selection changed — click <strong>Validate</strong> again.
              </div>
            ) : validationResult.status === 'INVALID_SELECTION_REFERENCE' ? (
              <div className="result-box result-invalid">
                <div className="result-status">INVALID SELECTION</div>
                <div style={{ fontSize: 12 }}>Unknown or duplicate player ID detected. Counts are not available.</div>
              </div>
            ) : validationResult.status === 'VALID' ? (
              <div className="result-box result-valid">
                <div className="result-status">✓ VALID</div>
                <div style={{ fontSize: 12 }}>All squad rules are satisfied.</div>
              </div>
            ) : (
              <div className="result-box result-invalid">
                <div className="result-status">✗ INVALID</div>
                <ul className="violation-list">
                  {validationResult.violations.map((v, i) => (
                    <li key={i} className="violation-item">{v}</li>
                  ))}
                </ul>
              </div>
            )
          )}

        </div>
      </div>

      {/* ── Formation view — full width below columns ─────────────────────── */}
      <FormationView selectedPlayers={selectedPlayers} />
    </div>
  )
}
