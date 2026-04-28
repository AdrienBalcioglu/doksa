export default function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}
