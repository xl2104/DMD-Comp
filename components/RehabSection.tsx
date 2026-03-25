
import React, { useState, useMemo } from 'react';
import { UserDatabaseEntry, RehabRecord, RehabStatus, RehabExercise } from '../types';
import { 
  Play, Timer, Trophy, CheckCircle, ChevronRight, 
  BarChart3, Activity, Dumbbell, Calendar, 
  Lock, Unlock, ArrowLeft, AlertCircle, Info,
  ChevronLeft
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { saveRehabRecord, saveRehabStatus } from '../services/authService';

interface Props {
  userData: UserDatabaseEntry;
  onUpdate: () => void;
}

type RehabView = 'dashboard' | 'stats' | 'status' | 'training';
type StatsPeriod = 'week' | 'month' | 'year';

const REHAB_VIDEOS = [
  { id: 1, title: '踝关节拉伸 (Ankle Stretch)', url: 'https://cdn.pixabay.com/video/2021/04/12/70868-537469482_large.mp4', duration: 2.5, exercises: [{ name: '踝关节拉伸', count: 15 }] },
  { id: 2, title: '腘绳肌放松 (Hamstring Routine)', url: 'https://cdn.pixabay.com/video/2020/09/16/49983-460673322_large.mp4', duration: 2.5, exercises: [{ name: '腘绳肌放松', count: 12 }] },
  { id: 3, title: '深呼吸练习 (Breathing Exercises)', url: 'https://cdn.pixabay.com/video/2021/05/20/75217-554492754_large.mp4', duration: 2.5, exercises: [{ name: '深呼吸练习', count: 10 }] },
  { id: 4, title: '上肢活动度 (Upper Limb ROM)', url: 'https://cdn.pixabay.com/video/2020/06/17/42436-432856277_large.mp4', duration: 2.5, exercises: [{ name: '上肢活动度', count: 20 }] },
];

const LEVELS = [
  { id: 1, name: '10分钟初级1', duration: 10, description: '基础拉伸与呼吸' },
  { id: 2, name: '10分钟初级2', duration: 10, description: '进阶关节活动度' },
  { id: 3, name: '10分钟初级3', duration: 10, description: '全身稳定性训练' },
];

export const RehabSection: React.FC<Props> = ({ userData, onUpdate }) => {
  const [view, setView] = useState<RehabView>('dashboard');
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('week');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [statusForm, setStatusForm] = useState({
    hasJointPain: false,
    jointPainDetails: '',
    hasJointContracture: false,
    jointContractureDetails: ''
  });

  const records = userData.rehabRecords || [];
  const statusHistory = userData.rehabStatusHistory || [];

  // Helper: Calculate consecutive days for a specific level (Unique days only)
  const getConsecutiveDays = (level: number) => {
    if (records.length === 0) return 0;
    
    const levelRecords = records.filter(r => r.level === level);
    if (levelRecords.length === 0) return 0;

    // Get unique dates (YYYY-MM-DD)
    const uniqueDates = Array.from(new Set(levelRecords.map(r => new Date(r.date).toISOString().split('T')[0])));
    
    // Sort by date descending
    const sorted = uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let count = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstRecordDate = new Date(sorted[0]);
    firstRecordDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - firstRecordDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0; // Streak broken

    let currentStreakDate = firstRecordDate;
    count = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i]);
      prevDate.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((currentStreakDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        count++;
        currentStreakDate = prevDate;
      } else if (diff > 1) {
        break;
      }
    }
    return count;
  };

  const level1Streak = getConsecutiveDays(1);
  const level2Streak = getConsecutiveDays(2);

  const isLevel2Unlocked = level1Streak >= 7;
  const isLevel3Unlocked = level2Streak >= 7;

  // Stats Data Calculation with Mock Data Fallback
  const statsData = useMemo(() => {
    const now = new Date();
    let filterDate = new Date();
    
    if (statsPeriod === 'week') filterDate.setDate(now.getDate() - 7);
    else if (statsPeriod === 'month') filterDate.setMonth(now.getMonth() - 1);
    else filterDate.setFullYear(now.getFullYear() - 1);

    const filtered = records.filter(r => new Date(r.date) >= filterDate);
    
    const totalMinutes = filtered.reduce((acc, r) => acc + r.duration, 0);
    const totalSessions = filtered.length;

    // Group by day/month for chart
    const chartDataMap: Record<string, { name: string, minutes: number, count: number }> = {};
    
    filtered.forEach(r => {
      const d = new Date(r.date);
      const key = statsPeriod === 'year' 
        ? `${d.getFullYear()}-${d.getMonth() + 1}`
        : d.toLocaleDateString();
      
      if (!chartDataMap[key]) {
        chartDataMap[key] = { 
          name: statsPeriod === 'year' ? `${d.getFullYear()}年` : d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }), 
          minutes: 0, 
          count: 0 
        };
      }
      chartDataMap[key].minutes += r.duration;
      chartDataMap[key].count += 1;
    });

    let chartData = Object.values(chartDataMap).sort((a, b) => statsPeriod === 'year' ? 0 : new Date(a.name).getTime() - new Date(b.name).getTime());

    // Mock Data Fallback if no data
    if (chartData.length === 0) {
      if (statsPeriod === 'week') {
        const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        chartData = weekdays.map(w => ({ name: w, minutes: Math.floor(Math.random() * 10) + 5, count: 1 }));
      } else if (statsPeriod === 'month') {
        for (let i = 1; i <= 12; i++) {
          chartData.push({ name: `${i}月`, minutes: Math.floor(Math.random() * 50) + 20, count: Math.floor(Math.random() * 5) });
        }
      } else if (statsPeriod === 'year') {
        chartData = [
          { name: '2025年', minutes: 450, count: 45 },
          { name: '2026年', minutes: 120, count: 12 },
          { name: '2027年', minutes: 0, count: 0 },
        ];
      }
    }

    // Aggregate exercises
    const exerciseMap: Record<string, number> = {};
    filtered.forEach(r => {
      r.exercises.forEach(e => {
        exerciseMap[e.name] = (exerciseMap[e.name] || 0) + e.count;
      });
    });
    const exerciseList = Object.entries(exerciseMap).map(([name, count]) => ({ name, count }));

    return { totalMinutes, totalSessions, chartData, exerciseList };
  }, [records, statsPeriod]);

  const handleSaveStatus = async () => {
    await saveRehabStatus({
      date: new Date().toISOString(),
      ...statusForm
    });
    onUpdate();
    setView('dashboard');
  };

  const handleCompleteTraining = async () => {
    if (!selectedLevel) return;
    const levelInfo = LEVELS.find(l => l.id === selectedLevel);
    await saveRehabRecord({
      date: new Date().toISOString(),
      duration: levelInfo?.duration || 10,
      level: selectedLevel,
      exercises: REHAB_VIDEOS.flatMap(v => v.exercises)
    });
    onUpdate();
    setIsTraining(false);
    setShowCongrats(true);
  };

  // Dashboard View
  if (view === 'dashboard') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black text-gray-900">DMD康复定制中心</h1>
            <div className="flex items-center gap-2 text-brand-600 bg-brand-50 px-3 py-1 rounded-full text-sm font-bold">
              <Activity className="w-4 h-4" />
              今日状态良好
            </div>
          </div>
          <p className="text-gray-500 font-medium">为孩子定制的居家康复跟练和打卡计划。</p>
        </div>

        <div className="space-y-6">
          {/* Main Action: Training (Large) */}
          <button 
            onClick={() => setView('training')}
            className="w-full group bg-gradient-to-br from-brand-500 to-brand-700 p-8 rounded-[2rem] shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-1 transition-all text-left text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Play className="w-32 h-32 fill-current" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Play className="w-8 h-8 text-white fill-current" />
              </div>
              <h3 className="text-3xl font-black mb-2">进入今日跟练</h3>
              <p className="text-lg text-white/80 mb-6">开始 10 分钟定制康复计划，坚持就是胜利</p>
              <div className="inline-flex items-center bg-white/20 px-6 py-2 rounded-xl font-bold text-sm backdrop-blur-sm">
                立即开始 <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </button>

          {/* Secondary Actions: Stats & Status (Smaller) */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setView('stats')}
              className="group bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all text-left"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1">打卡记录</h3>
              <div className="flex items-center text-blue-600 font-bold text-xs">
                查看总结 <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </button>

            <button 
              onClick={() => setView('status')}
              className="group bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all text-left"
            >
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1">状态更新</h3>
              <div className="flex items-center text-amber-600 font-bold text-xs">
                立即记录 <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity Mini-List */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-500" />
            最近动态
          </h3>
          <div className="space-y-4">
            {records.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{LEVELS.find(l => l.id === r.level)?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()} · {r.duration}分钟</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
            {records.length === 0 && (
              <p className="text-center text-gray-400 py-4 italic">暂无打卡记录，开始你的第一次训练吧！</p>
            )}
          </div>
        </div>

        {/* Congrats Modal */}
        {showCongrats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
              <div className="w-24 h-24 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand-500/30">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">太棒了！</h2>
              <p className="text-gray-500 mb-8 font-medium">今日打卡成功，谢谢参与，明天我们再见。坚持康复是延缓病程最有效的方式。加油！</p>
              <button 
                onClick={() => { setShowCongrats(false); setView('dashboard'); }}
                className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
              >
                返回主页
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Stats View
  if (view === 'stats') {
    return (
      <div className="space-y-6 animate-in fade-in">
        <button onClick={() => setView('dashboard')} className="flex items-center text-gray-500 font-bold hover:text-brand-600 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" /> 返回面板
        </button>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900">康复总结</h2>
              <p className="text-gray-500">坚持就是胜利，查看你的进步</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {(['week', 'month', 'year'] as StatsPeriod[]).map(p => (
                <button 
                  key={p}
                  onClick={() => setStatsPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statsPeriod === p ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}
                >
                  {p === 'week' ? '周' : p === 'month' ? '月' : '年'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100">
              <span className="text-brand-600 text-sm font-bold uppercase tracking-wider block mb-1">总完成次数</span>
              <span className="text-3xl font-black text-brand-900">{statsData.totalSessions} <small className="text-sm font-normal">次</small></span>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <span className="text-blue-600 text-sm font-bold uppercase tracking-wider block mb-1">总训练时长</span>
              <span className="text-3xl font-black text-blue-900">{statsData.totalMinutes} <small className="text-sm font-normal">分钟</small></span>
            </div>
          </div>

          <div className="h-64 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                  {statsData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#14b8a6' : '#0d9488'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-4">完成动作统计</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {statsData.exerciseList.map((ex, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="font-bold text-gray-700">{ex.name}</span>
                  <span className="text-brand-600 font-black">{ex.count} <small className="text-xs font-normal">次</small></span>
                </div>
              ))}
              {statsData.exerciseList.length === 0 && (
                <p className="text-gray-400 italic text-sm">该时段暂无动作数据</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Status Update View
  if (view === 'status') {
    return (
      <div className="space-y-6 animate-in fade-in">
        <button onClick={() => setView('dashboard')} className="flex items-center text-gray-500 font-bold hover:text-brand-600 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" /> 返回面板
        </button>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 mb-2">基础状态更新</h2>
          <p className="text-gray-500 mb-8">记录最近的身体变化，帮助我们更好地调整康复建议</p>

          <div className="space-y-8">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <label className="font-black text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  最近有无关节疼痛？
                </label>
                <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                  <button 
                    onClick={() => setStatusForm(prev => ({ ...prev, hasJointPain: true }))}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${statusForm.hasJointPain ? 'bg-amber-500 text-white' : 'text-gray-500'}`}
                  >
                    有
                  </button>
                  <button 
                    onClick={() => setStatusForm(prev => ({ ...prev, hasJointPain: false }))}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!statusForm.hasJointPain ? 'bg-gray-200 text-gray-700' : 'text-gray-500'}`}
                  >
                    无
                  </button>
                </div>
              </div>
              {statusForm.hasJointPain && (
                <textarea 
                  placeholder="请描述疼痛部位及频率..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all h-24"
                  value={statusForm.jointPainDetails}
                  onChange={e => setStatusForm(prev => ({ ...prev, jointPainDetails: e.target.value }))}
                />
              )}
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <label className="font-black text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  最近有关节挛缩情况？
                </label>
                <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                  <button 
                    onClick={() => setStatusForm(prev => ({ ...prev, hasJointContracture: true }))}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${statusForm.hasJointContracture ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                  >
                    有
                  </button>
                  <button 
                    onClick={() => setStatusForm(prev => ({ ...prev, hasJointContracture: false }))}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!statusForm.hasJointContracture ? 'bg-gray-200 text-gray-700' : 'text-gray-500'}`}
                  >
                    无
                  </button>
                </div>
              </div>
              {statusForm.hasJointContracture && (
                <textarea 
                  placeholder="请描述挛缩部位（如踝关节、膝关节等）..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24"
                  value={statusForm.jointContractureDetails}
                  onChange={e => setStatusForm(prev => ({ ...prev, jointContractureDetails: e.target.value }))}
                />
              )}
            </div>

            <button 
              onClick={handleSaveStatus}
              className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
            >
              保存并更新
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Training View
  if (view === 'training') {
    if (isTraining && selectedLevel) {
      const levelInfo = LEVELS.find(l => l.id === selectedLevel);
      return (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                <Timer className="w-6 h-6 text-brand-600 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-gray-900">{levelInfo?.name}</h3>
                <p className="text-xs text-gray-400">正在播放第 {currentVideoIdx + 1} / {REHAB_VIDEOS.length} 个视频</p>
              </div>
            </div>
            <div className="text-3xl font-black text-brand-700 bg-white px-6 py-2 rounded-2xl shadow-sm border border-gray-100 tabular-nums">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl group">
            <video 
              key={REHAB_VIDEOS[currentVideoIdx].url}
              autoPlay 
              muted 
              playsInline
              className="w-full h-full object-cover opacity-90"
              onEnded={() => {
                if (currentVideoIdx < REHAB_VIDEOS.length - 1) {
                  setCurrentVideoIdx(prev => prev + 1);
                  setTimeLeft(150);
                } else {
                  handleCompleteTraining();
                }
              }}
            >
              <source src={REHAB_VIDEOS[currentVideoIdx].url} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {REHAB_VIDEOS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${i === currentVideoIdx ? 'bg-brand-600' : i < currentVideoIdx ? 'bg-brand-200' : 'bg-gray-200'}`}
              ></div>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => setIsTraining(false)}
              className="text-gray-400 text-sm font-medium hover:text-red-500 transition-colors"
            >
              终止练习 (提前结束)
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in">
        <button onClick={() => setView('dashboard')} className="flex items-center text-gray-500 font-bold hover:text-brand-600 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" /> 返回面板
        </button>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 mb-2">今日跟练</h2>
          <p className="text-gray-500 mb-8">连续打卡解锁更高等级，循序渐进效果更佳</p>

          <div className="space-y-4">
            {LEVELS.map(level => {
              const isUnlocked = level.id === 1 || (level.id === 2 && isLevel2Unlocked) || (level.id === 3 && isLevel3Unlocked);
              const streak = level.id === 1 ? level1Streak : level.id === 2 ? level2Streak : 0;
              const needed = 7;

              return (
                <div 
                  key={level.id}
                  className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${
                    isUnlocked 
                      ? selectedLevel === level.id 
                        ? 'border-brand-500 bg-brand-50' 
                        : 'border-gray-100 hover:border-brand-200 bg-white'
                      : 'border-gray-100 bg-gray-50 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUnlocked ? 'bg-brand-100 text-brand-600' : 'bg-gray-200 text-gray-400'}`}>
                        {isUnlocked ? <Play className="w-6 h-6 fill-current" /> : <Lock className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className={`font-black ${isUnlocked ? 'text-gray-900' : 'text-gray-400'}`}>{level.name}</h4>
                        <p className="text-xs text-gray-500">{level.description}</p>
                      </div>
                    </div>
                    {isUnlocked ? (
                      <button 
                        onClick={() => setSelectedLevel(level.id)}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${selectedLevel === level.id ? 'bg-brand-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      >
                        选择
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-400 block mb-1">解锁进度</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500" 
                            style={{ width: `${(streak / needed) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-amber-600 font-bold">{streak}/{needed} 天</span>
                      </div>
                    )}
                  </div>
                  {!isUnlocked && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                      <Unlock className="w-3 h-3 text-amber-600" />
                      <span className="text-[10px] text-amber-700 font-bold">连续完成 7 天 {LEVELS[level.id - 2].name} 即可解锁</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button 
            disabled={!selectedLevel}
            onClick={() => {
              setIsTraining(true);
              setCurrentVideoIdx(0);
              setTimeLeft(150);
            }}
            className="w-full mt-10 bg-brand-600 text-white py-4 rounded-2xl font-black hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-500/20"
          >
            <Play className="w-5 h-5 fill-current" />
            开始今日跟练
          </button>
        </div>
      </div>
    );
  }

  return null;
};
