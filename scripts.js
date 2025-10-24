// Page management
let currentPage = 'login';
let openedWindow = null;
let checkInterval = null;

// Keep a reference to the original window.open (in case we need it)
const originalWindowOpen = window.open;

// Defensive window.open override: intercept popup attempts when on CloudMoon,
// set the CloudMoon iframe src to the requested URL instead of opening a new tab/window,
// and return a fake window object so the caller thinks a window opened.
(function() {
    window.open = function(url, target, features) {
        try {
            console.log('🔍 window.open called with URL:', url, 'target:', target, 'features:', features);
        } catch (e) {}

        // If we are on the CloudMoon page, intercept and load the URL into the iframe
        if ((currentPage === 'cloudmoon' || currentPage === 'cloudmoon') && url) {
            try {
                const cloudmoonFrame = document.getElementById('cloudmoonFrame');
                if (cloudmoonFrame) {
                    console.log('✅ Intercepting window.open for CloudMoon. Loading in iframe:', url);
                    // Sanitize/normalize: if the URL is not absolute, try to construct it, else use as-is
                    try {
                        const parsed = new URL(url, window.location.href);
                        cloudmoonFrame.src = parsed.href;
                    } catch (e) {
                        cloudmoonFrame.src = url;
                    }
                }

                // Return a "fake" window object so scripts that expect a window handle keep working.
                const fake = {
                    closed: false,
                    close: function() { this.closed = true; },
                    focus: function() {},
                    blur: function() {},
                    postMessage: function() {}
                };

                // Keep a reference and periodically try to ensure it's blank (best-effort)
                openedWindow = fake;
                if (checkInterval) clearInterval(checkInterval);
                checkInterval = setInterval(() => {
                    try {
                        if (openedWindow && openedWindow.closed === false) {
                            // No-op: we cannot access cross-origin real windows, but keep this for future checks
                        }
                    } catch (e) {}
                }, 1000);

                return fake;
            } catch (e) {
                console.error('Error intercepting window.open:', e);
                // Fall back to not opening a new window
                return {
                    closed: false,
                    close: function() { this.closed = true; },
                    focus: function() {},
                    blur: function() {},
                    postMessage: function() {}
                };
            }
        }

        // For other pages, call the original behavior
        try {
            return originalWindowOpen.call(window, url, target, features);
        } catch (e) {
            console.warn('original window.open failed, returning fake window:', e);
            return {
                closed: false,
                close: function() { this.closed = true; },
                focus: function() {},
                blur: function() {},
                postMessage: function() {}
            };
        }
    };
})();

// Check access code and show appropriate page
function checkCode() {
    const code = document.getElementById('accessCode').value.trim();
    const errorMessage = document.getElementById('errorMessage');
   
    switch(code) {
        case '918':
            showPage('launcher');
            errorMessage.textContent = '';
            break;
        case '819':
            showPage('growden');
            errorMessage.textContent = '';
            break;
        case '818':
            showPage('roblox');
            errorMessage.textContent = '';
            break;
        // Accept both 919 and 999 for CloudMoon so common variants work
        case '919':
        case '999':
            showPage('cloudmoon');
            errorMessage.textContent = '';
            break;
        default:
            errorMessage.textContent = '❌ Invalid code. Please try again.';
            const accessCodeEl = document.getElementById('accessCode');
            if (accessCodeEl) {
                accessCodeEl.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    errorMessage.textContent = '';
                    accessCodeEl.style.animation = '';
                }, 3000);
            }
    }
}

