// BlogDetail.tsx
import { Calendar, User, Heart, Share2, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export function BlogDetail() {
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>(); // get slug from URL
  const navigate = useNavigate();

  const [blog, setBlog] = useState<any>(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  // Load blog by slug
  useEffect(() => {
    const loadBlog = async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from('blogs')
        .select('*, profiles(full_name,email)')
        .eq('slug', slug)
        .single();

      if (error) return console.error(error);
      setBlog(data);
      setLikes(data.likes || 0);
    };
    loadBlog();
  }, [slug]);

  // Load comments
  useEffect(() => {
    if (!blog) return;
    const loadComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*, profiles(full_name,email)')
        .eq('blog_id', blog.id)
        .order('created_at', { ascending: false });
      setComments(data || []);
    };
    loadComments();
  }, [blog]);

  const handleLike = async () => {
    if (!blog) return;
    const { error } = await supabase
      .from('blogs')
      .update({ likes: likes + 1 })
      .eq('id', blog.id);

    if (!error) setLikes(likes + 1);
  };

  const handleComment = async () => {
    if (!user || !newComment.trim() || !blog) return;

    await supabase.from('comments').insert({
      blog_id: blog.id,
      user_id: user.id,
      content: newComment,
    });

    setNewComment('');
    // reload comments
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(full_name,email)')
      .eq('blog_id', blog.id)
      .order('created_at', { ascending: false });
    setComments(data || []);
  };

  if (!blog) return <p className="text-center mt-12">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-600 mb-6 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <article className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

        <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-6 text-sm">
          <span className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            {blog.profiles?.full_name || 'Anonymous'}
          </span>
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(blog.created_at).toDateString()}
          </span>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 transition"
          >
            <Heart className="w-5 h-5" /> {likes}
          </button>

          <button
            onClick={() =>
              navigator.share?.({ url: window.location.href })
            }
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>

        {/* Blog Content */}
        <div
          className="prose prose-slate max-w-none
            prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full prose-img:mx-auto
            prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4
            prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-slate-200
            prose-td:border prose-td:border-slate-200"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Comments */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-4">Comments</h3>

          {user && (
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                placeholder="Write a comment..."
              />
              <button
                onClick={handleComment}
                className="mt-2 bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 transition"
              >
                Post Comment
              </button>
            </div>
          )}

          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="border-b pb-3">
                <p className="font-medium">{c.profiles?.full_name || 'User'}</p>
                <p className="text-slate-700">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
