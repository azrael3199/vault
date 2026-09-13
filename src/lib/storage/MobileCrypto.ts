// WebCrypto implementation of the Node.js AES-256-GCM envelope encryption

export class MobileCrypto {
  static async deriveKEK(masterKeyHex: string, userPasswordHash: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(masterKeyHex + userPasswordHash);
    
    // Hash it via SHA-256 just like the server
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    
    // Import the raw hash as an AES-GCM key
    return window.crypto.subtle.importKey(
      "raw",
      hashBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encryptData(key: CryptoKey, data: Uint8Array): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data
    );
    return {
      ciphertext: new Uint8Array(encryptedBuffer),
      iv,
    };
  }

  static async decryptData(key: CryptoKey, ciphertext: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );
    return new Uint8Array(decryptedBuffer);
  }

  static generateRandomBytes(length: number): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(length));
  }
}

export function buf2hex(buffer: Uint8Array): string {
  return Array.prototype.map.call(buffer, (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

export function hex2buf(hexString: string): Uint8Array {
  const result = [];
  for (let i = 0; i < hexString.length; i += 2) {
    result.push(parseInt(hexString.substr(i, 2), 16));
  }
  return new Uint8Array(result);
}

