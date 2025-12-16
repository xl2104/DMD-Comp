import React, { useState } from 'react';
import { SavedInquiry } from '../types';
import { MessageSquare, Calendar, ChevronRight, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
    inquiries: SavedInquiry[];
}

export const SavedInquiries: React.FC<Props> = ({ inquiries }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (inquiries.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">暂无保存的咨询</h3>
                <p className="text-gray-500 mt-2">在浏览文章时，点击“保存记录”即可在此处查看。</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-brand-600" />
                已保存的咨询记录 ({inquiries.length})
            </h2>
            
            {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <button 
                        onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
                    >
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 line-clamp-1">{inquiry.articleTitle}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {inquiry.date}
                                </span>
                                <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded text-xs">
                                    {inquiry.chatHistory.length} 条对话
                                </span>
                            </div>
                        </div>
                        {expandedId === inquiry.id ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                    </button>
                    
                    {expandedId === inquiry.id && (
                        <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">AI 摘要回顾</h4>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-700 prose prose-sm max-w-none">
                                    <ReactMarkdown>{inquiry.summary}</ReactMarkdown>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">对话记录</h4>
                                <div className="space-y-3">
                                    {inquiry.chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg text-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-gray-800 text-white ml-8' 
                                            : 'bg-white border border-gray-200 text-gray-700 mr-8'
                                        }`}>
                                            <span className="block text-xs opacity-50 mb-1">{msg.role === 'user' ? '我' : 'AI 助手'}</span>
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};