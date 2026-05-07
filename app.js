
var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2cK3ByWYn6HxMfZfsLRWu8AlS-mH6hXlphoXPxwe_1b_SQoWeHGoBoutVjB85Tmg/exec';
var DC = {D:'#E63946',I:'#F4A261',S:'#2A9D8F',C:'#457B9D'};

var st = {
  nombre:'', empresa:'', pais:'',
  purpose:null, mode:null,
  arquetipo:'', arquNombre:'', intensidad:10,
  D:5, I:5, S:5, C:5,
  perfProf:{D:5,I:5,S:5,C:5},
  perfRel:{D:5,I:5,S:5,C:5},
  similitud:5, pdfDone:false,
  industry:'', role:''
};

// -- PAGE NAVIGATION ------------------------------------
function showPage(id) {
  document.querySelectorAll('.page').forEach(function(p) { p.style.display = 'none'; });
  var el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

function updateDots(n) {
  for (var i = 0; i < 4; i++) {
    var d = document.getElementById('d' + i);
    var l = document.getElementById('l' + i);
    if (d) d.className = 'dot' + (i === n ? ' on' : i < n ? ' done' : '');
    if (l) l.className = 'dlbl' + (i === n ? ' on' : '');
  }
}

// -- INIT -----------------------------------------------
window.onload = function() {
  showPage('p0');
  updateDots(0);

  // PAGE 0 button
  document.getElementById('btn0').addEventListener('click', function() {
    st.nombre = document.getElementById('inp-nombre').value.trim();
    st.empresa = document.getElementById('inp-empresa').value.trim();
    st.pais = document.getElementById('inp-pais').value;
    if (!st.nombre || !st.empresa || !st.pais) {
      alert('Por favor completa todos los campos: nombre, empresa y pais');
      return;
    }
    showPage('p1'); updateDots(1); window.scrollTo(0,0);
  });

  // PAGE 1 - purpose cards
  document.getElementById('p-sel').addEventListener('click', function() {
    st.purpose = 'selection';
    document.getElementById('p-sel').classList.add('sel');
    document.getElementById('p-dev').classList.remove('sel');
    document.getElementById('btn1').disabled = false;
    if (st.mode === 'manual') document.getElementById('sec-pr').classList.remove('hidden');
  });
  document.getElementById('p-dev').addEventListener('click', function() {
    st.purpose = 'development';
    document.getElementById('p-dev').classList.add('sel');
    document.getElementById('p-sel').classList.remove('sel');
    document.getElementById('btn1').disabled = false;
    document.getElementById('sec-pr').classList.add('hidden');
  });
  document.getElementById('btn1b').addEventListener('click', function() { showPage('p0'); updateDots(0); window.scrollTo(0,0); });
  document.getElementById('btn1').addEventListener('click', function() { showPage('p2'); updateDots(2); setTimeout(drawRadar,100); window.scrollTo(0,0); });

  // PAGE 2 - mode selection
  document.getElementById('m-pdf').addEventListener('click', function() {
    st.mode = 'pdf';
    document.getElementById('m-pdf').classList.add('sel');
    document.getElementById('m-man').classList.remove('sel');
    document.getElementById('sec-pdf').classList.remove('hidden');
    document.getElementById('sec-man').classList.add('hidden');
    checkBtn2();
  });
  document.getElementById('m-man').addEventListener('click', function() {
    st.mode = 'manual';
    document.getElementById('m-man').classList.add('sel');
    document.getElementById('m-pdf').classList.remove('sel');
    document.getElementById('sec-man').classList.remove('hidden');
    document.getElementById('sec-pdf').classList.add('hidden');
    if (st.purpose === 'selection') document.getElementById('sec-pr').classList.remove('hidden');
    checkBtn2();
  });

  // PDF zone
  document.getElementById('pzone').addEventListener('click', function() { document.getElementById('finput').click(); });
  document.getElementById('finput').addEventListener('change', function() { if (this.files[0]) handlePDF(this.files[0]); });

  // Manual archetype select
  document.getElementById('sel-arq').addEventListener('change', function() {
    if (!this.value) return;
    var parts = this.value.split('|');
    st.arquetipo = parts[0]; st.arquNombre = parts[1];
    checkBtn2();
  });

  // Sliders
  ['int','D','I','S','C'].forEach(function(k) {
    var el = document.getElementById('r-' + k);
    if (!el) return;
    el.addEventListener('input', function() {
      var v = parseInt(this.value);
      var lk = k === 'int' ? 'intensidad' : k;
      st[lk] = v;
      document.getElementById('v-' + k).textContent = v;
      var col = DC[k] || '#E91E8C';
      this.style.background = 'linear-gradient(to right,' + col + ' ' + (v*10) + '%,#f3f4f6 ' + (v*10) + '%)';
      drawRadar();
    });
  });

  // Prof/Rel sliders
  ['D','I','S','C'].forEach(function(k) {
    ['pp','pr'].forEach(function(pfx) {
      var el = document.getElementById('r-' + pfx + k);
      if (!el) return;
      el.addEventListener('input', function() {
        var v = parseInt(this.value);
        var prof = pfx === 'pp' ? 'perfProf' : 'perfRel';
        st[prof][k] = v;
        document.getElementById('v-' + pfx + k).textContent = v;
        this.style.background = 'linear-gradient(to right,' + DC[k] + ' ' + (v*10) + '%,#e5e7eb ' + (v*10) + '%)';
      });
    });
  });
  var simEl = document.getElementById('r-sim');
  if (simEl) simEl.addEventListener('input', function() {
    st.similitud = parseInt(this.value);
    document.getElementById('v-sim').textContent = st.similitud;
    this.style.background = 'linear-gradient(to right,#E91E8C ' + (st.similitud*10) + '%,#e5e7eb ' + (st.similitud*10) + '%)';
  });

  document.getElementById('btn2b').addEventListener('click', function() { showPage('p1'); updateDots(1); window.scrollTo(0,0); });
  document.getElementById('btn2').addEventListener('click', function() {
    updSummary();
    showPage('p3'); updateDots(3); window.scrollTo(0,0);
  });

  // PAGE 3
  document.getElementById('inp-ind').addEventListener('change', function() {
    st.industry = this.value;
    document.getElementById('btn3').disabled = !st.industry;
  });
  document.getElementById('inp-role').addEventListener('input', function() { st.role = this.value; });
  document.getElementById('btn3b').addEventListener('click', function() { showPage('p2'); updateDots(2); window.scrollTo(0,0); });
  document.getElementById('btn3').addEventListener('click', genAnalysis);
  document.getElementById('btn-reset').addEventListener('click', resetApp);
};

function checkBtn2() {
  var ok = (st.mode === 'pdf' && st.pdfDone) || (st.mode === 'manual' && st.arquetipo);
  document.getElementById('btn2').disabled = !ok;
}

// -- RADAR ----------------------------------------------
function drawRadar() {
  var c = document.getElementById('radarChart');
  if (!c) return;
  var ctx = c.getContext('2d');
  var W=200, H=200, cx=100, cy=100, r=70;
  ctx.clearRect(0,0,W,H);
  var keys = ['D','I','S','C'];
  var angles = [-Math.PI/2, 0, Math.PI/2, Math.PI];
  for (var g=1;g<=5;g++) { ctx.beginPath();ctx.arc(cx,cy,r*g/5,0,2*Math.PI);ctx.strokeStyle='#e5e7eb';ctx.lineWidth=1;ctx.stroke(); }
  for (var i=0;i<4;i++) { ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*Math.cos(angles[i]),cy+r*Math.sin(angles[i]));ctx.strokeStyle='#d1d5db';ctx.lineWidth=1;ctx.stroke(); }
  ctx.beginPath();
  for (var i=0;i<4;i++) { var v=st[keys[i]]/10;var px=cx+r*v*Math.cos(angles[i]);var py=cy+r*v*Math.sin(angles[i]);if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py); }
  ctx.closePath();ctx.fillStyle='rgba(233,30,140,0.12)';ctx.fill();ctx.strokeStyle='#E91E8C';ctx.lineWidth=2;ctx.stroke();
  for (var i=0;i<4;i++) {
    var v=st[keys[i]]/10;var px=cx+r*v*Math.cos(angles[i]);var py=cy+r*v*Math.sin(angles[i]);
    ctx.beginPath();ctx.arc(px,py,5,0,2*Math.PI);ctx.fillStyle=DC[keys[i]];ctx.fill();
    var lx=cx+(r+16)*Math.cos(angles[i]);var ly=cy+(r+16)*Math.sin(angles[i]);
    ctx.font='bold 13px Manrope,sans-serif';ctx.fillStyle=DC[keys[i]];ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(keys[i],lx,ly);
  }
}

