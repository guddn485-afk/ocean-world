
import { GoogleGenAI } from "@google/genai";

// --- State Management ---
let state = {
  currentUser: JSON.parse(localStorage.getItem('oc_session') || 'null'),
  stats: JSON.parse(localStorage.getItem('oc_stats') || JSON.stringify({ tons: '20,000', years: '500', prob: '0' })),
  activities: JSON.parse(localStorage.getItem('oc_activities') || '[]'),
  isAuthLogin: true,
  adminTab: 'content',
  isGenerating: false
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Gemini Service ---
const generateBountyDescription = async (title: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `제주도 해양 정화 활동 "${title}"에 대한 전문적이고 간결한 보상 활동 설명을 작성해주세요. 환경적 영향과 지역적 특성에 집중하세요. 30자 이내의 한국어로 작성하세요.`,
    });
    return response.text || "활동 상세 정보가 없습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "제주 연안 환경 정화 활동 - 고위험군 수거 작업";
  }
};

// --- DOM References & Rendering ---
const renderAuthNav = () => {
  const area = document.getElementById('auth-nav-area');
  if (!area) return;
  if (state.currentUser) {
    area.innerHTML = `
      <span class="text-cyan-400 font-bold border-r border-white/20 pr-4">${state.currentUser.name.toUpperCase()} 회원</span>
      <button id="logout-btn" class="hover:text-red-500 transition">LOGOUT</button>
    `;
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('hero-join-btn')?.classList.add('hidden');
    const footerBtnText = document.getElementById('footer-btn-text');
    if (footerBtnText) footerBtnText.innerText = 'MISSION CENTER';
  } else {
    area.innerHTML = `<button id="nav-join-btn" class="px-5 py-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition">JOIN</button>`;
    document.getElementById('nav-join-btn')?.addEventListener('click', () => toggleModal('auth-modal', true));
    document.getElementById('hero-join-btn')?.classList.remove('hidden');
    const footerBtnText = document.getElementById('footer-btn-text');
    if (footerBtnText) footerBtnText.innerText = 'JOIN THE PROJECT';
  }
};

const renderStats = () => {
  document.getElementById('stat-tons')!.innerHTML = `${state.stats.tons}<span class="text-2xl align-top ml-2">TONS</span>`;
  document.getElementById('stat-years')!.innerHTML = `${state.stats.years}<span class="text-2xl align-top ml-2">YEARS</span>`;
  document.getElementById('stat-prob')!.innerHTML = `${state.stats.prob}<span class="text-2xl align-top ml-2">%</span>`;
};

const renderActivities = () => {
  const list = document.getElementById('activity-list');
  if (!list) return;
  if (state.activities.length === 0) {
    list.innerHTML = `<div class="col-span-full text-center py-20 border border-dashed border-gray-800 rounded-3xl"><p class="text-gray-600">현재 활성화된 보상 활동이 없습니다.</p></div>`;
    return;
  }
  list.innerHTML = state.activities.map(item => `
    <div class="group cursor-pointer">
      <div class="relative overflow-hidden bg-gray-900 aspect-[3/4] mb-4 rounded-xl border border-white/10">
        <img src="${item.img}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
        <div class="absolute top-3 left-3 bg-white text-black px-2 py-1 text-[10px] md:text-xs font-bold font-title shadow-2xl">₩ ${item.price}</div>
      </div>
      <h3 class="font-title text-base md:text-lg mb-1 group-hover:text-cyan-400 transition-colors uppercase truncate">${item.title}</h3>
      <p class="text-gray-500 text-[10px] md:text-xs font-body line-clamp-1">${item.desc}</p>
    </div>
  `).join('');
};

