import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Wallet2, Users, Receipt, PlusCircle, X, ArrowRight, LogOut, UserPlus, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { collection, addDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Group, Member, Expense } from './types';

// Predefined members
const PREDEFINED_MEMBERS: Member[] = [
  { id: 'sujal', name: 'Sujal', balance: 0 },
  { id: 'sai', name: 'Sai', balance: 0 },
  { id: 'siddhart', name: 'Siddhart', balance: 0 },
  { id: 'samruddhi', name: 'Samruddhi', balance: 0 },
  { id: 'chaitrali', name: 'Chaitrali', balance: 0 },
  { id: 'arnav', name: 'Arnav', balance: 0 },
];

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Wallet2 className="h-12 w-12 text-indigo-600 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">BillBuddies</h1>
            <p className="text-lg text-gray-600 mb-8">
              {isSignUp ? 'Create an account to get started' : 'Welcome back! Please sign in'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 transition-colors group-hover:text-indigo-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 transition-colors group-hover:text-indigo-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-300"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isSignUp ? (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2011&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-600/90 mix-blend-multiply" />
        </div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-6">Split Expenses Effortlessly</h2>
            <p className="text-xl opacity-90">
              Track shared expenses, settle debts, and maintain friendships with ease
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '' });
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    paidBy: PREDEFINED_MEMBERS[0].id,
    participants: []
  });
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const groupsQuery = query(
      collection(db, 'groups'),
      where('members', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      setGroups(groupsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedGroup) return;

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('groupId', '==', selectedGroup)
    );

    const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expensesData);
    });

    return () => unsubscribe();
  }, [selectedGroup]);

  const handleAddGroup = async () => {
    if (!currentUser || !newGroup.name) return;

    try {
      await addDoc(collection(db, 'groups'), {
        name: newGroup.name,
        createdBy: currentUser.uid,
        members: [currentUser.uid],
        createdAt: Timestamp.now()
      });

      setShowAddGroup(false);
      setNewGroup({ name: '' });
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!selectedGroup || !newExpense.description || !newExpense.amount || !newExpense.paidBy || selectedParticipants.length === 0) {
      console.error('Missing required fields for expense');
      return;
    }

    try {
      const expenseData = {
        groupId: selectedGroup,
        description: newExpense.description,
        amount: newExpense.amount,
        paidBy: newExpense.paidBy,
        date: new Date().toISOString(),
        participants: selectedParticipants,
      };

      await addDoc(collection(db, 'expenses'), expenseData);

      setShowAddExpense(false);
      setNewExpense({
        description: '',
        amount: 0,
        paidBy: PREDEFINED_MEMBERS[0].id,
        participants: []
      });
      setSelectedParticipants([]);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const calculateBalances = () => {
    const balances = [...PREDEFINED_MEMBERS];
    
    expenses.forEach(expense => {
      const perPersonAmount = expense.amount / expense.participants.length;
      const payer = balances.find(m => m.id === expense.paidBy);
      
      if (payer) {
        payer.balance += expense.amount - (expense.participants.includes(payer.id) ? perPersonAmount : 0);
      }

      expense.participants.forEach(participantId => {
        if (participantId !== expense.paidBy) {
          const participant = balances.find(m => m.id === participantId);
          if (participant) {
            participant.balance -= perPersonAmount;
          }
        }
      });
    });

    return balances;
  };

  const currentBalances = calculateBalances();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <header className="bg-white shadow-lg backdrop-blur-lg bg-white/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet2 className="h-8 w-8 text-violet-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">BillBuddies</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  if (!selectedGroup) {
                    alert('Please select a group first');
                    return;
                  }
                  setShowAddExpense(true);
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Add Expense</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Groups</h2>
                <button
                  onClick={() => setShowAddGroup(true)}
                  className="text-violet-600 hover:text-violet-700 transition-transform hover:scale-110"
                >
                  <PlusCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {groups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                      selectedGroup === group.id
                        ? 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 shadow-md'
                        : 'hover:bg-violet-50'
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9 space-y-6">
            {selectedGroup ? (
              <>
                {/* Stats Overview */}
                <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="h-6 w-6 text-violet-500" />
                    <h2 className="text-lg font-semibold text-gray-700">Group Balance</h2>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">
                    ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Total shared expenses</p>
                </div>

                {/* Recent Expenses */}
                <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="p-6 hover:bg-violet-50/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{expense.description}</h3>
                            <p className="text-sm text-gray-500">
                              Paid by {PREDEFINED_MEMBERS.find(m => m.id === expense.paidBy)?.name} • 
                              Split between {expense.participants.length} people • 
                              {new Date(expense.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Participants: {expense.participants.map(id => 
                                PREDEFINED_MEMBERS.find(m => m.id === id)?.name
                              ).join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">
                              ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-gray-500">
                              ₹{(expense.amount / expense.participants.length).toLocaleString('en-IN', { minimumFractionDigits: 2 })} per person
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 text-center transition-all duration-300 hover:shadow-xl">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Select a Group</h2>
                <p className="text-gray-500">Choose a group from the sidebar or create a new one to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">Create New Group</h2>
              <button onClick={() => setShowAddGroup(false)} className="text-gray-500 hover:text-gray-700 transition-transform hover:scale-110">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  placeholder="Enter group name"
                />
              </div>

              <button
                onClick={handleAddGroup}
                disabled={!newGroup.name}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">Add New Expense</h2>
              <button onClick={() => setShowAddExpense(false)} className="text-gray-500 hover:text-gray-700 transition-transform hover:scale-110">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  placeholder="What was this expense for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                <select
                  value={newExpense.paidBy}
                  onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                >
                  {PREDEFINED_MEMBERS.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Split Between</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {PREDEFINED_MEMBERS.map(member => (
                    <label key={member.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-violet-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipants([...selectedParticipants, member.id]);
                          } else {
                            setSelectedParticipants(selectedParticipants.filter(id => id !== member.id));
                          }
                        }}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 transition-colors"
                      />
                      <span>{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddExpense}
                disabled={!newExpense.description || !newExpense.amount || selectedParticipants.length === 0}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route
        path="/dashboard"
        element={currentUser ? <Dashboard /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;