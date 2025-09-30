const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Tạo self-signed certificate trong code
const selfsigned = require('selfsigned');
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

// Mime types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

const server = https.createServer({
    key: pems.private,
    cert: pems.cert
}, (req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = `.${parsedUrl.pathname}`;

    // Default to index.html
    if (pathname === './') {
        pathname = './index.html';
    }

    // Check if file exists
    if (fs.existsSync(pathname)) {
        const ext = path.parse(pathname).ext;
        const mimeType = mimeTypes[ext] || 'text/plain';

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        const fileStream = fs.createReadStream(pathname);
        fileStream.pipe(res);
    } else {
        res.statusCode = 404;
        res.end('File not found');
    }
});

const PORT = 8443;
server.listen(PORT, () => {
    console.log(`HTTPS Server running at https://localhost:${PORT}/`);
    console.log('Note: You may need to accept the self-signed certificate warning in your browser');
});
