import React from 'react';
import { Inbox } from 'lucide-react';
export default function EmptyState({ message = 'No data found', description = 'Try adjusting your filters.' }) {
  return (<div className="flex flex-col items-center justify-center py-16 text-navy-400"><Inbox size={36} className="mb-3" /><p className="text-base font-medium text-navy-600">{message}</p><p className="text-sm mt-1">{description}</p></div>);
}
