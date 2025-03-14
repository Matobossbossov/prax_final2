"use client";

import * as React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LoginIcon from "@mui/icons-material/Login";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Sun icon
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Moon icon
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useThemeToggle } from "../components/ThemeProvider";
import ProfileMenu from "./ProfileMenu";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const toggleTheme = useThemeToggle(); // Theme toggle function

  // Load theme preference from localStorage on mount
  const [isSun, setIsSun] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      setIsSun(savedTheme !== "dark"); // Ensure consistency with stored theme
    }
  }, []);

  // Toggle the sun/moon icon and theme mode
  const handleThemeToggle = () => {
    setIsSun((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "light" : "dark"); // Save the theme
      return newTheme;
    });
    toggleTheme();
  };

  const handleNavigation = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === "profile-menu") {
      return; // Do nothing when clicking profile
    }
    
    if (
      !session &&
      newValue !== "/auth/registracia" &&
      newValue !== "/auth/prihlasenie" &&
      newValue !== "/" &&
      newValue !== "/o-mne"
    ) {
      router.push("/auth/registracia");
    } else {
      router.push(newValue);
    }
  };

  const nonAuthPaths = [
    { label: "Domov", value: "/", icon: <HomeIcon /> },
    { label: "O mne", value: "/o-mne", icon: <AccessibilityIcon /> },
    { label: "Registrácia", value: "/auth/registracia", icon: <AppRegistrationIcon /> },
    { label: "Prihlásenie", value: "/auth/prihlasenie", icon: <LoginIcon /> },
  ];

  const authPaths = [
    { label: "Domov", value: "/prispevok", icon: <HomeIcon /> },
    { label: "Hľadať", value: "/hladat", icon: <SearchIcon /> },
    { label: "Pridať", value: "/pridat", icon: <AddCircleIcon /> },
    {
      label: "Profil",
      value: "profile-menu",
      icon: <ProfileMenu />,
    }
  ];

  const navigationPaths = status === "authenticated" ? authPaths : nonAuthPaths;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        zIndex: 1000,
      }}
    >
      <BottomNavigation
        value={pathname}
        onChange={handleNavigation}
        sx={{ height: "60px" }}
      >
        {navigationPaths.map((path) => (
          <BottomNavigationAction
            key={path.value}
            value={path.value}
            icon={path.icon}
            label={path.label}
          />
        ))}
        <IconButton
          onClick={handleThemeToggle}
          sx={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {isSun ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </BottomNavigation>
    </Box>
  );
}