const renderAdminDashboard = () => {
  const container = document.getElementById('admin-dashboard');
  if (!container) return;
  const storedUsers = JSON.parse(localStorage.getItem('oc_users') || '[]');
  
  const contentHTML = `
    <div class="w-full max-w-5xl bg-[#0a0a0a] min-h-[80vh] p-8 rounded-3xl border border-white/10 shadow-2xl my-10 font-body">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-white/5 pb-8">
        <div><h2 class="text-4xl font-title text-cyan-400 tracking-tighter">OC CONTROL HUB</h2><p class="text-gray-500 text-xs font-title tracking-[0.3em] mt-1 uppercase">보안 등급: ALPHA-01</p></div>
        <div class="flex items-center gap-4 p-1 bg-white/5 rounded-2xl">
          <button id="tab-content" class="px-6 py-2 rounded-xl text-xs font-bold transition-all ${state.adminTab === 'content' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}">보상금 관리</button>
          <button id="tab-members" class="px-6 py-2 rounded-xl text-xs font-bold transition-all ${state.adminTab === 'members' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}">회원 목록</button>
          <button id="admin-close" class="ml-4 pr-4 text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
      </div>
      <div id="admin-view-area">
        ${state.adminTab === 'content' ? `
          <div class="space-y-12">
            <div>
              <h3 class="text-sm font-title tracking-widest text-gray-500 mb-6 flex items-center gap-2"><span class="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>실시간 보상금 작전 배치</h3>
              <div class="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2"><label class="text-[10px] text-gray-600 font-bold uppercase">작전명</label><input id="new-title" class="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors" placeholder="예: 서귀포 심해 정화 작전"></div>
                  <div class="space-y-2"><label class="text-[10px] text-gray-600 font-bold uppercase">보상금 액수 (₩)</label><input id="new-price" class="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors font-title" placeholder="150,000"></div>
                </div>
                <div class="space-y-2"><label class="text-[10px] text-gray-600 font-bold uppercase">작전 브리핑</label>
                  <div class="relative"><input id="new-desc" class="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors pr-32" placeholder="상세 설명..."><button id="ai-gen-btn" class="absolute right-2 top-2 bottom-2 px-4 bg-cyan-500/10 text-cyan-400 rounded-lg text-[10px] font-black font-title border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">${state.isGenerating ? '분석 중...' : 'AI 자동 생성'}</button></div>
                </div>
                <div class="space-y-2"><label class="text-[10px] text-gray-600 font-bold uppercase">이미지 URL</label><input id="new-img" class="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors text-xs" value="https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1974&auto=format&fit=crop"></div>
                <div class="flex gap-4 pt-4"><button id="add-activity-btn" class="flex-1 bg-cyan-500 text-black font-black py-4 rounded-xl font-title hover:bg-cyan-400 transition-all shadow-lg">보상금 작전 배치하기</button><button id="clear-activities-btn" class="px-8 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl font-title text-sm">전체 삭제</button></div>
              </div>
            </div>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-y-2">
              <thead><tr class="text-[10px] font-title text-gray-600 tracking-widest uppercase"><th class="px-6 py-4">등급</th><th class="px-6 py-4">이름</th><th class="px-6 py-4">연락처</th><th class="px-6 py-4">기여도</th><th class="px-6 py-4 text-right">상태</th></tr></thead>
              <tbody class="font-body text-sm">${storedUsers.map(u => `
                <tr class="bg-white/5 hover:bg-white/[0.08] transition-colors"><td class="px-6 py-5 rounded-l-2xl"><span class="px-3 py-1 rounded text-[10px] font-black font-title bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">${u.rank}</span></td><td class="px-6 py-5 font-bold text-white">${u.name}</td><td class="px-6 py-5 text-gray-400">${u.email}</td><td class="px-6 py-5 font-title text-lg text-white">${u.contribution}</td><td class="px-6 py-5 rounded-r-2xl text-right"><span class="text-[10px] font-title text-green-500 uppercase">ACTIVE</span></td></tr>
              `).join('')}</tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
  container.innerHTML = contentHTML;

  // Re-attach listeners for injected content
  document.getElementById('admin-close')?.addEventListener('click', () => toggleModal('admin-dashboard', false));
  document.getElementById('tab-content')?.addEventListener('click', () => { state.adminTab = 'content'; renderAdminDashboard(); });
  document.getElementById('tab-members')?.addEventListener('click', () => { state.adminTab = 'members'; renderAdminDashboard(); });
  document.getElementById('ai-gen-btn')?.addEventListener('click', async () => {
    const title = (document.getElementById('new-title') as HTMLInputElement).value;
    if(!title) return alert('작전명을 입력하세요.');
    state.isGenerating = true; renderAdminDashboard();
    const desc = await generateBountyDescription(title);
    (document.getElementById('new-desc') as HTMLInputElement).value = desc;
    state.isGenerating = false; renderAdminDashboard();
  });
  document.getElementById('add-activity-btn')?.addEventListener('click', () => {
    const title = (document.getElementById('new-title') as HTMLInputElement).value;
    const price = (document.getElementById('new-price') as HTMLInputElement).value;
    const desc = (document.getElementById('new-desc') as HTMLInputElement).value;
    const img = (document.getElementById('new-img') as HTMLInputElement).value;
    if(!title || !price) return alert('작전명과 보상금을 입력하세요.');
    state.activities = [{ id: Math.random().toString(36).substr(2, 9), title, price, desc, img, createdAt: Date.now() }, ...state.activities];
    localStorage.setItem('oc_activities', JSON.stringify(state.activities));
    alert('작전이 성공적으로 배치되었습니다.');
    renderActivities();
    renderAdminDashboard();
  });
  document.getElementById('clear-activities-btn')?.addEventListener('click', () => {
    if(confirm('모든 보상금을 삭제하시겠습니까?')) {
      state.activities = [];
      localStorage.setItem('oc_activities', JSON.stringify([]));
      renderActivities();
      renderAdminDashboard();
    }
  });
};

