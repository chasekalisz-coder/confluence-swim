// ═══════════════════════════════════════════════
// CONFLUENCE SWIM — CHART RENDERING SYSTEM
// 14 chart types, SVG-based, print-safe
// ═══════════════════════════════════════════════

// Colors
var C = {
  gold: '#B8956A', ink: '#121212', muted: '#6B6B6B', rule: '#E8E4DD', paper: '#FAF9F6',
  gray: {50:'#F1EFE8',200:'#B4B2A9',400:'#888780',600:'#5F5E5A',800:'#444441'},
  teal: {50:'#E1F5EE',200:'#5DCAA5',400:'#1D9E75',600:'#0F6E56',800:'#085041'},
  blue: {50:'#E6F1FB',200:'#85B7EB',400:'#378ADD',600:'#185FA5',800:'#0C447C'},
  red: {50:'#FCEBEB',200:'#F09595',400:'#E24B4A',600:'#A32D2D',800:'#791F1F'},
  green: {50:'#EAF3DE',200:'#97C459',400:'#639922',800:'#27500A'},
  amber: {50:'#FAEEDA',200:'#EF9F27',400:'#BA7517',600:'#854F0B',800:'#633806'},
  pink: {50:'#FBEAF0',200:'#ED93B1',400:'#D4537E',800:'#72243E'},
  zoneWhite: '#94a3b8', zonePink: '#fb7185', zoneRed: '#ef4444', zoneBlue: '#3b82f6',
};

