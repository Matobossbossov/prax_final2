// src/app/profil/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Container, Typography, Box, Avatar, Grid, Paper, CircularProgress } from "@mui/material";
import { Post, Profile, User } from "@prisma/client";

type UserWithProfile = User & {
  profile: Profile | null;
  posts: Post[];
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch(`/api/user/profile`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container>
        <Typography>User not found</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
            <Avatar
              src={userData.profile?.avatarUrl || userData.image || undefined}
              alt={userData.name || "User"}
              sx={{ width: 150, height: 150, mx: "auto" }}
            >
              {!userData.profile?.avatarUrl && !userData.image && (userData.name?.charAt(0) || "U")}
            </Avatar>
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h4" gutterBottom>
              {userData.name || "Anonymous User"}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {userData.profile?.bio || "No bio yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Location: {userData.profile?.location || "Not specified"}
            </Typography>
            {userData.profile?.interests && userData.profile.interests.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Interests:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {userData.profile.interests.map((interest, index) => (
                    <Paper
                      key={index}
                      sx={{
                        px: 2,
                        py: 1,
                        backgroundColor: "primary.main",
                        color: "white",
                        borderRadius: 2,
                      }}
                    >
                      {interest}
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Posts Grid */}
      <Typography variant="h5" gutterBottom>
        My Posts
      </Typography>
      <Grid container spacing={3}>
        {userData.posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Paper
              elevation={2}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={post.imageUrl}
                alt={post.caption || "Post image"}
                sx={{
                  width: "100%",
                  height: 300,
                  objectFit: "cover",
                }}
              />
              {post.caption && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2">{post.caption}</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {userData.posts.length === 0 && (
        <Typography variant="body1" textAlign="center" sx={{ mt: 4 }}>
          No posts yet. Create your first post!
        </Typography>
      )}
    </Container>
  );
}
