import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Blog } from '../../types/database';
import { Calendar, User, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlogWithAuthor extends Blog {
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
  slug: string; // <-- ensure slug exists
}

/**
 * Convert HTML content to clean text preview
 */
const getTextPreview = (html: string, length = 160) => {
  if (!html) return '';
  const text = html.replace(/<[^>]+>/g, '');
  return text.length > length ? text.slice(0, length) + '…' : text;
};

export function BlogList() {
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(
          `
          id,
          title,
          content,
          slug,
          created_at,
          profiles (
            full_name,
            email
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          No blogs yet
        </h3>
        <p className="text-slate-600">
          Start writing and your stories will appear here ✨
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogs.map((blog) => (
        <article
          key={blog.id}
          onClick={() => navigate(`/blogs/${blog.slug}`)} // <-- navigate to BlogDetail
          className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden border border-slate-100"
        >
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition line-clamp-2">
              {blog.title}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
              {getTextPreview(blog.content)}
            </p>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="truncate">
                  {blog.profiles?.full_name ||
                    blog.profiles?.email ||
                    'Anonymous'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(blog.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition">
            Read article →
          </div>
        </article>
      ))}
    </div>
  );
}
