
import React, { useState, useEffect } from 'react';
import { Stats, Activity, Member, User } from '../types';
import { generateBountyDescription } from '../services/geminiService';

interface AdminDashboardProps {
  onClose: () => void;
  stats: Stats;
  updateStats: (newStats: Stats) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  clearActivities: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onClose, 
  addActivity, 
  clearActivities 
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'members'>('content');
  const [members, setMembers] = useState<Member[]>([]);
  const [newActivity, setNewActivity] = useState({
    title: '',
    desc: '',
    price: '',
    img: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1974&auto=format&fit=crop'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Load actual users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('oc_users') || '[]');
    // Map User type to Member type for the UI
    const mappedMembers: Member[] = storedUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      rank: u.rank || 'ROOKIE',
      contribution: u.contribution || '0kg',
      joinedAt: u.joinedAt || '2024.01.01'
    }));
    setMembers(mappedMembers);
  }, [activeTab]); // Refresh when switching to members tab

  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value });
  };

  const handleAddActivity = () => {
    if (!newActivity.title) return alert('작전명을 입력해주세요.');
    addActivity(newActivity);
    setNewActivity({
      title: '',
      desc: '',
      price: '',
      img: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1974&auto=format&fit=crop'
    });
    alert('활동이 성공적으로 추가되었습니다!');
  };

  const handleAiDescription = async () => {
    if (!newActivity.title) return alert('먼저 작전명을 입력해주세요.');
    setIsGenerating(true);
    const desc = await generateBountyDescription(newActivity.title);
    setNewActivity(prev => ({ ...prev, desc }));
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 overflow-y-auto p-4 md:p-12 flex items-start justify-center backdrop-blur-md">
      <div className="w-full max-w-5xl bg-[#0a0a0a] min-h-[80vh] p-8 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300 my-10 font-body">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-4xl font-title text-cyan-400 tracking-tighter">OC CONTROL HUB</h2>
            <p className="text-gray-500 text-xs font-title tracking-[0.3em] mt-1 uppercase">보안 등급: ALPHA-01</p>
          </div>
          
          <div className="flex items-center gap-4 p-1 bg-white/5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('content')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              보상금 관리
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'members' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              회원 목록
            </button>
            <button onClick={onClose} className="ml-4 pr-4 text-gray-400 hover:text-white transition-colors">✕</button>
          </div>
        </div>

        {activeTab === 'content' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Bounties Section */}
            <div>
              <h3 className="text-sm font-title tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                실시간 보상금 작전 배치
              </h3>
              <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-600 font-bold uppercase">작전명</label>
                    <input 
                      className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors"
                      name="title" 
                      value={newActivity.title} 
                      onChange={handleActivityChange} 
                      placeholder="예: 서귀포 심해 정화 작전" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-600 font-bold uppercase">보상금 액수 (₩)</label>
                    <input 
                      className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors font-title"
                      name="price" 
                      value={newActivity.price} 
                      onChange={handleActivityChange} 
                      placeholder="150,000" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-600 font-bold uppercase">작전 브리핑 (상세 설명)</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors pr-32"
                      name="desc" 
                      value={newActivity.desc} 
                      onChange={handleActivityChange} 
                      placeholder="작전의 목적과 세부 내용을 입력하세요..." 
                    />
                    <button 
                      onClick={handleAiDescription}
                      disabled={isGenerating}
                      className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-500/10 text-cyan-400 rounded-lg text-[10px] font-black font-title border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-30 transition-all"
                    >
                      {isGenerating ? '분석 중...' : 'AI 자동 생성'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-600 font-bold uppercase">참조 이미지 URL</label>
                  <input 
                    className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors text-xs"
                    name="img" 
                    value={newActivity.img} 
                    onChange={handleActivityChange} 
                    placeholder="https://..." 
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleAddActivity}
                    className="flex-1 bg-cyan-500 text-black font-black py-4 rounded-xl font-title hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20"
                  >
                    보상금 작전 배치하기
                  </button>
                  <button 
                    onClick={() => { if(confirm('정말로 모든 활성 보상금을 삭제하시겠습니까?')) clearActivities(); }}
                    className="px-8 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl font-title text-sm"
                  >
                    전체 삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-title tracking-widest text-gray-500 uppercase">등록된 회원 데이터베이스</h3>
              <div className="px-4 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                <span className="text-[10px] font-black text-cyan-400 font-title">{members.length}명의 회원 활동 중</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {members.length > 0 ? (
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] font-title text-gray-600 tracking-widest uppercase">
                      <th className="px-6 py-4">등급</th>
                      <th className="px-6 py-4">이름</th>
                      <th className="px-6 py-4">연락처 (이메일)</th>
                      <th className="px-6 py-4">총 수거 기여도</th>
                      <th className="px-6 py-4">가입일</th>
                      <th className="px-6 py-4 text-right">상태</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-sm">
                    {members.map((member) => (
                      <tr key={member.id} className="bg-white/5 hover:bg-white/[0.08] transition-colors group">
                        <td className="px-6 py-5 rounded-l-2xl">
                          <span className={`px-3 py-1 rounded text-[10px] font-black font-title ${
                            member.rank === 'MASTER' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            member.rank === 'ELITE' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {member.rank}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {member.name}
                        </td>
                        <td className="px-6 py-5 text-gray-400">
                          {member.email}
                        </td>
                        <td className="px-6 py-5 font-title text-lg text-white">
                          {member.contribution}
                        </td>
                        <td className="px-6 py-5 text-gray-500 text-xs">
                          {member.joinedAt}
                        </td>
                        <td className="px-6 py-5 rounded-r-2xl text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            <span className="text-[10px] font-title text-green-500 uppercase">ACTIVE</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
                  <p className="text-gray-500 font-body">아직 가입된 회원이 없습니다.</p>
                </div>
              )}
            </div>
            
            <div className="mt-12 p-8 border border-white/5 rounded-3xl bg-gradient-to-br from-white/[0.02] to-transparent">
              <h4 className="text-xs font-title text-gray-500 mb-2 tracking-widest uppercase">관리자 유의사항</h4>
              <p className="text-gray-400 text-xs leading-relaxed max-w-2xl">
                회원들의 등급은 수거 활동량과 참여 횟수에 따라 실시간으로 산정됩니다. 
                부적절한 활동이나 허위 보고가 적발될 경우 즉시 엑세스 권한을 회수하고 블랙리스트로 등록하십시오. 
                제주 해양 생태계의 복원은 이들의 헌신에 달려 있습니다.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;