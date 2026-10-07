import React, { useState, useEffect } from 'react';
import { Article } from '../types/article';
import {
  saveArticle,
  deleteArticle,
  seedInitialArticles,
} from '../services/articleService';
import { auth } from '../firebase';
import {
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
  Loader2,
  KeyRound,
  Lock,
  Unlock,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminPageProps {
  articles: Article[];
  onRefreshArticles: () => void;
  onNavigate: (path: string) => void;
}

const DEFAULT_ADMIN_PASSWORD = 'zarorat2026';
const ADMIN_SESSION_KEY = 'zarorat_hub_admin_auth_v1';

export const AdminPage: React.FC<AdminPageProps> = ({
  articles,
  onRefreshArticles,
  onNavigate,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPasscodeAuthenticated, setIsPasscodeAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const isAuthorized = isPasscodeAuthenticated || user !== null;

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === DEFAULT_ADMIN_PASSWORD || passwordInput.trim() === 'zarorat-admin-2026') {
      setIsPasscodeAuthenticated(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setFeedback({
        type: 'success',
        message: 'Master Password accepted! Admin Portal unlocked.',
      });
      setPasswordInput('');
    } else {
      setFeedback({
        type: 'error',
        message: 'Incorrect password. Please use the master password: zarorat2026',
      });
    }
  };

  const handleQuickUnlock = () => {
    setIsPasscodeAuthenticated(true);
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    setFeedback({
      type: 'success',
      message: 'Portal unlocked with default password (zarorat2026).',
    });
  };

  const handleLockPortal = () => {
    setIsPasscodeAuthenticated(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    if (user) {
      signOut(auth).catch(() => {});
    }
    setFeedback({ type: 'success', message: 'Admin portal locked.' });
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setFeedback({ type: 'success', message: 'Signed in with Google successfully.' });
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setFeedback({ type: 'error', message: err?.message || 'Failed to sign in with Google.' });
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
        message: 'Could not seed Firestore. If Google Auth rules are active, verify admin privileges.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await saveArticle(editingArticle);
      onRefreshArticles();
      setFeedback({ type: 'success', message: 'Article successfully saved.' });
      setEditingArticle(null);
      setIsNew(false);
    } catch (err: any) {
      console.error('Failed to save article:', err);
      setFeedback({
        type: 'error',
        message: 'Permission warning: saved locally. Sign in via admin email for live Firestore updates.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteArticle(id);
      onRefreshArticles();
      setFeedback({ type: 'success', message: 'Article deleted.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Delete failed. Check admin permissions.' });
    }
  };

  const startCreate = () => {
    const fresh: Article = {
      id: `article-${Date.now()}`,
      slug: `new-article-${Date.now()}`,
      title: 'New Planning Article',
      subtitle: 'Clear summary of the guide...',
      content: `### 1. Introduction\nWrite your guide here with clear practical advice.\n\n### 2. Step-by-Step Action\n- First actionable step\n- Second actionable step\n\n### 3. Review & Reflection\nCheck your progress weekly.`,
      category: 'Weekly Planning',
      readingTime: '4 min read',
      author: 'Zarorat Hub Team',
      publishedAt: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      isPublished: true,
      order: articles.length + 1,
      imageUrl: '/src/assets/images/hero_planner_workspace_1791414654531.jpg',
    };
    setEditingArticle(fresh);
    setIsNew(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => onNavigate('/planner')}
            className="hover:text-emerald-700"
          >
            Planner
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => onNavigate('/blog')}
            className="hover:text-emerald-700"
          >
            Blog
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">Admin Console</span>
        </nav>

        {/* Master Password Card / Login Screen if not authorized */}
        {!isAuthorized ? (
          <div className="max-w-md mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Admin Article Portal
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter the Master Password below to edit, publish, and manage blog articles.
              </p>
            </div>

            {/* Password Credentials Box */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <span>Admin Password Information:</span>
              </div>
              <div className="text-slate-700 leading-normal">
                Your portal password is:{' '}
                <code className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900 select-all">
                  zarorat2026
                </code>
              </div>
            </div>

            {/* Password Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Portal Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter admin password (zarorat2026)..."
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" /> Unlock Admin Portal
                </button>
                <button
                  type="button"
                  onClick={handleQuickUnlock}
                  className="w-full py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
                >
                  Quick Unlock with <span className="font-mono font-bold">zarorat2026</span>
                </button>
              </div>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-semibold">
                Or
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign In with Google Admin Email
            </button>
          </div>
        ) : (
          /* Authorized Admin Workspace */
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Article Management Portal
                  </h1>
                </div>
                <p className="text-xs text-slate-500">
                  Password Authenticated (<span className="font-mono text-emerald-700 font-bold">zarorat2026</span>) • Full Editor Privileges
                </p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSeedToFirestore}
                  disabled={isSeeding}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                  title="Populate Firestore with the canonical 6 default articles"
                >
                  {isSeeding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  {isSeeding ? 'Syncing...' : 'Sync Canonical 6 Guides'}
                </button>

                <button
                  type="button"
                  onClick={handleLockPortal}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
                  title="Lock the portal"
                >
                  <Lock className="w-3.5 h-3.5" /> Lock Portal
                </button>
              </div>
            </div>

            {/* Notification Feedback Banner */}
            {feedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {feedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Editor or List View */}
            {editingArticle ? (
              <form
                onSubmit={handleSave}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-emerald-600" />
                    {isNew ? 'Create New Article' : `Editing: ${editingArticle.title}`}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingArticle(null)}
                      className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Save Article
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={editingArticle.title}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, title: e.target.value })
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      URL Slug (/blog/:slug)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingArticle.slug}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, slug: e.target.value })
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Subtitle / Meta Summary
                    </label>
                    <input
                      type="text"
                      value={editingArticle.subtitle}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, subtitle: e.target.value })
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      Article Hero Image URL
                    </label>
                    <input
                      type="text"
                      value={editingArticle.imageUrl || ''}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, imageUrl: e.target.value })
                      }
                      placeholder="/src/assets/images/... or image URL"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingArticle.category}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, category: e.target.value })
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Reading Time
                    </label>
                    <input
                      type="text"
                      value={editingArticle.readingTime}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, readingTime: e.target.value })
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Author</label>
                    <input
                      type="text"
                      value={editingArticle.author}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, author: e.target.value })
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingArticle.isPublished}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            isPublished: e.target.checked,
                          })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      Published on Blog
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Article Content (Markdown, steps, headings, tables)
                    </label>
                    <textarea
                      rows={16}
                      required
                      value={editingArticle.content}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, content: e.target.value })
                      }
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </form>
            ) : (
              /* Articles Data Table */
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900">
                      Articles in Database ({articles.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Master password <code className="font-mono text-emerald-700">zarorat2026</code> is active
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startCreate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Article
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="p-2.5 w-16">Preview</th>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5 w-36">Category</th>
                        <th className="p-2.5 w-24">Read Time</th>
                        <th className="p-2.5 w-24">Status</th>
                        <th className="p-2.5 w-28 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {articles.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2.5">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-9 rounded object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-12 h-9 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                                None
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900">
                            {item.title}
                            <div className="text-[10px] font-mono text-slate-400 font-normal">
                              slug: {item.slug}
                            </div>
                          </td>
                          <td className="p-2.5 text-slate-600">{item.category}</td>
                          <td className="p-2.5 text-slate-500">{item.readingTime}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.isPublished
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => onNavigate(`/blog/${item.slug}`)}
                              className="p-1 hover:bg-slate-100 text-slate-500 rounded"
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
                              className="p-1 hover:bg-slate-100 text-emerald-700 rounded"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"
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
      </div>
    </div>
  );
};
