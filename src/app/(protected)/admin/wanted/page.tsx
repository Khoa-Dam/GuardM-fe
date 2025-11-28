'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    useCreateWantedCriminal,
    useUpdateWantedCriminal,
    useDeleteWantedCriminal,
} from '@/hooks/use-wanted-criminals-admin';
import { useWantedCriminals } from '@/hooks/use-wanted-criminals';
import type { WantedCriminalResponse, CreateWantedCriminalDto, UpdateWantedCriminalDto } from '@/service/wanted-criminal.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AdminWantedPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(e.target.value);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const { data: paginatedData, isLoading, error } = useWantedCriminals({
        page,
        limit: 10,
        search: debouncedSearch,
    });

    const criminals = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;

    const createMutation = useCreateWantedCriminal();
    const updateMutation = useUpdateWantedCriminal();
    const deleteMutation = useDeleteWantedCriminal();

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCriminal, setSelectedCriminal] = useState<WantedCriminalResponse | null>(null);

    // Form states
    const [formData, setFormData] = useState<CreateWantedCriminalDto>({
        name: '',
        birthYear: new Date().getFullYear() - 30,
        address: '',
        parents: '',
        crime: '',
        decisionNumber: '',
        issuingUnit: '',
    });

    const resetForm = () => {
        setFormData({
            name: '',
            birthYear: new Date().getFullYear() - 30,
            address: '',
            parents: '',
            crime: '',
            decisionNumber: '',
            issuingUnit: '',
        });
    };

    const handleCreate = async () => {
        try {
            await createMutation.mutateAsync(formData);
            toast.success('Tạo đối tượng truy nã thành công');
            setCreateDialogOpen(false);
            resetForm();
        } catch (err: any) {
            toast.error(err?.message || 'Không thể tạo đối tượng truy nã');
        }
    };

    const handleEdit = async () => {
        if (!selectedCriminal) return;

        const updateData: UpdateWantedCriminalDto = {
            name: formData.name,
            birthYear: formData.birthYear,
            address: formData.address,
            parents: formData.parents,
            crime: formData.crime,
            decisionNumber: formData.decisionNumber,
            issuingUnit: formData.issuingUnit,
        };

        try {
            await updateMutation.mutateAsync({ id: selectedCriminal.id, payload: updateData });
            toast.success('Cập nhật đối tượng truy nã thành công');
            setEditDialogOpen(false);
            setSelectedCriminal(null);
            resetForm();
        } catch (err: any) {
            toast.error(err?.message || 'Không thể cập nhật đối tượng truy nã');
        }
    };

    const handleDelete = async () => {
        if (!selectedCriminal) return;

        try {
            await deleteMutation.mutateAsync(selectedCriminal.id);
            toast.success('Xóa đối tượng truy nã thành công');
            setDeleteDialogOpen(false);
            setSelectedCriminal(null);
        } catch (err: any) {
            toast.error(err?.message || 'Không thể xóa đối tượng truy nã');
        }
    };

    const openEditDialog = (criminal: WantedCriminalResponse) => {
        setSelectedCriminal(criminal);
        setFormData({
            name: criminal.name,
            birthYear: criminal.birthYear,
            address: criminal.address || '',
            parents: criminal.parents || '',
            crime: criminal.crime,
            decisionNumber: criminal.decisionNumber || '',
            issuingUnit: criminal.issuingUnit || '',
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (criminal: WantedCriminalResponse) => {
        setSelectedCriminal(criminal);
        setDeleteDialogOpen(true);
    };

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-destructive">Có lỗi xảy ra: {error.message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý đối tượng truy nã</h1>
                    <p className="text-muted-foreground">
                        Thêm, sửa, xóa thông tin đối tượng truy nã
                    </p>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm đối tượng
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Danh sách đối tượng truy nã</CardTitle>
                            <CardDescription>Tổng số: {paginatedData?.total || 0} đối tượng</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo tên, tội danh..."
                                className="pl-8"
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Họ tên</TableHead>
                                        <TableHead>Năm sinh</TableHead>
                                        <TableHead>Tội danh</TableHead>
                                        <TableHead>Nơi ĐKTT</TableHead>
                                        <TableHead>Số QĐ</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {criminals.length > 0 ? (
                                        criminals.map((criminal) => (
                                            <TableRow key={criminal.id}>
                                                <TableCell className="font-medium">
                                                    {criminal.name}
                                                </TableCell>
                                                <TableCell>{criminal.birthYear}</TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {criminal.crime}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {criminal.address || 'N/A'}
                                                </TableCell>
                                                <TableCell>{criminal.decisionNumber || 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openEditDialog(criminal)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => openDeleteDialog(criminal)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Không tìm thấy dữ liệu
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </>
                    )}
                </CardContent>
                {totalPages > 1 && (
                    <CardFooter className="flex items-center justify-center space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">
                            Trang {page} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isLoading}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Thêm đối tượng truy nã</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin đối tượng truy nã mới
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-name">
                                    Họ tên <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="create-name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-birthYear">
                                    Năm sinh <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="create-birthYear"
                                    type="number"
                                    value={formData.birthYear}
                                    onChange={(e) =>
                                        setFormData({ ...formData, birthYear: Number(e.target.value) })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-crime">
                                Tội danh <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="create-crime"
                                value={formData.crime}
                                onChange={(e) =>
                                    setFormData({ ...formData, crime: e.target.value })
                                }
                                placeholder="Trộm cắp tài sản"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-address">Nơi ĐKTT</Label>
                            <Input
                                id="create-address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder="Hà Nội"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-parents">Họ tên bố/mẹ</Label>
                            <Input
                                id="create-parents"
                                value={formData.parents}
                                onChange={(e) =>
                                    setFormData({ ...formData, parents: e.target.value })
                                }
                                placeholder="Nguyễn Văn B"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-decisionNumber">Số ngày QĐ</Label>
                                <Input
                                    id="create-decisionNumber"
                                    value={formData.decisionNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, decisionNumber: e.target.value })
                                    }
                                    placeholder="123/2025/QĐ-BCA"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-issuingUnit">Đơn vị ra QĐTN</Label>
                                <Input
                                    id="create-issuingUnit"
                                    value={formData.issuingUnit}
                                    onChange={(e) =>
                                        setFormData({ ...formData, issuingUnit: e.target.value })
                                    }
                                    placeholder="Bộ Công An"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            {createMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Tạo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa đối tượng truy nã</DialogTitle>
                        <DialogDescription>Cập nhật thông tin đối tượng truy nã</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Họ tên</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-birthYear">Năm sinh</Label>
                                <Input
                                    id="edit-birthYear"
                                    type="number"
                                    value={formData.birthYear}
                                    onChange={(e) =>
                                        setFormData({ ...formData, birthYear: Number(e.target.value) })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-crime">Tội danh</Label>
                            <Textarea
                                id="edit-crime"
                                value={formData.crime}
                                onChange={(e) =>
                                    setFormData({ ...formData, crime: e.target.value })
                                }
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Nơi ĐKTT</Label>
                            <Input
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-parents">Họ tên bố/mẹ</Label>
                            <Input
                                id="edit-parents"
                                value={formData.parents}
                                onChange={(e) =>
                                    setFormData({ ...formData, parents: e.target.value })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-decisionNumber">Số ngày QĐ</Label>
                                <Input
                                    id="edit-decisionNumber"
                                    value={formData.decisionNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, decisionNumber: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-issuingUnit">Đơn vị ra QĐTN</Label>
                                <Input
                                    id="edit-issuingUnit"
                                    value={formData.issuingUnit}
                                    onChange={(e) =>
                                        setFormData({ ...formData, issuingUnit: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleEdit} disabled={updateMutation.isPending}>
                            {updateMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Cập nhật
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa đối tượng truy nã{' '}
                            <strong>{selectedCriminal?.name}</strong>? Hành động này không thể hoàn
                            tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
