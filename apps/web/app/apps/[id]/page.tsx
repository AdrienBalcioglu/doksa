import { api } from '@/lib/api';
import ReviewsClient from './ReviewsClient';

export default async function AppReviewsPage({ params }: { params: { id: string } }) {
  const [apps, initialData] = await Promise.all([
    api.getApps().catch(() => []),
    api.getReviews(params.id, { limit: '20', page: '1' }).catch(() => null),
  ]);

  const app = apps.find((a) => a.id === params.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{app?.name ?? 'Reviews'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {initialData?.total ?? 0} total reviews
        </p>
      </div>
      <ReviewsClient appId={params.id} initialData={initialData} />
    </div>
  );
}
