import { Calendar, User, ArrowLeft } from 'lucide-react';

interface BlogWithAuthor {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface BlogDetailProps {
  blog: BlogWithAuthor;
  onBack: () => void;
}

export function BlogDetail({ blog, onBack }: BlogDetailProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to all posts
      </button>

      <article className="bg-white rounded-xl shadow-lg p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-slate-200">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            <span className="font-medium">
              {blog.profiles?.full_name || blog.profiles?.email || 'Anonymous'}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            <span>
              {new Date(blog.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
            {blog.content}
          </div>
        </div>
      </article>
    </div>
  );
}
