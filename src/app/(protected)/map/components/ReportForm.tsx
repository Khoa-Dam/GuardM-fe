'use client';

import React, { useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import { CrimeType } from '@/service/report.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { MapPin, X, Upload, Loader2, AlertCircle, ChevronRight, ChevronLeft, Check, Skull, Target, Eye, Flame, Shield, Package, AlertTriangle, Siren, Zap } from 'lucide-react';
import type { VerificationCrimeReport } from '@/types/map';
import { cn } from '@/lib/utils';
import { parseReportAction } from '../actions/parse-report.action';

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface ReportLocationData {
    lat: number;
    lng: number;
    address: string;
    addressDetails?: Record<string, string>;
}

export interface ReportFormPayload {
    title: string;
    type: CrimeType;
    description: string;
    attachments: string[];
    lat: number;
    lng: number;
    address: string;
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
    areaCode?: string;
    source?: string;
    severity?: number;
    reportedAt?: string;
}

interface ReportFormProps {
    locationData: ReportLocationData;
    onClose: () => void;
    onSubmit: (data: ReportFormPayload) => void;
    isSubmitting?: boolean;
    report?: VerificationCrimeReport;
}

const crimeTypes: { type: CrimeType; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    { type: CrimeType.GIET_NGUOI, label: 'Giết người', icon: Skull, color: '#ff3b3b', desc: 'Tội phạm giết người' },
    { type: CrimeType.BAT_COC, label: 'Bắt cóc', icon: Target, color: '#ff6b35', desc: 'Bắt cóc, tống tiền' },
    { type: CrimeType.TRUY_NA, label: 'Truy nã', icon: Siren, color: '#ff3b3b', desc: 'Đối tượng đang bị truy nã' },
    { type: CrimeType.CUOP_GIAT, label: 'Cướp giật', icon: Flame, color: '#ffd700', desc: 'Cướp giật tài sản' },
    { type: CrimeType.DE_DOA, label: 'Đe dọa', icon: AlertTriangle, color: '#ffd700', desc: 'Đe dọa, uy hiếp' },
    { type: CrimeType.NGHI_PHAM, label: 'Nghi phạm', icon: Eye, color: '#00d4ff', desc: 'Đối tượng nghi phạm' },
    { type: CrimeType.DANG_NGO, label: 'Đáng ngờ', icon: Shield, color: '#00d4ff', desc: 'Hành vi đáng ngờ' },
    { type: CrimeType.TROM_CAP, label: 'Trộm cắp', icon: Package, color: '#00ff88', desc: 'Trộm cắp tài sản' },
];

const severityConfig = [
    { level: 1, label: 'Rất thấp', color: '#00ff88', desc: 'Hành vi nhẹ, không nguy hiểm' },
    { level: 2, label: 'Thấp', color: '#66ff66', desc: 'Có thể theo dõi thêm' },
    { level: 3, label: 'Trung bình', color: '#ffd700', desc: 'Cần chú ý, báo cáo ngay' },
    { level: 4, label: 'Cao', color: '#ff6b35', desc: 'Nguy hiểm, cần can thiệp' },
    { level: 5, label: 'Rất cao', color: '#ff3b3b', desc: 'Cực kỳ nguy hiểm — GỌI 113' },
];

const formatDateTimeLocal = (date?: string | Date): string => {
    if (!date) return new Date().toISOString().slice(0, 16);
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 16);
};

const STEPS = ['VỊ TRÍ', 'LOẠI TỘI', 'CHI TIẾT', 'XÁC NHẬN'];

