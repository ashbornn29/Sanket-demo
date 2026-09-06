import React from 'react';
import { getRiskBg } from '../../data/mockData';
export default function RiskBadge({ level, score, size = 'sm' }) {
  const classes = getRiskBg(level);
  const sizeClasses = { xs: 'text-[10px] px-1.5 py-0.5', sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1', lg: 'text-base px-3 py-1.5' };
  return (<span className={`inline-flex items-center gap-1.5 font-semibold rounded-md border ${classes} ${sizeClasses[size]}`}>{score !== undefined && <span>{score}</span>}<span>{level}</span></span>);
}
