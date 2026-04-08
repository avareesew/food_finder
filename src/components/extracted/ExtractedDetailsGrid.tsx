import type { ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';

export default function ExtractedDetailsGrid({ event }: { event: ExtractedEvent }) {
  return (
    <div className="grid grid-cols-1 gap-3 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Title</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50">{event.title ?? '—'}</div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Host</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50">{event.host ?? '—'}</div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Society</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50">{event.society?.trim() || '—'}</div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Campus</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50">{event.campus ?? '—'}</div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Date</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50">{event.date ?? '—'}</div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Time</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50">
          {event.startTime ? (
            <span>
              {event.startTime}
              {event.endTime ? ` – ${event.endTime}` : ''}
            </span>
          ) : (
            '—'
          )}
        </div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Place</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50">{event.place ?? '—'}</div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Food</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50">{event.food ?? '—'}</div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Category</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50">{event.foodCategory ?? '—'}</div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Sign-up / club link</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50 break-all">
          {event.clubSignupLink?.trim() || '—'}
        </div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Participation expectations</div>
        <div className="text-right font-semibold text-gray-900 dark:text-gray-50">
          {event.participationExpectations?.trim() || '—'}
        </div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="text-gray-500 dark:text-gray-400">Food emoji</div>
        <div className="text-right text-2xl">{event.foodEmoji?.trim() || '—'}</div>
      </div>
    </div>
  );
}
