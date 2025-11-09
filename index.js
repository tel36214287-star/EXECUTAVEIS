// launch.js - inicialização da Calculadora Agritech

document.addEventListener('DOMContentLoaded', () => {
  const cropSelect = document.getElementById('crop');
  const usePresetCheckbox = document.getElementById('usePreset');

  // Função de highlight para inputs
  const highlight = id => {
    const el = document.getElementById(id);
    el.style.boxShadow = '0 6px 18px rgba(46,125,50,0.12)';
    setTimeout(() => el.style.boxShadow = '', 350);
  };

  // Função pulse (visual efeito)
  const pulse = id => {
    const el = document.getElementById(id);
    el.style.transition = 'transform .18s, box-shadow .18s';
    el.style.transform = 'translateY(-4px)';
    el.style.boxShadow = '0 8px 20px rgba(46,125,50,0.14)';
    setTimeout(() => { el.style.transform = ''; el.style.boxShadow = ''; }, 420);
  };

  // Função de presets
  const presets = {
    milho: {lineSpacing:0.80, plantSpacing:0.25, germination:90},
    cana: {lineSpacing:1.20, plantSpacing:0.50, germination:85}
  };

  const applyPreset = () => {
    if(!usePresetCheckbox.checked) return;
    const crop = cropSelect.value;
    const p = presets[crop];
    document.getElementById('lineSpacing').value = p.lineSpacing;
    document.getElementById('plantSpacing').value = p.plantSpacing;
    document.getElementById('germination').value = p.germination;
    ['lineSpacing','plantSpacing','germination'].forEach(pulse);
  };

  // Evento change para select e checkbox
  cropSelect.addEventListener('change', applyPreset);
  usePresetCheckbox.addEventListener('change', applyPreset);

  // Botão calcular
  document.querySelector('.calc').addEventListener('click', () => {
    const seeds = parseFloat(document.getElementById('seeds').value);
    const lineSpacing = parseFloat(document.getElementById('lineSpacing').value);
    const plantSpacing = parseFloat(document.getElementById('plantSpacing').value);
    const germinationPct = parseFloat(document.getElementById('germination').value);

    if(!isFinite(seeds) || seeds<=0 || !isFinite(lineSpacing) || lineSpacing<=0 || !isFinite(plantSpacing) || plantSpacing<=0 || !isFinite(germinationPct) || germinationPct<=0){
      document.getElementById('resultText').innerText = "Preencha todos os campos corretamente.";
      document.getElementById('subText').innerText = '';
      return;
    }

    const G = germinationPct / 100.0;
    const density = G / (lineSpacing * plantSpacing);
    const area = seeds / density;
    const hectares = area / 10000;

    document.getElementById('resultText').innerText = `Área necessária: ${area.toFixed(2)} m²`;
    document.getElementById('subText').innerText = `(${hectares.toFixed(4)} ha) • Densidade estimada: ${density.toFixed(2)} plantas/m²`;

    // animação flags
    ['flagSeeds','flagSpacing','flagGerm'].forEach(id => document.getElementById(id).classList.add('active'));

    // plot visual
    const maxArea = 20000;
    const clamped = Math.min(area,maxArea);
    const pct = 6 + (clamped / maxArea) * 90;
    const plot = document.getElementById('plot');
    plot.style.height = pct + '%';
    plot.style.width = (40 + (Math.min(area,5000)/5000)*60) + '%';
    plot.dataset.last = JSON.stringify({crop:cropSelect.value,seeds,lineSpacing,plantSpacing,germinationPct,area,hectares,density});
  });

  // Reset
  document.querySelector('.export-row button:nth-child(2)').addEventListener('click', () => {
    document.getElementById('seeds').value = 10000;
    usePresetCheckbox.checked = true;
    applyPreset();
    document.getElementById('resultText').innerText = 'Área necessária: —';
    document.getElementById('subText').innerText = 'Preencha os dados e calcule';
    ['flagSeeds','flagSpacing','flagGerm'].forEach(id => document.getElementById(id).classList.remove('active'));
    const plot = document.getElementById('plot');
    plot.style.height = '8%';
    plot.style.width = '80%';
    document.getElementById('ratioText').innerText='—';
  });

  // Export CSV
  document.querySelector('.export-row button:nth-child(1)').addEventListener('click', () => {
    const plot = document.getElementById('plot');
    const raw = plot.dataset.last;
    if(!raw){ alert('Calcule primeiro para exportar.'); return; }
    const obj = JSON.parse(raw);
    const headers = ['cultura','sementes','espacamento_linhas_m','espacamento_plantas_m','germinacao_pct','area_m2','area_ha','densidade_plantas_m2'];
    const values = [obj.crop,obj.seeds,obj.lineSpacing,obj.plantSpacing,obj.germinationPct,obj.area.toFixed(2),obj.hectares.toFixed(4),obj.density.toFixed(2)];
    const csv = headers.join(',') + '\n' + values.join(',');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculo_area_${obj.crop}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // inicializa presets
  applyPreset();
});
