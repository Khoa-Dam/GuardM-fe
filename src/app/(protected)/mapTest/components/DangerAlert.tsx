'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface DangerAlertProps {
    message: string;
    onClose: () => void;
}

export const DangerAlert: React.FC<DangerAlertProps> = ({ message, onClose }) => (
    <div className="fixed top-15 right-4 z-50 w-full max-w-sm animate-in slide-in-from-right-5">
        {/* Thay đổi: Nền trắng/nhạt, viền đỏ */}
        <Alert className="border-red-200 bg-red-50 text-red-900 shadow-lg">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div className="flex items-start justify-between gap-2 ml-2">
                <div>
                    <AlertTitle className="text-red-700 font-bold">Cảnh báo</AlertTitle>
                    <AlertDescription className="text-red-600/90 mt-1">
                        {message}
                    </AlertDescription>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-6 w-6 text-red-400 hover:bg-red-100 hover:text-red-600 -mt-1"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </Alert>
    </div>
);