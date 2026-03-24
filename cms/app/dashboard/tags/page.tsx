"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

type Tag = {
  id: string;
  name: string;
  slug: string;
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (res.ok) {
        setNewTagName("");
        fetchTags();
      } else {
        const errText = await res.text();
        setError(errText || "Failed to create tag");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove the tag from all posts.")) return;

    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTags();
      } else {
        alert("Failed to delete tag");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={4}>
        Tags Management
      </Typography>

      <Card variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Create New Tag</Typography>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <TextField
              label="Tag Name"
              variant="outlined"
              size="small"
              fullWidth
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              error={!!error}
              helperText={error}
              disabled={creating}
            />
            <Button
              type="submit"
              variant="contained"
              disableElevation
              startIcon={creating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              disabled={!newTagName.trim() || creating}
              sx={{ height: 40, whiteSpace: "nowrap" }}
            >
              Add Tag
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : tags.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No tags have been created yet.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {tags.map((tag, i) => (
              <Box key={tag.id}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDelete(tag.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={<Typography fontWeight="medium">{tag.name}</Typography>}
                    secondary={`Slug: ${tag.slug}`}
                  />
                </ListItem>
                {i < tags.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Card>
    </Box>
  );
}
