import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { ProfileForm } from './components/ProfileForm';
import { ArticleCard } from './components/ArticleCard';
import { AIInterpreterModal } from './components/AIInterpreterModal';
import { SavedInquiries } from './components/SavedInquiries';
import { Logo } from './components/Logo';
import { searchArticles } from './services/pubmedService';
import { logout, getCurrentUser, getUserData, saveUserProfile } from './services/authService';
import { UserProfile, Article, UserDatabaseEntry } from './types';
import { Calendar, Loader2, Sparkles, LayoutGrid, Settings, Bookmark } from 'lucide-react';

type ViewState = 'feed' | 'settings' | 'saved';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserDatabaseEntry | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('feed');
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [timeRange, setTimeRange] = useState(1); 
  const [initializing, setInitializing] = useState(true);

  // Initialize User from session
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const data = getUserData();
      setUserData(data);
      if (!data?.profile) {
        // Force view to settings/setup if no profile
        setCurrentView('settings');
      }
    }
    setInitializing(false);
  }, []);

  // Fetch Feed Logic
  useEffect(() => {
    if (user && userData?.profile && currentView === 'feed') {
      const fetchFeed = async () => {
        setLoadingFeed(true);
        try {
          const data = await searchArticles(timeRange, userData.profile!.interests);
          setArticles(data);
        } catch (e) {
          console.error(e);
        } finally {
            setLoadingFeed(false);
        }
      };
      fetchFeed();
    }
  }, [user, userData, currentView, timeRange]);

  const handleLoginSuccess = () => {
    const u = getCurrentUser();
    setUser(u);
    const data = getUserData();
    setUserData(data);
    if (!data?.profile) {
        setCurrentView('settings');
    } else {
        setCurrentView('feed');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setUserData(null);
    setArticles([]);
  };

  const handleProfileSave = async (profile: UserProfile) => {
      await saveUserProfile(profile);
      // Reload local user data
      setUserData(getUserData());
      setCurrentView('feed');
  };

  // Update button logic (Refresh data)
  const handleUpdate = () => {
      if (currentView === 'feed') {
        // Trigger re-fetch
        setLoadingFeed(true);
        searchArticles(timeRange, userData?.profile?.interests || [])
            .then(data => {
                setArticles(data);
                setLoadingFeed(false);
            });
      }
      // Also refresh user data in case inquiries were saved
      setUserData(getUserData());
  };

  if (initializing) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>;
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Initial Onboarding View
  if (!userData?.profile) {
      return (
          <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
              <ProfileForm onSave={handleProfileSave} isInitialSetup={true} />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      
      {/* Navigation */}
      <header className="bg-white sticky top-0 z-30 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-2 md:gap-6">
             <nav className="flex items-center bg-gray-100 p-1 rounded-lg">
                 <button 
                    onClick={() => setCurrentView('feed')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'feed' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    主页
                 </button>
                 <button 
                    onClick={() => setCurrentView('saved')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'saved' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    <Bookmark className="w-4 h-4 mr-2" />
                    已保存
                 </button>
                 <button 
                    onClick={() => setCurrentView('settings')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'settings' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    <Settings className="w-4 h-4 mr-2" />
                    设置
                 </button>
             </nav>
             
             <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

             <div className="flex items-center gap-3">
                 <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-700">{user}</span>
                    <span className="text-[10px] text-gray-400">已同步</span>
                 </div>
                 <button 
                    onClick={handleLogout}
                    className="text-sm text-red-500 hover:text-red-700 font-medium whitespace-nowrap"
                 >
                    退出
                 </button>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: SETTINGS */}
        {currentView === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">个人设置</h2>
                <ProfileForm initialData={userData.profile} onSave={handleProfileSave} />
            </div>
        )}

        {/* VIEW: SAVED */}
        {currentView === 'saved' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SavedInquiries inquiries={userData.savedInquiries || []} />
            </div>
        )}

        {/* VIEW: FEED (MAIN) */}
        {currentView === 'feed' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {/* Intro Banner */}
                <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                        <Sparkles className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold mb-2">为您定制的最新研究动态</h1>
                        <p className="text-brand-100 text-sm md:text-base leading-relaxed mb-6 max-w-2xl">
                            我们每周扫描顶级医学期刊，用通俗易懂的语言为您解读DMD领域的最新进展。
                        </p>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-medium text-brand-200 uppercase mr-2">时间范围:</span>
                            <button onClick={() => setTimeRange(1)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${timeRange === 1 ? 'bg-white text-brand-700' : 'bg-brand-900/30 text-white hover:bg-brand-700'}`}>最近1个月</button>
                            <button onClick={() => setTimeRange(3)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${timeRange === 3 ? 'bg-white text-brand-700' : 'bg-brand-900/30 text-white hover:bg-brand-700'}`}>最近3个月</button>
                            <button onClick={() => setTimeRange(12)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${timeRange === 12 ? 'bg-white text-brand-700' : 'bg-brand-900/30 text-white hover:bg-brand-700'}`}>最近1年</button>
                            
                            <div className="flex-grow"></div>
                            
                            <button 
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center"
                            >
                                <Loader2 className={`w-4 h-4 mr-2 ${loadingFeed ? 'animate-spin' : ''}`} />
                                更新数据
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        最新文章推送
                    </h2>
                    <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                        已找到 {articles.length} 条相关结果
                    </div>
                </div>

                {/* Feed Grid */}
                {loadingFeed ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
                        <p className="text-gray-500">正在扫描 PubMed 最新数据库...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map(article => (
                            <ArticleCard 
                                key={article.id} 
                                article={article} 
                                onSelect={setSelectedArticle} 
                            />
                        ))}
                    </div>
                )}
                
                {!loadingFeed && articles.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">该时间段内暂无新文章。</p>
                        <button 
                            onClick={() => setTimeRange(12)}
                            className="mt-4 text-brand-600 font-medium hover:underline"
                        >
                            尝试查看过去一年的数据
                        </button>
                    </div>
                )}
            </div>
        )}

      </main>

      {/* AI Modal */}
      {selectedArticle && userData?.profile && (
        <AIInterpreterModal 
            article={selectedArticle} 
            profile={userData.profile} 
            onClose={() => {
                setSelectedArticle(null);
                // Refresh data when modal closes to reflect any saved inquiries immediately
                setUserData(getUserData());
            }} 
        />
      )}

    </div>
  );
};

export default App;