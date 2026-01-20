import React, { useState, useEffect, useRef } from 'react';
import { ClinicalTrial, UserProfile, ChatMessage, SavedInquiry } from '../types';
import { analyzeTrial, chatWithContext } from '../services/geminiService';
import { saveInquiry } from '../services/authService';
import { X, Send, Bot, User, Microscope, AlertTriangle, Save, Check, MapPin, ClipboardCheck, Info, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  trial: ClinicalTrial;
  profile: UserProfile;
  onClose: () => void;
}

export const TrialInterpreterModal: React.FC<Props> = ({ trial, profile, onClose }) => {
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
      const result = await analyzeTrial(trial, profile);
      if (isMounted) {
        setAnalysis(result);
        setLoading(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [trial, profile]);

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

    const context = `临床试验: ${trial.title}\nID: ${trial.nctId}\n标准: ${trial.eligibility}\n摘要: ${trial.summary}`;
    const responseText = await chatWithContext(chatHistory, userMsg.text, context, profile, 'trial');
    
    const botMsg: ChatMessage = { role: 'model', text: responseText };
    setChatHistory(prev => [...prev, botMsg]);
    setChatLoading(false);
  };

  const handleSave = async () => {
      setSaving(true);
      await saveInquiry({
          id: `trial-${trial.nctId}-${Date.now()}`,
          date: new Date().toLocaleDateString('zh-CN'),
          articleId: trial.nctId,
          articleTitle: `临床试验匹配: ${trial.title}`,
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
            <div className="p-2 bg-purple-100 rounded-xl shrink-0">
                <Microscope className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">临床试验匹配分析</h2>
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
                        <span className="text-xs font-mono text-gray-400">{trial.nctId}</span>
                        <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{trial.status.replace(/_/g, ' ')}</div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{trial.title}</h3>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                            <p className="text-gray-600"><span className="font-bold">阶段:</span> {trial.phase.join(', ') || '未知'}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                            <p className="text-gray-600"><span className="font-bold">中心:</span> {trial.locations.length} 个试验中心</p>
                        </div>
                        <div className="flex items-start gap-2 pt-2 border-t border-gray-50">
                            <ClipboardCheck className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                            <div className="text-xs text-gray-500">
                                <span className="font-bold block mb-1">入选标准概览:</span>
                                <p className="line-clamp-4 italic">{trial.eligibility}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-brand-500 mr-2"></span>
                        AI 深度匹配评估
                    </h3>
                    
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-32 bg-gray-200 rounded w-full mt-6"></div>
                        </div>
                    ) : (
                        <div className="prose prose-sm prose-brand max-w-none text-gray-700 bg-white p-5 rounded-xl border border-gray-100">
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
                            我是您的AI试验咨询员。关于该试验 (${trial.nctId}) 的入组要求、风险或具体流程，您可以随时问我。
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
                    {chatLoading && <div className="text-xs text-gray-400 italic ml-12">AI 正在根据试验资料分析中...</div>}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-3 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="请提问，例如：这个试验对年龄有什么严格要求？"
                            className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-5 py-3 focus:ring-2 focus:ring-brand-500 outline-none"
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