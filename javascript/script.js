// ---------- Default target ----------
    const defaultTarget = new Date('2026-06-01T12:00:00');

    // Init elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');
    const statusEl = document.getElementById('status');
    const displayTarget = document.getElementById('displayTarget');

    // Modal & inputs
    const modal = document.getElementById('modal');
    const openSettings = document.getElementById('openSettings');
    const closeBtn = document.getElementById('closeBtn');
    const saveBtn = document.getElementById('saveBtn');
    const dateInput = document.getElementById('dateInput');
    const labelInput = document.getElementById('labelInput');
    const resetBtn = document.getElementById('resetBtn');

    // confetti canvas
    const confettiCanvas = document.getElementById('confetti');
    const ctx = confettiCanvas.getContext('2d');
    let confettiPieces = [];
    let confettiRunning = false;
    let muted = false;
    const tickSound = document.getElementById('tickSound');
    const celebrationSound = document.getElementById('celebrationSound');
    const muteBtn = document.getElementById('muteBtn');

   muteBtn.addEventListener('click', () => {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
});

    function fitCanvas(){
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', fitCanvas);
    fitCanvas();

    // Load saved target from localStorage
    let target = localStorage.getItem('grad_target');
    let label = localStorage.getItem('grad_label');
    if(target){
      target = new Date(target);
    } else {
      target = defaultTarget;
    }
    if(label){
      document.getElementById('targetLabel').querySelector('strong').textContent = label + ' — ' + formatDateTime(target);
    } else {
      displayTarget.textContent = formatDateTime(target);
    }

    // Set inputs initial values
    dateInput.value = toDateTimeLocal(target);
    labelInput.value = label || '';

    // Main countdown loop
    let lastValues = {};
    const tick = () => {
      const now = new Date();
      const diff = target - now;
      if(diff <= 0){
        

        daysEl.innerHTML = '0'; hoursEl.innerHTML='0'; minsEl.innerHTML='0'; secsEl.innerHTML='0';
         
        if(!confettiRunning){
           
          celebrate();
          statusEl.textContent = 'مبروك ! انت دلوقتي خريج رسمي  🎓';
        }
        return; // stop updating remaining values (still keep confetti anim)
      }
      const seconds = Math.floor((diff/1000) % 60);
      const minutes = Math.floor((diff/1000/60) % 60);
      const hours = Math.floor((diff/1000/60/60) % 24);
      const days = Math.floor(diff/1000/60/60/24);

      // update DOM only when changed to trigger animation
      updateEl(daysEl, days);
      updateEl(hoursEl, hours);
      updateEl(minsEl, minutes);
      updateEl(secsEl, seconds);
      if (!muted && diff > 0) {
      tickSound.currentTime = 0;
      tickSound.play().catch(()=>{});
      }
      statusEl.textContent = 'يتبقى حتى موعد التخرج — حافظ على التركيز!';
    };
    tick();
    const timer = setInterval(tick, 1000);

    function updateEl(el, value){
      const str = String(value);
      if(el._last !== str){
        el._last = str;
        el.innerHTML = '';
        const span = document.createElement('span');
        span.className = 'flip';
        span.textContent = str;
        el.appendChild(span);
      }
    }

    // Helpers
    function toDateTimeLocal(d){
      const pad = n=>String(n).padStart(2,'0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth()+1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
    function formatDateTime(d){
      return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    }

    // Modal controls
    openSettings.addEventListener('click', ()=>{ modal.classList.add('open'); });
    closeBtn.addEventListener('click', ()=>{ modal.classList.remove('open'); });

    saveBtn.addEventListener('click', ()=>{
      const val = dateInput.value;
      if(!val){ alert('اختر تاريخاً صالحاً'); return; }
      const newTarget = new Date(val);
      if(isNaN(newTarget.getTime())){ alert('التاريخ غير صالح'); return; }
      target = newTarget;
      const newLabel = labelInput.value.trim();
      if(newLabel){
        document.getElementById('targetLabel').querySelector('strong').textContent = newLabel + ' — ' + formatDateTime(target);
        localStorage.setItem('grad_label', newLabel);
      } else {
        displayTarget.textContent = formatDateTime(target);
        localStorage.removeItem('grad_label');
      }
      localStorage.setItem('grad_target', target.toISOString());
      modal.classList.remove('open');
      // small pulse feedback
      flashSaved();
    });

    resetBtn.addEventListener('click', ()=>{
      if(confirm('هل تريد إعادة الضبط إلى التاريخ الافتراضي؟')){
        localStorage.removeItem('grad_target');
        localStorage.removeItem('grad_label');
        target = defaultTarget;
        dateInput.value = toDateTimeLocal(target);
        labelInput.value = '';
        displayTarget.textContent = formatDateTime(target);
        alert('تمت إعادة الضبط');
      }
    });

    function flashSaved(){
      const old = statusEl.textContent;
      statusEl.textContent = 'تم حفظ التاريخ ✅';
      setTimeout(()=>statusEl.textContent = old, 1800);
    }

    // ---------- Confetti / Celebration ----------
    function random(min,max){return Math.random()*(max-min)+min}
    function createConfetti(x,y){
      for(let i=0;i<80;i++){
        confettiPieces.push({
          x:x,y:y,
          vx:random(-8,8),vy:random(-12,-2),
          size:random(6,14),
          rotation:random(0,360),
          vr:random(-0.2,0.2),
          color: `hsl(${Math.floor(random(0,360))}, 85%, 60%)`,
        });
      }
      if(!confettiRunning) runConfetti();
    }

    function runConfetti(){
      confettiRunning = true;
      let frames = 0;
      function loop(){
        frames++;
        ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
        for(let i=confettiPieces.length-1;i>=0;i--){
          const p = confettiPieces[i];
          p.vy += 0.35; // gravity
          p.x += p.vx; p.y += p.vy; p.rotation += p.vr;
          ctx.save();
          ctx.translate(p.x,p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
          ctx.restore();
          // remove off screen
          if(p.y > confettiCanvas.height + 50){ confettiPieces.splice(i,1); }
        }
        if(confettiPieces.length>0 && frames<1000){ requestAnimationFrame(loop); }
        else { confettiRunning=false; ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height); }
      }
      requestAnimationFrame(loop);
    }

    function celebrate(){
     if (!muted) {
     celebrationSound.currentTime = 0;
     celebrationSound.play().catch(()=>{});}
      // burst center
      createConfetti(window.innerWidth/2, window.innerHeight/4);
      // a few extra bursts
      setTimeout(()=>createConfetti(window.innerWidth/4, window.innerHeight/3),200);
      setTimeout(()=>createConfetti(window.innerWidth*3/4, window.innerHeight/3),400);
      
}

    

    // If target already passed on load, show congrats
    if(target - new Date() <= 0){
      statusEl.textContent = 'التاريخ المحدد قد مرّ — يمكنك تعديل التاريخ.';
    }

    // Accessibility: close modal when clicking outside
    modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.classList.remove('open'); });

    // Small improvement: open settings on 'o' key and reset on 'r'
    window.addEventListener('keydown', (e)=>{
      if(e.key==='o' || e.key==='O') modal.classList.add('open');
      if(e.key==='r' || e.key==='R') resetBtn.click();
    });
