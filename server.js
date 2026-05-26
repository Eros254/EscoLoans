const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT_DIR = __dirname;
const PORT = Number(process.env.PORT || 3000);

loadEnvFile(path.join(ROOT_DIR, '.env.local'));

const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const pathname = decodeURIComponent(requestUrl.pathname);

    if (pathname === '/api/firebase-config') {
        serveFirebaseConfig(response);
        return;
    }

    if (pathname === '/') {
        serveFile(path.join(ROOT_DIR, 'esco.html'), response);
        return;
    }

    const filePath = path.join(ROOT_DIR, pathname.replace(/^\/+/, ''));

    if (!isSafePath(filePath)) {
        sendNotFound(response);
        return;
    }

    serveFile(filePath, response);
});

server.listen(PORT, () => {
    console.log(`Esco Loans running at http://localhost:${PORT}`);
});

function serveFirebaseConfig(response) {
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || ''
    };

    const configured = Object.values(firebaseConfig).every(Boolean);

    response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8'
    });
    response.end(JSON.stringify({
        configured,
        firebaseConfig: configured ? firebaseConfig : null
    }));
}

function serveFile(filePath, response) {
    fs.readFile(filePath, (error, data) => {
        if (error) {
            sendNotFound(response);
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        response.writeHead(200, {
            'Content-Type': MIME_TYPES[extension] || 'application/octet-stream'
        });
        response.end(data);
    });
}

function sendNotFound(response) {
    response.writeHead(404, {
        'Content-Type': 'text/plain; charset=utf-8'
    });
    response.end('404: NOT_FOUND');
}

function isSafePath(filePath) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    return relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

function loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) {
        return;
    }

    const fileContents = fs.readFileSync(envPath, 'utf8');
    const lines = fileContents.split(/\r?\n/);

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }

        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}
