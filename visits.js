// --- Configuration ---
const UPDATE_ENDPOINT = '/api/update-stats'; // POST endpoint to log a new visit/activity
const FETCH_ENDPOINT = '/api/fetch-stats';   // GET endpoint to retrieve the current counts
const REFRESH_INTERVAL_MS = 5000;            // Refresh stats every 5 seconds (5000ms)

// --- Helper to get or create a unique session ID (for active users tracking) ---
function getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        // Generate a simple, unique ID (UUID is better, but this works)
        sessionId = 'user-' + Date.now() + Math.random().toString(16).slice(2);
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

// --- 1. Function to LOG the current visit/activity ---
async function logVisit() {
    try {
        const sessionId = getSessionId();

        await fetch(UPDATE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Send the session ID so the backend can update the 'last active' timestamp
            body: JSON.stringify({ sessionId: sessionId }),
        });
        // Logging successful visit is silent to the user
    } catch (error) {
        console.error('Error logging visit:', error);
    }
}

// --- 2. Function to FETCH and UPDATE the displayed stats ---
async function fetchAndDisplayStats() {
    try {
        const response = await fetch(FETCH_ENDPOINT);
        const data = await response.json();

        // Assume the response JSON has these fields:
        // { totalVisits: 1234, visitsToday: 56, activeUsers: 3 }

        document.getElementById('total-visits').textContent = data.totalVisits || 0;
        document.getElementById('visits-today').textContent = data.visitsToday || 0;
        document.getElementById('active-users').textContent = data.activeUsers || 0;

    } catch (error) {
        console.error('Error fetching stats:', error);
        // Optional: Set spans to a placeholder on error
        document.getElementById('total-visits').textContent = 'N/A';
        document.getElementById('visits-today').textContent = 'N/A';
        document.getElementById('active-users').textContent = 'N/A';
    }
}


// --- 3. Run the logic on page load ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Log the first visit/activity immediately
    logVisit();

    // 2. Fetch and display the stats immediately
    fetchAndDisplayStats();

    // 3. Set up the interval to refresh the stats every 5 seconds
    setInterval(() => {
        // Log the activity to keep the 'active user' status alive
        logVisit();
        // Fetch the updated stats
        fetchAndDisplayStats();
    }, REFRESH_INTERVAL_MS);
});
