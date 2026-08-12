const OnlineEmulatorScreen = {
  render(container, args) {
    const code = args.code || '';
    const tunnelUrl = `https://cartaralho-${code.toLowerCase()}.loca.lt`;
    
    window.__isOnlineEmulator = true;

    container.innerHTML = `
      <div style="width:100%; height:100vh; position:relative; overflow:hidden;">
        <button id="exit-emulator-btn" style="
          position:absolute; 
          top:15px; 
          right:15px; 
          z-index:9999; 
          background: var(--danger); 
          color:#fff; 
          border:none; 
          padding:10px 20px; 
          border-radius: 20px; 
          font-weight:bold; 
          cursor:pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        ">Sair do Jogo Online</button>
        <iframe src="${tunnelUrl}" style="width:100%; height:100%; border:none;" allow="clipboard-write; clipboard-read"></iframe>
      </div>
    `;

    document.getElementById('exit-emulator-btn').addEventListener('click', async () => {
      const confirmed = await Modal.confirm('Sair', 'Tem certeza que deseja sair do jogo online?');
      if (confirmed) {
        window.__isOnlineEmulator = false;
        App.showScreen('home');
      }
    });
  }
};
