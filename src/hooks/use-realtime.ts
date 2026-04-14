'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRealtimeContext, type RealtimeCallbacks } from '@/providers/realtime-provider';

export function useRealtime(callbacks?: RealtimeCallbacks) {
    const { subscribe, subscribeArea, unsubscribeArea, isConnected } = useRealtimeContext();

    // Keep callbacks ref stable to avoid re-subscribing on every render
    const callbacksRef = useRef<RealtimeCallbacks | undefined>(callbacks);
    callbacksRef.current = callbacks;

    useEffect(() => {
        // Subscribe with a stable proxy that reads from the ref
        const proxy: RealtimeCallbacks = {
            onReportCreated: (r) => callbacksRef.current?.onReportCreated?.(r),
            onReportUpdated: (r) => callbacksRef.current?.onReportUpdated?.(r),
            onReportDeleted: (id) => callbacksRef.current?.onReportDeleted?.(id),
            onNearbyAlert:   (r) => callbacksRef.current?.onNearbyAlert?.(r),
        };
        return subscribe(proxy);
    // subscribe is stable (useCallback in provider), so this runs once per mount
    }, [subscribe]);

    const subscribeAreaCb = useCallback((lat: number, lng: number) => {
        subscribeArea(lat, lng);
    }, [subscribeArea]);

    const unsubscribeAreaCb = useCallback(() => {
        unsubscribeArea();
    }, [unsubscribeArea]);

    return { subscribeArea: subscribeAreaCb, unsubscribeArea: unsubscribeAreaCb, isConnected };
}
