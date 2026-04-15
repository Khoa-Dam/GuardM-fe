'use client';

import type { LeafletWindow } from '@/types/leaflet-manual';

import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { toast } from 'sonner';
import { useLeaflet } from '@/hooks/use-leaflet';
import { useReportsQuery } from '@/hooks/use-crime-reports';
import ReportCard from './components/ReportCard';
import { FilterBtn, DangerAlert, SearchBox, ReportForm } from './components';
import { NewsPanel } from './components/NewsPanel';
import { MapLegend } from './components/MapLegend';
import type { FilterType, VerificationCrimeReport } from '@/types/map';
import {
    useMapInit, useMapGeolocation, useMapCrimeMarkers, useMapHeatmap, useMapGlobalAlerts,
    useMapFilters, useReportingMode, useMapActions,
} from './hooks';
import { CRIME_TYPE_OPTIONS, TIME_OPTIONS } from './hooks/use-map-filters';
import { useGlobalAlerts } from '@/hooks/use-global-alerts';
import {
    Plus, Loader2, MapPin, Crosshair, Thermometer,
    Clock, ChevronDown, ChevronUp, Filter, Brain, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveIndicator } from './components/LiveIndicator';
import { AISafetyPanel } from '@/components/ai-safety-panel';
import { useRealtime } from '@/hooks/use-realtime';
import { useNotifications } from '@/hooks/use-notifications';
import { motion, AnimatePresence } from 'motion/react';

// ── Crosshair overlay ─────────────────────────────────────────────────────────
const CrosshairOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-[44] flex items-center justify-center">
        <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.25) 20%, rgba(0,212,255,0.7) 50%, rgba(0,212,255,0.25) 80%, transparent 100%)' }} />
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.25) 20%, rgba(0,212,255,0.7) 50%, rgba(0,212,255,0.25) 80%, transparent 100%)' }} />
        <div className="relative w-5 h-5">
            <div className="absolute inset-0 rounded-full border border-[#00d4ff] animate-ping opacity-40" />
            <div className="absolute inset-1 rounded-full bg-[#00d4ff]/80" style={{ boxShadow: '0 0 8px #00d4ff' }} />
        </div>
        {[['top-[calc(50%-28px)]','left-[calc(50%-28px)]','border-t','border-l'],
          ['top-[calc(50%-28px)]','right-[calc(50%-28px)]','border-t','border-r'],
          ['bottom-[calc(50%-28px)]','left-[calc(50%-28px)]','border-b','border-l'],
          ['bottom-[calc(50%-28px)]','right-[calc(50%-28px)]','border-b','border-r'],
        ].map((cls, i) => (
            <div key={i} className={cn('absolute w-4 h-4 border-[#00d4ff]/60', ...cls)} style={{ borderWidth: '1.5px' }} />
        ))}
    </div>
);

// ── HUD overlay when in reporting mode ────────────────────────────────────────
const HudOverlay = ({ lat, lng, address, isLoading }: { lat: number | null; lng: number | null; address: string; isLoading: boolean }) => (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[46] pointer-events-none w-full max-w-sm px-4">
        <div className="rounded border border-[rgba(0,212,255,0.4)] px-4 py-2.5"
            style={{ background: 'rgba(6,10,20,0.92)', backdropFilter: 'blur(16px)', boxShadow: '0 0 24px rgba(0,212,255,0.15)' }}>
            <div className="flex items-center gap-2 mb-1.5">
                <Crosshair className="h-3 w-3 text-[#00d4ff] shrink-0" />
                <span className="font-mono text-[9px] tracking-[0.25em] text-[#00d4ff]/60 uppercase">Select Report Location</span>
                {isLoading && <Loader2 className="h-3 w-3 text-[#00d4ff] animate-spin ml-auto" />}
            </div>
            <div className="flex gap-4 mb-1.5">
                <span className="font-mono text-[10px] text-[#00d4ff]/50">
                    LAT <span className="text-[#00d4ff] font-bold">{lat !== null ? lat.toFixed(6) : '—'}</span>
                </span>
                <span className="font-mono text-[10px] text-[#00d4ff]/50">
                    LNG <span className="text-[#00d4ff] font-bold">{lng !== null ? lng.toFixed(6) : '—'}</span>
                </span>
            </div>
            <p className="font-mono text-[10px] text-white/70 truncate leading-relaxed">
                {isLoading ? 'Resolving address...' : address || 'Drag the map to select a location'}
            </p>
        </div>
    </div>
);

