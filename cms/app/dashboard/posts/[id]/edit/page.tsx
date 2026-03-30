"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { use } from "react";

const Editor = dynamic(() => import("@/app/components/Editor"), { ssr: false });

type Tag = { id: string; name: string };

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  const [initLoading, setInitLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isConcept, setIsConcept] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/tags").then((res) => res.json()),
      fetch(`/api/posts/${postId}`).then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
    ])
      .then(([tagsData, postData]) => {
        setTags(tagsData);
        setFormData({
          title: postData.title,
          description: postData.description || "",
          content: postData.content,
        });
        setSelectedTags(postData.tags.map((t: any) => t.tag.id));
        setIsPublished(postData.published);
        setIsConcept(postData.concept);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load post data");
        router.push("/dashboard/posts");
      })
      .finally(() => {
        setInitLoading(false);
      });
  }, [postId, router]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async (publishAction: boolean = false) => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.content.trim() || formData.content === "<p></p>") newErrors.content = "Content is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (publishAction) {
      setPublishLoading(true);
    } else {
      setSaveLoading(true);
    }

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: selectedTags,
          ...(publishAction ? { concept: false, published: true } : { concept: isConcept, published: isPublished }),
        }),
      });

      if (res.ok) {
        if (publishAction) {
          router.push("/dashboard/posts");
          router.refresh();
        } else {
          alert("Saved successfully!");
        }
      } else {
        alert("Failed to update post.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      if (publishAction) setPublishLoading(false);
      else setSaveLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex justify-center mt-16">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <Link
        href="/dashboard/posts"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Posts
      </Link>

      <div className="flex justify-between mb-8 items-center">
        <h1 className="font-[var(--font-display)] text-2xl font-bold text-on-surface">
          Edit Post
        </h1>
        {isConcept ? (
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-secondary-container/20 text-secondary uppercase tracking-wider">Draft</span>
        ) : isPublished ? (
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary-fixed/20 text-primary uppercase tracking-wider">Published</span>
        ) : (
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-secondary-container/30 text-secondary uppercase tracking-wider">Archived</span>
        )}
      </div>

      <div className="bg-surface-lowest rounded-3xl shadow-ambient p-8">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-on-surface-variant font-[var(--font-body)] mb-2">
              Post Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`block w-full px-4 py-2.5 rounded-xl bg-surface-lowest text-on-surface text-sm outline-none transition-colors font-[var(--font-body)] ${errors.title ? "border border-secondary" : "ghost-border ghost-border-focus"}`}
              required
            />
            {errors.title && <p className="mt-1.5 text-xs text-secondary font-medium">{errors.title}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-on-surface-variant font-[var(--font-body)] mb-2">
              Short Description (SEO & Preview)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-surface-lowest ghost-border ghost-border-focus text-on-surface text-sm outline-none transition-colors font-[var(--font-body)]"
            />
          </div>

          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-on-surface-variant font-[var(--font-body)] mb-2">
              Tags
            </label>
            <div
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="flex flex-wrap gap-1.5 min-h-[42px] px-4 py-2 rounded-xl bg-surface-lowest ghost-border cursor-pointer items-center"
            >
              {selectedTags.length === 0 ? (
                <span className="text-sm text-on-surface-variant/50">Select tags...</span>
              ) : (
                selectedTags.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  return (
                    <span key={tagId} className="chip-tag rounded-md px-2.5 py-0.5 text-xs font-semibold">
                      {tag?.name || tagId}
                    </span>
                  );
                })
              )}
            </div>
            {showTagDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-surface-lowest rounded-xl shadow-ambient-lg py-2 max-h-48 overflow-y-auto">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "text-primary bg-primary-fixed/10"
                        : "text-on-surface-variant hover:bg-surface-low"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-on-surface-variant font-[var(--font-body)] mb-2">
              Content *
            </label>
            <Editor
              content={formData.content}
              onChange={(html) => handleChange("content", html)}
            />
            {errors.content && <p className="mt-1.5 text-xs text-secondary font-medium">{errors.content}</p>}
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={saveLoading || publishLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full ghost-border text-sm font-semibold text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-40"
            >
              {saveLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saveLoading || publishLoading || (isPublished && !isConcept)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full gradient-primary text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {publishLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