// -- PDF ------------------------------------------------
async function handlePDF(file) {
  var ps = document.getElementById('pstatus');
  ps.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:10px;color:#E91E8C;font-weight:600"><span class="spin" style="width:18px;height:18px"></span>Leyendo PDF...</div>';
  document.getElementById('pdf-err').classList.add('hidden');
  try {
    var arrayBuf = await file.arrayBuffer();
    var pdf = await pdfjsLib.getDocument({data:arrayBuf}).promise;
    var text = '';
    for (var i=1;i<=pdf.numPages;i++) {
      var page = await pdf.getPage(i);
      var tc = await page.getTextContent();
      text += tc.items.map(function(item){return item.str;}).join(' ') + '\n';
    }
    ps.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:10px;color:#E91E8C;font-weight:600"><span class="spin" style="width:18px;height:18px"></span>Interpretando con IA...</div>';
    var resp = await fetch(SCRIPT_URL, {method:'POST', redirect:'follow', body:JSON.stringify({action:'extractPDFText', text:text.substring(0,8000)})});
    var data = await resp.json();
    if (!data.success) throw new Error(data.error || 'Error');
    var d = data.data;
    st.arquetipo = d.arquetipo || ''; st.arquNombre = d.nombre || d.arquetipo || '';
    st.intensidad = d.intensidad || 10; st.D = d.D||5; st.I = d.I||5; st.S = d.S||5; st.C = d.C||5;
    st.perfProf = d.perfProf || {D:5,I:5,S:5,C:5}; st.perfRel = d.perfRel || {D:5,I:5,S:5,C:5};
    st.similitud = d.similitud || 5; st.pdfDone = true;
    if (d.nombreEvaluado && !st.nombre) { st.nombre = d.nombreEvaluado; document.getElementById('inp-nombre').value = d.nombreEvaluado; }
    ps.innerHTML = '<div style="color:#166534;font-weight:700">OK ' + st.arquNombre + ' (' + st.arquetipo + ') . Int. ' + st.intensidad + '/10</div>';
    var okDiv = document.getElementById('pdf-ok');
    okDiv.textContent = 'D:' + st.D + ' I:' + st.I + ' S:' + st.S + ' C:' + st.C;
    okDiv.classList.remove('hidden');
    drawRadar(); checkBtn2();
  } catch(e) {
    var er = document.getElementById('pdf-err');
    er.textContent = 'Error: ' + e.message + '. Usa modo manual.';
    er.classList.remove('hidden');
    ps.innerHTML = '<div style="font-size:26px;margin-bottom:8px"></div><div style="color:#E91E8C;font-size:14px;font-weight:600">Intenta de nuevo o usa modo manual</div>';
  }
}

