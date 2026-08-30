"use client";

import { motion } from "motion/react";
import { UsersThree, Plus, Trash, ChatCircle, ShareNetwork, CaretUp } from "@phosphor-icons/react";
import { useState } from "react";
import { createCommunityPost, deleteCommunityPost } from "@/lib/actions";

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  } | null;
};

export default function CommunityClient({ initialPosts, currentUserId, university, major }: { initialPosts: Post[], currentUserId: string, university?: string | null, major?: string | null }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Diskusi Umum");
  const [filter, setFilter] = useState("Semua");

  const categories = ["Diskusi Umum", "Tanya PR", "Cari Teman Belajar", "Info Kampus"];

  const filteredPosts = filter === "Semua" ? posts : posts.filter(p => p.category === filter);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsCreating(true);
    try {
      const post = await createCommunityPost(title, content, category);
      // Optimistic addition
      const newPost: Post = {
        ...post,
        user: { name: "You", email: "" }
      };
      setPosts([newPost, ...posts]);
      setTitle("");
      setContent("");
    } catch (e) {
      console.error(e);
      alert("Failed to create post");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus postingan ini?")) return;
    setPosts(posts.filter(p => p.id !== id));
    try {
      await deleteCommunityPost(id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
      <header className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3"
        >
          <UsersThree weight="fill" className="text-[var(--color-primary)]" />
          Komunitas {university ? `Kampus` : 'Global'}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[var(--color-text-muted)] mt-2"
        >
          {university 
            ? `Diskusikan PR, berbagi info kampus, dan cari teman belajar dari ${university}${major ? ` (Jurusan ${major})` : ''}.`
            : "Diskusikan PR, berbagi info kampus, dan cari teman belajar. Atur universitas di profil untuk masuk ke komunitas kampusmu!"
          }
        </motion.p>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setFilter("Semua")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === "Semua" ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]"}`}
        >
          Semua
        </button>
        {categories.map(c => (
          <button 
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === c ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Create Post */}
      <div className="mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl w-full shadow-sm">
        <h3 className="text-sm font-semibold mb-3 text-[var(--color-text)]">Buat Postingan Baru</h3>
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            placeholder="Judul Diskusi" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <textarea 
            placeholder="Isi pesanmu..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)] resize-none"
          />
          <div className="flex justify-between items-center">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              onClick={handleCreate}
              disabled={isCreating}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors font-medium text-sm disabled:opacity-50"
            >
              <Plus weight="bold" />
              {isCreating ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + Math.min(i, 10) * 0.05 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] font-bold">
                  {(post.user?.name || "Anon")[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[var(--color-text)]">{post.user?.name || "Anonim"}</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">{new Date(post.createdAt).toLocaleString("id-ID")}</p>
                </div>
              </div>
              {post.userId === currentUserId && (
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="text-[var(--color-text-muted)] hover:text-red-500 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>

            <div className="mt-3">
              <span className="inline-block px-2 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] text-[10px] font-medium rounded-md text-[var(--color-text-muted)] mb-2">
                {post.category}
              </span>
              <h3 className="font-bold text-lg text-[var(--color-text)] mb-1">{post.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            <div className="flex gap-4 mt-5 pt-4 border-t border-[var(--color-border)] text-[var(--color-text-muted)]">
              <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[var(--color-primary)] transition-colors">
                <CaretUp size={16} weight="bold" />
                <span>Upvote</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[var(--color-primary)] transition-colors">
                <ChatCircle size={16} weight="bold" />
                <span>Balas</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[var(--color-primary)] transition-colors">
                <ShareNetwork size={16} weight="bold" />
                <span>Bagikan</span>
              </button>
            </div>
          </motion.div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            <UsersThree size={48} className="mb-4 opacity-50" />
            <p>Belum ada diskusi untuk kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
