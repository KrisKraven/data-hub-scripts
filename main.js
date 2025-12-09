// DATA HUB — FINAL PRODUCTION SCRIPT (2025)
// Hosted on GitHub — works on every device, no Beezer blocking

// Confirmed message (shown every time)
document.addEventListener('DOMContentLoaded', () => {
  const confirmed = document.createElement('div');
  confirmed.innerHTML = '<div style="color:#0b84ee; text-align:center; margin-top:15px; font-size:16px; font-weight:bold;">Confirmed ✓</div>';
  document.body.prepend(confirmed);
});

// Load FingerprintJS for permanent device ID
const fpPromise = import('https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js')
  .then(FingerprintJS => FingerprintJS.load());

fpPromise.then(fp => fp.get()).then(result => {
  const deviceId = result.visitorId;
  localStorage.setItem('device_fingerprint', deviceId);

  // Phone + SIM from #hash (first open only)
  let userPhone = localStorage.getItem('user_phone');
  let userSim   = localStorage.getItem('user_sim');
  if (!userPhone || !userSim) {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const phone = params.get('phone') || params.get('number');
      const sim   = params.get('sim')   || params.get('simid') || params.get('iccid');
      if (phone) { userPhone = phone.replace(/[^0-9]/g,''); localStorage.setItem('user_phone', userPhone); }
      if (sim)   { userSim   = sim.toUpperCase();          localStorage.setItem('user_sim',   userSim); }
      history.replaceState(null, null, window.location.pathname);
    }
  }

  // Network detection
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const net = conn ? (conn.effectiveType || conn.type || 'unknown') : 'unknown';

  // Weekly streak (starts at 1 on first open)
  const streakKey = 'weekly_streak_' + deviceId;
  let streak = parseInt(localStorage.getItem(streakKey)) || 0;
  const lastCheckDate = localStorage.getItem(streakKey + '_date');
  const today = new Date().toDateString();
  if (!lastCheckDate || new Date(lastCheckDate).toDateString() !== today) {
    streak = streak === 0 ? 1 : streak + 1;
    localStorage.setItem(streakKey, streak);
    localStorage.setItem(streakKey + '_date', today);
  }

  // Visual streak counter
  const streakDiv = document.createElement('div');
  streakDiv.style = 'background:#f0f8ff;padding:20px;border-radius:12px;margin:20px 0;text-align:center;';
  streakDiv.innerHTML = `
    <h3 style="color:#0b84ee;margin-bottom:10px;">Your Weekly Streak</h3>
    <div style="font-size:36px;font-weight:bold;color:#28a745;margin:15px 0;">Day ${streak}</div>
    <div style="background:#e0e0e0;border-radius:10px;height:24px;overflow:hidden;">
      <div style="background:#28a745;height:100%;width:${Math.min((streak/7)*100,100)}%;transition:width 0.6s ease;"></div>
    </div>
    <p style="color:#666;font-size:15px;">Open 7 days in a row for 1 GB free data!</p>
  `;
  document.body.appendChild(streakDiv);

  // Eastern Time
  const easternTime = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});

  // Send beacon
  function sendBeacon(page) {
    fetch('https://hook.us2.make.com/7ozrdbk7h2q1topau4u71v6y2b6u9bpm', {
      method: 'POST',
      body: JSON.stringify({
        device_id: deviceId,
        phone:     userPhone || 'unknown',
        sim_id:    userSim   || 'unknown',
        t:         easternTime,
        p:         page,
        s:         'data_hub',   // ← change to 'safety_hub' in Safety Hub
        ua:        navigator.userAgent,
        o:         navigator.onLine,
        n:         net,
        streak:    streak
      })
    });
  }

  sendBeacon('monthly_checkin');

  // Daily silent ping
  const lastPing = localStorage.getItem('last_ping') || 0;
  if (Date.now() - lastPing > 23*60*60*1000) {
    sendBeacon('daily_ping');
    localStorage.setItem('last_ping', Date.now());
  }
});
