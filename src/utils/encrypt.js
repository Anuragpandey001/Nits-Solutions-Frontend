import CryptoJS from "crypto-js";

export const encryptNote = (text) => {
    return CryptoJS.AES.encrypt(
        text,
        import.meta.env.VITE_SECRET_KEY
    ).toString();
};