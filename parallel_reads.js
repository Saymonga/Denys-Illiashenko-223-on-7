const http = require('http');
const fs = require('fs/promises');

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' || req.url !== '/parallel') {
    res.statusCode = 404;
    return res.end('Not Found');
  }

  const start = Date.now();

  try {
    const [a, b, c] = await Promise.all([
      fs.readFile('a.txt', 'utf-8'),
      fs.readFile('b.txt', 'utf-8'),
      fs.readFile('c.txt', 'utf-8')
    ]);

    const combined = a.trim() + b.trim() + c.trim();
    const elapsedMs = Date.now() - start;

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;

    res.end(JSON.stringify({
      combined,
      elapsedMs
    }));
  } catch (err) {
    res.statusCode = 500;
    res.end('Server Error');
  }
});

const port = process.argv[2] || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});