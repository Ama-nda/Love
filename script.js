(function(){
  const toggle = document.getElementById('themeToggle');
  const root = document.body;

  function applyTheme(theme){
    // Remove all theme classes
    root.classList.remove('dark');

    // Apply the selected theme
    if(theme === 'dark'){
      root.classList.add('dark');
    }

    // Update button text and aria-label
    if(toggle){
      const isDark = root.classList.contains('dark');
      const buttonText = isDark ? 'Light Mode ☀️' : 'Dark Mode 🌙';
      const ariaLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';
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
    const isDark = root.classList.contains('dark');
    const nextTheme = isDark ? 'light' : 'dark';
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

  // Q&A (stored locally in this browser)
  const anonForm = document.getElementById('anonForm');
  const anonMessage = document.getElementById('anonMessage');
  const anonName = document.getElementById('anonName');
  const anonList = document.getElementById('anonList');
  const anonEmpty = document.getElementById('anonEmpty');
  const clearInbox = document.getElementById('clearInbox');
  // Guestbook DOM
  const guestForm = document.getElementById('guestForm');
  const guestMessage = document.getElementById('guestMessage');
  const guestName = document.getElementById('guestName');
  const guestList = document.getElementById('guestList');
  const guestEmpty = document.getElementById('guestEmpty');
  const clearGuest = document.getElementById('clearGuest');

  function loadComments(){
    try{
      const raw = localStorage.getItem('public_qna');
      return raw ? JSON.parse(raw) : [];
    }catch{ return []; }
  }

  function saveComments(list){
    localStorage.setItem('public_qna', JSON.stringify(list));
  }

  // Guestbook storage
  function loadGuest(){
    try{
      const raw = localStorage.getItem('guestbook_entries');
      return raw ? JSON.parse(raw) : [];
    }catch{ return []; }
  }
  function saveGuest(list){
    localStorage.setItem('guestbook_entries', JSON.stringify(list));
  }

  function formatDate(ts){
    const d = new Date(ts);
    return d.toLocaleString();
  }

  function renderComments(){
    if(!anonList) return;
    const list = loadComments();
    anonList.innerHTML = '';
    if(list.length === 0){
      anonEmpty && (anonEmpty.style.display = 'block');
      return;
    }
    anonEmpty && (anonEmpty.style.display = 'none');
    list.forEach((m, idx)=>{
      const li = document.createElement('li');
      li.className = 'inbox-item';
      li.innerHTML = `
        <div class="inbox-top">
          <span class="inbox-author">${m.name ? m.name : 'Anonymous'}</span>
          <span class="inbox-time">${formatDate(m.ts)}</span>
        </div>
        <div class="inbox-body"></div>
        ${m.answer ? `<div class=\"inbox-answer\"><strong>Answer:</strong> <span class=\"answer-text\"></span></div>` : ''}
        <div class="inbox-actions-row">
          <button type="button" class="btn btn-ghost btn-small" data-delete-index="${idx}">Delete</button>
          <button type="button" class="btn btn-ghost btn-small" data-answer-index="${idx}">Answer</button>
        </div>
      `;
      li.querySelector('.inbox-body').textContent = m.text;
      if(m.answer){
        li.querySelector('.answer-text').textContent = m.answer;
      }
      anonList.appendChild(li);
    });

    // Hook delete buttons
    anonList.querySelectorAll('[data-delete-index]').forEach((btn)=>{
      btn.addEventListener('click', ()=>{
        const idx = Number(btn.getAttribute('data-delete-index'));
        const arr = loadComments();
        arr.splice(idx, 1);
        saveComments(arr);
        renderComments();
      });
    });

    // Hook answer buttons
    anonList.querySelectorAll('[data-answer-index]').forEach((btn)=>{
      btn.addEventListener('click', ()=>{
        const idx = Number(btn.getAttribute('data-answer-index'));
        const arr = loadComments();
        const current = arr[idx];
        const next = prompt('Write or edit your answer:', current?.answer || '');
        if(next !== null){
          arr[idx] = { ...current, answer: next.trim() };
          saveComments(arr);
          renderComments();
        }
      });
    });
  }

  if(anonForm){
    renderComments();
    anonForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const text = (anonMessage?.value || '').trim();
      const name = (anonName?.value || '').trim();
      if(!text){
        anonMessage?.focus();
        return;
      }
      const arr = loadComments();
      arr.unshift({ text, name, ts: Date.now() });
      saveComments(arr);
      anonMessage.value = '';
      if(anonName) anonName.value = '';
      renderComments();
    });
  }

  clearInbox?.addEventListener('click', ()=>{
    if(confirm('Clear all comments saved in this browser?')){
      saveComments([]);
      renderComments();
    }
  });

  // This or That voting (local)
  const VOTE_KEY = 'this_or_that_votes';
  function loadVotes(){
    try{
      const raw = localStorage.getItem(VOTE_KEY);
      return raw ? JSON.parse(raw) : {};
    }catch{ return {}; }
  }
  function saveVotes(v){ localStorage.setItem(VOTE_KEY, JSON.stringify(v)); }

  function renderVotes(){
    const votes = loadVotes();
    const pairs = [
      { q:'cats_dogs', a:['cats','dogs'] },
      { q:'coffee_tea', a:['coffee','tea'] },
      { q:'dota_lol', a:['dota2','lol'] },
      { q:'fivem_gtav', a:['fivem','gtav'] },
      { q:'java_python', a:['java','python'] }
    ];
    pairs.forEach(({q,a})=>{
      a.forEach((opt)=>{
        const el = document.getElementById(`count-${q}-${opt}`);
        if(el){ el.textContent = String(votes[q]?.[opt] || 0); }
      });
    });
  }

  document.querySelectorAll('button[data-question][data-option]').forEach((btn)=>{
    btn.addEventListener('click', ()=>{
      const q = btn.getAttribute('data-question');
      const opt = btn.getAttribute('data-option');
      if(!q || !opt) return;
      const votes = loadVotes();
      votes[q] = votes[q] || {};
      votes[q][opt] = (votes[q][opt] || 0) + 1;
      saveVotes(votes);
      renderVotes();
      btn.animate([
        { transform:'scale(1)' },
        { transform:'scale(1.05)' },
        { transform:'scale(1)' }
      ], { duration: 160, easing: 'ease-out' });
    });
  });

  const clearThisThat = document.getElementById('clearThisThat');
  clearThisThat?.addEventListener('click', ()=>{
    if(confirm('Clear all votes saved in this browser?')){
      saveVotes({});
      renderVotes();
    }
  });

  renderVotes();

  // Quiz logic (secret until submit)
  const QUIZ_ANSWERS = {
    q1: 'shawerma',
    q2: 'blank_space',
    q3: 'spider_man',
    q4: 'spain',
    q5: 'beige',
    q6: 'dreams',
    q7: 'men',
    q8: 'spiteful',
    q9: 'women',
    q10: 'tf2'
  };

  const selections = {}; // { qid: option }
  function clearQuizUI(){
    document.querySelectorAll('.quiz-card .btn').forEach((b)=>{
      b.classList.remove('selected');
    });
    document.querySelectorAll('.quiz-feedback').forEach((f)=>{ f.style.display = 'none'; f.textContent = ''; f.className = 'muted quiz-feedback'; });
    document.getElementById('quizResult') && (document.getElementById('quizResult').textContent = '');
  }

  document.querySelectorAll('button[data-quiz-id][data-option]').forEach((btn)=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-quiz-id') || '';
      const opt = btn.getAttribute('data-option') || '';
      if(!id) return;
      selections[id] = opt;
      // Update selected state within the same card
      const card = btn.closest('.quiz-card');
      card?.querySelectorAll('button[data-quiz-id]')?.forEach((b)=> b.classList.remove('selected'));
      btn.classList.add('selected');
      btn.animate([
        { transform:'scale(1)' },
        { transform:'scale(1.05)' },
        { transform:'scale(1)' }
      ], { duration: 140, easing: 'ease-out' });
    });
  });

  const quizSubmit = document.getElementById('quizSubmit');
  const quizReset = document.getElementById('quizReset');
  const quizResult = document.getElementById('quizResult');

  quizSubmit?.addEventListener('click', ()=>{
    let score = 0;
    const total = Object.keys(QUIZ_ANSWERS).length;
    Object.entries(QUIZ_ANSWERS).forEach(([qid, correct])=>{
      const chosen = selections[qid];
      const feedback = document.getElementById(`feedback-${qid}`);
      if(!feedback) return;
      feedback.style.display = 'block';
      if(qid === 'q7' && chosen === 'men'){
        feedback.textContent = 'Men.. JK HAHA';
        feedback.className = 'quiz-feedback muted';
        score += 1; // count joke as correct per instruction
        return;
      }
      if(chosen && chosen === correct){
        score += 1;
        feedback.textContent = 'Correct! ✅';
        feedback.className = 'quiz-feedback quiz-correct';
      }else{
        feedback.textContent = 'Not quite.';
        feedback.className = 'quiz-feedback quiz-wrong';
      }
    });
    if(quizResult){
      quizResult.textContent = `Your score: ${score} / ${total}`;
    }
  });

  quizReset?.addEventListener('click', ()=>{
    for(const k in selections){ delete selections[k]; }
    clearQuizUI();
    window.scrollTo({ top: document.getElementById('quiz')?.offsetTop || 0, behavior: 'smooth' });
  });

  function renderGuest(){
    if(!guestList) return;
    const list = loadGuest();
    guestList.innerHTML = '';
    if(list.length === 0){
      guestEmpty && (guestEmpty.style.display = 'block');
      return;
    }
    guestEmpty && (guestEmpty.style.display = 'none');
    list.forEach((m, idx)=>{
      const li = document.createElement('li');
      li.className = 'inbox-item';
      li.innerHTML = `
        <div class="inbox-top">
          <span class="inbox-author">${m.name ? m.name : 'Anonymous'}</span>
          <span class="inbox-time">${formatDate(m.ts)}</span>
        </div>
        <div class="inbox-body"></div>
        <div class="inbox-actions-row">
          <button type="button" class="btn btn-ghost btn-small" data-guest-delete-index="${idx}">Delete</button>
        </div>
      `;
      li.querySelector('.inbox-body').textContent = m.text;
      guestList.appendChild(li);
    });

    guestList.querySelectorAll('[data-guest-delete-index]').forEach((btn)=>{
      btn.addEventListener('click', ()=>{
        const idx = Number(btn.getAttribute('data-guest-delete-index'));
        const arr = loadGuest();
        arr.splice(idx, 1);
        saveGuest(arr);
        renderGuest();
      });
    });
  }

  if(guestForm){
    renderGuest();
    guestForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const text = (guestMessage?.value || '').trim();
      const name = (guestName?.value || '').trim();
      if(!text){
        guestMessage?.focus();
        return;
      }
      const arr = loadGuest();
      arr.unshift({ text, name, ts: Date.now() });
      saveGuest(arr);
      guestMessage.value = '';
      if(guestName) guestName.value = '';
      renderGuest();
    });
  }

  clearGuest?.addEventListener('click', ()=>{
    if(confirm('Clear all guestbook signatures saved in this browser?')){
      saveGuest([]);
      renderGuest();
    }
  });
})();