// -- SUMMARY --------------------------------------------
function updSummary() {
  document.getElementById('sum-tags').innerHTML =
    '<span style="font-size:14px;font-weight:700;color:#1a1744">' + st.nombre + '</span> ' +
    '<span class="tag" style="background:#f3f4f6;color:#374151">' + st.empresa + '</span>' +
    '<span class="tag" style="background:#f3f4f6;color:#374151">' + st.pais + '</span>' +
    '<span class="tag" style="background:rgba(233,30,140,0.1);border:1px solid rgba(233,30,140,0.3);color:#E91E8C">' + (st.arquNombre||st.arquetipo||'Arquetipo') + '</span>' +
    '<span class="tag" style="background:#f3f4f6;color:#6b7280">' + (st.purpose==='selection'?' Seleccion':' Desarrollo') + '</span>';
}

// -- GENERATE -------------------------------------------
async function genAnalysis() {
  document.getElementById('gen-err').classList.add('hidden');
  document.getElementById('dotsBar').style.display = 'none';
  showPage('p-load');
  try {
    var resp = await fetch(SCRIPT_URL, {method:'POST', redirect:'follow', body:JSON.stringify({
      action:'generateAnalysis',
      nombre:st.nombre, empresa:st.empresa, pais:st.pais, purpose:st.purpose,
      arquetipo:st.arquetipo+'|'+st.arquNombre, intensidad:st.intensidad,
      D:st.D, I:st.I, S:st.S, C:st.C,
      perfProf:st.perfProf, perfRel:st.perfRel, similitud:st.similitud,
      industry:st.industry, role:st.role
    })});
    var data = await resp.json();
    if (!data.success) throw new Error(data.error || 'Error en el analisis');
    renderResults(data.data, data.data.sheetUrl);
    showPage('p-res');
  } catch(e) {
    document.getElementById('dotsBar').style.display = 'flex';
    showPage('p3'); updateDots(3);
    var er = document.getElementById('gen-err');
    er.textContent = 'Error: ' + e.message;
    er.classList.remove('hidden');
  }
}

