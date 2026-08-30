"use client";

import { motion } from "motion/react";
import { UsersThree, Plus, Trash, ChatCircle, ShareNetwork, CaretUp, ShieldCheck } from "@phosphor-icons/react";
import { useState } from "react";
import { createCommunityPost, deleteCommunityPost } from "@/lib/actions";
import { toast } from "sonner";

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

export default function CommunityClient({
  initialPosts,
  currentUserId,
  university,
  major,
}: {
  initialPosts: Post[];
  currentUserId: string;
  university?: string | null;
  major?: string | null;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Diskusi Umum");
  const [filter, setFilter] = useState("Semua");

  const categories = ["Diskusi Umum", "Tanya PR", "Cari Teman Belajar", "Info Kampus"];

  const filteredPosts = filter === "Semua" ? posts : posts.filter((p) => p.category === filter);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Judul dan isi postingan tidak boleh kosong.");
      return;
    }

    setIsCreating(true);
    const tempId = `temp-${Date.now()}`;
    const newPost: Post = {
      id: tempId,
      title: title.trim(),
      content: content.trim(),
      category,
      userId: currentUserId,
      createdAt: new Date(),
      user: { name: "Anda", email: "" },
    };

    setPosts([newPost, ...posts]);
    setTitle("");
    setContent("");

    try {
      const saved = await createCommunityPost(newPost.title, newPost.content, newPost.category);
      setPosts((curr) => curr.map((p) => (p.id === tempId ? { ...p, id: saved.id } : p)));
      toast.success("Postingan berhasil diterbitkan!");
    } catch (e: any) {
      setPosts((curr) => curr.filter((p) => p.id !== tempId));
      toast.error(e.message || "Gagal membuat postingan.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const previous = [...posts];
    setPosts((curr) => curr.filter((p) => p.id !== id));

    try {
      await deleteCommunityPost(id);
      toast.success("Postingan berhasil dihapus.");
    } catch (e: any) {
      setPosts(previous);
      toast.error(e.message || "Gagal menghapus postingan.");
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 pt-6 min-h-screen">
      <header className="mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3"
        >
          <UsersThree weight="fill" className="text-[var(--color-primary)]" />
          Komunitas {university ? `Kampus (${university})` : "Mahasiswa"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[var(--color-text-muted)] mt-1 text-sm"
        >
          {university
            ? `Berbagi informasi seputar ${university}${major ? ` (Jurusan ${major})` : ""}, diskusikan PR, dan cari teman belajar.`
            : "Forum diskusi santai seputar tugas kuliah, info kampus, dan kelompok belajar."}
        </motion.p>
      </header>

      {/* Community Rules Banner */}
      <div className="mb-6 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-start gap-3 shadow-sm">
        <ShieldCheck size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5" weight="fill" />
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          <strong>Etika Komunitas:</strong> Jaga sopan santun, dilarang menyebarkan materi bajakan berbayar atau melakukan ujaran kebencian. Postingan yang melanggar akan dimoderasi oleh sistem.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilter("Semua")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === "Semua"
              ? "bg-[var(--color-primary)] text-white shadow-sm"
              : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          Semua Topik
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === c
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Create Post Form */}
      <div className="mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-3xl w-full shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[var(--color-text)]">Buat Diskusi Baru</h3>
        <input
          type="text"
          placeholder="Judul topik diskusi..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
        <textarea
          placeholder="Tuliskan pertanyaan, materi yang membingungkan, atau info penting..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none"
        />
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-1">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors font-semibold text-xs disabled:opacity-50 shadow-sm"
          >
            <Plus weight="bold" />
            <span>{isCreating ? "Menerbitkan..." : "Terbitkan Diskusi"}</span>
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.04 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                  {(post.user?.name || "A")[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[var(--color-text)]">
                    {post.user?.name || "Mahasiswa"}
                  </h4>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {new Date(post.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {post.userId === currentUserId && (
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-[var(--color-text-muted)] hover:text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Hapus postingan"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>

            <div className="mt-3">
              <span className="inline-block px-2.5 py-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[10px] font-semibold rounded-md text-[var(--color-primary)] mb-1.5">
                {post.category}
              </span>
              <h3 className="font-bold text-base text-[var(--color-text)] mb-1">{post.title}</h3>
              <p className="text-xs text-[var(--color-text)] whitespace-pre-wrap leading-relaxed opacity-90">
                {post.content}
              </p>
            </div>
          </motion.div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 text-center">
            <UsersThree size={48} className="mb-3 opacity-30 text-[var(--color-primary)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">Belum ada diskusi untuk topik ini.</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Jadilah yang pertama memulai diskusi atau bertanya tugas!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
