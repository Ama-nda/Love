(function(){
  const toggle = document.getElementById('themeToggle');
  const root = document.body;

  function applyTheme(theme){
    // Remove all theme classes
    root.classList.remove('sparkle', 'dark');
    
    // Apply the selected theme
    if(theme === 'sparkle'){
      root.classList.add('sparkle');
    } else if(theme === 'dark'){
      root.classList.add('dark');
    }
    
    // Update button text and aria-label
    if(toggle){
      let buttonText, ariaLabel;
      switch(theme){
        case 'sparkle':
          buttonText = 'Dark Mode 🌙';
          ariaLabel = 'Switch to dark mode';
          break;
        case 'dark':
          buttonText = 'Light Mode ☀️';
          ariaLabel = 'Switch to light mode';
          break;
        default:
          buttonText = 'Sparkle Mode ✨';
          ariaLabel = 'Switch to sparkle mode';
      }
      toggle.textContent = buttonText;
      toggle.setAttribute('aria-label', ariaLabel);
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }

  // Get saved theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  // Theme toggle click handler
  toggle?.addEventListener('click', ()=>{
    const currentTheme = root.classList.contains('sparkle') ? 'sparkle' : 
                        root.classList.contains('dark') ? 'dark' : 'light';
    
    let nextTheme;
    switch(currentTheme){
      case 'light':
        nextTheme = 'sparkle';
        break;
      case 'sparkle':
        nextTheme = 'dark';
        break;
      case 'dark':
        nextTheme = 'light';
        break;
    }
    
    applyTheme(nextTheme);
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


