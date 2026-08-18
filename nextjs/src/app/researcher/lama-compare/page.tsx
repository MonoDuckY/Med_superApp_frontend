"use client";

import { useEffect, useState } from "react";
import LamaComparePanel from "@/components/researcher/LamaComparePanel";

export default function LamaComparePage() {
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

  return <LamaComparePanel user={user} />;
}