// --- Handlers ---
const toggleModal = (id: string, show: boolean) => {
  const modal = document.getElementById(id);
  if (show) modal?.classList.remove('hidden');
  else modal?.classList.add('hidden');
};

const handleLogout = () => {
  state.currentUser = null;
  localStorage.removeItem('oc_session');
  alert('로그아웃 되었습니다.');
  renderAuthNav();
};

const handleAuthToggle = () => {
  state.isAuthLogin = !state.isAuthLogin;
  const subtitle = document.getElementById('auth-subtitle');
  const submitBtn = document.getElementById('auth-submit-btn');
  const toggleBtn = document.getElementById('auth-toggle-btn');
  const nameField = document.getElementById('name-field');
  const confirmField = document.getElementById('confirm-password-field');

  if (state.isAuthLogin) {
    subtitle!.innerText = 'Welcome Back Member';
    submitBtn!.innerText = 'SIGN IN';
    toggleBtn!.innerText = "Don't have an account? Sign Up";
    nameField?.classList.add('hidden');
    confirmField?.classList.add('hidden');
  } else {
    subtitle!.innerText = 'Join the Movement';
    submitBtn!.innerText = 'CREATE ACCOUNT';
    toggleBtn!.innerText = "Already a member? Sign In";
    nameField?.classList.remove('hidden');
    confirmField?.classList.remove('hidden');
  }
};

// --- Initial Setup & Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  renderAuthNav();
  renderStats();
  renderActivities();

  // Navigation & General
  document.getElementById('nav-logo')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.getElementById('hero-join-btn')?.addEventListener('click', () => toggleModal('auth-modal', true));
  document.getElementById('footer-join-btn')?.addEventListener('click', () => {
    if(state.currentUser) alert('미션 센터로 이동합니다.');
    else toggleModal('auth-modal', true);
  });

  // Admin Login
  document.getElementById('admin-login-btn')?.addEventListener('click', () => toggleModal('admin-login-modal', true));
  document.getElementById('admin-login-close')?.addEventListener('click', () => toggleModal('admin-login-modal', false));
  document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = (document.getElementById('admin-password-input') as HTMLInputElement).value;
    if (pw === '1234') {
      toggleModal('admin-login-modal', false);
      renderAdminDashboard();
      toggleModal('admin-dashboard', true);
    } else {
      alert('접근 권한이 없습니다.');
    }
    (document.getElementById('admin-password-input') as HTMLInputElement).value = '';
  });

  // Auth Modal
  document.getElementById('auth-modal-close')?.addEventListener('click', () => toggleModal('auth-modal', false));
  document.getElementById('auth-toggle-btn')?.addEventListener('click', handleAuthToggle);
  document.getElementById('auth-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const users = JSON.parse(localStorage.getItem('oc_users') || '[]');

    if (state.isAuthLogin) {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        state.currentUser = user;
        localStorage.setItem('oc_session', JSON.stringify(user));
        alert(`${user.name}님 환영합니다!`);
        renderAuthNav();
        toggleModal('auth-modal', false);
      } else {
        alert('이메일 또는 비밀번호가 잘못되었습니다.');
      }
    } else {
      const name = formData.get('name') as string;
      const confirm = formData.get('confirmPassword') as string;
      if (!name || !email || !password) return alert('필수 항목을 입력하세요.');
      if (password !== confirm) return alert('비밀번호가 일치하지 않습니다.');
      if (users.some((u: any) => u.email === email)) return alert('이미 가입된 이메일입니다.');

      const now = new Date();
      const joinedAt = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
      const newUser = { id: Math.random().toString(36).substr(2,9), name, email, password, rank: 'ROOKIE', contribution: '0kg', joinedAt };
      users.push(newUser);
      localStorage.setItem('oc_users', JSON.stringify(users));
      alert('회원가입 완료! 로그인 해주세요.');
      handleAuthToggle();
    }
  });
});
