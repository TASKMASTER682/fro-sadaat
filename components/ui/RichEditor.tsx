'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}

export default function RichEditor({ value, onChange, placeholder = 'Write something...', dir = 'ltr' }: RichEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'royal-tiptap-editor',
        dir,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="royal-editor-wrapper">
      <div className="flex flex-wrap gap-1 p-2 bg-clan-dark-3 border border-clan-border rounded-t-lg">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-clan-dark-4 transition-colors ${editor.isActive('bold') ? 'bg-clan-gold/20 text-clan-gold' : 'text-muted-foreground'}`}
          title="Bold"
        >
          <span className="font-bold text-sm">B</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-clan-dark-4 transition-colors ${editor.isActive('italic') ? 'bg-clan-gold/20 text-clan-gold' : 'text-muted-foreground'}`}
          title="Italic"
        >
          <span className="italic text-sm">I</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-clan-dark-4 transition-colors ${editor.isActive('strike') ? 'bg-clan-gold/20 text-clan-gold' : 'text-muted-foreground'}`}
          title="Strikethrough"
        >
          <span className="line-through text-sm">S</span>
        </button>
        
        <div className="w-[1px] bg-clan-border mx-1" />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-clan-dark-4 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-clan-gold/20 text-clan-gold' : 'text-muted-foreground'}`}
          title="Heading 1"
        >
          <span className="text-xs font-bold">H1</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-clan-dark-4 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-clan-gold/20 text-clan-gold' : 'text-muted-foreground'}`}
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-clan-dark-4 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-clan-gold/20 text-clan-gold' : 'text-muted-foreground'}`}
          title="Heading 3"
        >
          <span className="text-xs font-bold">H3</span>
        </button>
        
        <div className="w-[1px] bg-clan-border mx-1" />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-clan-dark-4 transition-colors ${editor.isActive('bulletList') ? 'bg-clan-gold/20 text-clan-gold' : 'text-muted-foreground'}`}
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-clan-dark-4 transition-colors ${editor.isActive('orderedList') ? 'bg-clan-gold/20 text-clan-gold' : 'text-muted-foreground'}`}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20h14M7 12h14M7 4h14M3 20h.01M3 12h.01M3 4h.01" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-clan-dark-4 transition-colors ${editor.isActive('blockquote') ? 'bg-clan-gold/20 text-clan-gold' : 'text-muted-foreground'}`}
          title="Quote"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
          </svg>
        </button>
        
        <div className="w-[1px] bg-clan-border mx-1" />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-clan-dark-4 transition-colors text-muted-foreground disabled:opacity-30"
          title="Undo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l6-6M3 10l6 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-clan-dark-4 transition-colors text-muted-foreground disabled:opacity-30"
          title="Redo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2M21 10l-6-6M21 10l-6 6" />
          </svg>
        </button>
      </div>
      
      <EditorContent 
        editor={editor} 
        className="min-h-[300px] bg-clan-dark-3 border border-t-0 border-clan-border rounded-b-lg p-4"
      />
    </div>
  );
}
