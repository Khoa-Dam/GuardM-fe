"use client";

import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useReportsQuery, useMyReportsQuery } from "@/hooks/use-crime-reports";
import { useStatistics } from "@/hooks/use-statistics";
import { CrimeType } from "@/service/report.service";
import { crimeTypeLabels } from "@/types/crime";
import { FileText, AlertTriangle, ShieldCheck, UserCircle2 } from "lucide-react";
import { SummaryCards } from "./components/SummaryCards";
import { ReportsHeaderCard } from "./components/ReportsHeaderCard";
import { RecentReportsSection } from "./components/RecentReportsSection";
import { MyReportsSection } from "./components/MyReportsSection";
import { StatisticsSection } from "./components/StatisticsSection";
import type { SummaryCardConfig, CrimeTypeDatum } from "./types/types";

export default function ReportsPage() {
  // Use React Query hooks for caching - data shared with dashboard
  const { data: reports = [], isLoading: reportsLoading, error: reportsError } = useReportsQuery();
  const { data: myReports = [], isLoading: myReportsLoading, error: myReportsError } = useMyReportsQuery();
  const { data: stats, isLoading: statsLoading, error: statsError } = useStatistics();
  const [search, setSearch] = useState("");

  const filteredReports = useMemo(() => {
    if (!search) return reports;
    return reports.filter((report) => {
      const query = search.toLowerCase();
      return (
        report.title?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query) ||
        report.address?.toLowerCase().includes(query)
      );
    });
  }, [reports, search]);

  const recentReports = useMemo(() => filteredReports.slice(0, 6), [filteredReports]);
  const myLatestReports = useMemo(() => myReports.slice(0, 5), [myReports]);
  const byTypeData = useMemo<CrimeTypeDatum[]>(
    () =>
      (stats?.byType ?? []).map((item) => ({
        ...item,
        label: crimeTypeLabels[item.type as CrimeType] ?? item.type,
      })),
    [stats]
  );

  const summaryCards = useMemo<SummaryCardConfig[]>(
    () => [
      {
        title: "Tổng số báo cáo",
        value: stats?.total ?? 0,
        description: "Tất cả báo cáo đã ghi nhận",
        icon: FileText,
        showSpinner: true,
      },
      {
        title: "Báo cáo đang hoạt động",
        value: stats?.activeAlerts ?? 0,
        description: "Status = 0",
        icon: AlertTriangle,
        showSpinner: true,
      },
      {
        title: "Báo cáo mức độ cao",
        value: stats?.highSeverity ?? 0,
        description: "Severity ≥ 4",
        icon: ShieldCheck,
        showSpinner: true,
      },
      {
        title: "Báo cáo của tôi",
        value: myReports.length,
        description: "Bạn đã gửi",
        icon: UserCircle2,
        showSpinner: false,
      },
    ],
    [stats, myReports.length]
  );

  return (
    <div className="space-y-6">
      <SummaryCards cards={summaryCards} statsLoading={statsLoading} />
      <ReportsHeaderCard search={search} onSearchChange={setSearch} />

      {(statsError || reportsError || myReportsError) && (
        <Alert variant="destructive">
          <AlertTitle>Có lỗi xảy ra</AlertTitle>
          <AlertDescription>
            {statsError?.message || reportsError?.message || myReportsError?.message || "Không thể tải dữ liệu. Vui lòng thử lại sau."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentReportsSection reports={recentReports} loading={reportsLoading} />
        <MyReportsSection reports={myLatestReports} loading={myReportsLoading} />
      </div>

      <StatisticsSection stats={stats ?? null} statsLoading={statsLoading} byTypeData={byTypeData} />
    </div>
  );
}