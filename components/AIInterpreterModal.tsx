import React, { useState, useEffect, useRef } from 'react';
import { Article, UserProfile, ChatMessage, SavedInquiry } from '../types';
import { analyzeArticle, chatWithArticle } from '../services/geminiService';
import { saveInquiry } from '../services/authService';
import { X, Send, Bot, User, Sparkles, AlertTriangle, Save, Check, FileText, Users, BookOpen, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  article: Article;
  profile: UserProfile;
  onClose: () => void;
}

export const AIInterpreterModal: React.FC<Props> = ({ article, profile, onClose }) => {
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoadingSummary(true);
      const result = await analyzeArticle(article, profile);
      if (isMounted) {
        setSummary(result);
        setLoadingSummary(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [article, profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, summary]);

  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input };
    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    const responseText = await chatWithArticle(chatHistory, userMsg.text, article, profile);
    
    const botMsg: ChatMessage = { role: 'model', text: responseText };
    setChatHistory(prev => [...prev, botMsg]);
    setChatLoading(false);
  };

  const handleSave = async () => {
      setSaving(true);
      const inquiry: SavedInquiry = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('zh-CN'),
          articleId: article.id,
          articleTitle: article.title,
          summary: summary,
          chatHistory: chatHistory
      };
      await saveInquiry(inquiry);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header (Simplified) */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 rounded-xl shrink-0">
                <Sparkles className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">AI 智能解读助手</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
                onClick={handleSave}
                disabled={loadingSummary || saved || saving}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    saved 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                }`}
            >
                {saving ? (
                   <Loader2 className="w-4 h-4 mr-1 animate-spin"/>
                ) : saved ? (
                   <Check className="w-4 h-4 mr-1"/>
                ) : (
                   <Save className="w-4 h-4 mr-1"/>
                )}
                {saved ? '已保存' : saving ? '保存中...' : '保存记录'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Panel: Summary & Metadata (Scrollable) */}
            <div className="w-full md:w-1/2 overflow-y-auto p-6 border-r border-gray-100 bg-gray-50/50">
                
                {/* 1. Original Article Metadata (Top Pinned visually in scroll) */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
                    <h3 className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        <FileText className="w-3 h-3 mr-1" /> Original Article
                    </h3>
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 text-lg leading-tight">
                            {article.title}
                        </h4>
                        
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                            <span>{article.authors.join(', ')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-brand-700 font-medium">
                            <BookOpen className="w-4 h-4 shrink-0" />
                            <span className="italic">{article.journal}</span>
                            <span className="text-gray-400 font-normal">| {article.publicationDate}</span>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-brand-500 mr-2"></span>
                        AI 深度解析
                    </h3>
                    
                    {loadingSummary ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-32 bg-gray-200 rounded w-full mt-6"></div>
                            <p className="text-center text-gray-400 text-sm mt-4">AI 正在阅读并为您生成个性化解读...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm prose-brand max-w-none text-gray-700 leading-relaxed">
                            <ReactMarkdown>{summary}</ReactMarkdown>
                        </div>
                    )}
                    
                    {!loadingSummary && (
                        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-5">
                                提醒：此摘要由 AI 生成，旨在帮助您理解，而非替代医疗诊断。具体治疗方案请务必咨询您的主治医生。
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Chat */}
            <div className="flex-1 flex flex-col bg-white border-t md:border-t-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                            <Bot className="w-5 h-5 text-brand-600" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 text-sm text-gray-800 shadow-sm max-w-[85%]">
                            我已经阅读了这篇文章。关于它对您的家庭意味着什么，您有什么想问的吗？
                        </div>
                    </div>

                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${msg.role === 'user' ? 'bg-gray-800' : 'bg-brand-100'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-brand-600" />}
                            </div>
                            <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-gray-900 text-white rounded-tr-none' 
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                            }`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    
                    {chatLoading && (
                        <div className="flex gap-3">
                             <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                                <Bot className="w-5 h-5 text-brand-600" />
                            </div>
                            <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 text-sm text-gray-500 shadow-sm">
                                <span className="animate-pulse flex items-center gap-1">
                                    思考中 <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex gap-3 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="输入问题 (例如: 这项研究对儿童安全吗？)"
                            className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-5 py-3 pr-12 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-shadow"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || chatLoading}
                            className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};