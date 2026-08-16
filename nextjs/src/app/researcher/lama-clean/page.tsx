"use client";

import { useEffect, useState } from "react";
import LamaCleanPanel from "@/components/researcher/LamaCleanPanel";

export default function LamaCleanPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return <LamaCleanPanel user={user} />;
}
