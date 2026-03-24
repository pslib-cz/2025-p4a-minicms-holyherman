"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

type Post = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  concept: boolean;
  publishDate: string | null;
  tags: { tag: { id: string; name: string } }[];
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${p}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosts(page);
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, alignItems: "center" }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          My Posts
        </Typography>
        <Button
          component={Link}
          href="/dashboard/posts/new"
          variant="contained"
          startIcon={<AddIcon />}
          disableElevation
        >
          Create Post
        </Button>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }} aria-label="posts table">
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">You haven't created any posts yet.</Typography>
                    <Button component={Link} href="/dashboard/posts/new" sx={{ mt: 2 }} variant="outlined">
                      Create your first post
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body1" fontWeight="medium">
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        /{post.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {post.concept ? (
                        <Chip label="Draft" color="default" size="small" />
                      ) : post.published ? (
                        <Chip label="Published" color="success" size="small" />
                      ) : (
                        <Chip label="Archived" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {post.tags.map((t) => (
                          <Chip key={t.tag.id} label={t.tag.name} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell align="right">
                      {post.published && !post.concept && (
                        <IconButton component="a" href={`/posts/${post.slug}`} target="_blank" size="small" color="primary" title="View Public Post">
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton component={Link} href={`/dashboard/posts/${post.id}/edit`} size="small" color="info" title="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(post.id)} size="small" color="error" title="Delete">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {!loading && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
