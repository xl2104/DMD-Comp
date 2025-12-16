import React from 'react';
import { Article, ArticleType } from '../types';
import { BookOpen, Activity, FileText, FlaskConical } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
}

const TagBadge: React.FC<{ type: ArticleType }> = ({ type }) => {
  let colorClass = 'bg-gray-100 text-gray-700';
  let Icon = FileText;

  switch (type) {
    case ArticleType.CLINICAL_TRIAL:
      colorClass = 'bg-purple-100 text-purple-700 border border-purple-200';
      Icon = Activity;
      break;
    case ArticleType.GUIDELINE:
      colorClass = 'bg-green-100 text-green-700 border border-green-200';
      Icon = BookOpen;
      break;
    case ArticleType.RESEARCH:
      colorClass = 'bg-blue-100 text-blue-700 border border-blue-200';
      Icon = FlaskConical;
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} mr-2 mb-1`}>
      <Icon className="w-3 h-3 mr-1" />
      {type}
    </span>
  );
};

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 p-5 flex flex-col h-full">
      <div className="mb-3 flex flex-wrap">
        {article.tags.map(tag => <TagBadge key={tag} type={tag} />)}
        <span className="text-xs text-gray-400 ml-auto mt-1 whitespace-nowrap">{article.publicationDate}</span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 line-clamp-2 hover:text-brand-600 transition-colors">
        {article.title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow leading-relaxed">
        {article.abstract || "暂无摘要预览。"}
      </p>

      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-500 italic truncate max-w-[50%]">
            {article.journal}
        </span>
        <button 
          onClick={() => onSelect(article)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-sm"
        >
          解读与咨询
        </button>
      </div>
    </div>
  );
};