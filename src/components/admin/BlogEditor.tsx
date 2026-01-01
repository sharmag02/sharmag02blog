import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Save, X } from 'lucide-react';
import type { Blog } from '../../types/database';

interface BlogEditorProps {
  blog?: Blog;
  onSave: () => void;
  onCancel: () => void;
}

export function BlogEditor({ blog, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content);
      setExcerpt(blog.excerpt || '');
    }
  }, [blog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      if (blog) {
        const { error } = await supabase
          .from('blogs')
          .update({
            title,
            content,
            excerpt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', blog.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert({
            title,
            content,
            excerpt,
            author_id: user.id,
          });

        if (error) throw error;
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
            placeholder="Enter blog title"
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 mb-2">
            Excerpt (optional)
          </label>
          <input
            id="excerpt"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
            placeholder="Brief description of your post"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition resize-y"
            placeholder="Write your blog content here..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Saving...' : blog ? 'Update Post' : 'Publish Post'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
