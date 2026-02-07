
export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
export const API_URL = `${BASE_URL}/api/auth`;

export const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150";

    if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('data:'))) {
        return path;
    }

    // Normalize path: replace all backslashes with forward slashes
    let cleanPath = path.toString().replace(/\\/g, '/');

    // Special case for frontend public folder assets
    // These folders exist in the frontend's public directory and should not use BASE_URL (backend)
    const publicFolders = ['3d-icons', 'Saloon', 'Plumbing', 'AC Service', 'Electronic', 'HomePageHero', 'Offer', 'Review'];
    const isPublicAsset = publicFolders.some(folder =>
        cleanPath.includes(folder + '/') || cleanPath.startsWith(folder + '/') || cleanPath.startsWith('/' + folder + '/')
    );

    if (isPublicAsset) {
        // Return relative to frontend root
        return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    }

    // Handle backend uploads
    if (cleanPath.includes('uploads/')) {
        cleanPath = 'uploads/' + cleanPath.split('uploads/').pop();
    } else {
        if (!cleanPath.startsWith('uploads/')) {
            cleanPath = 'uploads/' + cleanPath;
        }
    }

    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

    return `${BASE_URL.replace(/\/$/, '')}/${cleanPath}`;
};
