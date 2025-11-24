'use client';

import React from 'react';
import { VerificationCrimeReport, VerificationLevel } from '@/types/map';

interface ReportCardProps {
    report: VerificationCrimeReport;
    onClose: () => void;
    onConfirm: (id: string) => void;
    onDispute: (id: string) => void;
    isConfirming?: boolean;
    isDisputing?: boolean;
}

const badgeByLevel: Record<VerificationLevel, { label: string; classes: string }> = {
    [VerificationLevel.CONFIRMED]: { label: 'CHÍNH XÁC', classes: 'bg-blue-100 text-blue-700 border border-blue-200' },
    [VerificationLevel.VERIFIED]: { label: 'ĐÃ XÁC MINH', classes: 'bg-green-100 text-green-700 border border-green-200' },
    [VerificationLevel.PENDING]: { label: 'CHỜ XÁC MINH', classes: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    [VerificationLevel.UNVERIFIED]: { label: 'CHƯA XÁC MINH', classes: 'bg-gray-100 text-gray-600 border border-gray-200' },
};

const scoreColor = (score: number | undefined) => {
    if ((score ?? 0) >= 85) return 'bg-blue-500';
    if ((score ?? 0) >= 70) return 'bg-green-500';
    if ((score ?? 0) >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
};

const ReportCard: React.FC<ReportCardProps> = ({
    report,
    onClose,
    onConfirm,
    onDispute,
    isConfirming = false,
    isDisputing = false,
}) => {
    const badge = badgeByLevel[report.verificationLevel ?? VerificationLevel.UNVERIFIED];

    return (
        <div className="fixed md:absolute z-2000 md:z-1000 inset-0 md:inset-auto md:top-16 md:right-4 md:w-80 pointer-events-none md:pointer-events-auto flex items-center justify-center md:block p-4 md:p-0 bg-black/50 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
            <div className="bg-white w-full max-w-sm md:max-w-none rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col pointer-events-auto">
                {report.attachments?.length ? (
                    <div className="w-full h-36 bg-gray-100 relative">
                        <img src={report.attachments[0]} alt="evidence" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
                            {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                ) : null}

                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${badge.classes}`}>{badge.label}</span>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mt-1.5">{report.title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1.5 bg-gray-50 rounded-full transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-4 bg-gray-50 p-2 rounded-lg">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="line-clamp-1">{report.address}</span>
                    </p>

                    <div className="mb-4 p-3 rounded-lg border border-slate-100 bg-white shadow-sm">
                        <div className="flex justify-between text-xs mb-1.5 font-bold text-gray-700">
                            <span>Độ tin cậy</span>
                            <span className={(report.trustScore ?? 0) >= 70 ? 'text-green-600' : 'text-gray-600'}>
                                {report.trustScore ?? 0}/100
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-700 ease-out ${scoreColor(report.trustScore)}`}
                                style={{ width: `${report.trustScore ?? 0}%` }}
                            />
                        </div>
                        <div className="mt-2.5 flex justify-between text-[11px] text-gray-500 border-t border-gray-50 pt-2">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {report.confirmationCount ?? 0} Xác nhận
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {report.disputeCount ?? 0} Báo sai
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-5 leading-relaxed">{report.description}</p>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onConfirm(report.id)}
                            disabled={isConfirming}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold active:scale-95 shadow-blue-100 shadow-lg ${isConfirming
                                    ? 'bg-blue-400 text-white cursor-not-allowed opacity-80'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {isConfirming ? (
                                <>
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                    Xác thực
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => onDispute(report.id)}
                            disabled={isDisputing}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold active:scale-95 border ${isDisputing
                                    ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed opacity-80'
                                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                        >
                            {isDisputing ? (
                                <>
                                    <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Báo sai
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;

