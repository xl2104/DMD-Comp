import React from 'react';
import { ClinicalTrial } from '../types';
import { MapPin, Info, ClipboardCheck, ArrowRight, Globe } from 'lucide-react';

interface Props {
  trial: ClinicalTrial;
  onSelect: (trial: ClinicalTrial) => void;
}

export const TrialCard: React.FC<Props> = ({ trial, onSelect }) => {
  const isRecruiting = trial.status.toLowerCase().includes('recruiting');
  const displayStatus = isRecruiting ? '正在招募' : '活跃未招募';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-5 flex flex-col h-full border-l-4 border-l-brand-500">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
          isRecruiting ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {displayStatus}
        </span>
        <span className="text-xs text-gray-400 font-mono">{trial.nctId}</span>
      </div>

      <h3 className="text-md font-bold text-gray-900 leading-tight mb-3 line-clamp-3">
        {trial.title}
      </h3>

      <div className="flex flex-wrap gap-1 mb-4">
        {trial.regions.map(r => (
          <span key={r} className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
            <Globe className="w-2.5 h-2.5 mr-1" />
            {r}
          </span>
        ))}
        {trial.regions.length === 0 && <span className="text-[10px] text-gray-400">地点待定</span>}
      </div>

      <div className="space-y-2 mb-4 flex-grow">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Info className="w-3 h-3 text-brand-500" />
          <span>阶段: {trial.phase.length > 0 ? trial.phase.join(', ') : 'N/A'}</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <MapPin className="w-3 h-3 text-brand-500 mt-0.5 shrink-0" />
          <span className="line-clamp-2">中心: {trial.locations.length > 0 ? `${trial.locations[0]} 等 ${trial.locations.length} 个中心` : '全球多中心'}</span>
        </div>
      </div>

      <button 
        onClick={() => onSelect(trial)}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100 transition-colors"
      >
        <ClipboardCheck className="w-4 h-4" />
        匹配度分析
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};