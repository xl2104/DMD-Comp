import React, { useState, useEffect, useRef } from 'react';
import { FDADrug, UserProfile, ChatMessage, SavedInquiry } from '../types';
import { analyzeDrug, chatWithContext } from '../services/geminiService';
import { saveInquiry } from '../services/authService';
import { X, Send, Bot, User, ShieldCheck, AlertTriangle, Save, Check, Pill, Factory, Clock, Microscope, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  drug: FDADrug;
  profile: UserProfile;
  onClose: () => void;
}

export const DrugInterpreterModal: React.FC<Props> = ({ drug, profile, onClose }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      const result = await analyzeDrug(drug, profile);
      if (isMounted) {
        setAnalysis(result);
        setLoading(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [drug, profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, analysis]);

  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input };
    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    const context = `药物: ${drug.brandName} (${drug.brandNameCn || 'N/A'})\n通用名: ${drug.genericName}\n适应症: ${drug.indication}\n剂量: ${drug.dosage}`;
    const responseText = await chatWithContext(chatHistory, userMsg.text, context, profile, 'drug');
    
    const botMsg: ChatMessage = { role: 'model', text: responseText };
    setChatHistory(prev => [...prev, botMsg]);
    setChatLoading(false);
  };

  const handleSave = async () => {
      setSaving(true);
      await saveInquiry({
          id: `drug-${drug.brandName}-${Date.now()}`,
          date: new Date().toLocaleDateString('zh-CN'),
          articleId: drug.brandName,
          articleTitle: `药物适配: ${drug.brandNameCn || drug.brandName}`,
          summary: analysis,
          chatHistory: chatHistory
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 rounded-xl shrink-0">
                <Pill className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">药物病情适配解读</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
                onClick={handleSave}
                disabled={loading || saved || saving}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    saved ? 'bg-green-100 text-green-700' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                }`}
            >
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : saved ? <Check className="w-4 h-4 mr-1"/> : <Save className="w-4 h-4 mr-1"/>}
                {saved ? '已保存' : '保存咨询'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-1/2 overflow-y-auto p-6 border-r border-gray-100 bg-gray-50/50">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-black text-gray-900">
                            {drug.brandNameCn || drug.brandName}
                            <span className="block text-sm font-medium text-gray-400 font-sans tracking-tight">{drug.brandName}</span>
                        </h3>
                        <div className="bg-brand-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">FDA {drug.approvalYear}</div>
                    </div>
                    <div className="space-y-3 text-sm border-t border-gray-100 pt-3">
                        <div className="flex items-start gap-2">
                            <Microscope className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                            <p className="text-gray-700 font-medium">{drug.indication}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                            <p className="text-gray-700">剂量: {drug.dosage}</p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-brand-500 mr-2"></span>
                        AI 智能适配解读
                    </h3>
                    {loading ? (
                        <div className="space-y-4 animate-pulse"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-32 bg-gray-200 rounded w-full mt-6"></div></div>
                    ) : (
                        <div className="prose prose-sm prose-brand max-w-none text-gray-700 leading-relaxed bg-white p-5 rounded-xl border border-gray-100">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white">
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm"><Bot className="w-5 h-5 text-brand-600" /></div>
                        <div className="bg-gray-100 rounded-2xl p-4 text-sm text-gray-800 shadow-sm max-w-[85%]">
                            我是您的AI助手。关于 {drug.brandName}，有什么我可以帮您的？
                        </div>
                    </div>
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 border-white ${msg.role === 'user' ? 'bg-gray-800' : 'bg-brand-100'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-brand-600" />}
                            </div>
                            <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {chatLoading && <div className="text-xs text-gray-400 italic ml-12">AI 正在根据药物标签分析中...</div>}
                </div>
                <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-3 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="请提问，例如：这个药是否要求特定的突变？"
                            className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-5 py-3 pr-12 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                        <button onClick={handleSend} disabled={!input.trim() || chatLoading} className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-lg disabled:opacity-50">
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