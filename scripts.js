// Access Codes
const CODES = {
  LAUNCHER: '918',
  GROWDEN:  '819',
  ROBLOX:   '818',
  CLOUDMOON:'919',
};

let currentPage = 'login';
const $ = (id) => document.getElementById(id);

// IMPORTANT: Hard block any popups from your *top page* too.
(function hardBlockPopupsOnTop() {
  const originalOpen = window.open;
  window.open = function() {
    console.log('🚫 Popup attempt on top window blocked.');
    return { closed:true, close(){}, focus(){}, blur(){}, postMessage(){} };
  };
})();

// Page switching
function showPage(page) {
  currentPage = page;

  ['loginPage','launcherPage','growdenPage','robloxPage','cloudmoonPage']
    .forEach(id => { const el = $(id); if (el) el.style.display = 'none'; });

  switch (page) {
    case 'login':
      $('loginPage').style.display = 'block';
      $('accessCode').value = '';
      $('accessCode').focus();
      break;

    case 'launcher':
      $('launcherPage').style.display = 'block';
      $('currentGame').textContent = 'Ragdoll Archers';
      $('gameFrame').src = 'https://games.crazygames.com/en_US/ragdoll-archers/index.html';
      $('gameName').focus();
      break;

    case 'growden':
      $('growdenPage').style.display = 'block';
      $('growdenFrame').src = 'https://growden.io/';
      break;

    case 'roblox':
      $('robloxPage').style.display = 'block';
      $('robloxFrame').src = 'https://www.myandroid.org/playonline/androidemulator.php';
      break;

    case 'cloudmoon':
      $('cloudmoonPage').style.display = 'block';
      // POPUPS BLOCKED by iframe sandbox (no allow-popups). Just load homepage here:
      $('cloudmoonFrame').src = 'https://web.cloudmoonapp.com/';
      console.log('🌙 CloudMoon loaded with sandbox — popups are blocked.');
      break;
  }
}

function showLogin() { showPage('login'); }

// Login
function checkCode() {
  const code = $('accessCode').value.trim();
  const error = $('errorMessage');

  if (code === CODES.LAUNCHER) {
    error.textContent = ''; showPage('launcher');
  } else if (code === CODES.GROWDEN) {
    error.textContent = ''; showPage('growden');
  } else if (code === CODES.ROBLOX) {
    error.textContent = ''; showPage('roblox');
  } else if (code === CODES.CLOUDMOON) {
    error.textContent = ''; showPage('cloudmoon');
  } else {
    error.textContent = '❌ Invalid code. Please try again.';
    $('accessCode').style.animation = 'shake 0.5s';
    setTimeout(() => { $('accessCode').style.animation = ''; error.textContent = ''; }, 1600);
  }
}

// CrazyGames launcher
function launchGame() {
  const inputEl = $('gameName');
  const input = (inputEl.value || '').trim();
  if (!input) {
    alert('⚠️ Please enter a game name or URL.');
    inputEl.focus();
    return;
  }

  let url = '';
  let title = '';

  if (input.includes('crazygames.com/game/')) {
    try {
      const u = new URL(input);
      const slug = u.pathname.split('/').pop();
      const base = slug.split('---')[0].replace(/-/g, ' ');
      title = base.replace(/\b\w/g, c => c.toUpperCase());
      const dashed = base.trim().replace(/\s+/g, '-');
      url = `https://games.crazygames.com/en_US/${dashed}/index.html`;
    } catch {
      alert('❌ Invalid CrazyGames URL.');
      return;
    }
  } else if (input.includes('games.crazygames.com')) {
    url = input;
    try {
      const parts = new URL(input).pathname.split('/');
      title = (parts[parts.length - 2] || 'Custom Game')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    } catch {
      title = 'Custom Game';
    }
  } else {
    const slug = input.toLowerCase().replace(/\s+/g, '-');
    url = `https://games.crazygames.com/en_US/${slug}/index.html`;
    title = input.replace(/\b\w/g, c => c.toUpperCase());
  }

  $('gameFrame').src = url;
  $('currentGame').textContent = title;
  console.log('🎮 Loading:', title, '→', url);
}

// Events
document.addEventListener('DOMContentLoaded', () => {
  $('accessCode').focus();

  $('enterBtn').addEventListener('click', checkCode);
  $('accessCode').addEventListener('keydown', (e) => { if (e.key === 'Enter') checkCode(); });

  $('launchButton').addEventListener('click', launchGame);
  $('gameName').addEventListener('keydown', (e) => { if (e.key === 'Enter') launchGame(); });

  document.querySelectorAll('[data-back]').forEach(btn => btn.addEventListener('click', showLogin));

  showLogin();

  // Safety tip if leaving
  window.addEventListener('beforeunload', (e) => {
    if (currentPage !== 'login') { e.preventDefault(); e.returnValue = ''; }
  });
});
