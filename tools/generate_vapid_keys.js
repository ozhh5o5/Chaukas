const fs = require('fs');
const crypto = require('crypto');

function b64url(buf) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function setVar(filePath, key, value) {
  let text = fs.readFileSync(filePath, 'utf8');
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(text)) {
    text = text.replace(re, `${key}=${value}`);
  } else {
    if (!text.endsWith('\n')) text += '\n';
    text += `${key}=${value}\n`;
  }
  fs.writeFileSync(filePath, text, 'utf8');
}

// Generate ES256 keypair (P-256)
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
});

const jwkPub = publicKey.export({ format: 'jwk' });
const jwkPriv = privateKey.export({ format: 'jwk' });

const x = Buffer.from(jwkPub.x, 'base64url');
const y = Buffer.from(jwkPub.y, 'base64url');
const d = Buffer.from(jwkPriv.d, 'base64url');

// Web Push expects uncompressed EC point format: 0x04 || X || Y
const publicKeyBytes = Buffer.concat([Buffer.from([0x04]), x, y]);
const VAPID_PUBLIC_KEY = b64url(publicKeyBytes);
const VAPID_PRIVATE_KEY = b64url(d);

setVar('backend/.env', 'VAPID_PUBLIC_KEY', VAPID_PUBLIC_KEY);
setVar('backend/.env', 'VAPID_PRIVATE_KEY', VAPID_PRIVATE_KEY);
setVar('frontend/.env', 'VITE_VAPID_PUBLIC_KEY', VAPID_PUBLIC_KEY);

console.log('VAPID keys generated and written to backend/.env and frontend/.env (values not printed).');
