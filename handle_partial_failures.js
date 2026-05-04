const http = require('http');
const fs = require('fs/promises');

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/error-handling') {
    res.statusCode = 404;
    return res.end('Not Found');
  }

  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    let files;

    try {
      files = JSON.parse(body);
      if (!Array.isArray(files)) {
        throw new Error();
      }
    } catch {
      res.statusCode = 400;
      return res.end('Bad Request');
    }

    try {
      const results = await Promise.allSettled(
        files.map(file => fs.readFile(file, 'utf-8'))
      );

      const successes = [];
      const failures = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successes.push(result.value.trim());
        } else {
          failures.push(files[index]);
        }
      });

      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;

      res.end(JSON.stringify({
        successes,
        failures,
        total: files.length
      }));
    } catch (err) {
      res.statusCode = 500;
      res.end('Server Error');
    }
  });
});

const port = process.argv[2] || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});