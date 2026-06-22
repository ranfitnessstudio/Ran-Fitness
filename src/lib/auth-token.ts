const JWT_SECRET = process.env.JWT_SECRET || 'ran_fitness_super_secure_jwt_secret_token_2026';

function textToBuffer(text: string) {
  return new TextEncoder().encode(text);
}

export async function signToken(username: string, expiresAt: number): Promise<string> {
  const payload = JSON.stringify({ username, expiresAt });
  const key = await crypto.subtle.importKey(
    'raw',
    textToBuffer(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, textToBuffer(payload));
  
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const payloadBase64 = btoa(payload);
  return `${payloadBase64}.${signatureHex}`;
}

export async function verifyToken(token: string): Promise<string | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  
  const [payloadBase64, signatureHex] = parts;
  try {
    const payloadStr = atob(payloadBase64);
    const payload = JSON.parse(payloadStr);
    
    if (payload.expiresAt < Date.now()) return null;
    
    const key = await crypto.subtle.importKey(
      'raw',
      textToBuffer(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const sigBytes = signatureHex.match(/.{1,2}/g);
    if (!sigBytes) return null;
    
    const sigBuffer = new Uint8Array(
      sigBytes.map(byte => parseInt(byte, 16))
    );
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBuffer,
      textToBuffer(payloadStr)
    );
    
    return isValid ? payload.username : null;
  } catch {
    return null;
  }
}

export async function hashSha256(input: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateMemberSessionCookieValue(memberId: string, passwordHash?: string): Promise<string> {
  const tokenInput = passwordHash ? passwordHash : (memberId + JWT_SECRET);
  const sig = await hashSha256(tokenInput);
  return `${memberId}.${sig}`;
}

export async function verifyMemberSessionCookie(cookieValue: string, passwordHash?: string): Promise<boolean> {
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  const tokenInput = passwordHash ? passwordHash : (parts[0] + JWT_SECRET);
  const sig = await hashSha256(tokenInput);
  return parts[1] === sig;
}
