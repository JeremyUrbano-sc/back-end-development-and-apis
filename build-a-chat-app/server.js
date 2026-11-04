import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;

// User Story 1: Create HTTP server reading ./public/index.html
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// User Story 2: Create WebSocketServer passing { server } as options stored in wss
const wss = new WebSocketServer({ server });

// Helper to broadcast messages
function broadcast(data, filterClient = null) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== filterClient) {
      client.send(message);
    }
  });
}

// User Story 3 & 4: 'connection' listener and parsing username
wss.on('connection', (socket, req) => {
  const username = new URL(req.url, 'http://localhost').searchParams.get('username');

  // Broadcast join message
  broadcast({ type: 'system', text: `${username} joined` });

  // User Story 5: 'message' listener
  socket.on('message', (messageData) => {
    try {
      const parsed = JSON.parse(messageData);
      broadcast({ type: 'chat', username, text: parsed.text });
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });

  // User Story 6: 'close' listener
  socket.on('close', () => {
    broadcast({ type: 'system', text: `${username} left` }, socket);
  });
});

// User Story 7: Start server listening on PORT
server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});