'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    useWeatherNews,
    useCreateWeatherNews,
    useUpdateWeatherNews,
    useDeleteWeatherNews,
} from '@/hooks/use-weather-news';
import {
    WeatherNewsResponse,
    CreateWeatherNewsDto,
    UpdateWeatherNewsDto,
    WeatherNewsType,
} from '@/service/weather-news.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const weatherTypeLabels: Record<WeatherNewsType, string> = {
    [WeatherNewsType.DISASTER_WARNING]: 'Disaster Warning',
    [WeatherNewsType.WEATHER_FORECAST]: 'Weather Forecast',
};

const weatherTypeColors: Record<WeatherNewsType, string> = {
    [WeatherNewsType.DISASTER_WARNING]: 'bg-red-500',
    [WeatherNewsType.WEATHER_FORECAST]: 'bg-blue-500',
};

export default function AdminWeatherPage() {
    const router = useRouter();
    const { data: newsList = [], isLoading, error } = useWeatherNews();
    const createMutation = useCreateWeatherNews();
    const updateMutation = useUpdateWeatherNews();
    const deleteMutation = useDeleteWeatherNews();

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<WeatherNewsResponse | null>(null);

    // Form states
    const [formData, setFormData] = useState<CreateWeatherNewsDto>({
        title: '',
        type: WeatherNewsType.WEATHER_FORECAST,
        summary: '',
        content: '',
        imageUrl: '',
        sourceUrl: '',
        location: '',
        severity: '',
    });

    const resetForm = () => {
        setFormData({
            title: '',
            type: WeatherNewsType.WEATHER_FORECAST,
            summary: '',
            content: '',
            imageUrl: '',
            sourceUrl: '',
            location: '',
            severity: '',
        });
    };

    const handleCreate = async () => {
        try {
            await createMutation.mutateAsync(formData);
            toast.success('Weather news created successfully');
            setCreateDialogOpen(false);
            resetForm();
        } catch (err: unknown) {
            toast.error((err as Error)?.message || 'Unable to create news');
        }
    };

    const handleEdit = async () => {
        if (!selectedNews) return;

        const updateData: UpdateWeatherNewsDto = {
            title: formData.title,
            type: formData.type,
            summary: formData.summary,
            content: formData.content,
            imageUrl: formData.imageUrl,
            sourceUrl: formData.sourceUrl,
            location: formData.location,
            severity: formData.severity,
        };

        try {
            await updateMutation.mutateAsync({ id: selectedNews.id, payload: updateData });
            toast.success('News updated successfully');
            setEditDialogOpen(false);
            setSelectedNews(null);
            resetForm();
        } catch (err: unknown) {
            toast.error((err as Error)?.message || 'Unable to update news');
        }
    };

    const handleDelete = async () => {
        if (!selectedNews) return;

        try {
            await deleteMutation.mutateAsync(selectedNews.id);
            toast.success('News deleted successfully');
            setDeleteDialogOpen(false);
            setSelectedNews(null);
        } catch (err: unknown) {
            toast.error((err as Error)?.message || 'Unable to delete news');
        }
    };

    const openEditDialog = (news: WeatherNewsResponse) => {
        setSelectedNews(news);
        setFormData({
            title: news.title,
            type: news.type,
            summary: news.summary || '',
            content: news.content || '',
            imageUrl: news.imageUrl || '',
            sourceUrl: news.sourceUrl || '',
            location: news.location || '',
            severity: news.severity || '',
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (news: WeatherNewsResponse) => {
        setSelectedNews(news);
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Weather News Management</h1>
                        <p className="text-muted-foreground">
                            Manage weather news and disaster warnings
                        </p>
                    </div>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Article
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>News List</CardTitle>
                    <CardDescription>Total: {newsList.length} articles</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Published Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {newsList.length > 0 ? (
                                    newsList.map((news) => (
                                        <TableRow key={news.id}>
                                            <TableCell className="font-medium max-w-xs truncate" title={news.title}>
                                                {news.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={weatherTypeColors[news.type]}>
                                                    {weatherTypeLabels[news.type]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate">
                                                {news.location || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {news.publishedDate
                                                    ? format(new Date(news.publishedDate), 'dd/MM/yyyy HH:mm', { locale: vi })
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {news.sourceUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.open(news.sourceUrl, '_blank')}
                                                            title="View Source"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(news)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog(news)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No data found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Weather Article</DialogTitle>
                        <DialogDescription>
                            Enter weather news or disaster warning information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-title">Title <span className="text-destructive">*</span></Label>
                            <Input
                                id="create-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter news title"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as WeatherNewsType })}
                                >
                                    <SelectTrigger id="create-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={WeatherNewsType.WEATHER_FORECAST}>Weather Forecast</SelectItem>
                                        <SelectItem value={WeatherNewsType.DISASTER_WARNING}>Disaster Warning</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-location">Location</Label>
                                <Input
                                    id="create-location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Affected area"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-summary">Summary</Label>
                            <Textarea
                                id="create-summary"
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                placeholder="Summarize the news content"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-content">Detailed Content</Label>
                            <Textarea
                                id="create-content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Detailed content..."
                                rows={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-imageUrl">Image URL</Label>
                            <Input
                                id="create-imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-sourceUrl">Source URL</Label>
                            <Input
                                id="create-sourceUrl"
                                value={formData.sourceUrl}
                                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                                placeholder="https://nchmf.gov.vn/..."
                            />
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
                        <DialogTitle>Edit News</DialogTitle>
                        <DialogDescription>Update news information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title <span className="text-destructive">*</span></Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as WeatherNewsType })}
                                >
                                    <SelectTrigger id="edit-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={WeatherNewsType.WEATHER_FORECAST}>Weather Forecast</SelectItem>
                                        <SelectItem value={WeatherNewsType.DISASTER_WARNING}>Disaster Warning</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-location">Location</Label>
                                <Input
                                    id="edit-location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-summary">Summary</Label>
                            <Textarea
                                id="edit-summary"
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-content">Detailed Content</Label>
                            <Textarea
                                id="edit-content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-imageUrl">Image URL</Label>
                            <Input
                                id="edit-imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-sourceUrl">Source URL</Label>
                            <Input
                                id="edit-sourceUrl"
                                value={formData.sourceUrl}
                                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                            />
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
                            Are you sure you want to delete news article <strong>{selectedNews?.title}</strong>?
                            This action cannot be undone.
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
