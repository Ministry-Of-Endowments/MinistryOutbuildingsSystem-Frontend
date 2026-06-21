import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import type {
  OverviewCardsDto,
  OverviewChartsDto,
  LegalCriticalRowDto,
  ExpiringRentRowDto,
} from '../utils/types';

interface ApiWrapper<T> {
  data: T;
  status: string;
  message: string;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(`فشل الطلب (${res.status})`);
  const json: ApiWrapper<T> = await res.json();
  return json.data;
}

function formatCurrency(v: number): string {
  return v.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' جنيه';
}

function getDaysColor(days: number): string {
  if (days <= 30) return 'text-rose-700 font-semibold';
  if (days <= 60) return 'text-amber-700';
  return 'text-gray-500';
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
  iconPath,
  onClick,
}: {
  label: string;
  value: string | number;
  accent: 'brand' | 'alert';
  iconPath: string;
  onClick?: () => void;
}) {
  const iconBg = accent === 'alert' ? 'bg-rose-50' : 'bg-[#f5ede0]';
  const iconColor = accent === 'alert' ? 'text-rose-600' : 'text-[#8a7540]';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 ${onClick ? 'cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group' : ''}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 24 24">
          <path d={iconPath} />
        </svg>
      </div>
      <div className="flex-1 text-right min-w-0">
        <div
          className="text-xl font-bold text-gray-800 leading-tight truncate"
          title={String(value)}
        >
          {value}
        </div>
        <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap flex items-center justify-end gap-1">
          {label}
          {onClick && (
            <svg className="w-3 h-3 text-gray-300 group-hover:text-gray-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
      <div className="flex-1 text-right">
        <div className="h-6 bg-gray-100 rounded w-14 mb-1.5 mr-auto" />
        <div className="h-3 bg-gray-50 rounded w-24 mr-auto" />
      </div>
    </div>
  );
}

function DonutChart({ occupied, vacant }: { occupied: number; vacant: number }) {
  const total = occupied + vacant;
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const occupiedArc = total > 0 ? (occupied / total) * circumference : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 160 160" className="w-36 h-36">
        <g transform="rotate(-90 80 80)">
          {/* Vacant (background ring) */}
          <circle cx="80" cy="80" r={r} fill="none" stroke="#ede8db" strokeWidth="20" />
          {/* Occupied arc */}
          {total > 0 && (
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke="#c7ad6b"
              strokeWidth="20"
              strokeDasharray={`${occupiedArc} ${circumference - occupiedArc}`}
            />
          )}
        </g>
        <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1f2937">
          {total}
        </text>
        <text x="80" y="93" textAnchor="middle" fontSize="11" fill="#9ca3af">
          إجمالي
        </text>
      </svg>
      <div className="flex gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#c7ad6b' }} />
          <span>مشغول ({occupied})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#ede8db' }} />
          <span>شاغر ({vacant})</span>
        </div>
      </div>
    </div>
  );
}

const BAR_COLORS = [
  '#c7ad6b',
  '#94a3b8',
  '#a8a29e',
  '#6b7280',
  '#b5ada0',
  '#8d9ca8',
  '#c4bba8',
];

