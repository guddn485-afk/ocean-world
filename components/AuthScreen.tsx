
import React, { useState } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mock Backend Logic using LocalStorage
    const storedUsers = JSON.parse(localStorage.getItem('oc_users') || '[]');

    if (isLogin) {
      // Login Logic
      const user = storedUsers.find((u: any) => u.email === formData.email && u.password === formData.password);
      if (user) {
        onAuthSuccess(user);
        onClose();
      } else {
        alert('이메일 또는 비밀번호가 일치하지 않습니다.');
      }
    } else {
      // Signup Logic
      if (!formData.name || !formData.email || !formData.password) {
        return alert('모든 필드를 입력해주세요.');
      }
      if (formData.password !== formData.confirmPassword) {
        return alert('비밀번호가 일치하지 않습니다.');
      }
      if (storedUsers.find((u: any) => u.email === formData.email)) {
        return alert('이미 가입된 이메일입니다.');
      }

      // Format current date for joinedAt
      const now = new Date();
      const joinedAt = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

      const newUser: User & { joinedAt: string } = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password, // In real app, never store plain text passwords
        rank: 'ROOKIE',
        contribution: '0kg',
        joinedAt: joinedAt
      };

      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('oc_users', JSON.stringify(updatedUsers));
      
      alert('회원 등록이 완료되었습니다! 로그인해주세요.');
      setIsLogin(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="absolute inset-0 opacity-20">
        <img src="https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="bg" />
      </div>
      
      <div className="w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-10">
          <h2 className="font-title text-4xl mb-2 text-white">OC™</h2>
          <p className="text-gray-400 text-sm font-body uppercase tracking-widest">
            {isLogin ? 'Welcome Back Member' : 'Join the Movement'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase font-title tracking-widest">User Name</label>
              <input 
                name="name"
                type="text" 
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" 
                placeholder="Full Name" 
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase font-title tracking-widest">Email Address</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" 
              placeholder="ocean@clean.com" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase font-title tracking-widest">Password</label>
            <input 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" 
              placeholder="••••••••" 
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase font-title tracking-widest">Confirm Password</label>
              <input 
                name="confirmPassword"
                type="password" 
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" 
                placeholder="••••••••" 
              />
            </div>
          )}

          <button type="submit" className="w-full bg-cyan-500 text-black py-4 mt-4 rounded-xl font-bold font-title text-lg hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-500/20">
            {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            }}
            className="text-gray-500 hover:text-white text-sm transition-colors font-body"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already a member? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
