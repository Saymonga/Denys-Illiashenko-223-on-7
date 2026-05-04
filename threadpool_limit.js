const http = require('http');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' || req.url !== '/threadpool-limit') {
    res.statusCode = 404;
    return res.end('Not Found');
  }

  const start = Date.now();

  const tasks = [];

  for (let i = 0; i < 8; i++) {
    tasks.push(new Promise((resolve, reject) => {
      crypto.pbkdf2(
        'password',
        'salt',
        100000,
        64,
        'sha512',
        (err, key) => {
          if (err) reject(err);
          else resolve(key);
        }
      );
    }));
  }

  Promise.all(tasks)
    .then(() => {
      const durationMs = Date.now() - start;

      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;

      res.end(JSON.stringify({
        tasks: 8,
        durationMs
      }));
    })
    .catch(() => {
      res.statusCode = 500;
      res.end('Server Error');
    });
});

const port = process.argv[2] || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});