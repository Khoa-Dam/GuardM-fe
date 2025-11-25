const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const DEFAULT_HEADERS = { 'Accept-Language': 'vi' };

export interface GeocodingResult {
    display_name: string;
    lat: string;
    lon: string;
    address?: Record<string, any>;
}

export async function searchAddress(query: string): Promise<GeocodingResult[]> {
    if (!query.trim()) return [];
    const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    try {
        const res = await fetch(url, { headers: DEFAULT_HEADERS });
        if (!res.ok) return [];
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            return [];
        }
    } catch {
        return [];
    }
}

export async function reverseGeocode(lat: number, lng: number): Promise<{ display_name: string; address?: Record<string, any> } | null> {
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    try {
        const res = await fetch(url, { headers: DEFAULT_HEADERS });
        if (!res.ok) return null;
        const text = await res.text();
        try {
            const data = JSON.parse(text);
            return {
                display_name: typeof data.display_name === 'string' ? data.display_name : 'Địa chỉ không xác định',
                address: data.address || {},
            };
        } catch {
            return null;
        }
    } catch {
        return null;
    }
}


