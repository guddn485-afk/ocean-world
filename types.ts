
export interface Stats {
  tons: string;
  years: string;
  prob: string;
}

export interface Activity {
  id: string;
  title: string;
  desc: string;
  price: string;
  img: string;
  createdAt: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  rank: 'MASTER' | 'ELITE' | 'ROOKIE';
  contribution: string; // kg
  joinedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  rank: 'MASTER' | 'ELITE' | 'ROOKIE';
  contribution: string;
}