// -- RENDER ---------------------------------------------
function li(arr, color) { return (arr||[]).map(function(x){return'<div class="li"><span style="color:'+color+';flex-shrink:0;font-weight:800;margin-top:1px">></span><span>'+x+'</span></div>';}).join(''); }
function tags(arr, bg, border, color) { return (arr||[]).map(function(t){return'<span class="tag" style="background:'+bg+';border:1px solid '+border+';color:'+color+'">'+t+'</span>';}).join(''); }

function radarSVG() {
  var keys=['D','I','S','C'], angles=[-Math.PI/2,0,Math.PI/2,Math.PI], r=55, cx=80, cy=80;
  var pts = keys.map(function(k,i){var v=st[k]/10;return{x:cx+r*v*Math.cos(angles[i]),y:cy+r*v*Math.sin(angles[i])};});
  var poly = pts.map(function(p){return p.x+','+p.y;}).join(' ');
  var grid='';for(var g=1;g<=5;g++){grid+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*g/5)+'" fill="none" stroke="#e5e7eb" stroke-width="1"/>';}
  var axes='';for(var i=0;i<4;i++){var px=cx+r*Math.cos(angles[i]),py=cy+r*Math.sin(angles[i]);axes+='<line x1="'+cx+'" y1="'+cy+'" x2="'+px+'" y2="'+py+'" stroke="#d1d5db" stroke-width="1"/>';}
  var dots='',lbls='';
  for(var i=0;i<4;i++){
    dots+='<circle cx="'+pts[i].x+'" cy="'+pts[i].y+'" r="4" fill="'+DC[keys[i]]+'"/>';
    var lx=cx+(r+16)*Math.cos(angles[i]),ly=cy+(r+16)*Math.sin(angles[i]);
    lbls+='<text x="'+lx+'" y="'+ly+'" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="800" fill="'+DC[keys[i]]+'">'+keys[i]+'</text>';
  }
  return '<svg width="160" height="160" viewBox="0 0 160 160">'+grid+axes+'<polygon points="'+poly+'" fill="rgba(233,30,140,0.12)" stroke="#E91E8C" stroke-width="2"/>'+dots+lbls+'</svg>';
}

