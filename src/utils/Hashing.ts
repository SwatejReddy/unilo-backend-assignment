// Function to generate a random salt
export function generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Function to hash a password using SHA-256
export async function hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

// Function to verify a password against an already hashed password
export async function verifyPassword(password: string, hashedPassword: string, salt: string): Promise<boolean> {
    const newHash = await hashPassword(password, salt);
    return newHash === hashedPassword;
}