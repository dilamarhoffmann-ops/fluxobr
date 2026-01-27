
export const isImageFile = (url: string | undefined | null) => {
    if (!url) return false;
    const cleanUrl = url.trim().split(/[?#]/)[0].toLowerCase();
    return cleanUrl.endsWith('.jpg') ||
        cleanUrl.endsWith('.jpeg') ||
        cleanUrl.endsWith('.png') ||
        cleanUrl.endsWith('.webp') ||
        cleanUrl.endsWith('.gif') ||
        cleanUrl.endsWith('.svg') ||
        cleanUrl.endsWith('.avif') ||
        cleanUrl.endsWith('.bmp');
};

export const copyToClipboard = (text: string, onNotify?: () => void) => {
    navigator.clipboard.writeText(text);
    if (onNotify) onNotify();
};

export const getCleanFileName = (file: File) => {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    return cleanName;
};
