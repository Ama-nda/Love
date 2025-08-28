(function(){
  const toggle = document.getElementById('themeToggle');
  const root = document.body;

  function applySparkleMode(enabled){
    root.classList.toggle('sparkle', enabled);
    if(toggle){
      toggle.textContent = enabled ? 'Calm Mode 🌙' : 'Sparkle Mode ✨';
      toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }
    localStorage.setItem('sparkle', enabled ? '1' : '0');
  }

  const saved = localStorage.getItem('sparkle');
  applySparkleMode(saved === '1');

  toggle?.addEventListener('click', ()=>{
    const next = !root.classList.contains('sparkle');
    applySparkleMode(next);
  });

  // Micro pop animation on gallery hover via JS fallback (for touch)
  const popItems = document.querySelectorAll('[data-pop="true"]');
  popItems.forEach((el)=>{
    el.addEventListener('click', ()=>{
      el.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.05)' },
        { transform: 'scale(1)' }
      ], { duration: 180, easing: 'ease-out' });
    });
  });

  // Copy Discord handle
  document.querySelectorAll('[data-copy]').forEach((btn)=>{
    btn.addEventListener('click', async ()=>{
      const value = btn.getAttribute('data-copy') || '';
      try{
        await navigator.clipboard.writeText(value);
        const original = btn.textContent;
        btn.textContent = 'Copied! ✅';
        setTimeout(()=>{ btn.textContent = original; }, 1200);
      }catch{
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = value; document.body.appendChild(input); input.select();
        document.execCommand('copy'); document.body.removeChild(input);
        const original = btn.textContent;
        btn.textContent = 'Copied! ✅';
        setTimeout(()=>{ btn.textContent = original; }, 1200);
      }
    });
  });
})();


