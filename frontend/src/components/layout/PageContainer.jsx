import React from 'react';
export default function PageContainer({ title, subtitle, children, actions }) {
  return (
    <div className="animate-fade-in">
      {title && (<div className="flex items-start justify-between mb-5"><div><h1 className="text-xl font-bold text-navy-900">{title}</h1>{subtitle && <p className="text-sm text-navy-500 mt-1">{subtitle}</p>}</div>{actions && <div className="flex items-center gap-2">{actions}</div>}</div>)}
      {children}
    </div>
  );
}
