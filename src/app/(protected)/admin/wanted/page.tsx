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
            toast.success('Wanted criminal created successfully');
            setCreateDialogOpen(false);
            resetForm();
        } catch (err: unknown) {
            toast.error((err as Error)?.message || 'Unable to create wanted criminal');
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
            toast.success('Wanted criminal updated successfully');
            setEditDialogOpen(false);
            setSelectedCriminal(null);
            resetForm();
        } catch (err: unknown) {
            toast.error((err as Error)?.message || 'Unable to update wanted criminal');
        }
    };

    const handleDelete = async () => {
        if (!selectedCriminal) return;

        try {
            await deleteMutation.mutateAsync(selectedCriminal.id);
            toast.success('Wanted criminal deleted successfully');
            setDeleteDialogOpen(false);
            setSelectedCriminal(null);
        } catch (err: unknown) {
            toast.error((err as Error)?.message || 'Unable to delete wanted criminal');
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
                        <p className="text-destructive">An error occurred: {error.message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Wanted Criminals Management</h1>
                    <p className="text-muted-foreground">
                        Add, edit, delete wanted criminal information
                    </p>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Wanted Criminals List</CardTitle>
                            <CardDescription>Total: {paginatedData?.total || 0} subjects</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, crime..."
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
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Birth Year</TableHead>
                                        <TableHead>Crime</TableHead>
                                        <TableHead>Registered Address</TableHead>
                                        <TableHead>Decision No.</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
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
                                                No data found
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
                            Page {page} / {totalPages}
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
                        <DialogTitle>Add Wanted Criminal</DialogTitle>
                        <DialogDescription>
                            Enter new wanted criminal information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-name">
                                    Full Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="create-name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-birthYear">
                                    Birth Year <span className="text-destructive">*</span>
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
                                Crime <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="create-crime"
                                value={formData.crime}
                                onChange={(e) =>
                                    setFormData({ ...formData, crime: e.target.value })
                                }
                                placeholder="Property theft"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-address">Registered Address</Label>
                            <Input
                                id="create-address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder="Hanoi"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-parents">Parent Names</Label>
                            <Input
                                id="create-parents"
                                value={formData.parents}
                                onChange={(e) =>
                                    setFormData({ ...formData, parents: e.target.value })
                                }
                                placeholder="Jane Doe"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-decisionNumber">Decision Number</Label>
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
                                <Label htmlFor="create-issuingUnit">Issuing Unit</Label>
                                <Input
                                    id="create-issuingUnit"
                                    value={formData.issuingUnit}
                                    onChange={(e) =>
                                        setFormData({ ...formData, issuingUnit: e.target.value })
                                    }
                                    placeholder="Ministry of Public Security"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            {createMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Wanted Criminal</DialogTitle>
                        <DialogDescription>Update wanted criminal information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-birthYear">Birth Year</Label>
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
                            <Label htmlFor="edit-crime">Crime</Label>
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
                            <Label htmlFor="edit-address">Registered Address</Label>
                            <Input
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-parents">Parent Names</Label>
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
                                <Label htmlFor="edit-decisionNumber">Decision Number</Label>
                                <Input
                                    id="edit-decisionNumber"
                                    value={formData.decisionNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, decisionNumber: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-issuingUnit">Issuing Unit</Label>
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
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={updateMutation.isPending}>
                            {updateMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete wanted criminal{' '}
                            <strong>{selectedCriminal?.name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