function PurposeBarChart({
  items,
}: {
  items: Array<{ purposeValue: number; purposeLabel: string; count: number }>;
}) {
  const maxCount = items.length > 0 ? Math.max(...items.map((i) => i.count), 1) : 1;

  if (items.length === 0) {
    return <div className="text-center text-gray-400 py-8 text-sm">لا توجد بيانات</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <div key={item.purposeValue} className="flex items-center gap-3">
          <div className="text-xs text-gray-500 w-36 text-right shrink-0 leading-tight">
            {item.purposeLabel}
          </div>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.count / maxCount) * 100}%`,
                backgroundColor: BAR_COLORS[idx % BAR_COLORS.length],
              }}
            />
          </div>
          <div className="text-xs text-gray-600 font-medium w-6 text-left shrink-0">
            {item.count}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
        {title}
      </h2>
      {children}
    </div>
  );
}

function TableSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <span className="text-xs text-gray-400">{count} سجل</span>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<OverviewCardsDto | null>(null);
  const [charts, setCharts] = useState<OverviewChartsDto | null>(null);
  const [legalTable, setLegalTable] = useState<LegalCriticalRowDto[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<ExpiringRentRowDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchJson<OverviewCardsDto>('/dashboard/overview/cards'),
      fetchJson<OverviewChartsDto>('/dashboard/overview/charts'),
      fetchJson<LegalCriticalRowDto[]>('/dashboard/overview/legal-critical-table'),
      fetchJson<ExpiringRentRowDto[]>('/dashboard/overview/contracts-expiring?months=3'),
    ])
      .then(([c, ch, lt, ec]) => {
        setCards(c);
        setCharts(ch);
        setLegalTable(lt);
        setExpiringContracts(ec);
      })
      .catch((err: Error) => setError(err.message || 'حدث خطأ في تحميل البيانات'))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-rose-600 text-base font-medium mb-1">خطأ في تحميل البيانات</div>
          <div className="text-gray-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col gap-4 pb-4">
      {/* Page title */}
      <div className="text-right shrink-0">
        <h1 className="text-base font-bold text-gray-800">لوحة المعلومات</h1>
        <p className="text-xs text-gray-400 mt-0.5">نظرة عامة على بيانات الملحقات والمساجد</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 shrink-0">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : cards ? (
          <>
            <StatCard
              label="إجمالي الملحقات"
              value={cards.totalOutbuildings}
              accent="brand"
              iconPath="M3 21h18v-2H3v2zm0-4h4v-2H3v2zm6 0h4v-2H9v2zm6 0h4v-2h-4v2zM3 13h4v-2H3v2zm6 0h4v-2H9v2zm6 0h4v-2h-4v2zM3 9h4V7H3v2zm6 0h4V7H9v2zm6 0h4V7h-4v2zM3 5h18V3H3v2z"
              onClick={() => navigate('/outbuildings')}
            />
            <StatCard
              label="إجمالي المساجد"
              value={cards.totalMosques}
              accent="brand"
              iconPath="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
              onClick={() => navigate('/mosques')}
            />
            <StatCard
              label="الملحقات غير المستغلة"
              value={cards.unusedOutbuildingsCount}
              accent="brand"
              iconPath="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"
              onClick={() => navigate('/outbuildings?status=false')}
            />
            <StatCard
              label="إجمالي الإيجارات النشطة"
              value={formatCurrency(cards.activeRentTotal)}
              accent="brand"
              iconPath="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
              onClick={() => navigate('/outbuildings?status=true')}
            />
            <StatCard
              label="القضايا القانونية الحرجة"
              value={cards.criticalLegalCasesCount}
              accent="alert"
              iconPath="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
              onClick={() => navigate('/outbuildings?legalCritical=true')}
            />
          </>
        ) : null}
      </div>

      {/* Charts */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 h-52" />
          <div className="bg-white rounded-xl border border-gray-200 h-52" />
        </div>
      )}
      {!loading && charts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          <ChartPanel title="توزيع الإشغال">
            <DonutChart
              occupied={charts.occupancyDistribution.occupiedCount}
              vacant={charts.occupancyDistribution.vacantCount}
            />
          </ChartPanel>
          <ChartPanel title="توزيع أغراض الملحقات">
            <PurposeBarChart items={charts.purposeDistribution} />
          </ChartPanel>
        </div>
      )}

      {/* Legal Critical Table */}
      {!loading && (
        <TableSection
          title="القضايا القانونية الحرجة"
          count={legalTable.length}
        >
          {legalTable.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">لا توجد قضايا حرجة</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">#</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">الملحق</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">المسجد</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">المحافظة</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">المديرية</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">الإدارة</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">الحالة القانونية</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {legalTable.map((row, idx) => (
                  <tr key={row.outbuildingId} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/outbuildings?legalCritical=true')}>
                    <td className="px-4 py-2.5 text-gray-300 text-xs whitespace-nowrap">{idx + 1}</td>
                    <td className="px-4 py-2.5 text-gray-700 font-medium whitespace-nowrap">
                      {row.outbuildingDescription || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.mosqueName || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.governorateName || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.directorateName || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.administrationName || '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700">
                        {row.legalStatusText}
                      </span>
                    </td>
                    <td
                      className="px-4 py-2.5 text-gray-400 text-xs max-w-xs truncate"
                      title={row.notes ?? undefined}
                    >
                      {row.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableSection>
      )}

      {/* Expiring Contracts Table */}
      {!loading && (
        <TableSection
          title="عقود الإيجار المنتهية خلال 3 أشهر"
          count={expiringContracts.length}
        >
          {expiringContracts.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">
              لا توجد عقود منتهية قريبًا
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">#</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">الملحق</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">المسجد</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">المستأجر</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">قيمة الإيجار</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">تاريخ الانتهاء</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">الأيام المتبقية</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">المحافظة</th>
                  <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">المديرية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expiringContracts.map((row, idx) => (
                  <tr key={row.outbuildingId} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/outbuildings?status=true')}>
                    <td className="px-4 py-2.5 text-gray-300 text-xs whitespace-nowrap">{idx + 1}</td>
                    <td className="px-4 py-2.5 text-gray-700 font-medium whitespace-nowrap">
                      {row.outbuildingDescription || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.mosqueName || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.tenantName || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-700 font-medium whitespace-nowrap">
                      {row.rentValue != null ? formatCurrency(row.rentValue) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.endDate || '—'}</td>
                    <td className={`px-4 py-2.5 whitespace-nowrap ${getDaysColor(row.daysLeft)}`}>
                      {row.daysLeft} يوم
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.governorateName || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.directorateName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableSection>
      )}
    </div>
  );
}
