import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Save, X } from 'lucide-react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from '../../ckeditor/CustomEditor';
import type { Blog } from '../../types/database';
import { slugify } from '../../utils/slugify';

/* ---------------- Supabase Upload Adapter ---------------- */
class SupabaseUploadAdapter {
  loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  async upload() {
    const file = await this.loader.file;
    const ext = file.name.split('.').pop();
    const path = `blog/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from('blog_images')
      .upload(path, file, { contentType: file.type, cacheControl: '3600' });

    if (error) throw error;

    const { data } = supabase.storage
      .from('blog_images')
      .getPublicUrl(path);

    return { default: data.publicUrl }; // 🔥 Public URL required
  }

  abort() {}
}

function SupabaseUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter =
    (loader: any) => new SupabaseUploadAdapter(loader);
}

/* ---------------- BlogEditor ---------------- */
export function BlogEditor({
  blog,
  onSave,
  onCancel
}: {
  blog?: Blog;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setExcerpt(blog.excerpt || '');
      setContent(blog.content || '');
    }
  }, [blog]);

  // Generate a unique slug for new blogs
  const generateUniqueSlug = async (title: string) => {
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;

    while (true) {
      const { data } = await supabase
        .from('blogs')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (!data) break;
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    console.log('SAVED HTML:', content);

    if (blog) {
      // Editing blog, keep slug unchanged
      await supabase
        .from('blogs')
        .update({ title, excerpt, content })
        .eq('id', blog.id);
    } else {
      const slug = await generateUniqueSlug(title);

      await supabase.from('blogs').insert({
        title,
        excerpt,
        content,
        slug, // ✅ unique slug
        author_id: user.id,
      });
    }

    onSave();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">
          {blog ? 'Edit Blog' : 'Create Blog'}
        </h2>
        <button onClick={onCancel}><X /></button>
      </div>

      <input
        className="w-full text-3xl font-bold mb-3 outline-none"
        placeholder="Blog title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        className="w-full mb-4 outline-none text-gray-600"
        placeholder="Excerpt"
        value={excerpt}
        onChange={e => setExcerpt(e.target.value)}
      />

      <CKEditor
        editor={CustomEditor}
        data={content}
        onChange={(e, editor) => setContent(editor.getData())}
        config={{
          extraPlugins: [SupabaseUploadAdapterPlugin],
          toolbar: [
            'heading', '|',
            'bold', 'italic', 'underline', '|',
            'link', 'imageUpload', 'blockQuote', 'insertTable', '|',
            'bulletedList', 'numberedList', '|',
            'undo', 'redo'
          ],
          image: {
            toolbar: [
              'imageTextAlternative',
              'imageStyle:full',
              'imageStyle:alignLeft',
              'imageStyle:alignRight',
              'resizeImage:25',
              'resizeImage:50',
              'resizeImage:75',
            ],
            resizeOptions: [
              { name: 'resizeImage:25', value: '25', label: '25%' },
              { name: 'resizeImage:50', value: '50', label: '50%' },
              { name: 'resizeImage:75', value: '75', label: '75%' },
              { name: 'resizeImage:original', value: null, label: 'Original' }
            ],
          },
          mediaEmbed: {
            previewsInData: true, // 🔥 allows YouTube and other links
          },
        }}
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-black text-white py-3 mt-6 rounded"
      >
        <Save className="inline mr-2" /> Publish
      </button>
    </div>
  );
}