function renderResults(r, sheetUrl) {
  var d = st;
  var discTags = ['D','I','S','C'].map(function(k){return'<span class="tag" style="background:'+DC[k]+'18;border:1px solid '+DC[k]+'44;color:'+DC[k]+';font-weight:700">'+k+' '+d[k]+'/10</span>';}).join('');
  var cargos = (r.cargos_alineados||[]).map(function(c){return'<div class="ci"><div class="ci-n">'+c.cargo+'</div><div class="ci-r">'+c.razon+'</div></div>';}).join('');
  var profB = function(data,color){return['D','I','S','C'].map(function(k){return'<div class="pbar-row"><span class="pbar-lbl" style="color:'+DC[k]+'">'+k+'</span><div class="pbar-track"><div class="pbar-fill" style="width:'+((data[k]||0)*10)+'%;background:'+color+'"></div></div><span class="pbar-val">'+(data[k]||0)+'</span></div>';}).join('');};

  var html =
    '<div class="hero">' +
      '<div style="font-size:10px;letter-spacing:2px;color:#E91E8C;font-weight:700;margin-bottom:6px">' + d.arquNombre + ' (' + d.arquetipo + ') . INT. ' + d.intensidad + '/10</div>' +
      '<h2>' + r.resumen_perfil + '</h2>' +
      '<div style="font-size:13px;color:#6b7280;margin-bottom:14px">' + d.nombre + ' . ' + d.empresa + ' . ' + d.pais + '</div>' +
      '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:18px">' + discTags + '</div>' +
      '<div style="display:flex;justify-content:center;margin-bottom:16px">' + radarSVG() + '</div>' +
      '<p style="color:#374151;line-height:1.75;font-size:14px">' + r.estilo_natural + '</p>' +
    '</div>' +
    '<div class="g2">' +
      '<div class="card"><div class="stitle"> Fortalezas Clave</div>' + li(r.fortalezas_clave,'#E91E8C') + '</div>' +
      '<div class="card"><div class="stitle">! Riesgos y Cuidados</div>' + li(r.riesgos_y_cuidados,'#E63946') + '</div>' +
    '</div>' +
    '<div class="g2">' +
      '<div class="card"><div class="stitle"> Motivadores</div>' + li(r.motivadores,'#F7941D') + '</div>' +
      '<div class="card"><div class="stitle"> Desmotivadores</div>' + li(r.desmotivadores,'#457B9D') + '</div>' +
    '</div>' +
    '<div class="card"><div class="stitle"> Tareas en las que Destaca</div><div style="display:flex;flex-wrap:wrap;gap:6px">' + tags(r.tareas_en_que_destaca,'rgba(42,157,143,0.1)','rgba(42,157,143,0.3)','#0f766e') + '</div></div>' +
    '<div class="card"><div class="stitle"> Cargos Alineados - ' + d.industry + '</div>' + cargos + '</div>' +
    '<div class="card"><div class="stitle"> Proyectos con Alto Potencial</div><div style="display:flex;flex-wrap:wrap;gap:6px">' + tags(r.proyectos_potenciales,'rgba(69,123,157,0.1)','rgba(69,123,157,0.3)','#1d4ed8') + '</div></div>' +
    '<div class="card"><div class="stitle"> Zona de Confort y Entorno Ideal</div><p style="color:#374151;line-height:1.75;font-size:14px">' + r.zona_de_confort + '</p></div>' +
    '<div class="g2">' +
      '<div class="card"><div class="stitle"> Como Aprende</div>' + li(r.como_aprende,'#E91E8C') + '</div>' +
      '<div class="card"><div class="stitle"> Como Comunicarse</div>' + li(r.como_comunicarse,'#F7941D') + '</div>' +
    '</div>' +
    '<div class="card" style="background:#fdf5fa;border-color:rgba(233,30,140,0.2)"><div class="stitle"> Dinamica Interna</div><p style="color:#374151;line-height:1.75;font-size:14px">' + r.dinamica_interna + '</p></div>';

  if (d.purpose === 'selection' && r.comparacion_perfiles) {
    var cp = r.comparacion_perfiles;
    var simColor = d.similitud>=7?'#166534':d.similitud>=4?'#92400e':'#991b1b';
    html +=
      '<div class="cmp">' +
        '<div class="stitle" style="color:#2D2B6B;border-color:rgba(45,43,107,0.15)"> Perfil Profesional vs Perfil Relacional</div>' +
        '<div class="g2" style="margin-bottom:14px">' +
          '<div><div style="font-size:11px;color:#E91E8C;font-weight:700;letter-spacing:1px;margin-bottom:10px">PROFESIONAL</div>' + profB(d.perfProf,'#E91E8C') + '</div>' +
          '<div><div style="font-size:11px;color:#F7941D;font-weight:700;letter-spacing:1px;margin-bottom:10px">RELACIONAL</div>' + profB(d.perfRel,'#F7941D') + '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:8px 12px;background:#f9fafb;border-radius:8px">' +
          '<span style="font-size:12px;color:#6b7280">Similitud:</span>' +
          '<div style="flex:1;height:7px;background:#e5e7eb;border-radius:3px;overflow:hidden"><div style="width:'+(d.similitud*10)+'%;height:100%;background:'+simColor+';border-radius:3px"></div></div>' +
          '<span style="font-size:13px;font-weight:800;color:'+simColor+'">'+d.similitud+'/10</span>' +
        '</div>' +
        '<p style="color:#374151;line-height:1.7;font-size:13px;margin-bottom:10px">' + cp.similitud_interpretacion + '</p>' +
        (cp.diferencias_clave&&cp.diferencias_clave.length?'<div style="font-size:10px;color:#9ca3af;font-weight:700;margin-bottom:6px">DIFERENCIAS CLAVE</div>'+li(cp.diferencias_clave,'#2D2B6B'):'') +
        '<div style="border-top:1px solid #e5e7eb;padding-top:12px;margin-top:10px">' +
          '<div style="font-size:10px;color:#E91E8C;font-weight:700;margin-bottom:6px">IMPLICACION PARA SELECCION</div>' +
          '<p style="color:#374151;line-height:1.7;font-size:13px;margin-bottom:10px">' + cp.implicacion_seleccion + '</p>' +
          '<div style="font-size:10px;color:#166534;font-weight:700;margin-bottom:6px">FIT CULTURAL - ' + d.industry + '</div>' +
          '<p style="color:#374151;line-height:1.7;font-size:13px;margin:0">' + cp.fit_cultural + '</p>' +
        '</div>' +
      '</div>';
  }

  html +=
    '<div class="card-accent">' +
      '<div class="stitle">* Recomendacion Final - ' + (d.purpose==='selection'?'Seleccion':'Desarrollo') + '</div>' +
      '<p style="color:#374151;line-height:1.8;font-size:14px">' + r.recomendacion_final + '</p>' +
    '</div>' +
    '<div class="card" style="text-align:center;padding:20px">' +
      (sheetUrl ?
        '<div class="ok" style="margin:0;text-align:center">OK Guardado en Google Sheets . <a href="'+sheetUrl+'" target="_blank" style="color:#E91E8C;font-weight:700">Abrir -></a></div>' :
        '<p style="color:#9ca3af;font-size:13px">Analisis completado</p>') +
    '</div>';

  document.getElementById('res-content').innerHTML = html;
}

// -- RESET ----------------------------------------------
function resetApp() {
  st = {nombre:'',empresa:'',pais:'',purpose:null,mode:null,arquetipo:'',arquNombre:'',intensidad:10,D:5,I:5,S:5,C:5,perfProf:{D:5,I:5,S:5,C:5},perfRel:{D:5,I:5,S:5,C:5},similitud:5,pdfDone:false,industry:'',role:''};
  ['inp-nombre','inp-empresa','inp-pais','inp-ind','inp-role','sel-arq'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
  ['p-sel','p-dev','m-pdf','m-man'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.remove('sel');});
  document.getElementById('sec-pdf').classList.add('hidden');
  document.getElementById('sec-man').classList.add('hidden');
  document.getElementById('sec-pr').classList.add('hidden');
  document.getElementById('pdf-ok').classList.add('hidden');
  document.getElementById('pdf-err').classList.add('hidden');
  document.getElementById('btn1').disabled = true;
  document.getElementById('btn2').disabled = true;
  document.getElementById('btn3').disabled = true;
  document.getElementById('dotsBar').style.display = 'flex';
  showPage('p0'); updateDots(0); window.scrollTo(0,0);
}
