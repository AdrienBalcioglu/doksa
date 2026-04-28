import AlertsClient from './AlertsClient';
import { api } from '@/lib/api';

export default async function AlertsPage() {
  const apps = await api.getApps().catch(() => []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-gray-500 text-sm mt-1">
          Get notified via Slack or email when a low-rated review arrives.
        </p>
      </div>
      <AlertsClient apps={apps} />
    </div>
  );
}
