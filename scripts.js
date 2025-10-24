// Page management
let currentPage = 'login';
let openedWindow = null;
let checkInterval = null;

// Override window.open to capture the URL and redirect to iframe
(function() {
    const originalWindowOpen = window.open;
    
    window.open = function(url, target, features) {
        console.log('🔍 window.open called with URL:', url);
        
        // If on CloudMoon page, capture the URL and load in iframe
        if (currentPage === 'cloudmoon' && url) {
            console.log('✅ Intercepted! Loading in iframe:', url);
            const cloudmoonFrame = document.getElementById('cloudmoonFrame');
            if (cloudmoonFrame) {
                cloudmoonFrame.src = url;
            }
            
            // Return a fake window object so the site thinks it opened
            return {
                closed: false,
                close: function() {},
                focus: function() {},
                blur: function() {},
                postMessage: function() {}
            };
        }
        
        // For other pages, use original behavior
        return originalWindowOpen.call(window, url, target, features);
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
        case '919':
            showPage('cloudmoon');
            errorMessage.textContent = '';
            break;
        default:
            errorMessage.textContent = '❌ Invalid code. Please try again.';
            document.getElementById('accessCode').style.animation = 'shake 0.5s';
            setTimeout(() => {
                errorMessage.textContent = '';
                document.getElementById('accessCode').style.animation = '';
            }, 3000);
    }
}

// Show specific page
function showPage(page) {
    currentPage = page;
   
    // Hide all pages
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('launcherPage').style.display = 'none';
    document.getElementById('growdenPage').style.display = 'none';
    document.getElementById('robloxPage').style.display = 'none';
    document.getElementById('cloudmoonPage').style.display = 'none';
   
    // Show requested page
    switch(page) {
        case 'login':
            document.getElementById('loginPage').style.display = 'block';
            document.getElementById('accessCode').value = '';
            document.getElementById('accessCode').focus();
            break;
        case 'launcher':
            document.getElementById('launcherPage').style.display = 'block';
            document.getElementById('gameName').focus();
            break;
        case 'growden':
            document.getElementById('growdenPage').style.display = 'block';
            const growdenFrame = document.getElementById('growdenFrame');
            growdenFrame.src = 'https://growden.io/';
            break;
        case 'roblox':
            document.getElementById('robloxPage').style.display = 'block';
            const robloxFrame = document.getElementById('robloxFrame');
            robloxFrame.src = 'https://www.myandroid.org/playonline/androidemulator.php';
            break;
        case 'cloudmoon':
            document.getElementById('cloudmoonPage').style.display = 'block';
            const cloudmoonFrame = document.getElementById('cloudmoonFrame');
            cloudmoonFrame.src = 'https://web.cloudmoonapp.com/';
            
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
            const gameIdentifier = pathParts[pathParts.length - 1];
           
            const gameNameForTitle = gameIdentifier.split('---')[0].replace(/-/g, ' ');
            gameTitle = gameNameForTitle.replace(/\b\w/g, l => l.toUpperCase());
           
            const gameNameForUrl = gameNameForTitle.replace(/\s+/g, '-');
            newSrc = `https://games.crazygames.com/en_US/${gameNameForUrl}/index.html`;
        } catch (e) {
            alert('❌ Invalid URL format. Please check the URL and try again.');
            return;
        }
    }
    else if (input.includes('games.crazygames.com')) {
        newSrc = input;
        try {
            const urlParts = new URL(input).pathname.split('/');
            gameTitle = urlParts[urlParts.length - 2] || 'Unknown Game';
            gameTitle = gameTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } catch (e) {
            gameTitle = 'Custom URL';
        }
    }
    else {
        const formattedGameName = input.replace(/\s+/g, '-').toLowerCase();
        newSrc = `https://games.crazygames.com/en_US/${formattedGameName}/index.html`;
        gameTitle = input;
    }
   
    const gameFrame = document.getElementById('gameFrame');
    gameFrame.src = newSrc;
    document.getElementById('currentGame').textContent = gameTitle;
   
    console.log(`🎮 Loading game: ${gameTitle}`);
    console.log(`📍 URL: ${newSrc}`);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('accessCode').focus();
    document.getElementById('currentGame').textContent = 'Ragdoll Archers';
   
    const gameFrame = document.getElementById('gameFrame');
    gameFrame.addEventListener('load', function() {
        console.log('✅ Game loaded successfully');
    });
   
    gameFrame.addEventListener('error', function() {
        console.error('❌ Failed to load game');
        alert('Failed to load the game. Please check the game name and try again.');
    });
   
    const robloxFrame = document.getElementById('robloxFrame');
    robloxFrame.addEventListener('load', function() {
        console.log('✅ Roblox cloud gaming loaded');
    });
   
    robloxFrame.addEventListener('error', function() {
        console.error('❌ Failed to load Roblox');
    });
   
    const growdenFrame = document.getElementById('growdenFrame');
    growdenFrame.addEventListener('load', function() {
        console.log('✅ Growden.io loaded');
    });
   
    growdenFrame.addEventListener('error', function() {
        console.error('❌ Failed to load Growden.io');
    });
    
    const cloudmoonFrame = document.getElementById('cloudmoonFrame');
    cloudmoonFrame.addEventListener('load', function() {
        console.log('✅ CloudMoon frame loaded');
    });
   
    cloudmoonFrame.addEventListener('error', function() {
        console.error('❌ Failed to load CloudMoon');
    });
});

// Allow Enter key for login
document.getElementById('accessCode').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkCode();
    }
});

// Allow Enter key for game launch
document.getElementById('gameName').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        launchGame();
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
console.log('%c999 - CloudMoon Gaming', 'color: #4fc3f7; font-size: 12px;');
console.log('%c\nPress ESC to return to login', 'color: #888; font-size: 10px;');

// Auto-clear access code on focus
document.getElementById('accessCode').addEventListener('focus', function() {
    this.select();
});

// Add visual feedback for game input
document.getElementById('gameName').addEventListener('focus', function() {
    this.style.transform = 'scale(1.02)';
    this.style.transition = 'transform 0.2s ease';
});

document.getElementById('gameName').addEventListener('blur', function() {
    this.style.transform = 'scale(1)';
});

// Listen for messages from iframes
window.addEventListener('message', function(event) {
    console.log('📨 Message received:', event.data);
    
    // Check if message contains a URL
    if (typeof event.data === 'string' && (event.data.startsWith('http://') || event.data.startsWith('https://'))) {
        if (currentPage === 'cloudmoon') {
            const cloudmoonFrame = document.getElementById('cloudmoonFrame');
            console.log('✅ Loading URL from message:', event.data);
            cloudmoonFrame.src = event.data;
        }
    }
});

