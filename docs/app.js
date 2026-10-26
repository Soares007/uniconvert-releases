(() => {
  const choices = [...document.querySelectorAll('[data-choice]')];
  const tabs = [...document.querySelectorAll('[data-mode]')];
  const status = document.querySelector('#demo-status');
  const file = document.querySelector('#demo-file');
  const modes = {
    SHIFT: ['PNG', 'TXT', 'DOCX', 'JPG'],
    CTRL: ['Separar', 'ZIP', 'Compactar', 'Juntar'],
    ALT: ['Copiar', 'Caminho', 'Abrir local', 'Copiar']
  };
  let mode = 'SHIFT', running = false;
  const setMode = next => {
    if (running || !modes[next]) return;
    mode = next;
    tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.mode === mode)));
    choices.forEach((button, i) => {
      button.textContent = modes[mode][i];
      button.setAttribute('aria-label', 'Simular ' + modes[mode][i]);
    });
    file.textContent = 'arquivo.pdf';
    status.textContent = 'Demonstração: ' + ({SHIFT:'escolha o formato.',CTRL:'escolha uma ferramenta de PDF ou ZIP.',ALT:'experimente uma ação de arquivo.'})[mode];
  };
  tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
  choices.forEach((button, i) => button.addEventListener('click', () => {
    if (running) return;
    if (mode === 'ALT') {
      status.textContent = 'Demonstração: ' + ['arquivo copiado.','caminho copiado.','pasta de origem aberta.','arquivo copiado.'][i] + ' Nenhuma alteração foi feita no seu computador.';
      return;
    }
    running = true;
    choices.forEach(choice => choice.disabled = true);
    const action = modes[mode][i];
    status.textContent = 'Demonstração: ' + (mode === 'SHIFT' ? 'convertendo para ' + action : 'processando ' + action.toLowerCase()) + '…';
    status.classList.add('demo-working');
    window.setTimeout(() => {
      const name = mode === 'SHIFT' ? 'arquivo.' + action.toLowerCase() : ['arquivo-pagina-1.pdf', 'arquivo.zip', 'arquivo (1).pdf', 'arquivo (1).pdf'][i];
      file.textContent = name;
      status.textContent = 'Exemplo concluído: ' + name + ' salvo ao lado do original. Esta é uma demonstração visual.';
      status.classList.remove('demo-working');
      choices.forEach(choice => choice.disabled = false);
      running = false;
    }, 900);
  }));
  document.querySelector('#demo-interactive').addEventListener('keydown', event => {
    const key = {Shift:'SHIFT',Control:'CTRL',Alt:'ALT'}[event.key];
    if (key) setMode(key);
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  fetch('https://api.github.com/repos/Soares007/uniconvert-releases/releases/latest', {signal:controller.signal})
    .then(response => { if (!response.ok) throw new Error('Sem release'); return response.json(); })
    .then(release => {
      if (release.draft || release.prerelease || !/^v\d+\.\d+\.\d+$/.test(release.tag_name)) return;
      const setup = release.assets.find(asset => asset.name === 'Uniconvert-Setup.exe');
      if (!setup) return;
      document.querySelectorAll('[data-version]').forEach(element => element.textContent = release.tag_name + ' · ' + Math.round(setup.size / 1024 / 1024) + ' MB · estável');
    })
    .catch(() => {})
    .finally(() => clearTimeout(timeout));
})();
