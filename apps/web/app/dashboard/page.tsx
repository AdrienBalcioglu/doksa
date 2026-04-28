import { api, Stats } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getStats(): Promise<Stats | null> {
  try {
    return await api.getStats();
  } catch {
    return null;
  }
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border rounded-lg p-5">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  if (!stats) {
    return (
      <div className="text-center py-20 text-gray-400">
        Could not load stats. Make sure the API is running.
      </div>
    );
  }

  const appStoreCount = stats.by_platform?.app_store ?? 0;
  const playStoreCount = stats.by_platform?.play_store ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all your tracked apps</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Avg Rating" value={stats.avg_rating != null ? `${stats.avg_rating} ★` : '—'} />
        <StatCard label="Total Reviews" value={stats.total_reviews} />
        <StatCard label="This Week" value={stats.reviews_this_week} />
        <StatCard
          label="By Platform"
          value={`${appStoreCount} / ${playStoreCount}`}
          sub="App Store / Play Store"
        />
      </div>

      {stats.rating_distribution && Object.keys(stats.rating_distribution).length > 0 && (
        <div className="bg-white border rounded-lg p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Rating distribution</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.rating_distribution[star] ?? 0;
              const pct = stats.total_reviews ? Math.round((count / stats.total_reviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-4 text-right text-gray-600">{star}★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-amber-400 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-500 text-xs">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
