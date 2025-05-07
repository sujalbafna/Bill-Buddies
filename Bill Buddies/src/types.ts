export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
}

export interface Member {
  id: string;
  name: string;
  balance: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  participants: string[];
}