// Show specific page
function showPage(page) {
    currentPage = page;
   
    // Hide all pages
    const ids = ['loginPage','launcherPage','growdenPage','robloxPage','cloudmoonPage'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
   
    // Show requested page
    switch(page) {
        case 'login':
            const loginEl = document.getElementById('loginPage');
            if (loginEl) loginEl.style.display = 'block';
            const ac = document.getElementById('accessCode');
            if (ac) { ac.value = ''; ac.focus(); }
            break;
        case 'launcher':
            const launcherEl = document.getElementById('launcherPage');
            if (launcherEl) launcherEl.style.display = 'block';
            const gameName = document.getElementById('gameName');
            if (gameName) gameName.focus();
            break;
        case 'growden':
            const growdenEl = document.getElementById('growdenPage');
            if (growdenEl) growdenEl.style.display = 'block';
            const growdenFrame = document.getElementById('growdenFrame');
            if (growdenFrame) growdenFrame.src = 'https://growden.io/';
            break;
        case 'roblox':
            const robloxEl = document.getElementById('robloxPage');
            if (robloxEl) robloxEl.style.display = 'block';
            const robloxFrame = document.getElementById('robloxFrame');
            if (robloxFrame) robloxFrame.src = 'https://www.myandroid.org/playonline/androidemulator.php';
            break;
        case 'cloudmoon':
            const cloudmoonEl = document.getElementById('cloudmoonPage');
            if (cloudmoonEl) cloudmoonEl.style.display = 'block';
            const cloudmoonFrame = document.getElementById('cloudmoonFrame');
            if (cloudmoonFrame) {
                // Start with the CloudMoon site — some sites may not like sandboxing, but sandbox reduces popups
                cloudmoonFrame.src = 'https://web.cloudmoonapp.com/';
            }
            
            console.log('🎮 CloudMoon page loaded');
            console.log('🔒 Popup interception is active');
            break;
    }
}

// Show login page
function showLogin() {
    showPage('login');
}

// Function to launch a game based on user input
function launchGame() {
    const gameInput = document.getElementById('gameName');
    if (!gameInput) return;
    const input = gameInput.value.trim();
   
    if (!input) {
        alert('⚠️ Please enter a game name or URL');
        gameInput.focus();
        return;
    }
   
    let newSrc;
    let gameTitle;
   
    if (input.includes('crazygames.com/game/')) {
        try {
            const url = new URL(input);
            const pathParts = url.pathname.split('/');
            const gameIdentifier = pathParts[pathParts.length - 1] || '';
           
            const gameNameForTitle = gameIdentifier.split('---')[0].replace(/-/g, ' ');
            gameTitle = gameNameForTitle.replace(/\b\w/g, l => l.toUpperCase());
           
            const gameNameForUrl = gameNameForTitle.replace(/\s+/g, '-').toLowerCase();
            newSrc = `https://games.crazygames.com/en_US/${gameNameForUrl}/index.html`;
        } catch (e) {
            alert('❌ Invalid URL format. Please check the URL and try again.');
            return;
        }
    }
    else if (input.includes('games.crazygames.com') || input.includes('crazygames.com')) {
        try {
            // If it's already a games.crazygames link, use it directly or normalize it
            const parsed = new URL(input);
            if (parsed.hostname.includes('games.crazygames.com')) {
                newSrc = parsed.href;
            } else {
                // If it's the www.crazygames.com/game/* path, try to reformulate
                const pathParts = parsed.pathname.split('/');
                const identifier = pathParts[pathParts.length - 1] || '';
                const gameNameForUrl = identifier.split('---')[0].replace(/\s+/g, '-').toLowerCase();
                newSrc = `https://games.crazygames.com/en_US/${gameNameForUrl}/index.html`;
            }

            const urlParts = newSrc.split('/');
            gameTitle = urlParts[urlParts.length - 2] || 'Unknown Game';
            gameTitle = gameTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } catch (e) {
            newSrc = input;
            gameTitle = 'Custom URL';
        }
    }
    else {
        const formattedGameName = input.replace(/\s+/g, '-').toLowerCase();
        newSrc = `https://games.crazygames.com/en_US/${formattedGameName}/index.html`;
        gameTitle = input;
    }
   
    const gameFrame = document.getElementById('gameFrame');
    if (gameFrame) {
        gameFrame.src = newSrc;
    }
    const currentGameEl = document.getElementById('currentGame');
    if (currentGameEl) currentGameEl.textContent = gameTitle;
   
    console.log(`🎮 Loading game: ${gameTitle}`);
    console.log(`📍 URL: ${newSrc}`);
}

// Setup event listeners and initialization in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Focus access code
    const accessCodeEl = document.getElementById('accessCode');
    if (accessCodeEl) accessCodeEl.focus();

    const currentGame = document.getElementById('currentGame');
    if (currentGame) currentGame.textContent = 'Ragdoll Archers';
   
    const gameFrame = document.getElementById('gameFrame');
    if (gameFrame) {
        gameFrame.addEventListener('load', function() {
            console.log('✅ Game loaded successfully');
        });
        gameFrame.addEventListener('error', function() {
            console.error('❌ Failed to load game');
            alert('Failed to load the game. Please check the game name and try again.');
        });
    }
   
    const robloxFrame = document.getElementById('robloxFrame');
    if (robloxFrame) {
        robloxFrame.addEventListener('load', function() {
            console.log('✅ Roblox cloud gaming loaded');
        });
        robloxFrame.addEventListener('error', function() {
            console.error('❌ Failed to load Roblox');
        });
    }
   
    const growdenFrame = document.getElementById('growdenFrame');
    if (growdenFrame) {
        growdenFrame.addEventListener('load', function() {
            console.log('✅ Growden.io loaded');
        });
        growdenFrame.addEventListener('error', function() {
            console.error('❌ Failed to load Growden.io');
        });
    }
    
    const cloudmoonFrame = document.getElementById('cloudmoonFrame');
    if (cloudmoonFrame) {
        cloudmoonFrame.addEventListener('load', function() {
            console.log('✅ CloudMoon frame loaded (src=' + cloudmoonFrame.src + ')');
        });
        cloudmoonFrame.addEventListener('error', function() {
            console.error('❌ Failed to load CloudMoon');
        });
    }

    // Allow Enter key for login
    if (accessCodeEl) {
        accessCodeEl.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                checkCode();
            }
        });

        // Auto-clear access code on focus
        accessCodeEl.addEventListener('focus', function() {
            this.select();
        });
    }

    // Game name Enter and focus effects
    const gameNameEl = document.getElementById('gameName');
    if (gameNameEl) {
        gameNameEl.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                launchGame();
            }
        });

        gameNameEl.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });

        gameNameEl.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    }
});