// ── Main map content ──────────────────────────────────────────────────────────
const CrimeMapContent = () => {
    const markerClickedRef = useRef(false);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [showAiPanel, setShowAiPanel] = useState(false);

    const isLeafletLoaded = useLeaflet();
    const { addFromReport } = useNotifications();
    const { subscribeArea } = useRealtime({ onReportCreated: addFromReport, onNearbyAlert: addFromReport });

    const { data: reports = [], isLoading: loading, error } = useReportsQuery();
    const { data: globalAlerts = [] } = useGlobalAlerts();

    const { mapContainerRef, mapInstanceRef, markersLayerRef, zonesLayerRef } = useMapInit(isLeafletLoaded);
    const { handleGetLocation, alertMessage, setAlertMessage, currentLocation } = useMapGeolocation({
        isLeafletLoaded, mapInstanceRef, reports,
    });

    // ── Domain hooks ─────────────────────────────────────────────────────────
    const filters = useMapFilters(reports);

    // Break circular dependency: reporting ↔ actions via refs
    const onSelectReportRef = useRef<(id: string | null) => void>(() => {});
    const onEditReportRef   = useRef<(r: VerificationCrimeReport) => void>(() => {});

    const reporting = useReportingMode({
        mapInstanceRef,
        isLeafletLoaded,
        reports,
        onSelectReport: useCallback((id) => onSelectReportRef.current(id), []),
    });

    const actions = useMapActions({
        mapInstanceRef,
        reports,
        loading,
        isLeafletLoaded,
        onEditReport: useCallback((r) => onEditReportRef.current(r), []),
    });

    // Wire refs after both hooks are initialized
    onSelectReportRef.current = actions.setSelectedReportId;
    onEditReportRef.current   = reporting.handleEditReport;

    // ── Map layer hooks ───────────────────────────────────────────────────────
    useMapCrimeMarkers({
        isLeafletLoaded, mapInstanceRef, markersLayerRef, zonesLayerRef,
        reports: reporting.isReportingMode ? [] : filters.filteredReports,
        onMarkerClick: useCallback((reportId: string) => {
            markerClickedRef.current = true;
            actions.setSelectedReportId(reportId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [actions.setSelectedReportId]),
        selectedReportId: actions.selectedReportId,
    });

    useMapHeatmap({ isLeafletLoaded, mapInstanceRef, reports: filters.filteredReports, enabled: filters.showHeatmap });
    useMapGlobalAlerts({ isLeafletLoaded, mapInstanceRef, alerts: globalAlerts, visible: filters.showGlobalAlerts && !reporting.isReportingMode });

    // ── Track map center for AI panel ─────────────────────────────────────────
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isLeafletLoaded) return;
        const center = map.getCenter();
        setMapCenter({ lat: center.lat, lng: center.lng });
        const onMoveEnd = () => { const c = map.getCenter(); setMapCenter({ lat: c.lat, lng: c.lng }); };
        map.on('moveend', onMoveEnd);
        return () => { map.off('moveend', onMoveEnd); };
    }, [mapInstanceRef, isLeafletLoaded]);

    // Click map to deselect
    useEffect(() => {
        const map = mapInstanceRef.current;
        const L = (window as unknown as LeafletWindow).L;
        if (!map || !L) return;
        const handler = () => {
            if (markerClickedRef.current) { markerClickedRef.current = false; return; }
            actions.setSelectedReportId(null);
        };
        map.on('click', handler);
        return () => { map.off('click', handler); };
    }, [mapInstanceRef, actions]);

    useEffect(() => {
        if (error) toast.error(error instanceof Error ? error.message : 'An error occurred while loading data');
    }, [error]);

    const handleLocationButtonClick = () => {
        handleGetLocation();
        if (reporting.isReportingMode && !reporting.showReportForm) {
            if (currentLocation) {
                mapInstanceRef.current?.flyTo([currentLocation.lat, currentLocation.lng], 16, { duration: 1.5 });
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    ({ coords }) => mapInstanceRef.current?.flyTo([coords.latitude, coords.longitude], 16, { duration: 1.5 }),
                    () => toast.error('Unable to determine location'),
                );
            }
        }
    };

    const selectedReport = reports.find(r => r.id === actions.selectedReportId);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-[rgba(0,212,255,0.15)] bg-[#060a14]">
            {alertMessage && <DangerAlert message={alertMessage} onClose={() => setAlertMessage(null)} />}

            {(!isLeafletLoaded || loading) && (
                <div className="absolute inset-0 bg-[rgba(6,10,20,0.92)] backdrop-blur-sm z-[2000] flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-2 border-[rgba(0,212,255,0.2)] border-t-[#00d4ff] rounded-full animate-spin mb-3" />
                    <span className="font-mono text-xs text-[#00d4ff]/60 tracking-widest uppercase">Loading map...</span>
                </div>
            )}

            {reporting.isReportingMode && !reporting.showReportForm && <CrosshairOverlay />}

            {/* HUD / Filter bar */}
            {reporting.isReportingMode && !reporting.showReportForm ? (
                <HudOverlay
                    lat={reporting.liveCoords?.lat ?? reporting.reportLocation?.lat ?? null}
                    lng={reporting.liveCoords?.lng ?? reporting.reportLocation?.lng ?? null}
                    address={reporting.reportLocation?.address ?? ''}
                    isLoading={reporting.isLoadingAddress}
                />
            ) : !reporting.isReportingMode && (
                <div className="absolute top-3 left-3 right-3 z-[45] space-y-1.5 pointer-events-none">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex gap-1.5 pointer-events-auto flex-wrap">
                            {([
                                { value: 'all' as FilterType,    label: 'All',       color: '#00d4ff' },
                                { value: 'high' as FilterType,   label: 'Dangerous', color: '#ff3b3b' },
                                { value: 'medium' as FilterType, label: 'Medium',    color: '#ffd700' },
                                { value: 'low' as FilterType,    label: 'Low',       color: '#00ff88' },
                            ] as const).map(opt => (
                                <FilterBtn key={opt.value} active={filters.severityFilter === opt.value}
                                    onClick={() => filters.setSeverityFilter(opt.value)} color={opt.color}>
                                    {opt.label}
                                </FilterBtn>
                            ))}
                        </div>
                        <div className="ml-auto flex gap-1.5 pointer-events-auto">
                            <button onClick={() => filters.setShowGlobalAlerts(v => !v)}
                                title={`${filters.showGlobalAlerts ? 'Hide' : 'Show'} news (${globalAlerts.length})`}
                                className={cn(
                                    'relative flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1.5 rounded border transition-all duration-200',
                                    filters.showGlobalAlerts
                                        ? 'border-[rgba(255,154,60,0.6)] bg-[rgba(255,154,60,0.15)] text-[#ff9a3c]'
                                        : 'border-[rgba(255,255,255,0.1)] bg-[rgba(8,12,24,0.85)] text-[#8899aa] hover:text-white hover:border-[rgba(255,255,255,0.2)]'
                                )}>
                                <Globe className="h-3 w-3" />
                                <span className="hidden sm:inline">News</span>
                                {globalAlerts.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ff9a3c] font-mono text-[7px] flex items-center justify-center text-white font-bold">
                                        {globalAlerts.length > 99 ? '99' : globalAlerts.length}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => filters.setShowHeatmap(v => !v)}
                                className={cn(
                                    'flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1.5 rounded border transition-all duration-200',
                                    filters.showHeatmap
                                        ? 'border-[rgba(255,107,53,0.6)] bg-[rgba(255,107,53,0.15)] text-[#ff6b35]'
                                        : 'border-[rgba(255,255,255,0.1)] bg-[rgba(8,12,24,0.85)] text-[#8899aa] hover:text-white hover:border-[rgba(255,255,255,0.2)]'
                                )}>
                                <Thermometer className="h-3 w-3" />
                                <span className="hidden sm:inline">Heat</span>
                            </button>
                            <button onClick={() => filters.setShowExtraFilters(v => !v)}
                                className={cn(
                                    'relative flex items-center gap-1 font-mono text-[10px] uppercase px-2.5 py-1.5 rounded border transition-all duration-200',
                                    filters.showExtraFilters
                                        ? 'border-[rgba(0,212,255,0.5)] bg-[rgba(0,212,255,0.1)] text-[#00d4ff]'
                                        : 'border-[rgba(255,255,255,0.1)] bg-[rgba(8,12,24,0.85)] text-[#8899aa] hover:text-white'
                                )}>
                                <Filter className="h-3 w-3" />
                                {filters.activeFilterCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ff3b3b] font-mono text-[8px] flex items-center justify-center text-white">
                                        {filters.activeFilterCount}
                                    </span>
                                )}
                                {filters.showExtraFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                        </div>
                    </div>

                    {filters.showExtraFilters && (
                        <div className="space-y-1.5 pointer-events-auto">
                            <div className="flex items-center gap-1.5 flex-wrap rounded border border-[rgba(0,212,255,0.12)] px-2 py-1.5"
                                style={{ background: 'rgba(6,10,20,0.9)', backdropFilter: 'blur(12px)' }}>
                                <span className="font-mono text-[8px] text-[#00d4ff]/40 tracking-widest uppercase shrink-0">CRIME TYPE</span>
                                <div className="flex gap-1 flex-wrap">
                                    {CRIME_TYPE_OPTIONS.map(opt => (
                                        <button key={opt.value}
                                            onClick={() => filters.setCrimeTypeFilter(opt.value)}
                                            className={cn(
                                                'font-mono text-[9px] px-2 py-0.5 rounded border transition-all duration-150',
                                                filters.crimeTypeFilter === opt.value
                                                    ? 'text-white'
                                                    : 'border-[rgba(255,255,255,0.08)] text-[#8899aa] hover:text-white hover:border-[rgba(255,255,255,0.2)] bg-transparent'
                                            )}
                                            style={filters.crimeTypeFilter === opt.value ? {
                                                borderColor: `${opt.color}60`,
                                                backgroundColor: `${opt.color}18`,
                                                color: opt.color,
                                            } : {}}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 rounded border border-[rgba(0,212,255,0.12)] px-2 py-1.5"
                                style={{ background: 'rgba(6,10,20,0.9)', backdropFilter: 'blur(12px)' }}>
                                <Clock className="h-3 w-3 text-[#00d4ff]/40 shrink-0" />
                                <span className="font-mono text-[8px] text-[#00d4ff]/40 tracking-widest uppercase shrink-0">TIME RANGE</span>
                                <div className="flex gap-1">
                                    {TIME_OPTIONS.map(opt => (
                                        <button key={opt.value}
                                            onClick={() => filters.setTimeRange(opt.value)}
                                            className={cn(
                                                'font-mono text-[9px] px-2 py-0.5 rounded border transition-all duration-150',
                                                filters.timeRange === opt.value
                                                    ? 'border-[rgba(0,212,255,0.5)] bg-[rgba(0,212,255,0.15)] text-[#00d4ff]'
                                                    : 'border-[rgba(255,255,255,0.08)] text-[#8899aa] hover:text-white bg-transparent'
                                            )}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <span className="ml-auto font-mono text-[9px] text-[#8899aa]">
                                    {filters.filteredReports.length} <span className="text-[#00d4ff]/50">result(s)</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!reporting.isReportingMode && <LiveIndicator />}

            <NewsPanel
                alerts={globalAlerts}
                open={filters.showGlobalAlerts && !reporting.isReportingMode}
                onClose={() => filters.setShowGlobalAlerts(() => false)}
                onSelectAlert={(alert) => {
                    if (alert.lat && alert.lng) {
                        mapInstanceRef.current?.flyTo([alert.lat, alert.lng], 13, { duration: 1.2 });
                    }
                }}
            />

            <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#060a14]" />

            {!reporting.isReportingMode && <MapLegend />}

            {reporting.isReportingMode && !reporting.showReportForm && (
                <SearchBox onSelectLocation={(lat, lng) => mapInstanceRef.current?.flyTo([lat, lng], 16, { duration: 1.5 })} />
            )}

            {reporting.isReportingMode && !reporting.showReportForm && (
                <div className="absolute bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[44] flex gap-2 w-full max-w-xs px-4 pointer-events-auto">
                    <button onClick={reporting.handleCancelReporting}
                        className="flex-1 font-mono text-xs border border-[rgba(255,255,255,0.15)] rounded bg-[rgba(6,10,20,0.85)] text-[#8899aa] hover:text-white hover:border-[rgba(255,255,255,0.3)] py-2.5 transition-all"
                        style={{ backdropFilter: 'blur(12px)' }}>
                        Cancel
                    </button>
                    <button onClick={reporting.handleConfirmLocation}
                        disabled={!reporting.reportLocation || reporting.isLoadingAddress}
                        className="flex-1 font-mono text-xs rounded border border-[rgba(0,212,255,0.5)] bg-[rgba(0,212,255,0.12)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.2)] hover:text-white py-2.5 transition-all disabled:opacity-40"
                        style={{ backdropFilter: 'blur(12px)', boxShadow: '0 0 16px rgba(0,212,255,0.15)' }}>
                        {reporting.isLoadingAddress
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin inline mr-1" />Loading...</>
                            : <><Crosshair className="h-3.5 w-3.5 inline mr-1" />Confirm location</>}
                    </button>
                </div>
            )}

            {!reporting.isReportingMode && (
                <div className="absolute bottom-20 right-3 z-[44] w-auto sm:w-72 pointer-events-auto">
                    <AnimatePresence>
                        {showAiPanel && (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.97 }} transition={{ duration: 0.2 }} className="mb-2">
                                <AISafetyPanel lat={mapCenter?.lat ?? null} lng={mapCenter?.lng ?? null} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button onClick={() => setShowAiPanel(v => !v)}
                        className={cn(
                            'flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest rounded border px-3 py-2 transition-all w-full justify-center',
                            showAiPanel
                                ? 'border-[rgba(0,212,255,0.5)] bg-[rgba(0,212,255,0.1)] text-[#00d4ff]'
                                : 'border-[rgba(0,212,255,0.2)] bg-[rgba(6,10,20,0.85)] text-[#8899aa] hover:text-[#00d4ff]'
                        )}
                        style={{ backdropFilter: 'blur(12px)' }}>
                        <Brain className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">AI Safety Analysis</span>
                    </button>
                </div>
            )}

            <button onClick={() => reporting.setIsReportingMode(true)} disabled={reporting.isReportingMode}
                className="absolute bottom-6 left-6 z-[44] pointer-events-auto flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest rounded border border-[rgba(255,59,59,0.6)] bg-[rgba(255,59,59,0.15)] text-[#ff3b3b] hover:bg-[rgba(255,59,59,0.25)] hover:text-white px-4 py-2.5 transition-all disabled:opacity-40"
                style={{ backdropFilter: 'blur(12px)', boxShadow: '0 0 20px rgba(255,59,59,0.2)' }}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Report now</span>
                <span className="sm:hidden">Report</span>
            </button>

            <button onClick={handleLocationButtonClick}
                className="absolute bottom-6 right-12 z-[44] pointer-events-auto w-11 h-11 rounded-full border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.1)] hover:bg-[rgba(0,212,255,0.2)] transition-all flex items-center justify-center"
                title="My location" style={{ backdropFilter: 'blur(12px)' }}>
                <MapPin className="h-4 w-4 text-[#00d4ff]" />
            </button>

            {reporting.showReportForm && reporting.reportLocation && (
                <ReportForm
                    locationData={reporting.reportLocation}
                    onClose={() => { reporting.setShowReportForm(false); reporting.setEditingReportId(null); }}
                    onSubmit={reporting.handleReportSubmit}
                    isSubmitting={reporting.isSubmitting}
                    report={reporting.editingReportId ? reports.find(r => r.id === reporting.editingReportId) : undefined}
                />
            )}

            {selectedReport && (
                <ReportCard
                    report={selectedReport}
                    onClose={() => actions.setSelectedReportId(null)}
                    onConfirm={actions.handleConfirm}
                    onDispute={actions.handleDispute}
                    onEdit={reporting.handleEditReport}
                    onDelete={actions.handleDeleteReport}
                    isConfirming={actions.actionState.id === selectedReport.id && actions.actionState.type === 'confirm'}
                    isDisputing={actions.actionState.id === selectedReport.id && actions.actionState.type === 'dispute'}
                />
            )}
        </div>
    );
};

// ── Export wrapper ────────────────────────────────────────────────────────────
const CrimeMap = () => (
    <Suspense fallback={
        <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-[rgba(0,212,255,0.15)] bg-[#060a14] flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-[rgba(0,212,255,0.2)] border-t-[#00d4ff] rounded-full animate-spin mb-3" />
            <span className="font-mono text-xs text-[#00d4ff]/60 tracking-widest uppercase">Initializing map...</span>
        </div>
    }>
        <CrimeMapContent />
    </Suspense>
);

export default CrimeMap;
