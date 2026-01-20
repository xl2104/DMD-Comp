
import React from 'react';
import { FDADrug } from '../types';
import { ShieldCheck, Factory, Calendar, HeartPulse, ArrowRight } from 'lucide-react';

interface Props {
  drug: FDADrug;
  onSelect: (drug: FDADrug) => void;
}

export const DrugCard: React.FC<Props> = ({ drug, onSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-brand-300 hover:shadow-md transition-all flex flex-col h-full border-t-4 border-t-brand-500">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-brand-50 rounded-lg shrink-0">
          <ShieldCheck className="w-6 h-6 text-brand-600" />
        </div>
        <div className="overflow-hidden">
          <h3 className="font-extrabold text-gray-900 text-lg leading-tight truncate">
            {drug.brandNameCn || drug.brandName}
            {drug.brandNameCn && <span className="block text-sm font-medium text-gray-400 mt-0.5">{drug.brandName}</span>}
          </h3>
        </div>
      </div>

      <div className="space-y-2.5 text-sm text-gray-600 mb-6 flex-grow">
        <div className="flex items-center gap-2">
          <Factory className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">{drug.manufacturer}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <span>获批年份: {drug.approvalYear}</span>
        </div>
        <div className="flex items-start gap-2 bg-brand-50/50 p-2.5 rounded-lg border border-brand-100 mt-2">
          <HeartPulse className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-brand-900 line-clamp-3">
            <span className="font-bold">适应症:</span> {drug.indication}
          </p>
        </div>
      </div>

      <button 
        onClick={() => onSelect(drug)}
        className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm hover:shadow-brand-500/20"
      >
        药物病情适配
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
