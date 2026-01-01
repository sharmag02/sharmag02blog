import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Blog } from '../../types/database';
import { Calendar, User, BookOpen } from 'lucide-react';

interface BlogWithAuthor extends Blog {
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface BlogListProps {
  onSelectBlog: (blog: BlogWithAuthor) => void;
}

export function BlogList({ onSelectBlog }: BlogListProps) {
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No blogs yet</h3>
        <p className="text-slate-600">Check back later for new content!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <article
          key={blog.id}
          onClick={() => onSelectBlog(blog)}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group"
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition line-clamp-2">
              {blog.title}
            </h3>

            <p className="text-slate-600 mb-4 line-clamp-3">
              {blog.excerpt || blog.content.substring(0, 150) + '...'}
            </p>

            <div className="flex flex-col space-y-2 text-sm text-slate-500">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>{blog.profiles?.full_name || blog.profiles?.email || 'Anonymous'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
            <span className="text-slate-700 font-medium text-sm group-hover:text-slate-900 transition">
              Read more →
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
