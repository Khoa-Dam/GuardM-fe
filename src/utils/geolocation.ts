/**
 * Chuyển đổi độ sang radian
 */
export function deg2rad(deg: number): number {
    return (deg * Math.PI) / 180;
}

/**
 * Tính khoảng cách giữa hai điểm tọa độ (lat/lng) bằng công thức Haversine
 * @param lat1 - Vĩ độ điểm 1
 * @param lon1 - Kinh độ điểm 1
 * @param lat2 - Vĩ độ điểm 2
 * @param lon2 - Kinh độ điểm 2
 * @returns Khoảng cách tính bằng mét
 */
export function getDistanceFromLatLonInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Bán kính trái đất (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Khoảng cách (km)
    return d * 1000; // Đổi ra mét
}

