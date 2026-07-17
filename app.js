// --- State Management Machine ---
let currentAction = null;
let pointsValue = 0;
let homeScore = 0;
let matchHistory = [];
let undoTimeout = null;

// DOM Elements Linkage
const actionGrid = document.getElementById('action-grid');
const playerGrid = document.getElementById('player-grid');
const workflowTitle = document.getElementById('workflow-title');
const logFeed = document.getElementById('log-feed');
const undoBanner = document.getElementById('undo-banner');
const scoreDisplay = document.getElementById('home-score');
const backButton = document.getElementById('btn-back');

// --- Event Listeners Setup ---

// Step 1: Catch action clicks using dataset attributes
document.querySelectorAll('.btn-action').forEach(button => {
    button.addEventListener('click', (e) => {
        const target = e.currentTarget;
        currentAction = target.getAttribute('data-action');
        pointsValue = parseInt(target.getAttribute('data-points'), 10);
        
        // Switch to player view
        actionGrid.style.display = 'none';
        playerGrid.style.display = 'grid';
        workflowTitle.innerText = `STEP 2: Which Player Logged [${currentAction}]?`;
        workflowTitle.style.color = '#FFD700';
    });
});

// Step 2: Catch player jersey clicks
document.querySelectorAll('.btn-player').forEach(button => {
    button.addEventListener('click', (e) => {
        const jerseyNum = e.currentTarget.getAttribute('data-jersey');
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const eventObj = {
            id: Date.now(),
            action: currentAction,
            player: jerseyNum,
            points: pointsValue,
            time: timestamp,
            isAi: false
        };

        commitEvent(eventObj);
        cancelWorkflow();
    });
});

// Back Button & Undo Actions
backButton.addEventListener('click', cancelWorkflow);
undoBanner.addEventListener('click', undoLastEvent);


// --- Core Workflow Actions ---

function commitEvent(eventObj) {
    matchHistory.push(eventObj);
    
    if (eventObj.points > 0) {
        homeScore += eventObj.points;
        scoreDisplay.innerText = homeScore;
    }

    // Append entry into the top of the stream list
    const element = document.createElement('div');
    element.className = 'log-item';
    element.id = `event-${eventObj.id}`;
    element.innerHTML = `
        <span><strong>${eventObj.time}</strong> - Player #${eventObj.player} triggered <strong>${eventObj.action}</strong></span>
        ${eventObj.isAi ? '<span class="ai-badge">AI Tracking</span>' : ''}
    `;
    logFeed.insertBefore(element, logFeed.firstChild);

    // Only show manual system undo warnings
    if (!eventObj.isAi) {
        showUndoBanner();
    }
}

function showUndoBanner() {
    clearTimeout(undoTimeout);
    undoBanner.style.display = 'block';
    undoTimeout = setTimeout(() => {
        undoBanner.style.display = 'none';
    }, 5000); // Hide banner safely after 5 seconds
}

function undoLastEvent() {
    if (matchHistory.length === 0) return;
    
    const lastEvent = matchHistory.pop();
    
    if (lastEvent.points > 0) {
        homeScore -= lastEvent.points;
        scoreDisplay.innerText = homeScore;
    }

    const elementToRemove = document.getElementById(`event-${lastEvent.id}`);
    if (elementToRemove) elementToRemove.remove();

    undoBanner.style.display = 'none';
}

function cancelWorkflow() {
    currentAction = null;
    pointsValue = 0;
    playerGrid.style.display = 'none';
    actionGrid.style.display = 'grid';
    workflowTitle.innerText = "STEP 1: Select Action";
    workflowTitle.style.color = '#00E676';
}


// --- Simulated Camera AI Pipe ---
setInterval(() => {
    const mockAiEvents = [
        { action: 'Made 2pt', points: 2, player: '23' },
        { action: 'Rebound', points: 0, player: '34' },
        { action: 'Exchange Assist', points: 0, player: '10' }
    ];
    
    // 15% random chance every 12 seconds
    if (Math.random() < 0.15) {
        const pick = mockAiEvents[Math.floor(Math.random() * mockAiEvents.length)];
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        commitEvent({
            id: Date.now(),
            action: pick.action,
            player: pick.player,
            points: pick.points,
            time: timestamp,
            isAi: true
        });
    }
}, 12000);
