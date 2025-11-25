'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getDistanceFromLatLonInMeters } from '@/utils/geolocation';
import { VerificationCrimeReport } from '@/types/map';

interface UseMapGeolocationProps {
    isLeafletLoaded: boolean;
    mapInstanceRef: React.MutableRefObject<any>;
    reports: VerificationCrimeReport[];
}

export const useMapGeolocation = ({ isLeafletLoaded, mapInstanceRef, reports }: UseMapGeolocationProps) => {
    const userMarkerRef = useRef<any>(null);
    const watchIdRef = useRef<number | null>(null);

    const [hasLocated, setHasLocated] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertedReportIds, setAlertedReportIds] = useState<Set<string>>(new Set());
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    const createUserMarker = (latitude: number, longitude: number, accuracy: number) => {
        const L = (window as any).L;
        const map = mapInstanceRef.current;
        if (!L || !map) return null;

        const accuracyText =
            accuracy > 1000
                ? `<br><span style="color: red; font-size: 11px;">⚠️ Độ chính xác: ±${Math.round(accuracy)}m (Thấp!)</span>`
                : `<br><span style="font-size: 11px;">Độ chính xác: ±${Math.round(accuracy)}m</span>`;

        const icon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div class="my-location-pulse" style="width:16px;height:16px;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });

        const marker = L.marker([latitude, longitude], { icon }).addTo(map);
        marker.bindPopup(`<b>Vị trí hiện tại của bạn</b>${accuracyText}`);
        return marker;
    };

    const updateUserMarker = (latitude: number, longitude: number, accuracy: number) => {
        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
            const accuracyText =
                accuracy > 1000
                    ? `<br><span style="color: red; font-size: 11px;">⚠️ Độ chính xác: ±${Math.round(accuracy)}m (Thấp!)</span>`
                    : `<br><span style="font-size: 11px;">Độ chính xác: ±${Math.round(accuracy)}m</span>`;
            userMarkerRef.current.setPopupContent(`<b>Vị trí hiện tại của bạn</b>${accuracyText}`);
        } else {
            userMarkerRef.current = createUserMarker(latitude, longitude, accuracy);
        }
    };

    const handleGetLocation = () => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            toast.warning('Trình duyệt không hỗ trợ định vị');
            return;
        }

        // Nếu marker đã tồn tại, flyTo đến vị trí hiện tại của marker
        if (userMarkerRef.current) {
            const latlng = userMarkerRef.current.getLatLng();
            const map = mapInstanceRef.current;
            if (map && latlng) {
                map.flyTo([latlng.lat, latlng.lng], 15, { duration: 1.1 });
                return;
            }
        }

        // Nếu chưa có marker, lấy vị trí mới từ GPS
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const map = mapInstanceRef.current;
                const L = (window as any).L;
                if (!map || !L) return;

                // Cảnh báo nếu độ chính xác quá thấp
                if (coords.accuracy > 1000) {
                    toast.warning(
                        `Độ chính xác GPS thấp (±${Math.round(coords.accuracy)}m). Vị trí có thể không chính xác. Hãy cho phép truy cập vị trí chính xác trong cài đặt trình duyệt.`,
                        { duration: 5000 }
                    );
                }

                // Cập nhật hoặc tạo marker
                if (userMarkerRef.current) {
                    updateUserMarker(coords.latitude, coords.longitude, coords.accuracy);
                } else {
                    userMarkerRef.current = createUserMarker(coords.latitude, coords.longitude, coords.accuracy);
                }

                setCurrentLocation({ lat: coords.latitude, lng: coords.longitude });

                // Luôn flyTo đến vị trí hiện tại
                map.flyTo([coords.latitude, coords.longitude], 15, { duration: 1.1 });
                setHasLocated(true);
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                toast.error('Không thể xác định vị trí của bạn');
            }
        );
    };

    // Lấy vị trí lần đầu
    useEffect(() => {
        if (isLeafletLoaded && mapInstanceRef.current && !hasLocated) {
            handleGetLocation();
        }
    }, [isLeafletLoaded, hasLocated]);

    // Theo dõi vị trí liên tục và kiểm tra cảnh báo nguy hiểm
    useEffect(() => {
        if (
            typeof navigator === 'undefined' ||
            !navigator.geolocation ||
            !isLeafletLoaded ||
            !mapInstanceRef.current
        ) {
            return;
        }

        const L = (window as any).L;
        if (!L) return;

        const handlePositionChange = (pos: GeolocationPosition) => {
            const { latitude, longitude, accuracy } = pos.coords;
            const map = mapInstanceRef.current;
            if (!map) return;



            updateUserMarker(latitude, longitude, accuracy);
            setCurrentLocation({ lat: latitude, lng: longitude });

            if (!hasLocated) {
                setHasLocated(true);
                map.flyTo([latitude, longitude], 15, { duration: 1 });
            }

            reports.forEach((report) => {
                if (!report.lat || !report.lng) return;
                const distance = getDistanceFromLatLonInMeters(latitude, longitude, report.lat, report.lng);
                if (distance < 500) {
                    setAlertedReportIds((prev) => {
                        if (prev.has(report.id)) {
                            return prev;
                        }
                        setAlertMessage(
                            `Bạn đang ở gần khu vực "${report.title}" (~${Math.round(distance)}m). Hãy cẩn thận!`
                        );
                        if (navigator.vibrate) {
                            navigator.vibrate([400, 200, 400]);
                        }
                        const next = new Set(prev);
                        next.add(report.id);
                        return next;
                    });
                }
            });
        };

        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePositionChange,
            (err) => console.warn('Lỗi GPS:', err),
            { enableHighAccuracy: true }
        );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [isLeafletLoaded, reports, hasLocated]);

    return {
        handleGetLocation,
        alertMessage,
        setAlertMessage,
        currentLocation,
    };
};

