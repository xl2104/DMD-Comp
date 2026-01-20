import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { ProfileForm } from './components/ProfileForm';
import { ArticleCard } from './components/ArticleCard';
import { TrialCard } from './components/TrialCard';
import { DrugCard } from './components/DrugCard';
import { AIInterpreterModal } from './components/AIInterpreterModal';
import { DrugInterpreterModal } from './components/DrugInterpreterModal';
import { TrialInterpreterModal } from './components/TrialInterpreterModal';
import { SavedInquiries } from './components/SavedInquiries';
import { Logo } from './components/Logo';
import { searchArticles } from './services/pubmedService';
import { fetchDmdTrials } from './services/trialService';
import { fetchDmdDrugs } from './services/fdaService';
import { logout, getCurrentUser, getUserData, saveUserProfile } from './services/authService';
import { UserProfile, Article, UserDatabaseEntry, ClinicalTrial, FDADrug } from './types';
import { Calendar, Loader2, Sparkles, LayoutGrid, Settings, Bookmark, Microscope, Pill } from 'lucide-react';

type ViewState = 'feed' | 'trials' | 'drugs' | 'settings' | 'saved';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserDatabaseEntry | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('feed');
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [drugs, setDrugs] = useState<FDADrug[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<FDADrug | null>(null);
  const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null);
  const [timeRange, setTimeRange] = useState(1); 
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const data = getUserData();
      setUserData(data);
      if (!data?.profile) setCurrentView('settings');
    }
    setInitializing(false);
  }, []);

  useEffect(() => {
    if (!user || !userData?.profile) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentView === 'feed') {
          const data = await searchArticles(timeRange, userData.profile!.interests);
          setArticles(data);
        } else if (currentView === 'trials') {
          const data = await fetchDmdTrials();
          setTrials(data);
        } else if (currentView === 'drugs') {
          const data = await fetchDmdDrugs();
          setDrugs(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, userData, currentView, timeRange]);

  const handleLoginSuccess = () => {
    const u = getCurrentUser();
    setUser(u);
    const data = getUserData();
    setUserData(data);
    setCurrentView(data?.profile ? 'feed' : 'settings');
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setUserData(null);
  };

  const handleProfileSave = async (profile: UserProfile) => {
      await saveUserProfile(profile);
      setUserData(getUserData());
      setCurrentView('feed');
  };

  if (initializing) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;
  }

  if (!user) return <Login onLoginSuccess={handleLoginSuccess} />;

  if (!userData?.profile) {
      return (
          <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
              <ProfileForm onSave={handleProfileSave} isInitialSetup={true} />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <header className="bg-white sticky top-0 z-30 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center bg-gray-100 p-1 rounded-lg overflow-x-auto scrollbar-hide max-w-[200px] sm:max-w-none">
             <button onClick={() => setCurrentView('feed')} className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'feed' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}><LayoutGrid className="w-4 h-4 mr-1 sm:mr-2" />资讯</button>
             <button onClick={() => setCurrentView('trials')} className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'trials' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}><Microscope className="w-4 h-4 mr-1 sm:mr-2" />试验</button>
             <button onClick={() => setCurrentView('drugs')} className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'drugs' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}><Pill className="w-4 h-4 mr-1 sm:mr-2" />药物</button>
             <button onClick={() => setCurrentView('saved')} className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'saved' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}><Bookmark className="w-4 h-4 mr-1 sm:mr-2" />已存</button>
             <button onClick={() => setCurrentView('settings')} className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'settings' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}><Settings className="w-4 h-4 mr-1 sm:mr-2" />设置</button>
          </nav>
          <button onClick={handleLogout} className="text-sm text-red-500 font-medium">退出</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'feed' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg relative overflow-hidden">
                <Sparkles className="absolute top-0 right-0 opacity-10 w-64 h-64 -translate-y-10 translate-x-10" />
                <h1 className="text-2xl font-bold mb-2 relative z-10">定制研究动态</h1>
                <div className="flex gap-2 relative z-10">
                  {[1, 3, 12].map(m => (<button key={m} onClick={() => setTimeRange(m)} className={`px-3 py-1 rounded-lg text-xs font-bold ${timeRange === m ? 'bg-white text-brand-700' : 'bg-brand-900/30 text-white'}`}>{m === 12 ? '1年' : `${m}个月`}</button>))}
                </div>
            </div>
            {loading ? <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mt-20" /> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{articles.map(a => <ArticleCard key={a.id} article={a} onSelect={setSelectedArticle} />)}</div>}
          </div>
        )}

        {currentView === 'trials' && (
          <div className="animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Microscope className="w-6 h-6 text-brand-600" />全球临床试验库</h2>
            {loading ? <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mt-20" /> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{trials.map(t => <TrialCard key={t.nctId} trial={t} onSelect={setSelectedTrial} />)}</div>}
          </div>
        )}

        {currentView === 'drugs' && (
          <div className="animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Pill className="w-6 h-6 text-brand-600" />FDA 获批 DMD 药物清单</h2>
            {loading ? <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mt-20" /> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{drugs.map((d, i) => <DrugCard key={i} drug={d} onSelect={setSelectedDrug} />)}</div>}
          </div>
        )}

        {currentView === 'saved' && <SavedInquiries inquiries={userData.savedInquiries || []} />}
        {currentView === 'settings' && <ProfileForm initialData={userData.profile} onSave={handleProfileSave} />}
      </main>

      {selectedArticle && <AIInterpreterModal article={selectedArticle} profile={userData.profile} onClose={() => setSelectedArticle(null)} />}
      {selectedDrug && <DrugInterpreterModal drug={selectedDrug} profile={userData.profile} onClose={() => setSelectedDrug(null)} />}
      {selectedTrial && <TrialInterpreterModal trial={selectedTrial} profile={userData.profile} onClose={() => setSelectedTrial(null)} />}
    </div>
  );
};

export default App;