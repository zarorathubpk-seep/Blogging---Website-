import React, { useState, useEffect } from 'react';
import { Article } from '../types/article';
import {
  saveArticle,
  deleteArticle,
  seedInitialArticles,
} from '../services/articleService';
import {
  ContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../services/contactService';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  Database,
  Check,
  AlertTriangle,
  LogIn,
  LogOut,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  FileText,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AppImage } from '../components/AppImage';
import { resolveArticleImage } from '../utils/assets';

interface AdminPageProps {
  articles: Article[];
  onRefreshArticles: () => void;
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  articles,
  onRefreshArticles,
  onNavigate,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [emailInput, setEmailInput] = useState<string>('mralexander461@gmail.com');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Tabs: 'articles' or 'messages'
  const [activeTab, setActiveTab] = useState<'articles' | 'messages'>('articles');

  // Article state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Contact messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Alert feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
      if (currentUser) {
        loadMessages();
      }
    });
    return () => unsub();
  }, []);

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch (err) {
      console.warn('Could not load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const isAuthorized = user !== null;

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !passwordInput) {
      setFeedback({ type: 'error', message: 'Please provide both administrator email and password.' });
      return;
    }
    setIsLoggingIn(true);
    setFeedback(null);
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
      setFeedback({ type: 'success', message: 'Signed in successfully. Admin portal unlocked.' });
      setPasswordInput('');
    } catch (err: any) {
      console.error('Firebase Auth sign in failed:', err);
      const code = err?.code || '';
      let friendly = 'Failed to sign in. Please verify your credentials.';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        friendly = 'Incorrect administrator email or password. Please try again.';
      } else if (code === 'auth/user-not-found') {
        friendly = 'No administrator account found with this email.';
      } else if (code === 'auth/too-many-requests') {
        friendly = 'Too many failed attempts. Access is temporarily rate-limited; please wait a moment.';
      }
      setFeedback({ type: 'error', message: friendly });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setFeedback(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setFeedback({ type: 'success', message: 'Signed in with Google Administrator account.' });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setFeedback({ type: 'error', message: err?.message || 'Google sign-in was cancelled or encountered an error.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setFeedback({ type: 'success', message: 'Signed out successfully. Portal locked.' });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSeedToFirestore = async () => {
    setIsSeeding(true);
    setFeedback(null);
    try {
      const count = await seedInitialArticles();
      onRefreshArticles();
      setFeedback({
        type: 'success',
        message: `Successfully synchronized ${count} canonical articles to Firebase Firestore!`,
      });
    } catch (err: any) {
      console.error('Error seeding Firestore:', err);
      setFeedback({
        type: 'error',
        message: 'Could not seed Firestore. Verify administrator credentials in Firebase.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await saveArticle(editingArticle);
      onRefreshArticles();
      setFeedback({ type: 'success', message: 'Article successfully published to database.' });
      setEditingArticle(null);
      setIsNew(false);
    } catch (err: any) {
      console.error('Failed to save article:', err);
      setFeedback({
        type: 'error',
        message: 'Permission warning: saved locally. Sign in via verified admin email to update live Firestore.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteArticle(id);
      onRefreshArticles();
      setFeedback({ type: 'success', message: 'Article deleted.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Delete failed. Check admin permissions.' });
    }
  };

  const handleToggleMessageStatus = async (msg: ContactMessage) => {
    const nextStatus = msg.status === 'read' ? 'unread' : 'read';
    try {
      await updateContactMessageStatus(msg.id, nextStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: nextStatus } : m))
      );
    } catch (err) {
      console.error('Failed to update message status:', err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this contact message permanently?')) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setFeedback({ type: 'success', message: 'Message deleted from database.' });
    } catch (err) {
      console.error('Failed to delete message:', err);
      setFeedback({ type: 'error', message: 'Could not delete message. Check admin permissions.' });
    }
  };

  const startCreate = () => {
    const fresh: Article = {
      id: `article_${Date.now()}`,
      slug: `guide-${Date.now()}`,
      title: 'New Productivity Guide',
      subtitle: 'A practical system for focused execution',
      content: '# Introduction\n\nWrite your markdown guide here.',
      category: 'Work & Productivity',
      readingTime: '5 min read',
      author: 'ToolCrest Editorial Team',
      publishedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      updatedAt: new Date().toISOString(),
      isPublished: true,
      order: articles.length + 1,
    };
    setEditingArticle(fresh);
    setIsNew(true);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-[#CBD5E1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F3B542]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#CBD5E1] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hover:text-[#F3B542] transition cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <button
            type="button"
            onClick={() => onNavigate('/blog')}
            className="hover:text-[#F3B542] transition cursor-pointer"
          >
            Blog
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[#F3B542] font-semibold">Admin Portal</span>
        </nav>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fadeIn border ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* SECURE FIREBASE LOGIN SCREEN */}
        {!isAuthorized ? (
          <div className="max-w-md mx-auto bg-[#111827] border border-[#F3B542]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#F3B542]/15 border border-[#F3B542]/30 text-[#F3B542] flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ToolCrest Admin Portal
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign in with your verified administrator credentials to manage articles and support inquiries.
              </p>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@toolcrest.site"
                  className="w-full text-xs sm:text-sm bg-[#0B1020] border border-[#F3B542]/30 text-white rounded-xl px-3.5 py-2.5 focus:border-[#F3B542] focus:ring-1 focus:ring-[#F3B542] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter administrator password..."
                    className="w-full text-xs sm:text-sm bg-[#0B1020] border border-[#F3B542]/30 text-white rounded-xl pl-3.5 pr-10 py-2.5 focus:border-[#F3B542] focus:ring-1 focus:ring-[#F3B542] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-[#F3B542] hover:brightness-105 active:scale-98 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {isLoggingIn ? 'Authenticating...' : 'Sign In to Admin Portal'}
              </button>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#111827] px-3 text-[11px] text-slate-400 uppercase font-semibold">
                Or
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-200 bg-[#0B1020] hover:bg-slate-800 border border-slate-700 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#F3B542]" /> Sign In with Google Workspace
            </button>
          </div>
        ) : (
          /* AUTHORIZED ADMINISTRATOR WORKSPACE */
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-[#111827] border border-[#F3B542]/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-[#F3B542]/15 border border-[#F3B542]/30 text-[#F3B542] rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    ToolCrest Administration Console
                  </h1>
                </div>
                <p className="text-xs text-slate-400">
                  Authenticated as <span className="font-mono text-[#F3B542] font-semibold">{user?.email || 'Administrator'}</span> • Full Access
                </p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSeedToFirestore}
                  disabled={isSeeding}
                  className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-[#F3B542] hover:brightness-105 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                  title="Populate Firestore with the canonical 6 default articles"
                >
                  {isSeeding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Database className="w-3.5 h-3.5" />
                  )}
                  {isSeeding ? 'Syncing...' : 'Sync Canonical Guides'}
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#0B1020] border border-slate-700 hover:border-slate-500 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  title="Lock the portal and sign out"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" /> Sign Out
                </button>
              </div>
            </div>

            {/* Portal Tab Switcher */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('articles')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'articles'
                    ? 'bg-[#F3B542] text-slate-950 shadow-md'
                    : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Knowledge Articles ({articles.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('messages');
                  loadMessages();
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'messages'
                    ? 'bg-[#F3B542] text-slate-950 shadow-md'
                    : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>User Inquiries ({messages.length})</span>
                {messages.filter((m) => m.status === 'unread').length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {messages.filter((m) => m.status === 'unread').length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: ARTICLES MANAGEMENT */}
            {activeTab === 'articles' && (
              <div>
                {editingArticle ? (
                  /* Article Editor */
                  <form
                    onSubmit={handleSaveArticle}
                    className="bg-[#111827] border border-[#F3B542]/30 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-[#F3B542]" />
                        <h2 className="font-extrabold text-sm sm:text-base text-white">
                          {isNew ? 'Create New Guide' : `Editing: ${editingArticle.title}`}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingArticle(null);
                            setIsNew(false);
                          }}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-[#0B1020] border border-slate-700 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-[#F3B542] rounded-xl flex items-center gap-1.5 hover:brightness-105"
                        >
                          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          {isSaving ? 'Saving...' : 'Save & Publish'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={editingArticle.title}
                          onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                          className="w-full text-xs bg-[#0B1020] border border-[#F3B542]/30 text-white rounded-lg p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Slug (URL Path)</label>
                        <input
                          type="text"
                          required
                          value={editingArticle.slug}
                          onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                          className="w-full text-xs font-mono bg-[#0B1020] border border-[#F3B542]/30 text-white rounded-lg p-2"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={editingArticle.subtitle || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, subtitle: e.target.value })}
                          className="w-full text-xs bg-[#0B1020] border border-[#F3B542]/30 text-white rounded-lg p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                        <select
                          value={editingArticle.category}
                          onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                          className="w-full text-xs bg-[#0B1020] border border-[#F3B542]/30 text-white rounded-lg p-2"
                        >
                          <option value="Weekly Planning">Weekly Planning</option>
                          <option value="Planning Systems">Planning Systems</option>
                          <option value="Money & Budget">Money &amp; Budget</option>
                          <option value="Work & Productivity">Work &amp; Productivity</option>
                          <option value="Mindset & Habits">Mindset &amp; Habits</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Author</label>
                        <input
                          type="text"
                          value={editingArticle.author}
                          onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                          className="w-full text-xs bg-[#0B1020] border border-[#F3B542]/30 text-white rounded-lg p-2"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Article Content (Markdown format)
                        </label>
                        <textarea
                          rows={14}
                          required
                          value={editingArticle.content}
                          onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                          className="w-full text-xs font-mono bg-[#0B1020] border border-[#F3B542]/30 text-white rounded-lg p-3 leading-relaxed"
                        />
                      </div>
                    </div>
                  </form>
                ) : (
                  /* Articles Data Table */
                  <div className="bg-[#111827] border border-[#F3B542]/30 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <h2 className="font-extrabold text-base text-white">
                          Articles in Database ({articles.length})
                        </h2>
                        <p className="text-xs text-slate-400">
                          Direct live synchronization with Firebase Firestore
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={startCreate}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#F3B542] text-slate-950 rounded-xl hover:brightness-105 transition shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New Guide
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 bg-[#0B1020] text-slate-300">
                            <th className="p-2.5 w-16">Preview</th>
                            <th className="p-2.5">Title</th>
                            <th className="p-2.5 w-36">Category</th>
                            <th className="p-2.5 w-24">Read Time</th>
                            <th className="p-2.5 w-24">Status</th>
                            <th className="p-2.5 w-28 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {articles.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-850">
                              <td className="p-2.5">
                                <div className="w-12 h-9 rounded overflow-hidden border border-slate-700 bg-slate-900">
                                  <AppImage
                                    src={resolveArticleImage(item.slug, item.imageUrl)}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </td>
                              <td className="p-2.5 font-bold text-white">
                                {item.title}
                                <div className="text-[10px] font-mono text-slate-400 font-normal">
                                  slug: {item.slug}
                                </div>
                              </td>
                              <td className="p-2.5 text-slate-300">{item.category}</td>
                              <td className="p-2.5 text-slate-400">{item.readingTime}</td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    item.isPublished
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {item.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </td>
                              <td className="p-2.5 text-right space-x-1">
                                <button
                                  type="button"
                                  onClick={() => onNavigate(`/blog/${item.slug}`)}
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                                  title="Preview"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingArticle(item);
                                    setIsNew(false);
                                  }}
                                  className="p-1 hover:bg-slate-800 text-[#F3B542] rounded cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteArticle(item.id)}
                                  className="p-1 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CONTACT MESSAGES INBOX */}
            {activeTab === 'messages' && (
              <div className="bg-[#111827] border border-[#F3B542]/30 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="font-extrabold text-base text-white">
                      Incoming Contact Messages ({messages.length})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Inquiries delivered through the Contact Us form and stored in Firestore
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadMessages}
                    disabled={isLoadingMessages}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#0B1020] border border-slate-700 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isLoadingMessages ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Refresh Messages
                  </button>
                </div>

                {messages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm">No contact messages received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border transition space-y-2 ${
                          msg.status === 'unread'
                            ? 'bg-[#0B1020] border-[#F3B542]/40'
                            : 'bg-[#0E1526] border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{msg.name}</span>
                            <span className="text-xs text-[#F3B542] font-mono">({msg.email})</span>
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                              {msg.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 font-mono text-[11px]">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleMessageStatus(msg)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                msg.status === 'unread'
                                  ? 'bg-[#F3B542] text-slate-950'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {msg.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                              title="Delete message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#111827] p-3 rounded-lg border border-slate-800">
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