function esc(s) { return s == null ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function timeToSec(t) { if (!t) return 0; var s = String(t).trim(); if (s.includes(':')) { var p = s.split(':'); return parseFloat(p[0])*60+parseFloat(p[1]); } return parseFloat(s)||0; }
function secToTime(s) { if (s >= 60) { var m = Math.floor(s/60); var sec = (s - m*60).toFixed(2); if (sec.length < 5) sec = '0'+sec; return m+':'+sec; } return s.toFixed(2); }

// ═══ CHART SELECTION LOGIC ═══
function selectCharts(data) {
  var sets = data.sets || [];
  if (sets.length === 0 && data.mainSet) sets = [Object.assign({}, data.mainSet, {label:'Main Set'})];
  var charts = [];
  
  sets.forEach(function(set, si) {
    var reps = set.reps || [];
    if (reps.length === 0) return;
    var hasSplits = reps.some(function(r) { return r.splits && r.splits.length >= 2; });
    var hasHR = reps.some(function(r) { return r.hr; });
    var allSameDist = reps.every(function(r) { return r.distance === reps[0].distance; });
    
    var block = { setIndex: si, set: set, types: [] };
    
    // Primary chart — based on set structure
    if (reps.length <= 3) {
      block.types.push('stat_block');
    } else if (hasSplits && reps.length >= 3) {
      block.types.push('split_cards');
      if (reps.length >= 4) block.types.push('split_progression');
    } else {
      block.types.push('descent_bars');
    }
    
    // Secondary — delta if descending
    if (reps.length >= 4 && !hasSplits) {
      var descending = true;
      for (var i = 1; i < Math.min(reps.length, 4); i++) {
        if (timeToSec(reps[i].time) > timeToSec(reps[i-1].time) + 1) { descending = false; break; }
      }
      if (descending && reps.length >= 5) block.types.push('delta_chart');
    }
    
    // HR overlay
    if (hasHR) block.types.push('hr_overlay');
    
    charts.push(block);
  });
  
  // Hi-Lo
  if (data.hiLo) charts.push({ types: ['hilo_block'], hiLo: data.hiLo });
  
  return charts;
}

// ═══ MASTER RENDER ═══
function renderAllCharts(data) {
  var sets = data.sets || [];
  if (sets.length === 0 && data.mainSet) sets = [Object.assign({}, data.mainSet, {label:'Main Set'})];
  if (sets.length === 0 && !data.hiLo) return '';
  
  var html = '<div class="perf-section"><div class="perf-header">Performance data</div>';
  
  sets.forEach(function(set, si) {
    var reps = (set.reps || []).filter(function(r) { return r.time; });
    if (reps.length === 0) return;
    
    var hasSplits = reps.some(function(r) { return r.splits && r.splits.length >= 2; });
    var hasHR = reps.some(function(r) { return r.hr; });
    var setLabel = set.label || set.name || ('Set ' + (si+1));
    var setName = set.name || '';
    
    html += '<div class="chart-set-block">';
    html += '<div class="chart-set-label">Set ' + (si+1) + (sets.length > 1 ? ' of ' + sets.length : '') + '</div>';
    html += '<div class="chart-set-name">' + esc(setName) + '</div>';
    
    // Primary visualization
    if (reps.length <= 3) {
      html += renderStatBlock(reps, set);
    } else if (hasSplits) {
      html += renderSplitCards(reps, set);
      if (reps.length >= 4) html += renderSplitProgression(reps);
    } else if (hasHR) {
      html += renderBarsWithHR(reps, set);
    } else {
      html += renderDescentBars(reps, set);
      // Add delta chart for sets with 5+ reps
      if (reps.length >= 5) html += renderDeltaChart(reps);
    }
    
    // Summary cards
    html += renderSetSummary(reps, set);
    
    html += '</div>';
  });
  
  // Hi-Lo
  if (data.hiLo) {
    html += renderHiLo(data.hiLo);
  }
  
  html += '</div>';
  return html;
}

// ═══ 1. DESCENT/HOLD BARS ═══
function renderDescentBars(reps, set) {
  var times = reps.map(function(r) { return timeToSec(r.time); });
  var max = Math.max.apply(null, times);
  var min = Math.min.apply(null, times);
  var range = max - min || 1;
  var fastest = Math.min.apply(null, times);
  var slowest = Math.max.apply(null, times);
  
  // Determine pacing
  var descCount = 0;
  for (var i = 1; i < times.length; i++) { if (times[i] < times[i-1]) descCount++; }
  var isDescend = descCount >= times.length * 0.6;
  
  var h = '<div class="chart-bars-row" style="height:120px">';
  reps.forEach(function(r, i) {
    var sec = times[i];
    var pct = 30 + ((sec - min) / range) * 60;
    var color = C.gray[200];
    if (isDescend) {
      var intensity = (times.length - 1 - i) / (times.length - 1);
      if (sec === fastest) color = C.teal[400];
      else if (intensity < 0.3) color = C.teal[200];
      else color = C.gray[200];
    }
    h += '<div class="chart-bar-col"><div class="chart-bar-time">' + esc(r.time) + '</div>';
    h += '<div class="chart-bar" style="height:' + pct + '%;background:' + color + '"></div>';
    h += '<div class="chart-bar-label">#' + r.rep + '</div></div>';
  });
  h += '</div>';
  
  // Pacing tag
  var drop = slowest - fastest;
  if (isDescend) {
    h += '<span class="pacing-tag tag-green">Descended ' + drop.toFixed(1) + 's across ' + reps.length + ' reps</span>';
  } else {
    var spread = (slowest - fastest);
    if (spread < 1.5) {
      h += '<span class="pacing-tag tag-green">Held pace — ' + spread.toFixed(1) + 's spread</span>';
    } else {
      h += '<span class="pacing-tag tag-amber">Spread: ' + spread.toFixed(1) + 's</span>';
    }
  }
  
  return h;
}

// ═══ 2. SPLIT CARDS ═══
function renderSplitCards(reps, set) {
  var h = '<div class="split-cards-grid">';
  reps.forEach(function(r) {
    if (!r.splits || r.splits.length < 2) return;
    var front = r.splits[0];
    var back = r.splits[1];
    var frontSec = timeToSec(front);
    var backSec = timeToSec(back);
    var diff = backSec - frontSec;
    var isNeg = diff < 0;
    h += '<div class="split-card">';
    h += '<div class="split-rep">#' + r.rep + '</div>';
    h += '<div class="split-time">' + esc(r.time) + '</div>';
    h += '<div class="split-halves">';
    h += '<span class="split-half split-front">' + esc(front) + '</span>';
    h += '<span class="split-half ' + (isNeg ? 'split-back' : 'split-back-pos') + '">' + esc(back) + '</span>';
    h += '</div>';
    h += '<div class="' + (isNeg ? 'neg-label' : 'pos-label') + '">' + (diff >= 0 ? '+' : '') + diff.toFixed(2) + '</div>';
    h += '</div>';
  });
  h += '</div>';
  
  // Count negative splits
  var negCount = 0;
  reps.forEach(function(r) {
    if (r.splits && r.splits.length >= 2) {
      if (timeToSec(r.splits[1]) < timeToSec(r.splits[0])) negCount++;
    }
  });
  var total = reps.filter(function(r) { return r.splits && r.splits.length >= 2; }).length;
  if (total > 0) {
    h += '<span class="pacing-tag ' + (negCount >= total * 0.7 ? 'tag-green' : 'tag-amber') + '">Negative splits: ' + negCount + ' of ' + total + '</span>';
  }
  
  return h;
}

// ═══ 3. STAT BLOCK ═══
function renderStatBlock(reps, set) {
  var h = '<div class="stat-row">';
  reps.forEach(function(r, i) {
    var isFirst = i === 0;
    var isFastest = true;
    var sec = timeToSec(r.time);
    reps.forEach(function(other) { if (timeToSec(other.time) < sec && other !== r) isFastest = false; });
    var border = isFastest && reps.length > 1 ? 'border:0.5px solid ' + C.teal[200] : '';
    h += '<div class="stat-item" style="' + border + '">';
    h += '<div class="stat-rep">' + (r.distance ? r.distance : 'Rep ' + r.rep) + '</div>';
    h += '<div class="stat-time">' + esc(r.time) + '</div>';
    h += '</div>';
    if (i < reps.length - 1) h += '<div class="stat-arrow">&#8594;</div>';
  });
  h += '</div>';
  return h;
}

// ═══ 4. BARS WITH HR OVERLAY ═══
function renderBarsWithHR(reps, set) {
  var times = reps.map(function(r) { return timeToSec(r.time); });
  var max = Math.max.apply(null, times);
  var min = Math.min.apply(null, times);
  var range = max - min || 1;
  var hrs = reps.map(function(r) { return r.hr || null; });
  var validHR = hrs.filter(function(h) { return h !== null; });
  var maxHR = validHR.length ? Math.max.apply(null, validHR) : 30;
  var minHR = validHR.length ? Math.min.apply(null, validHR) : 20;
  var hrRange = maxHR - minHR || 1;
  
  var w = 600, barH = 140, hrTop = 10;
  var barW = Math.min(50, (w - 80) / reps.length - 4);
  
  var h = '<div class="chart-legend"><span class="legend-item"><span class="legend-dot" style="background:' + C.gray[200] + '"></span>Rep time</span>';
  if (validHR.length > 0) h += '<span class="legend-item"><span class="legend-dot" style="background:' + C.red[400] + '"></span>HR (10-sec)</span>';
  h += '</div>';
  
  h += '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + (barH + 50) + '">';
  
  // Zone bands if HR data
  if (validHR.length > 0) {
    h += '<rect x="50" y="' + hrTop + '" width="' + (w-60) + '" height="20" fill="' + C.zoneWhite + '" opacity="0.06"/>';
    h += '<text x="' + (w-5) + '" y="' + (hrTop+14) + '" text-anchor="end" font-size="7" fill="' + C.zoneWhite + '">WHITE 23-25</text>';
    h += '<rect x="50" y="' + (hrTop+20) + '" width="' + (w-60) + '" height="12" fill="' + C.zonePink + '" opacity="0.06"/>';
    h += '<text x="' + (w-5) + '" y="' + (hrTop+30) + '" text-anchor="end" font-size="7" fill="' + C.zonePink + '">PINK 26-27</text>';
  }
  
  // Bars
  reps.forEach(function(r, i) {
    var sec = times[i];
    var pct = 0.3 + ((sec - min) / range) * 0.6;
    var bH = pct * (barH - 40);
    var x = 60 + i * ((w - 80) / reps.length);
    var y = barH - bH;
    h += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + bH + '" fill="' + C.gray[200] + '" opacity="0.3" rx="2"/>';
    h += '<text x="' + (x + barW/2) + '" y="' + (y - 4) + '" text-anchor="middle" font-size="10" fill="' + C.ink + '">' + esc(r.time) + '</text>';
    h += '<text x="' + (x + barW/2) + '" y="' + (barH + 15) + '" text-anchor="middle" font-size="9" fill="' + C.muted + '">#' + r.rep + '</text>';
  });
  
  // HR line
  if (validHR.length >= 2) {
    var pts = [];
    reps.forEach(function(r, i) {
      if (r.hr) {
        var x = 60 + i * ((w - 80) / reps.length) + barW/2;
        var y = hrTop + 5 + (1 - (r.hr - minHR + 2) / (hrRange + 4)) * 30;
        pts.push({x:x, y:y, hr:r.hr});
      }
    });
    if (pts.length >= 2) {
      var line = pts.map(function(p,i) { return (i===0?'M':'L') + ' ' + p.x + ' ' + p.y; }).join(' ');
      h += '<polyline points="' + pts.map(function(p){return p.x+','+p.y}).join(' ') + '" fill="none" stroke="' + C.red[400] + '" stroke-width="2"/>';
      pts.forEach(function(p) {
        var dotColor = p.hr <= 25 ? C.red[400] : C.pink[400];
        h += '<circle cx="' + p.x + '" cy="' + p.y + '" r="5" fill="' + dotColor + '"/>';
        h += '<text x="' + p.x + '" y="' + (p.y - 8) + '" text-anchor="middle" font-size="9" fill="' + C.red[800] + '">' + p.hr + '</text>';
      });
    }
  }
  
  h += '</svg>';
  return h;
}

// ═══ 5. PACE REFERENCE BARS ═══
function renderPaceReferenceBars(reps, set, targetPace) {
  // Similar to descent bars but with a target line
  var times = reps.map(function(r) { return timeToSec(r.time); });
  var target = targetPace ? timeToSec(targetPace) : null;
  
  var max = Math.max.apply(null, times);
  var min = Math.min.apply(null, times);
  if (target) { max = Math.max(max, target); min = Math.min(min, target); }
  var range = max - min || 1;
  
  var h = '<div class="chart-bars-row" style="height:100px;position:relative">';
  if (target) {
    var tPct = 100 - ((target - min) / range) * 70 - 15;
    h += '<div style="position:absolute;left:0;right:0;top:' + tPct + '%;border-top:1.5px dashed ' + C.amber[200] + ';z-index:1"></div>';
  }
  reps.forEach(function(r, i) {
    var sec = times[i];
    var pct = 20 + ((sec - min) / range) * 70;
    var underTarget = target && sec <= target;
    var color = underTarget ? C.teal[200] : C.red[200];
    var delta = target ? (sec - target) : 0;
    h += '<div class="chart-bar-col" style="z-index:2"><div class="chart-bar-time">' + esc(r.time) + '</div>';
    h += '<div class="chart-bar" style="height:' + pct + '%;background:' + color + '"></div>';
    h += '<div class="chart-bar-label">#' + r.rep + '</div>';
    if (target) {
      h += '<div class="pace-delta ' + (underTarget ? 'delta-fast' : 'delta-slow') + '">' + (delta >= 0 ? '+' : '') + delta.toFixed(1) + '</div>';
    }
    h += '</div>';
  });
  h += '</div>';
  return h;
}

// ═══ 6. HI-LO RECOVERY ═══
function renderHiLo(hiLo) {
  if (!hiLo) return '';
  var drop = hiLo.drop != null ? hiLo.drop : (hiLo.hi - hiLo.lo);
  var isGood = Math.abs(drop) >= 10;
  var h = '<div class="hilo-module">';
  h += '<div class="hilo-grid">';
  h += '<div class="hilo-item"><div class="hilo-label">Hi pulse</div><div class="hilo-val">' + hiLo.hi + '</div></div>';
  h += '<div class="hilo-item"><div class="hilo-label">Lo &middot; 1 min</div><div class="hilo-val">' + hiLo.lo + '</div></div>';
  h += '<div class="hilo-item"><div class="hilo-label">Drop</div><div class="hilo-val ' + (isGood ? 'hilo-good' : 'hilo-building') + '">' + (drop >= 0 ? '-' : '+') + Math.abs(drop) + '</div></div>';
  h += '</div>';
  h += '<div class="hilo-context">' + (isGood ? 'Strong recovery. Aerobic engine responding well.' : 'Building toward the 10-count recovery target. Consistent training at this intensity will widen the gap over time.') + '</div>';
  h += '</div>';
  return h;
}

// ═══ 7. SET SUMMARY CARDS ═══
function renderSetSummary(reps, set) {
  var times = reps.map(function(r) { return timeToSec(r.time); }).filter(function(t) { return t > 0; });
  if (times.length === 0) return '';
  var fastest = Math.min.apply(null, times);
  var slowest = Math.max.apply(null, times);
  var spread = slowest - fastest;
  var fastIdx = times.indexOf(fastest);
  
  var h = '<div class="summary-row">';
  h += '<div class="summary-card"><div class="summary-label">Fastest</div><div class="summary-val">' + secToTime(fastest) + '</div><div class="summary-sub">Rep ' + reps[fastIdx].rep + '</div></div>';
  h += '<div class="summary-card"><div class="summary-label">Spread</div><div class="summary-val">' + spread.toFixed(1) + 's</div><div class="summary-sub">Across ' + reps.length + ' reps</div></div>';
  
  if (reps.length >= 4) {
    var avg = times.reduce(function(a,b){return a+b},0) / times.length;
    h += '<div class="summary-card"><div class="summary-label">Average</div><div class="summary-val">' + secToTime(avg) + '</div><div class="summary-sub">' + reps.length + ' reps</div></div>';
  }
  h += '</div>';
  return h;
}

// ═══ 8. REP-OVER-REP DELTA ═══
function renderDeltaChart(reps) {
  if (reps.length < 3) return '';
  var times = reps.map(function(r) { return timeToSec(r.time); });
  var deltas = [0];
  for (var i = 1; i < times.length; i++) deltas.push(times[i] - times[i-1]);
  
  var maxD = Math.max.apply(null, deltas.map(Math.abs));
  if (maxD === 0) maxD = 1;
  var w = 600, h2 = 140, mid = h2/2;
  
  var h = '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + (h2+20) + '">';
  h += '<line x1="50" y1="' + mid + '" x2="' + (w-10) + '" y2="' + mid + '" stroke="' + C.muted + '" stroke-width="1"/>';
  h += '<text x="' + (w-5) + '" y="' + (mid-8) + '" font-size="9" fill="' + C.green[800] + '" text-anchor="end">faster</text>';
  h += '<text x="' + (w-5) + '" y="' + (mid+16) + '" font-size="9" fill="' + C.red[800] + '" text-anchor="end">slower</text>';
  
  var barW = Math.min(45, (w - 80) / reps.length - 4);
  deltas.forEach(function(d, i) {
    var x = 60 + i * ((w - 80) / reps.length);
    var barH = Math.abs(d) / maxD * (mid - 20);
    var color = d <= 0 ? C.teal[200] : C.red[200];
    if (d < 0 && Math.abs(d) > maxD * 0.5) color = C.teal[400];
    if (i === 0) { color = C.gray[200]; barH = 2; }
    
    if (d <= 0 || i === 0) {
      h += '<rect x="' + x + '" y="' + (mid - barH) + '" width="' + barW + '" height="' + Math.max(barH, 1) + '" fill="' + color + '" rx="1"/>';
    } else {
      h += '<rect x="' + x + '" y="' + mid + '" width="' + barW + '" height="' + barH + '" fill="' + color + '" rx="1"/>';
    }
    var label = i === 0 ? '0' : (d >= 0 ? '+' : '') + d.toFixed(1);
    var ly = d <= 0 ? (mid - barH - 6) : (mid + barH + 12);
    var lColor = i === 0 ? C.muted : (d <= 0 ? C.teal[800] : C.red[800]);
    h += '<text x="' + (x + barW/2) + '" y="' + ly + '" text-anchor="middle" font-size="10" fill="' + lColor + '">' + label + '</text>';
    h += '<text x="' + (x + barW/2) + '" y="' + (h2 + 14) + '" text-anchor="middle" font-size="9" fill="' + C.muted + '">#' + reps[i].rep + '</text>';
  });
  h += '</svg>';
  return h;
}

// ═══ 9. EFFORT DISTRIBUTION ═══
function renderEffortDistribution(data) {
  // Build from sets data — count yardage per zone
  var zones = {};
  var total = 0;
  var sets = data.sets || [];
  if (sets.length === 0 && data.mainSet) sets = [data.mainSet];
  
  sets.forEach(function(set) {
    var zone = set.zone || 'unknown';
    var reps = set.reps || [];
    var yards = 0;
    reps.forEach(function(r) { yards += parseInt(r.distance) || 0; });
    if (!zones[zone]) zones[zone] = 0;
    zones[zone] += yards;
    total += yards;
  });
  
  if (total === 0) return '';
  
  var zoneColors = {white: {bg:C.gray[50],text:C.gray[800]}, pink: {bg:'#FBEAF0',text:'#72243E'}, red: {bg:'#FCEBEB',text:'#791F1F'}, blue: {bg:'#E6F1FB',text:'#0C447C'}, unknown: {bg:C.gray[50],text:C.gray[600]}};
  
  var h = '<div class="effort-dist-bar">';
  Object.keys(zones).forEach(function(z) {
    var pct = zones[z] / total;
    var colors = zoneColors[z] || zoneColors.unknown;
    h += '<div style="flex:' + Math.round(pct*100) + ';background:' + colors.bg + ';display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;color:' + colors.text + ';min-width:30px">' + z + '</div>';
  });
  h += '</div>';
  
  return h;
}

// ═══ 10. SPLIT PROGRESSION LINES ═══
function renderSplitProgression(reps) {
  var splitReps = reps.filter(function(r) { return r.splits && r.splits.length >= 2; });
  if (splitReps.length < 3) return '';
  
  var fronts = splitReps.map(function(r) { return timeToSec(r.splits[0]); });
  var backs = splitReps.map(function(r) { return timeToSec(r.splits[1]); });
  var all = fronts.concat(backs);
  var max = Math.max.apply(null, all);
  var min = Math.min.apply(null, all);
  var range = max - min || 1;
  
  var w = 600, ht = 180, padL = 60, padR = 20, padT = 25, padB = 30;
  var cw = w - padL - padR, ch = ht - padT - padB;
  
  var h = '<div class="chart-legend"><span class="legend-item"><span class="legend-dot" style="background:' + C.blue[400] + '"></span>Front half</span>';
  h += '<span class="legend-item"><span class="legend-dot" style="background:' + C.teal[400] + '"></span>Back half</span></div>';
  h += '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + ht + '">';
  
  // Grid
  for (var g = 0; g <= 3; g++) {
    var gy = padT + (g/3) * ch;
    var gv = max - (g/3) * range;
    h += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (w-padR) + '" y2="' + gy + '" stroke="' + C.rule + '" stroke-width="0.5" stroke-dasharray="3"/>';
    h += '<text x="' + (padL-8) + '" y="' + (gy+4) + '" text-anchor="end" font-size="9" fill="' + C.muted + '">' + gv.toFixed(0) + 's</text>';
  }
  
  // Gap bars
  splitReps.forEach(function(r, i) {
    var x = padL + (i / (splitReps.length-1)) * cw;
    var fy = padT + ((max - fronts[i]) / range) * ch;
    var by = padT + ((max - backs[i]) / range) * ch;
    var top = Math.min(fy, by), bot = Math.max(fy, by);
    h += '<rect x="' + (x-8) + '" y="' + top + '" width="16" height="' + (bot-top) + '" rx="2" fill="' + C.gray[50] + '" opacity="0.6"/>';
  });
  
  // Lines
  var fPts = [], bPts = [];
  splitReps.forEach(function(r, i) {
    var x = padL + (i / (splitReps.length-1)) * cw;
    fPts.push(x + ',' + (padT + ((max - fronts[i]) / range) * ch));
    bPts.push(x + ',' + (padT + ((max - backs[i]) / range) * ch));
  });
  h += '<polyline points="' + fPts.join(' ') + '" fill="none" stroke="' + C.blue[400] + '" stroke-width="2"/>';
  h += '<polyline points="' + bPts.join(' ') + '" fill="none" stroke="' + C.teal[400] + '" stroke-width="2"/>';
  
  // Dots and labels
  splitReps.forEach(function(r, i) {
    var x = padL + (i / (splitReps.length-1)) * cw;
    var fy = padT + ((max - fronts[i]) / range) * ch;
    var by = padT + ((max - backs[i]) / range) * ch;
    h += '<circle cx="' + x + '" cy="' + fy + '" r="4" fill="' + C.blue[400] + '"/>';
    h += '<circle cx="' + x + '" cy="' + by + '" r="4" fill="' + C.teal[400] + '"/>';
    h += '<text x="' + x + '" y="' + (fy-8) + '" text-anchor="middle" font-size="9" fill="' + C.blue[800] + '">' + r.splits[0] + '</text>';
    h += '<text x="' + x + '" y="' + (by+14) + '" text-anchor="middle" font-size="9" fill="' + C.teal[800] + '">' + r.splits[1] + '</text>';
    h += '<text x="' + x + '" y="' + (ht-5) + '" text-anchor="middle" font-size="9" fill="' + C.muted + '">#' + r.rep + '</text>';
  });
  
  h += '</svg>';
  return h;
}

// ═══ 11. PER-50 PACE NORMALIZATION ═══
function renderPer50Pace(reps, athlete) {
  if (reps.length < 2) return '';
  var paces = [];
  reps.forEach(function(r) {
    var sec = timeToSec(r.time);
    var dist = parseInt(r.distance) || 0;
    if (sec > 0 && dist > 0) {
      paces.push({ rep: r.rep, distance: dist, time: r.time, per50: (sec / dist) * 50 });
    }
  });
  if (paces.length < 2) return '';
  
  var max = Math.max.apply(null, paces.map(function(p){return p.per50}));
  var min = Math.min.apply(null, paces.map(function(p){return p.per50}));
  var range = max - min || 1;
  
  var h = '<div class="chart-bars-row" style="height:100px">';
  paces.forEach(function(p, i) {
    var pct = 30 + ((p.per50 - min) / range) * 60;
    var intensity = 1 - (i / (paces.length - 1));
    var color = i === paces.length - 1 ? C.teal[400] : (intensity > 0.5 ? C.gray[200] : C.blue[400]);
    h += '<div class="chart-bar-col"><div class="chart-bar-time">' + p.per50.toFixed(1) + '</div>';
    h += '<div class="chart-bar" style="height:' + pct + '%;background:' + color + '"></div>';
    h += '<div class="chart-bar-label">' + p.distance + 's</div></div>';
  });
  h += '</div>';
  h += '<div style="font-size:11px;color:' + C.muted + ';margin-top:4px">Per-50 pace (seconds)</div>';
  return h;
}

// ═══ 12. CONSISTENCY SCATTER ═══
function renderConsistencyScatter(reps, blocks) {
  if (reps.length < 5) return '';
  var times = reps.map(function(r) { return timeToSec(r.time); }).filter(function(t) { return t > 0; });
  if (times.length < 5) return '';
  
  var max = Math.max.apply(null, times);
  var min = Math.min.apply(null, times);
  var range = max - min || 0.1;
  
  var w = 600, ht = 140, padL = 40, padR = 20, padT = 15, padB = 20;
  var h = '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + ht + '">';
  
  // Grid
  h += '<line x1="' + padL + '" y1="' + (ht-padB) + '" x2="' + (w-padR) + '" y2="' + (ht-padB) + '" stroke="' + C.rule + '" stroke-width="0.5"/>';
  h += '<text x="' + (padL-5) + '" y="' + (padT+5) + '" text-anchor="end" font-size="9" fill="' + C.muted + '">' + min.toFixed(1) + '</text>';
  h += '<text x="' + (padL-5) + '" y="' + (ht-padB) + '" text-anchor="end" font-size="9" fill="' + C.muted + '">' + max.toFixed(1) + '</text>';
  
  // Dots
  var fastest = Math.min.apply(null, times);
  reps.forEach(function(r, i) {
    var sec = timeToSec(r.time);
    if (sec <= 0) return;
    var x = padL + 10 + (i / (reps.length-1)) * (w - padL - padR - 20);
    var y = padT + ((max - sec) / range) * (ht - padT - padB);
    var isFastest = sec === fastest;
    var dotR = isFastest ? 6 : 4;
    var fill = isFastest ? C.teal[400] : C.blue[400];
    var stroke = isFastest ? C.teal[600] : 'none';
    h += '<circle cx="' + x + '" cy="' + y + '" r="' + dotR + '" fill="' + fill + '"' + (stroke !== 'none' ? ' stroke="' + stroke + '" stroke-width="1.5"' : '') + '/>';
  });
  
  h += '</svg>';
  
  var avg = times.reduce(function(a,b){return a+b},0) / times.length;
  var spread = max - min;
  h += '<div class="summary-row">';
  h += '<div class="summary-card"><div class="summary-label">Fastest</div><div class="summary-val">' + secToTime(fastest) + '</div></div>';
  h += '<div class="summary-card"><div class="summary-label">Spread</div><div class="summary-val">' + spread.toFixed(2) + 's</div></div>';
  h += '<div class="summary-card"><div class="summary-label">Average</div><div class="summary-val">' + secToTime(avg) + '</div></div>';
  h += '</div>';
  return h;
}

// ═══ 13. SESSION COMPARISON (ghost bars) ═══
function renderSessionComparison(currentReps, previousReps) {
  if (!previousReps || previousReps.length === 0 || currentReps.length === 0) return '';
  var len = Math.min(currentReps.length, previousReps.length);
  
  var allTimes = [];
  for (var i = 0; i < len; i++) {
    allTimes.push(timeToSec(currentReps[i].time));
    allTimes.push(timeToSec(previousReps[i].time));
  }
  var max = Math.max.apply(null, allTimes);
  var min = Math.min.apply(null, allTimes);
  var range = max - min || 1;
  
  var h = '<div class="chart-legend"><span class="legend-item"><span class="legend-dot" style="background:' + C.blue[600] + '"></span>Today</span>';
  h += '<span class="legend-item"><span class="legend-dot" style="background:' + C.gray[200] + '"></span>Previous</span></div>';
  h += '<div class="chart-bars-row" style="height:120px">';
  
  for (var i = 0; i < len; i++) {
    var curSec = timeToSec(currentReps[i].time);
    var prevSec = timeToSec(previousReps[i].time);
    var curPct = 20 + ((curSec - min) / range) * 70;
    var prevPct = 20 + ((prevSec - min) / range) * 70;
    var isFaster = curSec < prevSec;
    var curColor = isFaster ? C.teal[400] : C.blue[600];
    
    h += '<div class="chart-bar-col" style="position:relative">';
    h += '<div class="chart-bar-time"' + (isFaster ? ' style="color:' + C.teal[800] + '"' : '') + '>' + currentReps[i].time + '</div>';
    h += '<div style="position:relative;width:100%;height:' + Math.max(curPct, prevPct) + '%">';
    h += '<div style="position:absolute;bottom:0;width:100%;height:' + prevPct + '%;background:' + C.gray[200] + ';border-radius:3px 3px 0 0;opacity:0.4"></div>';
    h += '<div style="position:absolute;bottom:0;width:100%;height:' + curPct + '%;background:' + curColor + ';border-radius:3px 3px 0 0"></div>';
    h += '</div>';
    h += '<div class="chart-bar-label">#' + currentReps[i].rep + '</div>';
    h += '</div>';
  }
  h += '</div>';
  return h;
}

// ═══ 14. DURATION-BASED ═══
function renderDurationBars(phases) {
  if (!phases || phases.length === 0) return '';
  var h = '';
  phases.forEach(function(phase) {
    h += '<div style="font-size:11px;color:' + C.muted + ';font-weight:500;margin:12px 0 6px;padding-top:8px;border-top:0.5px solid ' + C.rule + '">' + esc(phase.label) + '</div>';
    var maxDur = Math.max.apply(null, phase.reps.map(function(r){return r.duration || 0}));
    if (maxDur === 0) maxDur = 1;
    h += '<div class="dur-row" style="height:' + Math.min(100, maxDur * 2 + 30) + 'px">';
    phase.reps.forEach(function(r, i) {
      var pct = ((r.duration || 0) / maxDur) * 85 + 10;
      var color = phase.color || C.blue[400];
      h += '<div class="dur-col"><div class="dur-time">' + (r.duration || '?') + 's</div>';
      h += '<div class="dur-bar" style="height:' + pct + '%;background:' + color + '"></div>';
      h += '<div class="dur-label">#' + (i+1) + '</div></div>';
    });
    h += '</div>';
  });
  return h;
}

// Export for use in HTML pages
if (typeof window !== 'undefined') {
  window.renderAllCharts = renderAllCharts;
  window.renderDescentBars = renderDescentBars;
  window.renderSplitCards = renderSplitCards;
  window.renderStatBlock = renderStatBlock;
  window.renderBarsWithHR = renderBarsWithHR;
  window.renderPaceReferenceBars = renderPaceReferenceBars;
  window.renderHiLo = renderHiLo;
  window.renderSetSummary = renderSetSummary;
  window.renderDeltaChart = renderDeltaChart;
  window.renderEffortDistribution = renderEffortDistribution;
  window.renderSplitProgression = renderSplitProgression;
  window.renderPer50Pace = renderPer50Pace;
  window.renderConsistencyScatter = renderConsistencyScatter;
  window.renderSessionComparison = renderSessionComparison;
  window.renderDurationBars = renderDurationBars;
  window.selectCharts = selectCharts;
}
