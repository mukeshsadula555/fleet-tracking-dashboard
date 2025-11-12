const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const app = express();

// Serve data and fallback JSON
app.get('/data/events', (req, res) => {
  const file = path.join(__dirname, '..', 'data', 'fallback_events.json');
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(file);
});

// SSE stream: emits events in chronological order.
// Query: ?speed=5 controls playback speed (ratio relative to real timestamps)
app.get('/stream', (req, res) => {
  const file = path.join(__dirname, '..', 'data', 'fallback_events.json');
  const raw = fs.readFileSync(file, 'utf8');
  let events;
  try {
    events = JSON.parse(raw);
  } catch (err) {
    res.status(500).send('bad data');
    return;
  }
  events.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
  const speed = Number(req.query.speed) || 1;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let i = 0;
  let lastTs = events.length ? new Date(events[0].timestamp).getTime() : Date.now();

  function sendNext() {
    if (i >= events.length) {
      res.write(`event: end\ndata: {"msg":"end"}\n\n`);
      return res.end();
    }
    const ev = events[i++];
    res.write(`data: ${JSON.stringify(ev)}\n\n`);
    // wait based on timestamp diff divided by speed
    const nextTs = i < events.length ? new Date(events[i].timestamp).getTime() : null;
    const now = new Date(ev.timestamp).getTime();
    const delay = nextTs ? Math.max(10, (nextTs - now) / speed) : 50;
    setTimeout(sendNext, delay);
  }
  // initial small delay then start
  setTimeout(sendNext, 100);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
