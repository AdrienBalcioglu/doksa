import Link from 'next/link';
import { api, App } from '@/lib/api';
import AddAppForm from './AddAppForm';
import DeleteAppButton from './DeleteAppButton';

export const dynamic = 'force-dynamic';

async function getApps(): Promise<App[]> {
  try {
    return await api.getApps();
  } catch {
    return [];
  }
}

export default async function AppsPage() {
  const apps = await getApps();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Apps</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your tracked apps</p>
      </div>

      <AddAppForm />

      {apps.length === 0 ? (
        <p className="text-gray-400 text-sm">No apps yet. Add one above.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {apps.map((app) => (
            <div key={app.id} className="bg-white border rounded-lg p-5 hover:shadow-sm transition-shadow flex items-start justify-between">
              <Link href={`/apps/${app.id}`} className="flex-1 min-w-0">
                <h2 className="font-semibold">{app.name}</h2>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {app.app_store_id && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      App Store: {app.app_store_id}
                    </span>
                  )}
                  {app.play_store_id && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      Play Store: {app.play_store_id}
                    </span>
                  )}
                </div>
              </Link>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <Link href={`/apps/${app.id}`} className="text-brand-600 text-sm">View reviews →</Link>
                <DeleteAppButton id={app.id} name={app.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
