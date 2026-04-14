'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { searchAddress, GeocodingResult } from '@/utils/geocoding';
import { Search, Loader2, MapPin, X } from 'lucide-react';

interface SearchBoxProps {
    onSelectLocation: (lat: number, lng: number, name: string) => void;
    disabled?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSelectLocation, disabled }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GeocodingResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const activeQueryRef = useRef('');
    const inputRef = useRef<HTMLInputElement>(null);

    const runSearch = useCallback(async (value: string) => {
        if (!value.trim() || disabled) { setResults([]); setIsSearching(false); return; }
        setIsSearching(true);
        setError(null);
        activeQueryRef.current = value;
        try {
            const data = await searchAddress(value);
            if (activeQueryRef.current === value) setResults(data);
        } catch {
            if (activeQueryRef.current === value) setError('Không thể tìm kiếm.');
        } finally {
            if (activeQueryRef.current === value) setIsSearching(false);
        }
    }, [disabled]);

    useEffect(() => {
        if (!query.trim() || disabled) { setResults([]); setIsSearching(false); return; }
        const t = setTimeout(() => runSearch(query.trim()), 500);
        return () => clearTimeout(t);
    }, [query, runSearch, disabled]);

    const clear = () => { setQuery(''); setResults([]); setError(null); activeQueryRef.current = ''; };

    return (
        <div className="absolute top-4 left-4 z-[1100] w-full max-w-xs pointer-events-auto">
            {/* Input */}
            <div
                className="flex items-center gap-2 rounded border px-3 py-2 transition-all duration-200"
                style={{
                    background: 'rgba(6,10,20,0.95)',
                    backdropFilter: 'blur(16px)',
                    borderColor: isFocused ? 'rgba(0,212,255,0.5)' : 'rgba(0,212,255,0.2)',
                    boxShadow: isFocused ? '0 0 16px rgba(0,212,255,0.15)' : 'none',
                }}>
                {isSearching
                    ? <Loader2 className="h-3.5 w-3.5 shrink-0 text-[#00d4ff] animate-spin" />
                    : <Search className="h-3.5 w-3.5 shrink-0 text-[#00d4ff]/60" />}
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tìm địa điểm..."
                    value={query}
                    disabled={disabled}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && runSearch(query.trim())}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 bg-transparent font-mono text-xs text-white placeholder:text-[#8899aa]/50 outline-none disabled:opacity-40"
                />
                {query && (
                    <button onClick={clear} className="text-[#8899aa] hover:text-white transition-colors">
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mt-1 px-3 py-1.5 rounded border border-[rgba(255,59,59,0.3)] bg-[rgba(255,59,59,0.08)]">
                    <p className="font-mono text-[9px] text-[#ff3b3b]">{error}</p>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="mt-1 rounded border border-[rgba(0,212,255,0.2)] overflow-hidden"
                    style={{ background: 'rgba(6,10,20,0.97)', backdropFilter: 'blur(16px)', maxHeight: '240px', overflowY: 'auto' }}>
                    {results.map((item, idx) => (
                        <button
                            key={`${item.place_id}-${idx}`}
                            type="button"
                            className="w-full text-left flex items-start gap-2 px-3 py-2.5 border-b border-[rgba(0,212,255,0.08)] last:border-0 hover:bg-[rgba(0,212,255,0.06)] transition-colors group"
                            onClick={() => {
                                const lat = parseFloat(item.lat);
                                const lng = parseFloat(item.lon);
                                if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                                    onSelectLocation(lat, lng, String(item.display_name));
                                    setResults([]);
                                    setQuery(String(item.display_name).split(',')[0]);
                                }
                            }}>
                            <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-[#00d4ff]/40 group-hover:text-[#00d4ff]/70 transition-colors" />
                            <span className="font-mono text-[10px] text-[#8899aa] group-hover:text-white transition-colors leading-relaxed">
                                {item.display_name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBox;
