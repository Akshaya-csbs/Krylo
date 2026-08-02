"use client";

import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    // Login is handled by the main page via state management
    window.location.replace("/");
  }, []);

  return null;
}
