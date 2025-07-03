// server.js - FINAL VERSION WITH CREATIVE ADMIN DASHBOARD

const express = require('express');
const path = require('path');
const app = express();

// --- In-Memory "Permanent Database" ---
const urlDatabase = {};
let dbIdCounter = 100000000;

// --- In-Memory "High-Speed Cache" & "Rate Limiter" ---
const redisCache = new Map();
const rateLimitTracker = new Map();

// --- Middleware ---
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.set('trust proxy', 1);

// --- Rate Limiting Middleware ---
const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const limit = 10;
    const windowMs = 60 * 1000;
    let userData = rateLimitTracker.get(ip);
    if (!userData || now - userData.startTime > windowMs) {
        userData = { count: 1, startTime: now };
        rateLimitTracker.set(ip, userData);
        return next();
    }
    userData.count++;
    if (userData.count > limit) {
        return res.status(429).json({ error: 'Too many requests' });
    }
    next();
};

// --- Base62 Encoding Logic ---
const base62 = {
    charset: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    encode: (integer) => {
        if (integer === 0) return '0';
        let s = '';
        while (integer > 0) {
            s = base62.charset[integer % 62] + s;
            integer = Math.floor(integer / 62);
        }
        return s;
    }
};

// --- API Endpoint to CREATE a new short URL ---
app.post('/api/shorten', rateLimiter, (req, res) => {
    const { originalUrl } = req.body;
    if (!originalUrl) {
        return res.status(400).json({ error: 'originalUrl is required' });
    }
    const id = dbIdCounter++;
    const shortKey = base62.encode(id);
    urlDatabase[shortKey] = {
        original: originalUrl,
        clicks: 0,
        createdAt: new Date()
    };
    const shortUrl = `${req.protocol}://${req.get('host')}/${shortKey}`;
    res.status(201).json({ shortUrl });
});

// --- Redirect Endpoint ---
app.get('/:shortKey', (req, res, next) => {
    if (req.params.shortKey === 'admin' || req.url.includes('.')) {
        return next();
    }
    if (req.url.endsWith('/stats')) {
        return next();
    }
    const { shortKey } = req.params;
    if (redisCache.has(shortKey)) {
        const urlData = redisCache.get(shortKey);
        urlData.clicks++;
        urlDatabase[shortKey].clicks++;
        return res.redirect(301, urlData.original);
    }
    const urlData = urlDatabase[shortKey];
    if (urlData) {
        urlData.clicks++;
        redisCache.set(shortKey, urlData);
        res.redirect(301, urlData.original);
    } else {
        res.status(404).send('<h1>404 - URL Not Found</h1>');
    }
});

// --- Individual Analytics Route ---
app.get('/:shortKey/stats', (req, res) => {
    const { shortKey } = req.params;
    const urlData = urlDatabase[shortKey];
    if (urlData) {
        // ... HTML for individual stats page ...
        res.send(`Individual stats for ${shortKey}: ${urlData.clicks} clicks.`);
    } else {
        res.status(404).send('<h1>404 - Not Found</h1>');
    }
});


