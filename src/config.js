
export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
export const API_URL = `${BASE_URL}/api/auth`;

export const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('data:'))) {
        return path;
    }

    let cleanPath = path.toString().replace(/\\/g, '/');
    if (cleanPath.includes('uploads/')) {
        cleanPath = 'uploads/' + cleanPath.split('uploads/').pop();
    }
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

    return `${BASE_URL}/${cleanPath}`;
};
