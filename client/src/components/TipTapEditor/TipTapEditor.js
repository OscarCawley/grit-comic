import React, { useEffect, useState } from 'react';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import './TipTapEditor.css';

const TipTapEditor = ({ content, onChange, limit }) => {
    const [charCount, setCharCount] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            ...(limit ? [CharacterCount.configure({ limit })] : []),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
            
            const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, '', '');
            setCharCount(text.length);
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, false); // false = don't emit `onUpdate`
        }
    }, [content, editor]);

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
                    className={editor.isActive('strike') ? 'active' : ''}
                >Strike</button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive('underline') ? 'active' : ''}
                >Underline</button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'active' : ''}
                >• List</button>
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

            {limit && (
                <div className="character-count">
                    {charCount}/{limit}
                </div>
            )}
        </div>
    );
};

export default TipTapEditor;