// =======================================================================
// --- NEW: CREATIVE ADMIN DASHBOARD ---
// This route generates a full dashboard page with a new design.
// =======================================================================
app.get('/admin/dashboard', (req, res) => {
    const linksArray = Object.entries(urlDatabase).map(([key, value]) => ({ shortKey: key, ...value }));
    const totalLinks = linksArray.length;
    const totalClicks = linksArray.reduce((sum, link) => sum + link.clicks, 0);

    const tableRows = linksArray
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(link => `
            <tr>
                <td><a href="/${link.shortKey}" target="_blank">${link.shortKey}</a></td>
                <td class="original-url"><a href="${link.original}" target="_blank" title="${link.original}">${link.original}</a></td>
                <td>${link.clicks}</td>
                <td>${new Date(link.createdAt).toLocaleString()}</td>
                <td><button class="copy-btn" data-url="${req.protocol}://${req.get('host')}/${link.shortKey}">Copy</button></td>
            </tr>
        `).join('');

    const dashboardHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Admin Dashboard</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
            <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg-dark: #1a202c;
                    --card-dark: #2d3748;
                    --border-dark: #4a5568;
                    --text-bright: #edf2f7;
                    --text-dim: #a0aec0;
                    --accent-purple: #805ad5;
                    --accent-purple-hover: #6b46c1;
                }
                * { box-sizing: border-box; }
                body {
                    font-family: 'Poppins', sans-serif;
                    background-color: var(--bg-dark);
                    color: var(--text-bright);
                    margin: 0;
                    padding: 2rem;
                    /* Subtle SVG dot pattern for texture */
                    background-image: radial-gradient(var(--text-dim) 1px, transparent 0);
                    background-size: 30px 30px;
                }
                .dashboard { max-width: 1400px; margin: auto; }
                .dashboard-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
                .dashboard-header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0;
                    background: -webkit-linear-gradient(45deg, var(--accent-purple), #a270d0);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .dashboard-header p {
                    color: var(--text-dim);
                    margin-top: 0.25rem;
                }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
                .stat-card {
                    background-color: var(--card-dark);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-dark);
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2), 0 0 15px var(--accent-purple);
                }
                .stat-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
                .stat-card-header i { font-size: 1.5rem; color: var(--accent-purple); }
                .stat-card-header h2 { margin: 0; color: var(--text-dim); font-size: 1rem; font-weight: 500; }
                .stat-card .stat-value { margin: 0; color: var(--text-bright); font-size: 2.75rem; font-weight: 700; }
                .table-container { background-color: var(--card-dark); border-radius: 12px; border: 1px solid var(--border-dark); box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 1rem 1.5rem; text-align: left; }
                thead tr { border-bottom: 2px solid var(--border-dark); }
                th { font-weight: 600; color: var(--text-dim); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; }
                tbody tr { border-bottom: 1px solid var(--border-dark); transition: background-color 0.2s ease; }
                tbody tr:last-child { border-bottom: none; }
                tbody tr:hover { background-color: #384559; }
                .original-url { max-width: 450px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                a { color: var(--accent-purple); text-decoration: none; font-weight: 500; }
                a:hover { text-decoration: underline; color: #a270d0; }
                .copy-btn { background-color: #4a5568; color: var(--text-bright); border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background-color 0.2s ease; }
                .copy-btn:hover { background-color: #5b687c; }
                .copy-btn.copied { background-color: #38a169; }
            </style>
        </head>
        <body>
            <div class="dashboard">
                <div class="dashboard-header">
                    <h1>Service Dashboard</h1>
                    <p>Real-time overview of all link activity</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header"><i class="fa-solid fa-link"></i><h2>Total Links Created</h2></div>
                        <p class="stat-value">${totalLinks}</p>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-header"><i class="fa-solid fa-arrow-pointer"></i><h2>Total Clicks (All Links)</h2></div>
                        <p class="stat-value">${totalClicks}</p>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Short Key</th><th>Original URL</th><th>Clicks</th><th>Created Date</th><th>Action</th></tr></thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            </div>
            <script>
                document.addEventListener('click', e => {
                    if (e.target.matches('.copy-btn')) {
                        const url = e.target.dataset.url;
                        navigator.clipboard.writeText(url).then(() => {
                            e.target.textContent = 'Copied!';
                            e.target.classList.add('copied');
                            setTimeout(() => {
                                e.target.textContent = 'Copy';
                                e.target.classList.remove('copied');
                            }, 1500);
                        });
                    }
                });
            </script>
        </body>
        </html>
    `;
    res.send(dashboardHtml);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running! Open your browser to http://localhost:${PORT}`);
    console.log(`Admin Dashboard available at http://localhost:${PORT}/admin/dashboard`);
});