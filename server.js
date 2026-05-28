const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Ensure messages.json exists
if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2), 'utf8');
}

// POST endpoint for contact form
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newMessage = {
        id: Date.now().toString(),
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
    };

    try {
        const fileData = fs.readFileSync(MESSAGES_FILE, 'utf8');
        const messages = JSON.parse(fileData);
        messages.push(newMessage);
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
        
        console.log(`[Backend] New message received from ${name} (${email}): "${subject}"`);
        res.status(201).json({ message: 'Success! Your message was received by Soham\'s backend.' });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: 'Internal Server Error saving message.' });
    }
});

// GET endpoint to retrieve messages (for Soham's admin dashboard)
app.get('/api/messages', (req, res) => {
    const token = req.headers['x-admin-token'];
    
    // Simple secure authentication token
    if (token !== 'soham-admin-key') {
        return res.status(401).json({ error: 'Unauthorized access token' });
    }

    try {
        const fileData = fs.readFileSync(MESSAGES_FILE, 'utf8');
        const messages = JSON.parse(fileData);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error retrieving messages.' });
    }
});

// Serve main page for all other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Soham's Portfolio Backend running successfully!`);
    console.log(`🌍 Local Access: http://localhost:${PORT}`);
    console.log(`📝 Submissions are saved to: ${MESSAGES_FILE}`);
    console.log(`======================================================\n`);
});
