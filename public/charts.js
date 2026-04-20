
// ═══════════════════════════════════════════════════════════
// CONFLUENCE SWIM — CHART SYSTEM v2
// Matches approved mockup designs exactly
// ═══════════════════════════════════════════════════════════

function esc(s){return s==null?'':String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function timeToSec(t){if(!t)return 0;var s=String(t).trim();if(s.includes(':')){var p=s.split(':');return parseFloat(p[0])*60+parseFloat(p[1])}return parseFloat(s)||0}
function fmtTime(s){if(s>=60){var m=Math.floor(s/60);var sec=(s-m*60).toFixed(2);if(sec.length<5)sec='0'+sec;return m+':'+sec}return s.toFixed(2)}

// ═══ MASTER RENDER ═══
function renderAllCharts(data) {
  var sets = data.sets || [];
  if (sets.length === 0 && data.mainSet) {
    sets = [data.mainSet];
  }
  // Filter sets to only those with actual timed reps
  var validSets = [];
  sets.forEach(function(set) {
    var reps = (set.reps || []).filter(function(r) { return r.time && timeToSec(r.time) > 0; });
    if (reps.length > 0) validSets.push({ set: set, reps: reps });
  });

  if (validSets.length === 0 && !data.hiLo) return '';

  var html = '<div class="perf-section">';
  html += '<div class="perf-header">Performance data</div>';

  validSets.forEach(function(vs, si) {
    var set = vs.set;
    var reps = vs.reps;
    var hasSplits = reps.some(function(r){return r.splits && r.splits.length>=2});
    var hasHR = reps.some(function(r){return r.hr});
    var setName = set.name || set.label || '';
    var totalSets = validSets.length;

    html += '<div class="cs-block">';
    html += '<div class="cs-label">Set ' + (si+1) + (totalSets > 1 ? ' of ' + totalSets : '') + '</div>';
    if (setName) html += '<div class="cs-name">' + esc(setName) + '</div>';

    // ── Choose primary chart ──
    if (reps.length <= 3) {
      html += statBlock(reps);
    } else if (hasHR) {
      html += barsWithHR(reps);
    } else {
      html += descentBars(reps);
      if (reps.length >= 5) html += deltaChart(reps);
    }

    // ── Split cards if applicable ──
    var splitReps = reps.filter(function(r){return r.splits && r.splits.length>=2});
    if (splitReps.length >= 3) {
      html += splitCards(splitReps);
    } else if (splitReps.length > 0) {
      html += inlineSplits(splitReps);
    }

    // ── Summary ──
    html += summaryCards(reps);
    html += '</div>';
  });

  // Hi-Lo
  if (data.hiLo) html += hiLoBlock(data.hiLo);

  html += '</div>';
  return html;
}

// ═══ DESCENT BARS — matches mockup exactly ═══
function descentBars(reps) {
  var times = reps.map(function(r){return timeToSec(r.time)});
  var fastest = Math.min.apply(null, times);
  var slowest = Math.max.apply(null, times);
  var range = slowest - fastest;
  if (range === 0) range = fastest * 0.1 || 1;

  // Is it descending?
  var descCount = 0;
  for (var i=1;i<times.length;i++) if(times[i]<=times[i-1]+0.5)descCount++;
  var isDesc = descCount >= (times.length-1)*0.6;

  var h = '<div style="display:flex;gap:6px;align-items:flex-end;height:130px;margin:12px 0 6px">';
  reps.forEach(function(r, i) {
    var sec = times[i];
    // Bar height: fastest = 40%, slowest = 95%
    var pct = 40 + ((sec - fastest) / range) * 55;
    // Flip so fastest is shortest (lower time = shorter bar for "time" charts)
    // Actually for time charts: slower = taller bar, faster = shorter bar
    // But visually descending bars should show bars getting SHORTER as times drop
    // So: slowest time = tallest bar (95%), fastest = shortest (40%)
    
    // Color: gradient from gray to teal as times get faster
    var color;
    if (isDesc) {
      var progress = i / (reps.length - 1); // 0 = first, 1 = last
      if (progress < 0.3) color = '#B4B2A9';       // gray
      else if (progress < 0.6) color = '#5DCAA5';   // light teal
      else if (progress < 0.85) color = '#1D9E75';  // medium teal
      else color = '#0F6E56';                        // dark teal
      if (sec === fastest) color = '#0F6E56';
    } else {
      color = '#B4B2A9';
    }

    h += '<div style="display:flex;flex-direction:column;align-items:center;flex:1">';
    h += '<div style="font-size:11px;font-weight:500;margin-bottom:3px;white-space:nowrap">' + esc(r.time) + '</div>';
    h += '<div style="width:100%;height:' + pct + '%;background:' + color + ';border-radius:3px 3px 0 0;min-width:16px"></div>';
    h += '<div style="font-size:10px;color:#6B6B6B;margin-top:4px">#' + r.rep + '</div>';
    h += '</div>';
  });
  h += '</div>';

  // Pacing tag
  var drop = slowest - fastest;
  if (isDesc) {
    h += '<span class="pacing-tag tag-green">Descended ' + drop.toFixed(1) + 's across ' + reps.length + ' reps</span>';
  } else {
    if (drop < 1.5) h += '<span class="pacing-tag tag-green">Held pace — ' + drop.toFixed(1) + 's spread</span>';
    else h += '<span class="pacing-tag tag-amber">Spread: ' + drop.toFixed(1) + 's</span>';
  }
  return h;
}

// ═══ STAT BLOCK — for 1-3 reps ═══
function statBlock(reps) {
  var times = reps.map(function(r){return timeToSec(r.time)});
  var fastest = Math.min.apply(null, times);

  var h = '<div style="display:flex;gap:8px;margin:12px 0;align-items:center">';
  reps.forEach(function(r, i) {
    var sec = times[i];
    var isFastest = sec === fastest && reps.length > 1;
    var border = isFastest ? 'border:1.5px solid #5DCAA5' : 'border:0.5px solid #E8E4DD';
    h += '<div style="flex:1;text-align:center;padding:14px 12px;background:#fff;border-radius:8px;' + border + '">';
    h += '<div style="font-size:10px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">' + (r.distance || 'Rep ' + r.rep) + '</div>';
    h += '<div style="font-size:24px;font-weight:500;font-family:Fraunces,Georgia,serif">' + esc(r.time) + '</div>';
    h += '</div>';
    if (i < reps.length - 1) h += '<div style="font-size:16px;color:#1D9E75;flex-shrink:0;padding:0 2px">&#8594;</div>';
  });
  h += '</div>';

  // Insight for stat blocks
  if (reps.length === 3) {
    var spread = (Math.max.apply(null,times) - Math.min.apply(null,times)).toFixed(1);
    h += '<div class="cs-insight">Spread: ' + spread + 's across ' + reps.length + ' reps' + (parseFloat(spread) < 1 ? ' — consistent' : '') + '</div>';
  } else if (reps.length === 2) {
    var diff = (times[1] - times[0]).toFixed(2);
    var dir = parseFloat(diff) < 0 ? 'Improved' : 'Drifted';
    h += '<div class="cs-insight">' + dir + ' ' + Math.abs(parseFloat(diff)).toFixed(2) + 's from rep 1 to rep 2</div>';
  }
  return h;
}

// ═══ DELTA CHART — change from previous rep ═══
function deltaChart(reps) {
  var times = reps.map(function(r){return timeToSec(r.time)});
  var deltas = [0];
  for (var i=1;i<times.length;i++) deltas.push(times[i]-times[i-1]);
  var maxD = Math.max.apply(null, deltas.map(Math.abs));
  if (maxD === 0) maxD = 1;

  var w = 580, ht = 130, mid = 65;
  var barW = Math.min(42, (w-80)/reps.length - 6);

  var h = '<svg viewBox="0 0 ' + w + ' ' + ht + '" style="width:100%;max-width:600px;margin:12px 0">';
  // Zero line
  h += '<line x1="50" y1="' + mid + '" x2="' + (w-10) + '" y2="' + mid + '" stroke="#888" stroke-width="1"/>';
  h += '<text x="' + (w-5) + '" y="' + (mid-8) + '" font-size="9" fill="#27500A" text-anchor="end">faster</text>';
  h += '<text x="' + (w-5) + '" y="' + (mid+16) + '" font-size="9" fill="#791F1F" text-anchor="end">slower</text>';

  deltas.forEach(function(d, i) {
    var x = 55 + i * ((w-70)/reps.length);
    var maxBarH = mid - 15;
    var barH = Math.abs(d) / maxD * maxBarH;
    if (i === 0) { barH = 2; }
    var color, textColor;
    if (i === 0) { color = '#B4B2A9'; textColor = '#6B6B6B'; }
    else if (d <= 0) { color = d < -maxD*0.3 ? '#1D9E75' : '#5DCAA5'; textColor = '#085041'; }
    else { color = '#F09595'; textColor = '#791F1F'; }

    var label = i === 0 ? '0' : (d >= 0 ? '+' : '') + d.toFixed(1);

    if (d <= 0 || i === 0) {
      h += '<rect x="' + x + '" y="' + (mid-barH) + '" width="' + barW + '" height="' + Math.max(barH,1) + '" fill="' + color + '" rx="2"/>';
      h += '<text x="' + (x+barW/2) + '" y="' + (mid-barH-5) + '" text-anchor="middle" font-size="10" fill="' + textColor + '" font-weight="500">' + label + '</text>';
    } else {
      h += '<rect x="' + x + '" y="' + mid + '" width="' + barW + '" height="' + barH + '" fill="' + color + '" rx="2"/>';
      h += '<text x="' + (x+barW/2) + '" y="' + (mid+barH+13) + '" text-anchor="middle" font-size="10" fill="' + textColor + '" font-weight="500">' + label + '</text>';
    }
    h += '<text x="' + (x+barW/2) + '" y="' + (ht-3) + '" text-anchor="middle" font-size="9" fill="#6B6B6B">#' + reps[i].rep + '</text>';
  });
  h += '</svg>';
  return h;
}

// ═══ BARS WITH HR OVERLAY ═══
function barsWithHR(reps) {
  var times = reps.map(function(r){return timeToSec(r.time)});
  var fastest = Math.min.apply(null,times);
  var slowest = Math.max.apply(null,times);
  var range = slowest - fastest; if(range===0)range=1;
  var hrs = reps.map(function(r){return r.hr||null});
  var validHR = hrs.filter(function(h){return h!==null});
  var maxHR = validHR.length ? Math.max.apply(null,validHR) : 30;
  var minHR = validHR.length ? Math.min.apply(null,validHR) : 20;

  var w = 600, ht = 200;

  var h = '<div style="display:flex;gap:16px;font-size:11px;color:#6B6B6B;margin-bottom:8px">';
  h += '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#B4B2A9;margin-right:4px;vertical-align:middle"></span>Rep time</span>';
  if (validHR.length) h += '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#E24B4A;margin-right:4px;vertical-align:middle"></span>HR (10-sec)</span>';
  h += '<span style="font-size:10px;color:#999">White 23-25 · Pink 26-27</span>';
  h += '</div>';

  h += '<svg viewBox="0 0 ' + w + ' ' + ht + '" style="width:100%;max-width:620px">';
  // Zone bands
  h += '<rect x="50" y="10" width="' + (w-60) + '" height="25" fill="#94a3b8" opacity="0.06"/>';
  h += '<text x="' + (w-5) + '" y="28" text-anchor="end" font-size="7" fill="#94a3b8" font-weight="500">WHITE</text>';
  h += '<rect x="50" y="35" width="' + (w-60) + '" height="12" fill="#fb7185" opacity="0.06"/>';
  h += '<text x="' + (w-5) + '" y="44" text-anchor="end" font-size="7" fill="#fb7185" font-weight="500">PINK</text>';

  var barW = Math.min(50, (w-80)/reps.length - 4);
  var barTop = 60, barBot = ht - 25;

  reps.forEach(function(r, i) {
    var sec = times[i];
    var pct = 0.35 + ((sec-fastest)/range)*0.55;
    var bH = pct * (barBot - barTop);
    var x = 60 + i*((w-80)/reps.length);
    var y = barBot - bH;
    h += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + bH + '" fill="#B4B2A9" opacity="0.3" rx="2"/>';
    h += '<text x="' + (x+barW/2) + '" y="' + (y-4) + '" text-anchor="middle" font-size="10" fill="#121212" font-weight="500">' + esc(r.time) + '</text>';
    h += '<text x="' + (x+barW/2) + '" y="' + (barBot+14) + '" text-anchor="middle" font-size="9" fill="#6B6B6B">#' + r.rep + '</text>';
  });

  // HR line
  if (validHR.length >= 2) {
    var hrRange = maxHR - minHR || 1;
    var pts = [];
    reps.forEach(function(r, i) {
      if (r.hr) {
        var x = 60 + i*((w-80)/reps.length) + barW/2;
        var y = 15 + (1 - (r.hr - minHR + 1)/(hrRange + 2)) * 28;
        pts.push({x:x,y:y,hr:r.hr});
      }
    });
    if (pts.length >= 2) {
      h += '<polyline points="' + pts.map(function(p){return p.x+','+p.y}).join(' ') + '" fill="none" stroke="#E24B4A" stroke-width="2"/>';
      pts.forEach(function(p) {
        var fill = p.hr <= 25 ? '#E24B4A' : '#D4537E';
        h += '<circle cx="' + p.x + '" cy="' + p.y + '" r="5" fill="' + fill + '"/>';
        h += '<text x="' + p.x + '" y="' + (p.y-8) + '" text-anchor="middle" font-size="9" fill="#791F1F" font-weight="500">' + p.hr + '</text>';
      });
    }
  }
  h += '</svg>';
  return h;
}

// ═══ SPLIT CARDS ═══
function splitCards(reps) {
  var h = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0">';
  reps.forEach(function(r) {
    if (!r.splits || r.splits.length < 2) return;
    var front = r.splits[0], back = r.splits[1];
    var fSec = timeToSec(front), bSec = timeToSec(back);
    var diff = bSec - fSec;
    var isNeg = diff < 0;
    h += '<div style="flex:1;min-width:100px;max-width:150px;background:#fff;border-radius:8px;padding:8px 10px;text-align:center;border:0.5px solid #E8E4DD">';
    h += '<div style="font-size:10px;color:#6B6B6B;margin-bottom:2px">#' + r.rep + '</div>';
    h += '<div style="font-size:14px;font-weight:500;margin-bottom:4px">' + esc(r.time) + '</div>';
    h += '<div style="display:flex;gap:4px;justify-content:center">';
    h += '<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:#E6F1FB;color:#0C447C">' + esc(front) + '</span>';
    h += '<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:' + (isNeg ? '#EAF3DE' : '#FCEBEB') + ';color:' + (isNeg ? '#27500A' : '#791F1F') + '">' + esc(back) + '</span>';
    h += '</div>';
    h += '<div style="font-size:10px;color:' + (isNeg ? '#27500A' : '#791F1F') + ';margin-top:2px">' + (diff>=0?'+':'') + diff.toFixed(2) + '</div>';
    h += '</div>';
  });
  h += '</div>';

  var negCount = 0, total = 0;
  reps.forEach(function(r) {
    if (r.splits && r.splits.length >= 2) {
      total++;
      if (timeToSec(r.splits[1]) < timeToSec(r.splits[0])) negCount++;
    }
  });
  if (total > 0) {
    h += '<span class="pacing-tag ' + (negCount >= total*0.7 ? 'tag-green' : 'tag-amber') + '">Negative splits: ' + negCount + ' of ' + total + '</span>';
  }
  return h;
}

// ═══ INLINE SPLITS — for 1-2 reps with split data ═══
function inlineSplits(splitReps) {
  var h = '<div style="display:flex;gap:8px;margin:12px 0;flex-wrap:wrap">';
  splitReps.forEach(function(r) {
    var front = r.splits[0], back = r.splits[1];
    var fSec = timeToSec(front), bSec = timeToSec(back);
    var diff = bSec - fSec;
    var isNeg = diff < 0;
    h += '<div style="background:#fff;border-radius:8px;padding:10px 14px;border:0.5px solid #E8E4DD;text-align:center;min-width:120px">';
    h += '<div style="font-size:10px;color:#6B6B6B;margin-bottom:4px">Rep ' + r.rep + ' splits</div>';
    h += '<div style="font-size:15px;font-weight:500;margin-bottom:6px">' + esc(r.time) + '</div>';
    h += '<div style="display:flex;gap:4px;justify-content:center">';
    h += '<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:#E6F1FB;color:#0C447C">' + esc(front) + '</span>';
    h += '<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:' + (isNeg?'#EAF3DE':'#FCEBEB') + ';color:' + (isNeg?'#27500A':'#791F1F') + '">' + esc(back) + '</span>';
    h += '</div>';
    h += '<div style="font-size:11px;color:' + (isNeg?'#27500A':'#791F1F') + ';margin-top:4px;font-weight:500">' + (diff>=0?'+':'') + diff.toFixed(2) + 's</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

// ═══ SUMMARY CARDS ═══
function summaryCards(reps) {
  var times = reps.map(function(r){return timeToSec(r.time)}).filter(function(t){return t>0});
  if (times.length === 0) return '';
  var fastest = Math.min.apply(null,times);
  var slowest = Math.max.apply(null,times);
  var spread = slowest - fastest;
  var fastIdx = times.indexOf(fastest);
  var avg = times.reduce(function(a,b){return a+b},0) / times.length;

  var h = '<div style="display:flex;gap:12px;margin-top:14px">';
  h += '<div class="cs-summary"><div class="cs-sum-label">Fastest</div><div class="cs-sum-val">' + fmtTime(fastest) + '</div><div class="cs-sum-sub">Rep ' + reps[fastIdx].rep + '</div></div>';
  h += '<div class="cs-summary"><div class="cs-sum-label">Spread</div><div class="cs-sum-val">' + spread.toFixed(1) + 's</div><div class="cs-sum-sub">Across ' + reps.length + ' reps</div></div>';
  if (reps.length >= 4) {
    h += '<div class="cs-summary"><div class="cs-sum-label">Average</div><div class="cs-sum-val">' + fmtTime(avg) + '</div><div class="cs-sum-sub">' + reps.length + ' reps</div></div>';
  }
  h += '</div>';
  return h;
}

// ═══ HI-LO RECOVERY ═══
function hiLoBlock(hiLo) {
  if (!hiLo) return '';
  var hi = hiLo.hi || 0, lo = hiLo.lo || 0;
  // Auto-correct if hi < lo (AI sometimes reads backwards)
  if (hi < lo) { var tmp = hi; hi = lo; lo = tmp; }
  var drop = hi - lo;
  var isGood = drop >= 10;

  var h = '<div style="background:#FAF9F6;border-radius:8px;padding:18px 24px;margin-top:20px;border:0.5px solid #E8E4DD">';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;text-align:center;margin-bottom:12px">';
  h += '<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#6B6B6B;font-weight:500;margin-bottom:4px">Hi pulse</div><div style="font-family:Fraunces,Georgia,serif;font-size:1.8rem;font-weight:600">' + hi + '</div></div>';
  h += '<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#6B6B6B;font-weight:500;margin-bottom:4px">Lo &middot; 1 min</div><div style="font-family:Fraunces,Georgia,serif;font-size:1.8rem;font-weight:600">' + lo + '</div></div>';
  h += '<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#6B6B6B;font-weight:500;margin-bottom:4px">Drop</div><div style="font-family:Fraunces,Georgia,serif;font-size:1.8rem;font-weight:600;color:' + (isGood ? '#27500A' : '#854F0B') + '">-' + drop + '</div></div>';
  h += '</div>';
  h += '<div style="font-size:13px;color:#6B6B6B;text-align:center;padding-top:10px;border-top:0.5px solid #E8E4DD">';
  h += isGood ? 'Strong recovery. Aerobic engine responding well.' : 'Building toward the 10-count recovery target. Consistent training at this intensity will widen the gap over time.';
  h += '</div></div>';
  return h;
}

// ═══ EXPORTS ═══
if (typeof window !== 'undefined') {
  window.renderAllCharts = renderAllCharts;
}