// Prevent accidental page navigation
window.addEventListener('beforeunload', function(e) {
    if (currentPage !== 'login') {
        e.preventDefault();
        e.returnValue = '';
        return 'Are you sure you want to leave? Your game progress may be lost.';
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && 
        event.target.tagName !== 'INPUT' && 
        currentPage !== 'login') {
        if (confirm('Return to login page?')) {
            showLogin();
        }
    }
   
    if (event.key === 'F11') {
        console.log('💡 Tip: Press F11 to toggle fullscreen mode');
    }
});

// Console welcome message
console.log('%c🎮 Game Launcher Initialized', 'color: #4fc3f7; font-size: 20px; font-weight: bold;');
console.log('%cAccess Codes:', 'color: #ff6b6b; font-size: 14px; font-weight: bold;');
console.log('%c918 - CrazyGames Launcher', 'color: #4fc3f7; font-size: 12px;');
console.log('%c819 - Growden.io', 'color: #4fc3f7; font-size: 12px;');
console.log('%c818 - Roblox Cloud Gaming', 'color: #4fc3f7; font-size: 12px;');
console.log('%c919/999 - CloudMoon Gaming', 'color: #4fc3f7; font-size: 12px;');
console.log('%c\nPress ESC to return to login', 'color: #888; font-size: 10px;');

// Listen for messages from iframes
window.addEventListener('message', function(event) {
    try {
        console.log('📨 Message received:', event.data);
    } catch (e) {}
    
    // If an iframe posts a URL string, load it into CloudMoon iframe when appropriate
    if (typeof event.data === 'string' && (event.data.startsWith('http://') || event.data.startsWith('https://'))) {
        if (currentPage === 'cloudmoon') {
            const cloudmoonFrame = document.getElementById('cloudmoonFrame');
            if (cloudmoonFrame) {
                console.log('✅ Loading URL from message into CloudMoon iframe:', event.data);
                cloudmoonFrame.src = event.data;
            }
        }
    }
});
