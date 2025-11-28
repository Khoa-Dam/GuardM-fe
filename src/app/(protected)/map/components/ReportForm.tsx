'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { CrimeType } from '@/service/report.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { VerificationCrimeReport } from '@/types/map';

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 100MB in bytes

export interface ReportLocationData {
    lat: number;
    lng: number;
    address: string;
    addressDetails?: Record<string, any>;
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
    /** Báo cáo hiện có (khi edit) */
    report?: VerificationCrimeReport;
}

const crimeTypeLabels: Record<CrimeType, string> = {
    [CrimeType.GietNguoi]: 'Giết người',
    [CrimeType.BatCoc]: 'Bắt cóc',
    [CrimeType.TruyNa]: 'Truy nã',
    [CrimeType.CuopGiat]: 'Cướp giật',
    [CrimeType.DeDoa]: 'Đe dọa',
    [CrimeType.NghiPham]: 'Nghi phạm',
    [CrimeType.DangNgo]: 'Đáng ngờ',
    [CrimeType.TromCap]: 'Trộm cắp',
};

/** Helper để format datetime cho input */
const formatDateTimeLocal = (date?: string | Date): string => {
    if (!date) return new Date().toISOString().slice(0, 16);
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 16);
};

const ReportForm: React.FC<ReportFormProps> = ({ locationData, onClose, onSubmit, isSubmitting = false, report }) => {
    const isEditMode = !!report;

    // Khởi tạo form với dữ liệu từ report (nếu có) hoặc giá trị mặc định
    const [formData, setFormData] = useState(() => ({
        title: report?.title || '',
        type: (report?.type as CrimeType) || CrimeType.CuopGiat,
        description: report?.description || '',
        attachmentsInput: '',
        areaCode: report?.areaCode || '',
        province: report?.province || locationData.addressDetails?.city || locationData.addressDetails?.province || '',
        district: report?.district || locationData.addressDetails?.city_district || locationData.addressDetails?.district || '',
        ward: report?.ward || locationData.addressDetails?.suburb || locationData.addressDetails?.neighbourhood || '',
        street: report?.street || locationData.addressDetails?.road || '',
        source: report?.source || 'Người dùng báo cáo',
        severity: report?.severity ?? 3,
        reportedAt: formatDateTimeLocal(report?.reportedAt),
    }));

    // Attachments hiện có từ report (URLs)
    const [existingAttachments, setExistingAttachments] = useState<string[]>(
        report?.attachments || []
    );
    // Files mới upload (base64)
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const attachmentHints = useMemo(
        () => (formData.attachmentsInput ? formData.attachmentsInput.split(/\n|,/).map((v) => v.trim()).filter(Boolean) : []),
        [formData.attachmentsInput]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Gộp: existing attachments (URLs) + newly uploaded (base64) + URL inputs
        const attachments = [...existingAttachments, ...uploadedFiles, ...attachmentHints];
        const payload: ReportFormPayload = {
            ...formData,
            attachments,
            lat: locationData.lat,
            lng: locationData.lng,
            address: String(locationData.address),
            province: formData.province,
            district: formData.district,
            ward: formData.ward,
            street: formData.street,
            areaCode: formData.areaCode,
            source: formData.source,
            severity: Number(formData.severity),
            reportedAt: formData.reportedAt ? new Date(formData.reportedAt).toISOString() : undefined,
        };
        onSubmit(payload);
    };

    const handleRemoveExisting = (index: number) => {
        setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes >= 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        }
        return `${(bytes / 1024).toFixed(1)}KB`;
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || !files.length) return;
        setUploadError(null);

        // Validate file sizes
        const oversizedFiles: string[] = [];
        const validFiles: File[] = [];

        Array.from(files).forEach((file) => {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                oversizedFiles.push(`${file.name} (${formatFileSize(file.size)})`);
            } else {
                validFiles.push(file);
            }
        });

        // Show error for oversized files
        if (oversizedFiles.length > 0) {
            setUploadError(
                `File vượt quá giới hạn ${MAX_FILE_SIZE_MB}MB: ${oversizedFiles.join(', ')}`
            );
        }

        // Process valid files
        if (validFiles.length === 0) return;

        setIsUploading(true);
        const converters = validFiles.map(
            (file) =>
                new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (typeof reader.result === 'string') {
                            resolve(reader.result);
                        } else {
                            reject(new Error('Không thể đọc file'));
                        }
                    };
                    reader.onerror = () => reject(new Error('Không thể đọc file'));
                    reader.readAsDataURL(file);
                })
        );
        try {
            const base64Files = await Promise.all(converters);
            setUploadedFiles((prev) => [...prev, ...base64Files].slice(0, 5));
        } catch (error) {
            console.error(error);
            setUploadError('Có lỗi xảy ra khi tải file. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveUploaded = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()} >
            {/* 1. Xóa overflow-y-auto ở đây, thêm flex column và xóa padding mặc định (p-0) */}
            <DialogContent className="max-h-[90vh] flex flex-col p-0 gap-0 w-full max-w-lg overflow-hidden">

                {/* 2. Header giữ cố định, thêm padding thủ công */}
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle>{isEditMode ? 'Chỉnh sửa báo cáo' : 'Tạo báo cáo mới'}</DialogTitle>
                </DialogHeader>

                {/* 3. Tạo vùng cuộn riêng cho Form, thêm padding ở đây */}
                <div className="overflow-y-auto p-6 pt-2 flex-1 overflow-x-hidden">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Card className="bg-blue-50 border-blue-200 gap-1 p-0 shadow-sm">
                            <CardContent className='p-3'>
                                <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                                    <MapPin className="h-4 w-4" />
                                    Vị trí đã chọn
                                </div>
                                <p className="text-blue-700 text-sm mt-1 ">{String(locationData.address)}</p>
                            </CardContent>
                        </Card>

                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Tiêu đề báo cáo <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                required
                                placeholder="Ví dụ: Cướp giật điện thoại..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Loại hành vi <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as CrimeType })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(crimeTypeLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả chi tiết</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                placeholder="Mô tả sự việc..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Độ nghiêm trọng: {formData.severity}</Label>
                            {/* Thêm pb-2 để tránh bóng của slider bị cắt */}
                            <div className="pb-2 px-1">
                                <Slider
                                    value={[formData.severity]}
                                    onValueChange={([value]) => setFormData({ ...formData, severity: value })}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="py-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="source">Nguồn báo cáo</Label>
                                <Input
                                    id="source"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reportedAt">Thời gian xảy ra</Label>
                                <Input
                                    id="reportedAt"
                                    type="datetime-local"
                                    value={formData.reportedAt}
                                    onChange={(e) => setFormData({ ...formData, reportedAt: e.target.value })}
                                />
                            </div>
                        </div>

                        <Card className='gap-1'>
                            <CardHeader className="py-1">
                                <CardTitle className="text-sm">Thông tin địa chỉ</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3 pt-0">
                                <div className="space-y-1">
                                    <Label className="text-xs">Mã khu vực</Label>
                                    <Input
                                        value={formData.areaCode}
                                        onChange={(e) => setFormData({ ...formData, areaCode: e.target.value })}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Tỉnh/Thành</Label>
                                    <Input
                                        value={formData.province}
                                        readOnly
                                        className="h-9 bg-muted cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Quận/Huyện</Label>
                                    <Input
                                        value={formData.district}
                                        readOnly
                                        className="h-9 bg-muted cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Phường/Xã</Label>
                                    <Input
                                        value={formData.ward}
                                        readOnly
                                        className="h-9 bg-muted cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label className="text-xs">Đường/Ngõ</Label>
                                    <Input
                                        value={formData.street}
                                        readOnly
                                        className="h-9 bg-muted cursor-not-allowed"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-2">
                            <Label>Đính kèm (URL)</Label>
                            <Textarea
                                rows={2}
                                className="font-mono text-xs"
                                placeholder="https://example.com/image.jpg"
                                value={formData.attachmentsInput}
                                onChange={(e) => setFormData({ ...formData, attachmentsInput: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Hoặc tải tệp (tối đa 5 file, mỗi file ≤ {MAX_FILE_SIZE_MB}MB)</Label>
                            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-accent transition-colors">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="hidden"
                                    id="file-upload"
                                    onChange={(e) => {
                                        handleFileUpload(e.target.files);
                                        e.target.value = ''; // Reset để có thể chọn lại cùng file
                                    }}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer block">
                                    {isUploading ? (
                                        <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
                                    ) : (
                                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                    )}
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Nhấn để chọn ảnh hoặc video
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                        Hỗ trợ: JPG, PNG, GIF, MP4, WebM • Tối đa {MAX_FILE_SIZE_MB}MB/file
                                    </p>
                                </label>
                            </div>

                            {uploadError && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        {uploadError}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Hiển thị attachments hiện có (từ report khi edit) */}
                        {existingAttachments.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Tệp đính kèm hiện có</Label>
                                <div className="flex flex-wrap gap-2">
                                    {existingAttachments.map((url, idx) => {
                                        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
                                        return (
                                            <div
                                                key={`existing-${idx}`}
                                                className="relative w-20 h-20 rounded-lg overflow-hidden border"
                                            >
                                                {isVideo ? (
                                                    <video src={url} className="w-full h-full object-cover" muted />
                                                ) : (
                                                    <Image src={url} alt="attachment" fill className="object-cover" sizes="80px" />
                                                )}
                                                <Badge
                                                    variant="secondary"
                                                    className="absolute bottom-1 left-1 text-[10px] px-1 py-0 bg-black/60 text-white"
                                                >
                                                    Hiện có
                                                </Badge>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-5 w-5 rounded-full"
                                                    onClick={() => handleRemoveExisting(idx)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Hiển thị files mới upload (base64) */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                {existingAttachments.length > 0 && (
                                    <Label className="text-xs text-muted-foreground">Tệp mới tải lên</Label>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {uploadedFiles.map((file, idx) => (
                                        <div
                                            key={`new-${idx}-${file.slice(0, 10)}`}
                                            className="relative w-20 h-20 rounded-lg overflow-hidden border"
                                        >
                                            {file.startsWith('data:image') ? (
                                                <Image src={file} alt="preview" fill className="object-cover" sizes="80px" />
                                            ) : (
                                                <video src={file} className="w-full h-full object-cover" muted />
                                            )}
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-5 w-5 rounded-full"
                                                onClick={() => handleRemoveUploaded(idx)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {isEditMode ? 'Đang cập nhật...' : 'Đang gửi...'}
                                </>
                            ) : (
                                isEditMode ? 'Cập nhật báo cáo' : 'Gửi báo cáo'
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog >
    );
};

export default ReportForm;
