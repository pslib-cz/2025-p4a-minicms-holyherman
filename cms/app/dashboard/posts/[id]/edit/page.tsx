"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  OutlinedInput,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PublicIcon from "@mui/icons-material/Public";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dynamic from "next/dynamic";
import { use } from "react";

// Dynamically import TipTap editor so SSR doesn't crash on browser APIs
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
  const [isPublished, setIsPublished] = useState(false);
  const [isConcept, setIsConcept] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    tags: [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch tags and post data
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
          tags: postData.tags.map((t: any) => t.tag.id),
        });
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

  const handleSave = async (publishAction: boolean = false) => {
    // Basic validation
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
          // If publishing action is taken, concept becomes false and published true
          ...(publishAction ? { concept: false, published: true } : { concept: isConcept, published: isPublished }),
        }),
      });

      if (res.ok) {
        if (publishAction) {
          router.push("/dashboard/posts");
          router.refresh();
        } else {
          // just saved
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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Button
        component={Link}
        href="/dashboard/posts"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Posts
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, alignItems: "center" }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Edit Post
        </Typography>
        <Box>
          {isConcept ? (
            <Chip label="Draft / Concept" color="default" sx={{ fontWeight: "medium" }} />
          ) : isPublished ? (
            <Chip label="Published" color="success" sx={{ fontWeight: "medium" }} />
          ) : (
             <Chip label="Archived" color="warning" sx={{ fontWeight: "medium" }} />
          )}
        </Box>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4, pt: 3 }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }}>
            <TextField
              label="Post Title"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              margin="normal"
              required
            />

            <TextField
              label="Short Description (SEO & Preview)"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="tags-label">Tags</InputLabel>
              <Select
                labelId="tags-label"
                multiple
                value={formData.tags}
                onChange={(e) => handleChange("tags", typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                input={<OutlinedInput id="select-multiple-chip" label="Tags" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const tag = tags.find((t) => t.id === value);
                      return <Chip key={value} label={tag?.name || value} size="small" />;
                    })}
                  </Box>
                )}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" error={!!errors.content}>
              <Typography variant="subtitle2" color="text.secondary" mb={1} sx={{ pl: 0.5 }}>
                Content *
              </Typography>
              <Editor
                content={formData.content}
                onChange={(html) => handleChange("content", html)}
              />
              {errors.content && <FormHelperText>{errors.content}</FormHelperText>}
            </FormControl>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button
                type="submit"
                variant="outlined"
                size="large"
                startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={saveLoading || publishLoading}
              >
                Save Changes
              </Button>

              <Button
                type="button"
                variant="contained"
                color="success"
                size="large"
                startIcon={publishLoading ? <CircularProgress size={20} color="inherit" /> : <PublicIcon />}
                disabled={saveLoading || publishLoading || (isPublished && !isConcept)}
                disableElevation
                onClick={() => handleSave(true)}
              >
                Publish Post
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
