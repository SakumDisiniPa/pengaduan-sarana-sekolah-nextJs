import CryptoJS from "crypto-js";

// This is a basic salt for encryption. 
// In a real production app, this should ideally be combined with a user-specific secret.
const SECRET_PREFIX = "sakum_disini_pa_sh_";

/**
 * Encrypts a string or object using AES
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const encryptData = (data: any, userSecret: string): string => {
  try {
    const stringData = typeof data === "string" ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(stringData, SECRET_PREFIX + userSecret).toString();
  } catch (err) {
    console.error("Encryption error:", err);
    return "";
  }
};

/**
 * Decrypt data from IndexedDB
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const decryptData = (encryptedData: string, userSecret: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_PREFIX + userSecret);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
};
