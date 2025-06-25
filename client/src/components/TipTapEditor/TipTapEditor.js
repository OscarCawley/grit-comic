import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './TipTapEditor.css';

const TipTapEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className="editor-wrapper">
            <div className="toolbar">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'active' : ''}
                >Bold</button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'active' : ''}
                >Italic</button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? 'active' : ''}>Strike
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'active' : ''}>• List
                </button>
                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'active' : ''}
                >1. List</button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={editor.isActive('paragraph') ? 'active' : ''}
                >¶</button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
                >H2</button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                >Undo</button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                >Redo</button>
            </div>
        <EditorContent editor={editor} className="editor" />
        </div>
    );
};

export default TipTapEditor;