const ReportForm: React.FC<ReportFormProps> = ({ locationData, onClose, onSubmit, isSubmitting = false, report }) => {
    const isEditMode = !!report;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(0);
    const [selectedType, setSelectedType] = useState<CrimeType>((report?.type as CrimeType) || CrimeType.CUOP_GIAT);
    const [severity, setSeverity] = useState(report?.severity ?? 3);
    const [title, setTitle] = useState(report?.title || '');
    const [description, setDescription] = useState(report?.description || '');
    const [reportedAt, setReportedAt] = useState(formatDateTimeLocal(report?.reportedAt));
    const [existingAttachments, setExistingAttachments] = useState<string[]>(report?.attachments || []);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const selectedTypeConfig = crimeTypes.find(t => t.type === selectedType)!;
    const selectedSeverityConfig = severityConfig.find(s => s.level === severity)!;

    const addressDetails = locationData.addressDetails ?? {};
    const province = report?.province || addressDetails.city || addressDetails.province || '';
    const district = report?.district || addressDetails.city_district || addressDetails.district || '';
    const ward = report?.ward || addressDetails.suburb || addressDetails.neighbourhood || '';
    const street = report?.street || addressDetails.road || '';

    const handleFileUpload = async (files: FileList | File[] | null) => {
        if (!files || !Array.from(files).length) return;
        setUploadError(null);
        const oversized: string[] = [];
        const valid: File[] = [];
        Array.from(files).forEach(f => f.size > MAX_FILE_SIZE_BYTES ? oversized.push(f.name) : valid.push(f));
        if (oversized.length) setUploadError(`File vượt quá ${MAX_FILE_SIZE_MB}MB: ${oversized.join(', ')}`);
        if (!valid.length) return;
        setIsUploading(true);
        try {
            const base64s = await Promise.all(valid.map(f => new Promise<string>((res, rej) => {
                const r = new FileReader();
                r.onload = () => typeof r.result === 'string' ? res(r.result) : rej(new Error('Cannot read'));
                r.onerror = () => rej(new Error('Read error'));
                r.readAsDataURL(f);
            })));
            setUploadedFiles(prev => [...prev, ...base64s].slice(0, 5));
        } catch { setUploadError('Lỗi đọc file. Vui lòng thử lại.'); }
        finally { setIsUploading(false); }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileUpload(Array.from(e.dataTransfer.files).filter(f => /^(image|video)\//.test(f.type)));
    };

    const handleSubmit = () => {
        const payload: ReportFormPayload = {
            title: title || selectedTypeConfig.label,
            type: selectedType,
            description,
            attachments: [...existingAttachments, ...uploadedFiles, ...(videoUrl.trim() ? [videoUrl.trim()] : [])],
            lat: locationData.lat,
            lng: locationData.lng,
            address: String(locationData.address),
            province, district, ward, street,
            areaCode: report?.areaCode || '',
            source: report?.source || 'Người dùng báo cáo',
            severity,
            reportedAt: reportedAt ? new Date(reportedAt).toISOString() : undefined,
        };
        onSubmit(payload);
    };

    const handleAiAssist = async () => {
        if (!description.trim()) return;
        setIsAiLoading(true);
        setAiError(null);
        try {
            const result = await parseReportAction(description);
            if (!result) throw new Error('No result');
            if (result.title) setTitle(result.title);
            if (result.type) {
                const matched = crimeTypes.find(c => c.type === result.type);
                if (matched) setSelectedType(matched.type);
            }
            if (result.severity && result.severity >= 1 && result.severity <= 5) {
                setSeverity(result.severity);
            }
            if (result.description) setDescription(result.description);
        } catch {
            setAiError('AI không thể phân tích. Vui lòng thử lại.');
        } finally {
            setIsAiLoading(false);
        }
    };

    const canProceed = useMemo(() => {
        if (step === 0) return true;
        if (step === 1) return !!selectedType;
        return true;
    }, [step, selectedType]);

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="p-0 gap-0 w-full max-w-lg overflow-hidden border border-[rgba(0,212,255,0.2)] bg-[rgba(8,12,24,0.98)]"
                style={{ backdropFilter: 'blur(20px)' }}>
                <DialogTitle className="sr-only">Báo cáo sự cố</DialogTitle>
                <DialogDescription className="sr-only">Form báo cáo sự cố tội phạm trên bản đồ</DialogDescription>

                {/* Scan-line overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.8) 2px, rgba(0,212,255,0.8) 3px)', backgroundSize: '100% 3px', zIndex: 0 }} />

                {/* Top glow */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-60" />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b3b] animate-pulse" />
                            <span className="font-mono text-[9px] tracking-[0.25em] text-[#00d4ff]/50 uppercase">
                                {isEditMode ? 'EDIT REPORT' : 'NEW REPORT'} — STEP {step + 1}/{STEPS.length}
                            </span>
                        </div>
                        <h2 className="font-mono text-base font-bold text-white">{STEPS[step]}</h2>
                    </div>
                    <button onClick={onClose}
                        className="h-8 w-8 rounded border border-[rgba(255,255,255,0.1)] flex items-center justify-center hover:border-[rgba(255,59,59,0.5)] hover:text-[#ff3b3b] text-[#8899aa] transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Step indicator */}
                <div className="relative z-10 flex items-center gap-0 px-5 pb-4">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s}>
                            <div className="flex flex-col items-center gap-1">
                                <div className={cn(
                                    "w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[10px] transition-all duration-300",
                                    i < step ? "border-[#00d4ff] bg-[#00d4ff]/20 text-[#00d4ff]" :
                                        i === step ? "border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]" :
                                            "border-[rgba(255,255,255,0.1)] text-[#8899aa]"
                                )}>
                                    {i < step ? <Check className="h-3 w-3" /> : i + 1}
                                </div>
                                <span className={cn("font-mono text-[8px] tracking-wide transition-colors",
                                    i === step ? "text-[#00d4ff]" : "text-[#8899aa]")}>{s}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={cn("flex-1 h-px mx-1 mb-4 transition-all duration-300",
                                    i < step ? "bg-[#00d4ff]/60" : "bg-[rgba(255,255,255,0.08)]")} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Content */}
                <div className="relative z-10 overflow-y-auto px-5 pb-2" style={{ maxHeight: '52vh' }}>

                    {/* STEP 0: Location */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <div className="rounded border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.05)] p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 w-8 h-8 rounded bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] flex items-center justify-center shrink-0">
                                        <MapPin className="h-4 w-4 text-[#00d4ff]" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <p className="font-mono text-[10px] text-[#00d4ff]/60 uppercase tracking-widest">VỊ TRÍ ĐÃ XÁC NHẬN</p>
                                        <p className="font-mono text-sm text-white leading-relaxed">{locationData.address}</p>
                                        <div className="flex gap-4 mt-2">
                                            <span className="font-mono text-[10px] text-[#00d4ff]/50">LAT: <span className="text-[#00d4ff]">{locationData.lat.toFixed(6)}</span></span>
                                            <span className="font-mono text-[10px] text-[#00d4ff]/50">LNG: <span className="text-[#00d4ff]">{locationData.lng.toFixed(6)}</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {[{ label: 'TỈNH/THÀNH', val: province }, { label: 'QUẬN/HUYỆN', val: district }, { label: 'PHƯỜNG/XÃ', val: ward }, { label: 'ĐƯỜNG', val: street }]
                                .filter(r => r.val).map(row => (
                                    <div key={row.label} className="flex items-center gap-3 px-3 py-2 rounded border border-[rgba(255,255,255,0.05)]">
                                        <span className="font-mono text-[9px] text-[#00d4ff]/40 uppercase tracking-widest w-24 shrink-0">{row.label}</span>
                                        <span className="font-mono text-xs text-white">{row.val}</span>
                                    </div>
                                ))}
                        </div>
                    )}

                    {/* STEP 1: Crime type + severity */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                {crimeTypes.map(({ type, label, icon: Icon, color, desc }) => {
                                    const active = selectedType === type;
                                    return (
                                        <button key={type} type="button" onClick={() => setSelectedType(type)}
                                            className={cn(
                                                "relative flex flex-col items-start gap-2 rounded p-3 border text-left transition-all duration-200 overflow-hidden",
                                                active ? "" : "border-[rgba(255,255,255,0.06)] bg-transparent hover:border-[rgba(255,255,255,0.12)]"
                                            )}
                                            style={active ? { borderColor: color, backgroundColor: `${color}12`, boxShadow: `0 0 16px ${color}25` } : {}}>
                                            {active && <div className="absolute top-0 right-0 w-8 h-8 opacity-20" style={{ background: `radial-gradient(circle at top right, ${color}, transparent)` }} />}
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" style={{ color }} />
                                                <span className="font-mono text-xs font-bold text-white">{label}</span>
                                            </div>
                                            <span className="font-mono text-[9px] text-[#8899aa] leading-tight">{desc}</span>
                                            {active && <div className="absolute bottom-2 right-2"><Check className="h-3 w-3" style={{ color }} /></div>}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] text-[#00d4ff]/60 uppercase tracking-widest">MỨC ĐỘ NGUY HIỂM</span>
                                    <span className="font-mono text-xs font-bold" style={{ color: selectedSeverityConfig.color }}>{selectedSeverityConfig.label}</span>
                                </div>
                                <div className="relative">
                                    <div className="h-2 rounded-full relative overflow-hidden"
                                        style={{ background: 'linear-gradient(90deg, #00ff88 0%, #ffd700 50%, #ff3b3b 100%)' }}>
                                        <div className="absolute inset-0 rounded-full bg-[rgba(0,0,0,0.5)]"
                                            style={{ clipPath: `inset(0 ${(5 - severity) * 20}% 0 0)` }} />
                                    </div>
                                    <input type="range" min={1} max={5} step={1} value={severity}
                                        onChange={e => setSeverity(Number(e.target.value))}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-2" style={{ top: 0 }} />
                                    <div className="flex justify-between mt-1.5">
                                        {severityConfig.map(s => (
                                            <button key={s.level} type="button" onClick={() => setSeverity(s.level)}
                                                className={cn("w-2 h-2 rounded-full transition-all", severity === s.level ? "scale-150" : "scale-100")}
                                                style={{ backgroundColor: s.color, boxShadow: severity === s.level ? `0 0 8px ${s.color}` : undefined }} />
                                        ))}
                                    </div>
                                </div>
                                <p className="font-mono text-[10px] text-[#8899aa]">{selectedSeverityConfig.desc}</p>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Details */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="font-mono text-[9px] tracking-widest text-[#00d4ff]/60 uppercase">TIÊU ĐỀ</label>
                                <Input value={title} onChange={e => setTitle(e.target.value)}
                                    placeholder={selectedTypeConfig.label}
                                    className="font-mono text-sm bg-[rgba(0,212,255,0.04)] border-[rgba(0,212,255,0.2)] focus-visible:ring-0 focus-visible:border-[#00d4ff] text-white placeholder:text-[#8899aa]" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="font-mono text-[9px] tracking-widest text-[#00d4ff]/60 uppercase">MÔ TẢ CHI TIẾT</label>
                                    <button
                                        type="button"
                                        onClick={handleAiAssist}
                                        disabled={isAiLoading || !description.trim()}
                                        className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest px-2 py-1 rounded border border-[rgba(255,215,0,0.4)] bg-[rgba(255,215,0,0.08)] text-[#ffd700] hover:bg-[rgba(255,215,0,0.15)] transition-all disabled:opacity-30"
                                    >
                                        {isAiLoading
                                            ? <><Loader2 className="h-3 w-3 animate-spin" />AI đang phân tích...</>
                                            : <><Zap className="h-3 w-3" />AI tự điền</>
                                        }
                                    </button>
                                </div>
                                <Textarea value={description} onChange={e => setDescription(e.target.value)}
                                    rows={3} placeholder="Mô tả sự việc bằng lời tự do, AI sẽ tự điền các trường còn lại..."
                                    className="font-mono text-sm bg-[rgba(0,212,255,0.04)] border-[rgba(0,212,255,0.2)] focus-visible:ring-0 focus-visible:border-[#00d4ff] text-white placeholder:text-[#8899aa] resize-none" />
                                {aiError && (
                                    <div className="flex items-center gap-2 rounded border border-[rgba(255,59,59,0.3)] bg-[rgba(255,59,59,0.08)] px-3 py-2">
                                        <AlertCircle className="h-3.5 w-3.5 text-[#ff3b3b] shrink-0" />
                                        <span className="font-mono text-[10px] text-[#ff3b3b]">{aiError}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-mono text-[9px] tracking-widest text-[#00d4ff]/60 uppercase">THỜI GIAN XẢY RA</label>
                                <Input type="datetime-local" value={reportedAt} onChange={e => setReportedAt(e.target.value)}
                                    className="font-mono text-sm bg-[rgba(0,212,255,0.04)] border-[rgba(0,212,255,0.2)] focus-visible:ring-0 focus-visible:border-[#00d4ff] text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-mono text-[9px] tracking-widest text-[#00d4ff]/60 uppercase">LINK VIDEO (YouTube, Vimeo...)</label>
                                <Input
                                    value={videoUrl}
                                    onChange={e => setVideoUrl(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="font-mono text-sm bg-[rgba(0,212,255,0.04)] border-[rgba(0,212,255,0.2)] focus-visible:ring-0 focus-visible:border-[#00d4ff] text-white placeholder:text-[#8899aa]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="font-mono text-[9px] tracking-widest text-[#00d4ff]/60 uppercase">
                                    TẢI LÊN BẰNG CHỨNG ({uploadedFiles.length + existingAttachments.length}/5)
                                </label>
                                <div
                                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                                    onDragLeave={() => setIsDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "rounded border-2 border-dashed p-4 text-center cursor-pointer transition-all duration-200",
                                        isDragOver ? "border-[#00d4ff] bg-[rgba(0,212,255,0.08)]" : "border-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.35)] hover:bg-[rgba(0,212,255,0.04)]"
                                    )}>
                                    <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
                                        onChange={e => { handleFileUpload(e.target.files); e.target.value = ''; }} />
                                    {isUploading ? <Loader2 className="h-8 w-8 mx-auto text-[#00d4ff] animate-spin" /> : <Upload className="h-8 w-8 mx-auto text-[#00d4ff]/40" />}
                                    <p className="font-mono text-[10px] text-[#8899aa] mt-2">DRAG & DROP hoặc nhấn để chọn</p>
                                    <p className="font-mono text-[9px] text-[#8899aa]/50 mt-0.5">JPG · PNG · MP4 · WebM · Tối đa {MAX_FILE_SIZE_MB}MB</p>
                                </div>
                                {uploadError && (
                                    <div className="flex items-center gap-2 rounded border border-[rgba(255,59,59,0.3)] bg-[rgba(255,59,59,0.08)] px-3 py-2">
                                        <AlertCircle className="h-3.5 w-3.5 text-[#ff3b3b] shrink-0" />
                                        <span className="font-mono text-[10px] text-[#ff3b3b]">{uploadError}</span>
                                    </div>
                                )}
                                {(existingAttachments.length > 0 || uploadedFiles.length > 0) && (
                                    <div className="flex flex-wrap gap-2">
                                        {existingAttachments.map((url, idx) => (
                                            <div key={`ex-${idx}`} className="relative w-16 h-16 rounded overflow-hidden border border-[rgba(0,212,255,0.2)]">
                                                {/\.(mp4|webm|ogg|mov)$/i.test(url) ? <video src={url} className="w-full h-full object-cover" muted /> : <Image src={url} alt="" fill className="object-cover" sizes="64px" />}
                                                <button type="button" onClick={() => setExistingAttachments(p => p.filter((_, i) => i !== idx))}
                                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#ff3b3b] flex items-center justify-center">
                                                    <X className="h-2.5 w-2.5 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                        {uploadedFiles.map((file, idx) => (
                                            <div key={`new-${idx}`} className="relative w-16 h-16 rounded overflow-hidden border border-[rgba(0,255,136,0.3)]">
                                                {file.startsWith('data:video') ? <video src={file} className="w-full h-full object-cover" muted /> : <Image src={file} alt="" fill className="object-cover" sizes="64px" />}
                                                <button type="button" onClick={() => setUploadedFiles(p => p.filter((_, i) => i !== idx))}
                                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#ff3b3b] flex items-center justify-center">
                                                    <X className="h-2.5 w-2.5 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Confirm */}
                    {step === 3 && (
                        <div className="space-y-3">
                            {[
                                { label: 'VỊ TRÍ', value: locationData.address, color: '#00d4ff' },
                                { label: 'LOẠI TỘI PHẠM', value: selectedTypeConfig.label, color: selectedTypeConfig.color },
                                { label: 'MỨC ĐỘ', value: selectedSeverityConfig.label, color: selectedSeverityConfig.color },
                                { label: 'TIÊU ĐỀ', value: title || selectedTypeConfig.label, color: '#fff' },
                                { label: 'MÔ TẢ', value: description || '(Không có)', color: '#8899aa' },
                                { label: 'THỜI GIAN', value: reportedAt ? new Date(reportedAt).toLocaleString('vi-VN') : 'Ngay bây giờ', color: '#fff' },
                            ].map(row => (
                                <div key={row.label} className="flex gap-3 px-3 py-2.5 rounded border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                                    <span className="font-mono text-[9px] text-[#8899aa] uppercase tracking-widest w-28 shrink-0 mt-0.5">{row.label}</span>
                                    <span className="font-mono text-xs leading-relaxed" style={{ color: row.color }}>{row.value}</span>
                                </div>
                            ))}
                            {(uploadedFiles.length + existingAttachments.length) > 0 && (
                                <div className="flex gap-3 px-3 py-2.5 rounded border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                                    <span className="font-mono text-[9px] text-[#8899aa] uppercase tracking-widest w-28 shrink-0 mt-0.5">BẰNG CHỨNG</span>
                                    <span className="font-mono text-xs text-white">{uploadedFiles.length + existingAttachments.length} file đính kèm</span>
                                </div>
                            )}
                            {videoUrl.trim() && (
                                <div className="flex gap-3 px-3 py-2.5 rounded border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                                    <span className="font-mono text-[9px] text-[#8899aa] uppercase tracking-widest w-28 shrink-0 mt-0.5">LINK VIDEO</span>
                                    <span className="font-mono text-xs text-[#00d4ff] truncate">{videoUrl.trim()}</span>
                                </div>
                            )}
                            <div className="rounded border border-[rgba(255,215,0,0.2)] bg-[rgba(255,215,0,0.05)] p-3">
                                <p className="font-mono text-[10px] text-[#ffd700] text-center">
                                    Thông tin sẽ được gửi đến hệ thống giám sát. Vui lòng xác nhận nếu thông tin chính xác.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="relative z-10 flex gap-3 px-5 py-4 border-t border-[rgba(0,212,255,0.1)]">
                    {step > 0 ? (
                        <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}
                            className="flex-1 font-mono text-xs border-[rgba(0,212,255,0.2)] text-[#8899aa] hover:text-white hover:border-[rgba(0,212,255,0.5)] bg-transparent h-10">
                            <ChevronLeft className="h-4 w-4 mr-1" /> QUAY LẠI
                        </Button>
                    ) : (
                        <Button type="button" variant="outline" onClick={onClose}
                            className="flex-1 font-mono text-xs border-[rgba(255,255,255,0.1)] text-[#8899aa] hover:text-white bg-transparent h-10">
                            HỦY
                        </Button>
                    )}
                    {step < STEPS.length - 1 ? (
                        <Button type="button" onClick={() => setStep(s => s + 1)} disabled={!canProceed}
                            className="flex-1 font-mono text-xs h-10 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.4)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.2)] hover:text-white disabled:opacity-30">
                            TIẾP THEO <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}
                            className="flex-1 font-mono text-xs font-bold h-10 bg-[rgba(255,59,59,0.15)] border border-[rgba(255,59,59,0.5)] text-[#ff3b3b] hover:bg-[rgba(255,59,59,0.25)] hover:text-white disabled:opacity-40">
                            {isSubmitting
                                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{isEditMode ? 'ĐANG CẬP NHẬT...' : 'ĐANG GỬI...'}</>
                                : <><Check className="h-4 w-4 mr-1" />{isEditMode ? 'CẬP NHẬT' : 'GỬI BÁO CÁO'}</>
                            }
                        </Button>
                    )}
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#ff3b3b] to-transparent opacity-30" />
            </DialogContent>
        </Dialog>
    );
};

export default ReportForm;
