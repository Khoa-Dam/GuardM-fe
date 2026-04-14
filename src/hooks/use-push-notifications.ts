'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/utils/apiClient.util';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const arr = Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
    return arr.buffer.slice(0) as ArrayBuffer;
}

export function usePushNotifications() {
    const [permission, setPermission] = useState<PermissionState>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isSupported = typeof window !== 'undefined'
        && 'serviceWorker' in navigator
        && 'PushManager' in window;

    useEffect(() => {
        if (!isSupported) { setPermission('unsupported'); return; }
        setPermission(Notification.permission as PermissionState);

        // Check existing subscription
        navigator.serviceWorker.ready.then(reg =>
            reg.pushManager.getSubscription()
        ).then(sub => {
            setIsSubscribed(!!sub);
        }).catch(() => {});
    }, [isSupported]);

    const subscribe = useCallback(async (location?: { lat: number; lng: number }) => {
        if (!isSupported) return false;
        setIsLoading(true);
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm as PermissionState);
            if (perm !== 'granted') return false;

            // Register service worker
            const reg = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Get VAPID public key
            const pubKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
            if (!pubKey) throw new Error('VAPID public key not configured');

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(pubKey),
            });

            const subJson = sub.toJSON();
            await apiClient.post('/notifications/subscribe', {
                endpoint: subJson.endpoint,
                keys: subJson.keys,
                ...(location ?? {}),
            });

            setIsSubscribed(true);
            return true;
        } catch (err) {
            console.error('[Push] Subscribe error:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    const unsubscribe = useCallback(async () => {
        if (!isSupported) return;
        setIsLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await apiClient.delete('/notifications/unsubscribe', {
                    data: { endpoint: sub.endpoint },
                });
                await sub.unsubscribe();
            }
            setIsSubscribed(false);
        } catch (err) {
            console.error('[Push] Unsubscribe error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    return { permission, isSubscribed, isSupported, isLoading, subscribe, unsubscribe };
}
