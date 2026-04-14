export const CRIME_TYPE_LABEL: Record<string, string> = {
    giet_nguoi: 'Giết người',
    bat_coc:    'Bắt cóc',
    truy_na:    'Truy nã',
    cuop_giat:  'Cướp giật',
    de_doa:     'Đe dọa',
    nghi_pham:  'Nghi phạm',
    dang_ngo:   'Đáng ngờ',
    trom_cap:   'Trộm cắp',
};

/** Token color for filter chips and map markers */
export const CRIME_TYPE_COLOR: Record<string, string> = {
    giet_nguoi: '#ff3b3b',
    bat_coc:    '#ff6b35',
    truy_na:    '#ff3b3b',
    cuop_giat:  '#ffd700',
    de_doa:     '#ffd700',
    nghi_pham:  '#00d4ff',
    dang_ngo:   '#00d4ff',
    trom_cap:   '#00ff88',
};

export const CRIME_TYPE_OPTIONS = Object.entries(CRIME_TYPE_LABEL).map(([value, label]) => ({
    value,
    label,
    color: CRIME_TYPE_COLOR[value],
}));

export const SEVERITY_COLOR = {
    low:    { hex: '#56a381', glow: 'rgba(86,163,129,0.3)',  shadow: '0 0 0 2px rgba(86,163,129,0.3)' },
    medium: { hex: '#fcf160', glow: 'rgba(252,241,96,0.3)',  shadow: '0 0 0 2px rgba(252,241,96,0.3)' },
    high:   { hex: '#dd3121', glow: 'rgba(221,49,33,0.3)',   shadow: '0 0 0 2px rgba(221,49,33,0.3)' },
} as const;
