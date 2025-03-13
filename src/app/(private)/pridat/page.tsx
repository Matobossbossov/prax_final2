// src/app/prispevok/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function AddPostPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, upload the image
      const formData = new FormData();
      formData.append("file", image);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { imageUrl } = await uploadResponse.json();

      // Then, create the post
      const postResponse = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          caption,
        }),
      });

      if (!postResponse.ok) {
        throw new Error("Failed to create post");
      }

      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Create New Post
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Upload Image
              </Button>
            </label>

            {preview && (
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                  width: "100%",
                  maxHeight: 400,
                  objectFit: "contain",
                  mt: 2,
                  borderRadius: 1,
                }}
              />
            )}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            sx={{ mb: 3 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading || !image}
            sx={{ width: "100%" }}
          >
            {loading ? <CircularProgress size={24} /> : "Create Post"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
