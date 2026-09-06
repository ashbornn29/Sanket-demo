import React from 'react';
import { Loader2 } from 'lucide-react';
export default function Loading({ message = 'Loading data...' }) {
  return (<div className="flex flex-col items-center justify-center py-16 text-navy-500"><Loader2 size={28} className="animate-spin mb-3" /><p className="text-sm">{message}</p></div>);
}
