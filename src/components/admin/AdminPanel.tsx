import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Blog } from '../../types/database';
import { Edit, Trash2, Plus } from 'lucide-react';
import { BlogEditor } from './BlogEditor';

interface BlogWithAuthor extends Blog {
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

export function AdminPanel() {
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      loadBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleSave = () => {
    setEditingBlog(null);
    setIsCreating(false);
    loadBlogs();
  };

  if (isCreating || editingBlog) {
    return (
      <BlogEditor
        blog={editingBlog || undefined}
        onSave={handleSave}
        onCancel={() => {
          setEditingBlog(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Manage Blog Posts</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Post
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-slate-600">No blog posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{blog.title}</h3>
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {blog.excerpt || blog.content.substring(0, 150) + '...'}
                  </p>
                  <div className="flex items-center text-sm text-slate-500">
                    <span>By {blog.profiles?.full_name || blog.profiles?.email}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(blog.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingBlog(blog)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
