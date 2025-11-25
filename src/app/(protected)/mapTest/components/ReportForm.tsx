'use client';

import React, { useMemo, useState } from 'react';
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
import { MapPin, X, Upload, Loader2 } from 'lucide-react';

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

const ReportForm: React.FC<ReportFormProps> = ({ locationData, onClose, onSubmit, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: CrimeType.CuopGiat,
        description: '',
        attachmentsInput: '',
        areaCode: '',
        province: locationData.addressDetails?.city || locationData.addressDetails?.province || '',
        district: locationData.addressDetails?.city_district || locationData.addressDetails?.district || '',
        ward: locationData.addressDetails?.suburb || locationData.addressDetails?.neighbourhood || '',
        street: locationData.addressDetails?.road || '',
        source: 'Người dùng báo cáo',
        severity: 3,
        reportedAt: new Date().toISOString().slice(0, 16),
    });
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const attachmentHints = useMemo(
        () => (formData.attachmentsInput ? formData.attachmentsInput.split(/\n|,/).map((v) => v.trim()).filter(Boolean) : []),
        [formData.attachmentsInput]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const attachments = [...uploadedFiles, ...attachmentHints];
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

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || !files.length) return;
        setIsUploading(true);
        const converters = Array.from(files).map(
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
                    <DialogTitle>Chi tiết báo cáo</DialogTitle>
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
                                <p className="text-blue-700 text-sm mt-1 truncate">{String(locationData.address)}</p>
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

                        <Card>
                            <CardHeader className="py-3">
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
                                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Quận/Huyện</Label>
                                    <Input
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Phường/Xã</Label>
                                    <Input
                                        value={formData.ward}
                                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label className="text-xs">Đường/Ngõ</Label>
                                    <Input
                                        value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        className="h-9"
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
                            <Label>Hoặc tải tệp (tối đa 5 file)</Label>
                            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-accent transition-colors">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="hidden"
                                    id="file-upload"
                                    onChange={(e) => handleFileUpload(e.target.files)}
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
                                </label>
                            </div>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {uploadedFiles.map((file, idx) => (
                                    <div
                                        key={`${idx}-${file.slice(0, 10)}`}
                                        className="relative w-20 h-20 rounded-lg overflow-hidden border"
                                    >
                                        {file.startsWith('data:image') ? (
                                            <img src={file} alt="preview" className="w-full h-full object-cover" />
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
                        )}

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Đang gửi...
                                </>
                            ) : (
                                'Gửi báo cáo'
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog >
    );
};

export default ReportForm;
