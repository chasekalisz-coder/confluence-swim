
// ═══════════════════════════════════════════════════════════
// CONFLUENCE SWIM — CHART SYSTEM v3 — ALL 14 TYPES
// ═══════════════════════════════════════════════════════════

function esc(s){return s==null?'':String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function timeToSec(t){if(!t)return 0;var s=String(t).trim();if(s.includes(':')){var p=s.split(':');return parseFloat(p[0])*60+parseFloat(p[1])}return parseFloat(s)||0}
function fmtTime(s){if(s>=60){var m=Math.floor(s/60);var sec=(s-m*60).toFixed(2);if(sec.length<5)sec='0'+sec;return m+':'+sec}return s.toFixed(2)}

// ═══ MASTER RENDER ═══
function renderAllCharts(data) {
  var sets = data.sets || [];
  if (sets.length === 0 && data.mainSet) sets = [data.mainSet];
  var validSets = [];
  sets.forEach(function(set) {
    var reps = (set.reps || []).filter(function(r) { return r.time && timeToSec(r.time) > 0; });
    if (reps.length > 0) validSets.push({ set: set, reps: reps });
  });
  if (validSets.length === 0 && !data.hiLo) return '';

  var html = '<div class="perf-section"><div class="perf-header">Performance data</div>';

  validSets.forEach(function(vs, si) {
    var set = vs.set, reps = vs.reps;
    var hasSplits = reps.some(function(r){return r.splits && r.splits.length>=2});
    var hasHR = reps.some(function(r){return r.hr});
    var setName = set.name || set.label || '';
    var totalSets = validSets.length;

    html += '<div class="cs-block">';
    html += '<div class="cs-label">Set ' + (si+1) + (totalSets > 1 ? ' of ' + totalSets : '') + '</div>';
    if (setName) html += '<div class="cs-name">' + esc(setName) + '</div>';

    // Primary chart
    if (reps.length <= 3) {
      html += statBlock(reps);
    } else if (hasHR) {
      html += barsWithHR(reps);
    } else {
      html += descentBars(reps);
      if (reps.length >= 5) html += deltaChart(reps);
    }

    // Split cards
    var splitReps = reps.filter(function(r){return r.splits && r.splits.length>=2});
    if (splitReps.length >= 3) {
      html += splitCards(splitReps);
      if (splitReps.length >= 4) html += splitProgression(splitReps);
    } else if (splitReps.length > 0) {
      html += inlineSplits(splitReps);
    }

    // Summary
    html += summaryCards(reps);
    html += '</div>';
  });

  if (data.hiLo) html += hiLoBlock(data.hiLo);
  html += '</div>';
  return html;
}

// ═══ 1. DESCENT BARS ═══
function descentBars(reps) {
  var times = reps.map(function(r){return timeToSec(r.time)});
  var fastest = Math.min.apply(null, times), slowest = Math.max.apply(null, times);
  var range = slowest - fastest; if (range === 0) range = fastest * 0.1 || 1;
  var descCount = 0;
  for (var i=1;i<times.length;i++) if(times[i]<=times[i-1]+0.5)descCount++;
  var isDesc = descCount >= (times.length-1)*0.6;

  var h = '<div style="display:flex;gap:6px;align-items:flex-end;height:130px;margin:12px 0 6px">';
  reps.forEach(function(r, i) {
    var sec = times[i];
    var pct = 40 + ((sec - fastest) / range) * 55;
    var color;
    if (isDesc) {
      var progress = i / (reps.length - 1);
      if (progress < 0.3) color = '#B4B2A9';
      else if (progress < 0.6) color = '#5DCAA5';
      else if (progress < 0.85) color = '#1D9E75';
      else color = '#0F6E56';
      if (sec === fastest) color = '#0F6E56';
    } else { color = '#B4B2A9'; }
    h += '<div style="display:flex;flex-direction:column;align-items:center;flex:1">';
    h += '<div style="font-size:11px;font-weight:500;margin-bottom:3px;white-space:nowrap">' + esc(r.time) + '</div>';
    h += '<div style="width:100%;height:' + pct + '%;background:' + color + ';border-radius:3px 3px 0 0;min-width:16px"></div>';
    h += '<div style="font-size:10px;color:#6B6B6B;margin-top:4px">#' + r.rep + '</div></div>';
  });
  h += '</div>';
  var drop = slowest - fastest;
  if (isDesc) h += '<span class="pacing-tag tag-green">Descended ' + drop.toFixed(1) + 's across ' + reps.length + ' reps</span>';
  else if (drop < 1.5) h += '<span class="pacing-tag tag-green">Held pace \u2014 ' + drop.toFixed(1) + 's spread</span>';
  else h += '<span class="pacing-tag tag-amber">Spread: ' + drop.toFixed(1) + 's</span>';
  return h;
}

// ═══ 2. SPLIT CARDS ═══
function splitCards(reps) {
  var h = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0">';
  reps.forEach(function(r) {
    if (!r.splits || r.splits.length < 2) return;
    var front = r.splits[0], back = r.splits[1];
    var diff = timeToSec(back) - timeToSec(front), isNeg = diff < 0;
    h += '<div style="flex:1;min-width:100px;max-width:150px;background:#fff;border-radius:8px;padding:8px 10px;text-align:center;border:0.5px solid #E8E4DD">';
    h += '<div style="font-size:10px;color:#6B6B6B;margin-bottom:2px">#' + r.rep + '</div>';
    h += '<div style="font-size:14px;font-weight:500;margin-bottom:4px">' + esc(r.time) + '</div>';
    h += '<div style="display:flex;gap:4px;justify-content:center">';
    h += '<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:#E6F1FB;color:#0C447C">' + esc(front) + '</span>';
    h += '<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:' + (isNeg?'#EAF3DE':'#FCEBEB') + ';color:' + (isNeg?'#27500A':'#791F1F') + '">' + esc(back) + '</span>';
    h += '</div><div style="font-size:10px;color:' + (isNeg?'#27500A':'#791F1F') + ';margin-top:2px">' + (diff>=0?'+':'') + diff.toFixed(2) + '</div></div>';
  });
  h += '</div>';
  var negCount = 0, total = 0;
  reps.forEach(function(r) { if (r.splits && r.splits.length >= 2) { total++; if (timeToSec(r.splits[1]) < timeToSec(r.splits[0])) negCount++; }});
  if (total > 0) h += '<span class="pacing-tag ' + (negCount >= total*0.7 ? 'tag-green' : 'tag-amber') + '">Negative splits: ' + negCount + ' of ' + total + '</span>';
  return h;
}

// ═══ 3. STAT BLOCK ═══
function statBlock(reps) {
  var times = reps.map(function(r){return timeToSec(r.time)}), fastest = Math.min.apply(null, times);
  var h = '<div style="display:flex;gap:8px;margin:12px 0;align-items:center">';
  reps.forEach(function(r, i) {
    var isFastest = times[i] === fastest && reps.length > 1;
    var border = isFastest ? 'border:1.5px solid #5DCAA5' : 'border:0.5px solid #E8E4DD';
    h += '<div style="flex:1;text-align:center;padding:14px 12px;background:#fff;border-radius:8px;' + border + '">';
    h += '<div style="font-size:10px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">' + (r.distance || 'Rep ' + r.rep) + '</div>';
    h += '<div style="font-size:24px;font-weight:500;font-family:Fraunces,Georgia,serif">' + esc(r.time) + '</div></div>';
    if (i < reps.length - 1) h += '<div style="font-size:16px;color:#1D9E75;flex-shrink:0;padding:0 2px">\u2192</div>';
  });
  h += '</div>';
  if (reps.length >= 2) {
    var spread = (Math.max.apply(null,times) - Math.min.apply(null,times)).toFixed(1);
    h += '<div class="cs-insight">Spread: ' + spread + 's across ' + reps.length + ' reps' + (parseFloat(spread) < 1 ? ' \u2014 consistent' : '') + '</div>';
  }
  return h;
}

// ═══ 4. BARS WITH HR OVERLAY ═══
function barsWithHR(reps) {
  var times = reps.map(function(r){return timeToSec(r.time)});
  var fastest = Math.min.apply(null,times), slowest = Math.max.apply(null,times);
  var range = slowest - fastest; if(range===0)range=1;
  var validHR = reps.filter(function(r){return r.hr}).map(function(r){return r.hr});
  var maxHR = validHR.length ? Math.max.apply(null,validHR) : 30;
  var minHR = validHR.length ? Math.min.apply(null,validHR) : 20;
  var w = 600, ht = 200;

  var h = '<div style="display:flex;gap:16px;font-size:11px;color:#6B6B6B;margin-bottom:8px">';
  h += '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#B4B2A9;margin-right:4px;vertical-align:middle"></span>Rep time</span>';
  if (validHR.length) h += '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#E24B4A;margin-right:4px;vertical-align:middle"></span>HR (10-sec)</span>';
  h += '<span style="font-size:10px;color:#999">White 23-25 \u00b7 Pink 26-27</span></div>';

  h += '<svg viewBox="0 0 ' + w + ' ' + ht + '" style="width:100%;max-width:620px">';
  h += '<rect x="50" y="10" width="' + (w-60) + '" height="25" fill="#94a3b8" opacity="0.06"/>';
  h += '<text x="' + (w-5) + '" y="28" text-anchor="end" font-size="7" fill="#94a3b8" font-weight="500">WHITE</text>';
  h += '<rect x="50" y="35" width="' + (w-60) + '" height="12" fill="#fb7185" opacity="0.06"/>';
  h += '<text x="' + (w-5) + '" y="44" text-anchor="end" font-size="7" fill="#fb7185" font-weight="500">PINK</text>';
  var barW = Math.min(50, (w-80)/reps.length - 4), barTop = 60, barBot = ht - 25;
  reps.forEach(function(r, i) {
    var pct = 0.35 + ((times[i]-fastest)/range)*0.55;
    var bH = pct * (barBot - barTop), x = 60 + i*((w-80)/reps.length), y = barBot - bH;
    h += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + bH + '" fill="#B4B2A9" opacity="0.3" rx="2"/>';
    h += '<text x="' + (x+barW/2) + '" y="' + (y-4) + '" text-anchor="middle" font-size="10" fill="#121212" font-weight="500">' + esc(r.time) + '</text>';
    h += '<text x="' + (x+barW/2) + '" y="' + (barBot+14) + '" text-anchor="middle" font-size="9" fill="#6B6B6B">#' + r.rep + '</text>';
  });
  if (validHR.length >= 2) {
    var hrRange = maxHR - minHR || 1, pts = [];
    reps.forEach(function(r, i) {
      if (r.hr) { var x = 60 + i*((w-80)/reps.length) + barW/2; var y = 15 + (1 - (r.hr - minHR + 1)/(hrRange + 2)) * 28; pts.push({x:x,y:y,hr:r.hr}); }
    });
    if (pts.length >= 2) {
      h += '<polyline points="' + pts.map(function(p){return p.x+','+p.y}).join(' ') + '" fill="none" stroke="#E24B4A" stroke-width="2"/>';
      pts.forEach(function(p) {
        h += '<circle cx="' + p.x + '" cy="' + p.y + '" r="5" fill="' + (p.hr <= 25 ? '#E24B4A' : '#D4537E') + '"/>';
        h += '<text x="' + p.x + '" y="' + (p.y-8) + '" text-anchor="middle" font-size="9" fill="#791F1F" font-weight="500">' + p.hr + '</text>';
      });
    }
  }
  h += '</svg>';
  return h;
}

// ═══ 5. PACE REFERENCE BARS ═══
function paceReferenceBars(reps, targetPace) {
  var times = reps.map(function(r){return timeToSec(r.time)});
  var target = targetPace ? timeToSec(targetPace) : null;
  var all = times.slice(); if (target) all.push(target);
  var max = Math.max.apply(null, all), min = Math.min.apply(null, all), range = max - min || 1;

  var h = '<div style="display:flex;gap:6px;align-items:flex-end;height:110px;position:relative;margin:12px 0 6px">';
  if (target) {
    var tPct = 100 - ((target - min) / range) * 70 - 15;
    h += '<div style="position:absolute;left:0;right:0;top:' + tPct + '%;border-top:1.5px dashed #EF9F27;z-index:1"></div>';
  }
  reps.forEach(function(r, i) {
    var sec = times[i], pct = 20 + ((sec - min) / range) * 70;
    var under = target && sec <= target;
    h += '<div style="display:flex;flex-direction:column;align-items:center;flex:1;z-index:2">';
    h += '<div style="font-size:11px;font-weight:500;margin-bottom:3px">' + esc(r.time) + '</div>';
    h += '<div style="width:100%;height:' + pct + '%;background:' + (under?'#5DCAA5':'#F09595') + ';border-radius:3px 3px 0 0"></div>';
    h += '<div style="font-size:10px;color:#6B6B6B;margin-top:4px">#' + r.rep + '</div>';
    if (target) { var d = sec - target; h += '<div style="font-size:10px;font-weight:500;color:' + (under?'#27500A':'#791F1F') + '">' + (d>=0?'+':'') + d.toFixed(1) + '</div>'; }
    h += '</div>';
  });
  h += '</div>';
  return h;
}

// ═══ 6. CONSISTENCY SCATTER ═══
function consistencyScatter(reps) {
  if (reps.length < 5) return '';
  var times = reps.map(function(r){return timeToSec(r.time)}).filter(function(t){return t>0});
  if (times.length < 5) return '';
  var max = Math.max.apply(null,times), min = Math.min.apply(null,times), range = max - min || 0.1;
  var fastest = Math.min.apply(null, times);
  var w = 580, ht = 120, padL = 40, padT = 10, padB = 15;

  var h = '<svg viewBox="0 0 ' + w + ' ' + ht + '" style="width:100%;max-width:600px;margin:8px 0">';
  h += '<line x1="' + padL + '" y1="' + (ht-padB) + '" x2="' + (w-10) + '" y2="' + (ht-padB) + '" stroke="#E8E4DD" stroke-width="0.5"/>';
  h += '<text x="' + (padL-4) + '" y="' + (padT+8) + '" text-anchor="end" font-size="8" fill="#6B6B6B">' + fmtTime(min) + '</text>';
  h += '<text x="' + (padL-4) + '" y="' + (ht-padB-2) + '" text-anchor="end" font-size="8" fill="#6B6B6B">' + fmtTime(max) + '</text>';
  reps.forEach(function(r, i) {
    var sec = timeToSec(r.time); if (sec <= 0) return;
    var x = padL + 10 + (i / (reps.length-1)) * (w - padL - 20);
    var y = padT + ((max - sec) / range) * (ht - padT - padB);
    var isFastest = sec === fastest;
    h += '<circle cx="' + x + '" cy="' + y + '" r="' + (isFastest?6:4) + '" fill="' + (isFastest?'#1D9E75':'#378ADD') + '"' + (isFastest?' stroke="#0F6E56" stroke-width="1.5"':'') + '/>';
  });
  h += '</svg>';
  return h;
}

// ═══ 7. SPLIT PROGRESSION LINES ═══
function splitProgression(reps) {
  var splitReps = reps.filter(function(r){return r.splits && r.splits.length>=2});
  if (splitReps.length < 3) return '';
  var fronts = splitReps.map(function(r){return timeToSec(r.splits[0])});
  var backs = splitReps.map(function(r){return timeToSec(r.splits[1])});
  var all = fronts.concat(backs);
  var max = Math.max.apply(null,all), min = Math.min.apply(null,all), range = max - min || 1;
  var w = 580, ht = 160, padL = 55, padR = 15, padT = 20, padB = 25;
  var cw = w - padL - padR, ch = ht - padT - padB;

  var h = '<div style="display:flex;gap:16px;font-size:11px;color:#6B6B6B;margin:8px 0 4px">';
  h += '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#378ADD;margin-right:4px;vertical-align:middle"></span>Front half</span>';
  h += '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#1D9E75;margin-right:4px;vertical-align:middle"></span>Back half</span></div>';
  h += '<svg viewBox="0 0 ' + w + ' ' + ht + '" style="width:100%;max-width:600px">';
  for (var g=0;g<=3;g++) {
    var gy = padT + (g/3)*ch;
    h += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (w-padR) + '" y2="' + gy + '" stroke="#E8E4DD" stroke-width="0.5" stroke-dasharray="3"/>';
    h += '<text x="' + (padL-6) + '" y="' + (gy+4) + '" text-anchor="end" font-size="8" fill="#6B6B6B">' + (max - (g/3)*range).toFixed(0) + 's</text>';
  }
  // Gap bars
  splitReps.forEach(function(r, i) {
    var x = padL + (i/(splitReps.length-1))*cw;
    var fy = padT + ((max-fronts[i])/range)*ch, by = padT + ((max-backs[i])/range)*ch;
    h += '<rect x="' + (x-8) + '" y="' + Math.min(fy,by) + '" width="16" height="' + Math.abs(by-fy) + '" rx="2" fill="#F1EFE8" opacity="0.6"/>';
  });
  // Lines
  var fPts=[], bPts=[];
  splitReps.forEach(function(r,i) {
    var x = padL + (i/(splitReps.length-1))*cw;
    fPts.push(x+','+(padT+((max-fronts[i])/range)*ch));
    bPts.push(x+','+(padT+((max-backs[i])/range)*ch));
  });
  h += '<polyline points="' + fPts.join(' ') + '" fill="none" stroke="#378ADD" stroke-width="2"/>';
  h += '<polyline points="' + bPts.join(' ') + '" fill="none" stroke="#1D9E75" stroke-width="2"/>';
  // Dots + labels
  splitReps.forEach(function(r,i) {
    var x = padL + (i/(splitReps.length-1))*cw;
    var fy = padT + ((max-fronts[i])/range)*ch, by = padT + ((max-backs[i])/range)*ch;
    h += '<circle cx="' + x + '" cy="' + fy + '" r="4" fill="#378ADD"/>';
    h += '<circle cx="' + x + '" cy="' + by + '" r="4" fill="#1D9E75"/>';
    h += '<text x="' + x + '" y="' + (fy-7) + '" text-anchor="middle" font-size="8" fill="#0C447C">' + r.splits[0] + '</text>';
    h += '<text x="' + x + '" y="' + (by+13) + '" text-anchor="middle" font-size="8" fill="#085041">' + r.splits[1] + '</text>';
    h += '<text x="' + x + '" y="' + (ht-4) + '" text-anchor="middle" font-size="8" fill="#6B6B6B">#' + r.rep + '</text>';
  });
  h += '</svg>';
  return h;
}

// ═══ 8. DELTA CHART ═══
function deltaChart(reps) {
  var times = reps.map(function(r){return timeToSec(r.time)});
  var deltas = [0]; for (var i=1;i<times.length;i++) deltas.push(times[i]-times[i-1]);
  var maxD = Math.max.apply(null, deltas.map(Math.abs)); if (maxD===0) maxD=1;
  var w = 580, ht = 130, mid = 65, barW = Math.min(42, (w-70)/reps.length - 6);

  var h = '<svg viewBox="0 0 ' + w + ' ' + ht + '" style="width:100%;max-width:600px;margin:12px 0">';
  h += '<line x1="50" y1="' + mid + '" x2="' + (w-10) + '" y2="' + mid + '" stroke="#888" stroke-width="1"/>';
  h += '<text x="' + (w-5) + '" y="' + (mid-8) + '" font-size="9" fill="#27500A" text-anchor="end">faster</text>';
  h += '<text x="' + (w-5) + '" y="' + (mid+16) + '" font-size="9" fill="#791F1F" text-anchor="end">slower</text>';
  deltas.forEach(function(d, i) {
    var x = 55 + i*((w-70)/reps.length), maxBarH = mid-15;
    var barH = Math.abs(d)/maxD*maxBarH; if(i===0)barH=2;
    var color, tc;
    if(i===0){color='#B4B2A9';tc='#6B6B6B';}
    else if(d<=0){color=d<-maxD*0.3?'#1D9E75':'#5DCAA5';tc='#085041';}
    else{color='#F09595';tc='#791F1F';}
    var label=i===0?'0':(d>=0?'+':'')+d.toFixed(1);
    if(d<=0||i===0){
      h+='<rect x="'+x+'" y="'+(mid-barH)+'" width="'+barW+'" height="'+Math.max(barH,1)+'" fill="'+color+'" rx="2"/>';
      h+='<text x="'+(x+barW/2)+'" y="'+(mid-barH-5)+'" text-anchor="middle" font-size="10" fill="'+tc+'" font-weight="500">'+label+'</text>';
    } else {
      h+='<rect x="'+x+'" y="'+mid+'" width="'+barW+'" height="'+barH+'" fill="'+color+'" rx="2"/>';
      h+='<text x="'+(x+barW/2)+'" y="'+(mid+barH+13)+'" text-anchor="middle" font-size="10" fill="'+tc+'" font-weight="500">'+label+'</text>';
    }
    h+='<text x="'+(x+barW/2)+'" y="'+(ht-3)+'" text-anchor="middle" font-size="9" fill="#6B6B6B">#'+reps[i].rep+'</text>';
  });
  h += '</svg>';
  return h;
}

// ═══ 9. PER-50 PACE NORMALIZATION ═══
function per50Pace(reps) {
  var paces = [];
  reps.forEach(function(r) {
    var sec = timeToSec(r.time), dist = parseInt(r.distance) || 0;
    if (sec > 0 && dist > 0) paces.push({ rep:r.rep, dist:dist, per50:(sec/dist)*50 });
  });
  if (paces.length < 2) return '';
  var max = Math.max.apply(null, paces.map(function(p){return p.per50}));
  var min = Math.min.apply(null, paces.map(function(p){return p.per50}));
  var range = max - min || 1;

  var h = '<div style="display:flex;gap:6px;align-items:flex-end;height:100px;margin:12px 0 6px">';
  paces.forEach(function(p, i) {
    var pct = 30 + ((p.per50-min)/range)*60;
    var color = i === paces.length-1 ? '#1D9E75' : (i < paces.length/2 ? '#B4B2A9' : '#378ADD');
    h += '<div style="display:flex;flex-direction:column;align-items:center;flex:1">';
    h += '<div style="font-size:11px;font-weight:500;margin-bottom:3px">' + p.per50.toFixed(1) + '</div>';
    h += '<div style="width:100%;height:' + pct + '%;background:' + color + ';border-radius:3px 3px 0 0"></div>';
    h += '<div style="font-size:9px;color:#6B6B6B;margin-top:3px">' + p.dist + 's</div></div>';
  });
  h += '</div><div style="font-size:11px;color:#6B6B6B;margin-top:4px">Per-50 pace (seconds)</div>';
  return h;
}

// ═══ 10. SESSION COMPARISON ═══
function sessionComparison(currentReps, previousReps) {
  if (!previousReps || previousReps.length === 0) return '';
  var len = Math.min(currentReps.length, previousReps.length);
  var allTimes = [];
  for (var i=0;i<len;i++) { allTimes.push(timeToSec(currentReps[i].time)); allTimes.push(timeToSec(previousReps[i].time)); }
  var max = Math.max.apply(null,allTimes), min = Math.min.apply(null,allTimes), range = max-min||1;

  var h = '<div style="display:flex;gap:16px;font-size:11px;color:#6B6B6B;margin-bottom:8px">';
  h += '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#185FA5;margin-right:4px;vertical-align:middle"></span>Today</span>';
  h += '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#D3D1C7;margin-right:4px;vertical-align:middle"></span>Previous</span></div>';
  h += '<div style="display:flex;gap:6px;align-items:flex-end;height:120px;margin-bottom:8px">';
  for (var i=0;i<len;i++) {
    var cur = timeToSec(currentReps[i].time), prev = timeToSec(previousReps[i].time);
    var curPct = 20+((cur-min)/range)*70, prevPct = 20+((prev-min)/range)*70;
    var faster = cur < prev, col = faster ? '#1D9E75' : '#185FA5';
    h += '<div style="display:flex;flex-direction:column;align-items:center;flex:1">';
    h += '<div style="font-size:10px;font-weight:500;margin-bottom:3px;' + (faster?'color:#1D9E75':'') + '">' + currentReps[i].time + '</div>';
    h += '<div style="position:relative;width:100%;height:' + Math.max(curPct,prevPct) + '%">';
    h += '<div style="position:absolute;bottom:0;width:100%;height:' + prevPct + '%;background:#D3D1C7;border-radius:3px 3px 0 0;opacity:0.4"></div>';
    h += '<div style="position:absolute;bottom:0;width:100%;height:' + curPct + '%;background:' + col + ';border-radius:3px 3px 0 0"></div>';
    h += '</div><div style="font-size:10px;color:#6B6B6B;margin-top:4px">#' + currentReps[i].rep + '</div></div>';
  }
  h += '</div>';
  return h;
}

// ═══ 11. EFFORT DISTRIBUTION ═══
function effortDistribution(sets) {
  var zones = {}, total = 0;
  sets.forEach(function(set) {
    var zone = set.zone || 'mixed', yards = 0;
    (set.reps||[]).forEach(function(r){yards += parseInt(r.distance)||0;});
    if (!zones[zone]) zones[zone] = 0;
    zones[zone] += yards; total += yards;
  });
  if (total === 0) return '';
  var zc = {white:{bg:'#F1EFE8',t:'#444441'},pink:{bg:'#FBEAF0',t:'#72243E'},red:{bg:'#FCEBEB',t:'#791F1F'},blue:{bg:'#E6F1FB',t:'#0C447C'},mixed:{bg:'#F1EFE8',t:'#5F5E5A'}};
  var h = '<div style="height:28px;display:flex;border-radius:8px;overflow:hidden;margin:8px 0">';
  Object.keys(zones).forEach(function(z) {
    var pct = Math.round(zones[z]/total*100), c = zc[z]||zc.mixed;
    h += '<div style="flex:' + pct + ';background:' + c.bg + ';display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;color:' + c.t + ';min-width:30px">' + z + '</div>';
  });
  h += '</div>';
  return h;
}

// ═══ 12. DURATION BARS ═══
function durationBars(phases) {
  if (!phases || phases.length === 0) return '';
  var h = '';
  phases.forEach(function(phase) {
    h += '<div style="font-size:11px;color:#6B6B6B;font-weight:500;margin:10px 0 4px;padding-top:6px;border-top:0.5px solid #E8E4DD">' + esc(phase.label) + '</div>';
    var maxDur = Math.max.apply(null, phase.reps.map(function(r){return r.duration||0})); if(maxDur===0) maxDur=1;
    h += '<div style="display:flex;gap:6px;align-items:flex-end;height:' + Math.min(90, maxDur*2+30) + 'px">';
    phase.reps.forEach(function(r, i) {
      var pct = ((r.duration||0)/maxDur)*85+10;
      h += '<div style="display:flex;flex-direction:column;align-items:center;flex:1">';
      h += '<div style="font-size:11px;font-weight:500;margin-bottom:3px">' + (r.duration||'?') + 's</div>';
      h += '<div style="width:100%;height:' + pct + '%;background:' + (phase.color||'#378ADD') + ';border-radius:3px 3px 0 0"></div>';
      h += '<div style="font-size:9px;color:#6B6B6B;margin-top:3px">#' + (i+1) + '</div></div>';
    });
    h += '</div>';
  });
  return h;
}

// ═══ 13. HI-LO RECOVERY ═══
function hiLoBlock(hiLo) {
  if (!hiLo) return '';
  var hi = hiLo.hi||0, lo = hiLo.lo||0;
  if (hi < lo) { var tmp = hi; hi = lo; lo = tmp; }
  var drop = hi - lo, isGood = drop >= 10;
  var h = '<div style="background:#FAF9F6;border-radius:8px;padding:18px 24px;margin-top:20px;border:0.5px solid #E8E4DD">';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;text-align:center;margin-bottom:12px">';
  h += '<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#6B6B6B;font-weight:500;margin-bottom:4px">Hi pulse</div><div style="font-family:Fraunces,Georgia,serif;font-size:1.8rem;font-weight:600">' + hi + '</div></div>';
  h += '<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#6B6B6B;font-weight:500;margin-bottom:4px">Lo \u00b7 1 min</div><div style="font-family:Fraunces,Georgia,serif;font-size:1.8rem;font-weight:600">' + lo + '</div></div>';
  h += '<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#6B6B6B;font-weight:500;margin-bottom:4px">Drop</div><div style="font-family:Fraunces,Georgia,serif;font-size:1.8rem;font-weight:600;color:' + (isGood?'#27500A':'#854F0B') + '">-' + drop + '</div></div>';
  h += '</div><div style="font-size:13px;color:#6B6B6B;text-align:center;padding-top:10px;border-top:0.5px solid #E8E4DD">';
  h += isGood ? 'Strong recovery. Aerobic engine responding well.' : 'Building toward the 10-count recovery target. Consistent training at this intensity will widen the gap over time.';
  h += '</div></div>';
  return h;
}

// ═══ 14. INLINE SPLITS ═══
function inlineSplits(splitReps) {
  var h = '<div style="display:flex;gap:8px;margin:12px 0;flex-wrap:wrap">';
  splitReps.forEach(function(r) {
    var front = r.splits[0], back = r.splits[1];
    var diff = timeToSec(back) - timeToSec(front), isNeg = diff < 0;
    h += '<div style="background:#fff;border-radius:8px;padding:10px 14px;border:0.5px solid #E8E4DD;text-align:center;min-width:120px">';
    h += '<div style="font-size:10px;color:#6B6B6B;margin-bottom:4px">Rep ' + r.rep + ' splits</div>';
    h += '<div style="font-size:15px;font-weight:500;margin-bottom:6px">' + esc(r.time) + '</div>';
    h += '<div style="display:flex;gap:4px;justify-content:center">';
    h += '<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:#E6F1FB;color:#0C447C">' + esc(front) + '</span>';
    h += '<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:' + (isNeg?'#EAF3DE':'#FCEBEB') + ';color:' + (isNeg?'#27500A':'#791F1F') + '">' + esc(back) + '</span>';
    h += '</div><div style="font-size:11px;color:' + (isNeg?'#27500A':'#791F1F') + ';margin-top:4px;font-weight:500">' + (diff>=0?'+':'') + diff.toFixed(2) + 's</div></div>';
  });
  h += '</div>';
  return h;
}

// ═══ SUMMARY CARDS ═══
function summaryCards(reps) {
  var times = reps.map(function(r){return timeToSec(r.time)}).filter(function(t){return t>0});
  if (times.length === 0) return '';
  var fastest = Math.min.apply(null,times), slowest = Math.max.apply(null,times);
  var spread = slowest-fastest, fastIdx = times.indexOf(fastest);
  var avg = times.reduce(function(a,b){return a+b},0)/times.length;
  var h = '<div style="display:flex;gap:12px;margin-top:14px">';
  h += '<div class="cs-summary"><div class="cs-sum-label">Fastest</div><div class="cs-sum-val">' + fmtTime(fastest) + '</div><div class="cs-sum-sub">Rep ' + reps[fastIdx].rep + '</div></div>';
  h += '<div class="cs-summary"><div class="cs-sum-label">Spread</div><div class="cs-sum-val">' + spread.toFixed(1) + 's</div><div class="cs-sum-sub">Across ' + reps.length + ' reps</div></div>';
  if (reps.length >= 4) h += '<div class="cs-summary"><div class="cs-sum-label">Average</div><div class="cs-sum-val">' + fmtTime(avg) + '</div><div class="cs-sum-sub">' + reps.length + ' reps</div></div>';
  h += '</div>';
  return h;
}

// ═══ EXPORTS ═══
if (typeof window !== 'undefined') {
  window.renderAllCharts = renderAllCharts;
  window.paceReferenceBars = paceReferenceBars;
  window.consistencyScatter = consistencyScatter;
  window.splitProgression = splitProgression;
  window.per50Pace = per50Pace;
  window.sessionComparison = sessionComparison;
  window.effortDistribution = effortDistribution;
  window.durationBars = durationBars;
}
