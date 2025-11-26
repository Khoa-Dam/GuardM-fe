export const formatDate = (value?: string | Date) => {
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('vi-VN');
};

