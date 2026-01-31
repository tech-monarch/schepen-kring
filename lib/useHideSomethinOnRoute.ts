"use client";

import { usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";

export function useHideSomethingOnRoute(routes: string[]) {
  const router = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (routes.includes(router)) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [router, routes]);

  return hidden;
}
