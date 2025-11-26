'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { searchAddress } from '@/utils/geocoding';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';

interface SearchBoxProps {
    onSelectLocation: (lat: number, lng: number, name: string) => void;
    disabled?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSelectLocation, disabled }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const activeQueryRef = useRef('');

    const runSearch = useCallback(
        async (value: string) => {
            if (!value.trim() || disabled) {
                setResults([]);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            setError(null);
            activeQueryRef.current = value;
            try {
                const data = await searchAddress(value);
                if (activeQueryRef.current === value) {
                    setResults(data);
                }
            } catch (err) {
                if (activeQueryRef.current === value) {
                    setError('Không thể tìm kiếm. Vui lòng thử lại.');
                }
            } finally {
                if (activeQueryRef.current === value) {
                    setIsSearching(false);
                }
            }
        },
        [disabled]
    );

    useEffect(() => {
        if (!query.trim() || disabled) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        const timeout = setTimeout(() => {
            runSearch(query.trim());
        }, 500);

        return () => {
            clearTimeout(timeout);
        };
    }, [query, runSearch, disabled]);

    const handleSearch = () => {
        if (!query.trim() || disabled) return;
        runSearch(query.trim());
    };

    return (
        <div className="absolute top-4 left-4 z-1100 w-full max-w-xs pointer-events-auto">
            <Card className="shadow-lg p-2 rounded-b-none">
                <CardContent className="p-0">
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Tìm địa điểm..."
                            value={query}
                            disabled={disabled}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 h-9"
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={disabled || isSearching}
                            size="sm"
                            className="h-9"
                        >
                            {isSearching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {error && <p className="text-xs text-destructive mt-2 px-1">{error}</p>}
                </CardContent>
            </Card>

            {results.length > 0 && (
                <Card className="shadow-xl max-h-60 overflow-y-auto rounded-none">
                    <CardContent className="p-0">
                        {results.map((item, idx) => (
                            <button
                                type="button"
                                key={`${item.place_id}-${idx}`}
                                className="w-full text-left p-3 text-xs border-b border-gray-50 last:border-0 hover:bg-accent cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => {
                                    const lat = parseFloat(item.lat);
                                    const lng = parseFloat(item.lon);
                                    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                                        onSelectLocation(lat, lng, String(item.display_name));
                                        setResults([]);
                                        setQuery(String(item.display_name).split(',')[0]);
                                    }
                                }}
                            >
                                {item.display_name}
                            </button>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SearchBox;
