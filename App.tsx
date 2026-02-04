
import React, { useState, useEffect } from 'react';
import { Stats, Activity, User } from './types';
import AdminDashboard from './components/AdminDashboard';
import AuthScreen from './components/AuthScreen';

const App: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    tons: '20,000',
    years: '500',
    prob: '0'
  });
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const savedStats = localStorage.getItem('oc_stats');
    if (savedStats) setStats(JSON.parse(savedStats));

    const savedActivities = localStorage.getItem('oc_activities');
    if (savedActivities) setActivities(JSON.parse(savedActivities));

    const savedSession = localStorage.getItem('oc_session');
    if (savedSession) setCurrentUser(JSON.parse(savedSession));
  }, []);

  const updateStats = (newStats: Stats) => {
    setStats(newStats);
    localStorage.setItem('oc_stats', JSON.stringify(newStats));
  };

  const addActivity = (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const freshActivity: Activity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    const newActivities = [freshActivity, ...activities];
    setActivities(newActivities);
    localStorage.setItem('oc_activities', JSON.stringify(newActivities));
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem('oc_activities');
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '1234') {
      setIsAdminOpen(true);
      setIsAdminLoginOpen(false);
      setAdminPassword('');
    } else {
      alert('접근 권한이 없습니다.');
      setAdminPassword('');
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('oc_session', JSON.stringify(user));
    alert(`${user.name}님, 환영합니다!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('oc_session');
    alert('로그아웃 되었습니다.');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-8 flex justify-between items-center mix-blend-difference">
        <div 
          className="text-3xl font-black tracking-tighter cursor-pointer font-title z-50 relative hover:text-cyan-400 transition"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          OC™
        </div>
        
        <div className="flex items-center gap-8 font-title text-sm tracking-widest">
           <button onClick={() => scrollToSection('crisis')} className="hidden md:block hover:text-cyan-400 transition">CRISIS</button>
           <button onClick={() => scrollToSection('activities')} className="hidden md:block hover:text-cyan-400 transition">REWARDS</button>
           
           {currentUser ? (
             <div className="flex items-center gap-4">
                <span className="text-cyan-400 font-bold border-r border-white/20 pr-4">{currentUser.name.toUpperCase()} 회원</span>
                <button onClick={handleLogout} className="hover:text-red-500 transition">LOGOUT</button>
             </div>
           ) : (
             <button onClick={() => setIsAuthOpen(true)} className="px-5 py-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition">JOIN</button>
           )}
           
           <button onClick={() => setIsAdminLoginOpen(true)} className="text-gray-500 hover:text-white transition uppercase">[ Admin ]</button>
        </div>
      </nav>

      {/* Custom Admin Login Modal */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-sm p-8 text-center font-body">
            <h2 className="font-title text-2xl text-cyan-400 mb-2 tracking-[0.2em]">접근 제한 영역</h2>
            <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest">보안 인증 키를 입력하십시오</p>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <input 
                type="password" 
                autoFocus
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="••••"
              />
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 bg-cyan-500 text-black py-4 rounded-xl font-bold font-title hover:bg-cyan-400 transition-all active:scale-95"
                >
                  인증하기
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsAdminLoginOpen(false); setAdminPassword(''); }}
                  className="px-6 border border-white/10 text-gray-500 hover:text-white rounded-xl transition-colors font-title"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdminOpen && (
        <AdminDashboard 
          stats={stats} 
          onClose={() => setIsAdminOpen(false)} 
          updateStats={updateStats}
          addActivity={addActivity}
          clearActivities={clearActivities}
        />
      )}

      {isAuthOpen && (
        <AuthScreen 
          onClose={() => setIsAuthOpen(false)} 
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Hero Section */}
      <header id="home" className="relative w-full h-[110vh] flex flex-col items-center overflow-hidden bg-black">
        <div className="w-full pt-44 px-4 pointer-events-none z-0">
          <h1 className="font-title text-[18vw] leading-[0.7] font-black text-white mix-blend-overlay opacity-20 select-none text-center animate-in fade-in slide-in-from-top-20 duration-1000">
            OCEAN<br />CLEAN
          </h1>
        </div>
        
        <div className="absolute bottom-44 left-0 w-full z-10 px-8 md:px-24">
          <div className="max-w-2xl mx-auto md:mx-0">
            <div className="flex justify-center md:justify-start">
              <div className="inline-block px-4 py-1 border border-cyan-500/30 bg-cyan-500/10 rounded-full mb-8 animate-pulse">
                  <p className="text-cyan-400 tracking-[0.4em] text-[10px] font-bold font-title uppercase">EST. 2026 JEJU ISLAND PROJECT</p>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-4xl font-bold mb-10 leading-[1.3] font-body tracking-tight text-center md:text-left">
              지금 당신이 보고 있는 제주의 바다,<br />
              <span className="text-gray-500">10년 뒤에는 볼 수 없을지도 모릅니다.</span>
            </h3>

            <div className="flex flex-col md:flex-row gap-12 items-center">
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm font-body text-center md:text-left">
                  제주 해양 쓰레기 연간 2만 톤. 방치하면 재앙이 되지만, 수거하면 자원이 됩니다.
                  OC는 환경 정화 활동을 '수익이 창출되는 전문적인 일터'로 바꿉니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button onClick={() => scrollToSection('activities')} className="bg-cyan-500 text-black px-10 py-4 rounded-full text-sm font-bold hover:bg-cyan-400 transition-all font-body active:scale-95 shadow-lg shadow-cyan-500/20">
                    보상금 지도
                  </button>
                  {!currentUser && (
                    <button onClick={() => setIsAuthOpen(true)} className="bg-white text-black px-10 py-4 rounded-full text-sm font-bold hover:bg-gray-200 transition-all font-body active:scale-95">
                      회원 등록하기
                    </button>
                  )}
                </div>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-0 pointer-events-none"></div>
        <div className="absolute inset-0 -z-10 opacity-50 scale-110">
          <img src="https://images.unsplash.com/photo-1484291470158-b8f8d608850d?q=80&w=2070&auto=format&fit=crop" alt="Ocean background" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Marquee Section */}
      <section className="py-8 border-y border-white/10 bg-[#0a0a0a]">
        <div className="marquee-container">
          <div className="marquee-content font-title text-5xl text-transparent stroke-text">
            WARNING: ISLAND OF TRASH &nbsp; • &nbsp; SAVE THE OCEAN &nbsp; • &nbsp; BECOME A MEMBER &nbsp; • &nbsp; CLAIM YOUR REWARD &nbsp; • &nbsp; 
            WARNING: ISLAND OF TRASH &nbsp; • &nbsp; SAVE THE OCEAN &nbsp; • &nbsp; BECOME A MEMBER &nbsp; • &nbsp; CLAIM YOUR REWARD &nbsp; • &nbsp; 
          </div>
        </div>
      </section>

      {/* Crisis Section */}
      <section id="crisis" className="pt-32 pb-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-24 text-center md:text-left">
          <h2 className="font-title text-7xl md:text-9xl mb-8 leading-none">THE<br /><span className="text-red-600">CRISIS</span></h2>
          <p className="text-xl md:text-2xl font-bold text-gray-300 font-body mb-2">"우리가 외면한 사이, 바다는 질식하고 있습니다."</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 border-b border-gray-800 pb-16">
          <div className="group text-center md:text-left">
            <div className="font-title text-7xl md:text-8xl text-white mb-2 group-hover:text-cyan-400 transition-colors">
              {stats.tons}<span className="text-2xl align-top ml-2">TONS</span>
            </div>
            <p className="text-gray-400 text-sm font-body uppercase tracking-widest">매년 밀려오는 쓰레기 무게</p>
          </div>
          <div className="group text-center md:text-left">
            <div className="font-title text-7xl md:text-8xl text-white mb-2 group-hover:text-cyan-400 transition-colors">
              {stats.years}<span className="text-2xl align-top ml-2">YEARS</span>
            </div>
            <p className="text-gray-400 text-sm font-body uppercase tracking-widest">플라스틱 분해 소요 시간</p>
          </div>
          <div className="group text-center md:text-left">
            <div className="font-title text-7xl md:text-8xl text-white mb-2 group-hover:text-cyan-400 transition-colors">
              {stats.prob}<span className="text-2xl align-top ml-2">%</span>
            </div>
            <p className="text-gray-400 text-sm font-body uppercase tracking-widest">방치 시 해양 생태계 생존 확률</p>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="pt-8 pb-32 px-6 bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-20 gap-8">
            <div className="text-center md:text-left w-full">
              <h2 className="font-title text-6xl sm:text-7xl md:text-9xl">ACTIVITIES</h2>
              <p className="font-body text-cyan-500 text-xl sm:text-2xl font-bold mt-4 uppercase tracking-tighter">LIVE REWARDS (실시간 보상 활동)</p>
            </div>
          </div>

          <div id="activity-list" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
            {activities.length > 0 ? (
              activities.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden bg-gray-900 aspect-[3/4] mb-4 rounded-xl border border-white/10">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-3 left-3 bg-white text-black px-2 py-1 text-[10px] md:text-xs font-bold font-title shadow-2xl">
                      ₩ {item.price}
                    </div>
                  </div>
                  <h3 className="font-title text-base md:text-lg mb-1 group-hover:text-cyan-400 transition-colors uppercase truncate">{item.title}</h3>
                  <p className="text-gray-500 text-[10px] md:text-xs font-body line-clamp-1">{item.desc}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 border border-dashed border-gray-800 rounded-3xl">
                <p className="text-gray-600 font-body">현재 활성화된 보상 활동이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-black py-40 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
            <div className="text-center md:text-left">
              <h2 className="font-title text-7xl md:text-[9vw] font-black leading-[0.9] mb-12 tracking-tighter">
                READY TO<br /><span className="text-cyan-600">CLEAN?</span>
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-black text-white px-12 py-7 rounded-full font-bold font-title text-3xl hover:bg-cyan-600 hover:scale-105 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-6 group w-full sm:w-auto"
                >
                  {currentUser ? 'MISSION CENTER' : 'JOIN THE PROJECT'}
                  <div className="bg-white/10 p-2 rounded-full group-hover:bg-black/20 transition-colors">
                    <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-end text-center md:text-right">
              <p className="text-3xl md:text-4xl font-bold leading-tight font-body italic mb-8">
                "망설이는 순간에도 파도는<br />쓰레기를 싣고 옵니다."
              </p>
              <div className="text-gray-400 text-sm font-title tracking-widest space-y-2">
                <p>JEJU MARINE PRESERVATION UNIT</p>
                <p>OC™ SINCE 2024</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-12 flex flex-col md:flex-row justify-between gap-8 text-xs font-bold uppercase tracking-[0.3em] font-title text-center md:text-left">
            <div className="flex justify-center md:justify-start gap-10 text-gray-400">
               <a href="#" className="hover:text-black transition">Terms</a>
               <a href="#" className="hover:text-black transition">Privacy</a>
               <a href="#" className="hover:text-black transition">Support</a>
            </div>
            <div className="text-gray-300">
              © 2024 OC PROJECT. ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
