const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
// Railway provides the PORT environment variable
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve the static files (index.html, css, etc)

// Initialize Database if not exists
// Note: On Railway ephemeral storage, this file resets on redeploy. 
// For permanent storage, you'd typically use a Railway Postgres/MySQL plugin, 
// but this works for a simple demo/test.
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// API Route: Register
app.post('/api/register', (req, res) => {
    const { email, wallet } = req.body;

    if (!email || !wallet) {
        return res.status(400).json({ success: false, message: 'Missing email or wallet' });
    }

    // Read current data
    let data = [];
    try {
        if (fs.existsSync(DB_FILE)) {
            const fileContent = fs.readFileSync(DB_FILE, 'utf8');
            data = JSON.parse(fileContent);
        }
    } catch (err) {
        console.error('Error reading database:', err);
    }

    // Checking for duplicates (optional simple check)
    const exists = data.find(u => u.wallet === wallet || u.email === email);
    if (exists) {
        return res.status(409).json({ success: false, message: 'Wallet or Email already registered' });
    }

    // Add new entry
    const newEntry = {
        id: Date.now(),
        email,
        wallet,
        submittedAt: new Date().toISOString()
    };
    data.push(newEntry);

    // Save back to file
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing database:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

    console.log(`[New Registration] Email: ${email}, Wallet: ${wallet}`);
    res.json({ success: true, message: 'Registration successful!' });
});

// Fallback to index.html for any other route (SPA behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
