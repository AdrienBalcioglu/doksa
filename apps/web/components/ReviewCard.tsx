'use client';

import { useState } from 'react';
import { Review, api } from '@/lib/api';
import Stars from './Stars';

export default function ReviewCard({ review: initial }: { review: Review }) {
  const [review, setReview] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState(review.response_text ?? '');

  async function toggleResponded() {
    setLoading(true);
    try {
      const updated = await api.markResponded(review.id, !review.responded);
      setReview(updated);
    } finally {
      setLoading(false);
    }
  }

  async function saveReply() {
    setLoading(true);
    try {
      const updated = await api.markResponded(review.id, true, reply);
      setReview(updated);
      setShowReply(false);
    } finally {
      setLoading(false);
    }
  }

  const date = review.reviewed_at
    ? new Date(review.reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className={`bg-white border rounded-lg p-4 space-y-2 ${review.responded ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Stars rating={review.rating} />
            <span className="font-medium text-sm">{review.author ?? 'Anonymous'}</span>
            {date && <span className="text-gray-400 text-xs">{date}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                review.platform === 'app_store'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {review.platform === 'app_store' ? 'App Store' : 'Play Store'}
            </span>
            {review.responded && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Responded</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowReply((s) => !s)}
            className="text-xs text-brand-600 hover:underline"
          >
            Reply
          </button>
          <button
            onClick={toggleResponded}
            disabled={loading}
            className="text-xs border rounded px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {review.responded ? 'Reopen' : 'Mark responded'}
          </button>
        </div>
      </div>

      {review.body && <p className="text-sm text-gray-700 leading-relaxed">{review.body}</p>}

      {review.response_text && (
        <div className="bg-gray-50 border-l-2 border-brand-400 pl-3 py-2 text-sm text-gray-600">
          <span className="font-medium text-xs text-brand-600 block mb-0.5">Your response</span>
          {review.response_text}
        </div>
      )}

      {showReply && (
        <div className="space-y-2 pt-1">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Write your response..."
            className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex gap-2">
            <button
              onClick={saveReply}
              disabled={loading || !reply.trim()}
              className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded hover:bg-brand-700 disabled:opacity-50"
            >
              Save response
            </button>
            <button
              onClick={() => setShowReply(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
