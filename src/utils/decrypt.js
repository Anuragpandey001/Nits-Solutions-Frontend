import CryptoJS from "crypto-js";

export const decryptNote = (
    encryptedText
) => {
    const bytes = CryptoJS.AES.decrypt(
        encryptedText,
        import.meta.env.VITE_SECRET_KEY
    );

    return bytes.toString(
        CryptoJS.enc.Utf8
    );
};