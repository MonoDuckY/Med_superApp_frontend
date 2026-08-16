"use client";

import { useEffect, useState } from "react";
import AiComparePanel from "@/components/researcher/AiComparePanel";

export default function AiComparePage() {
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

  return <AiComparePanel user={user} />;
}
