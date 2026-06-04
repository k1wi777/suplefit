"use client";

import { useEffect, useState } from "react";
import { getCartCount, subscribeCart } from "@/lib/cart";

export function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCartCount());
    return subscribeCart(() => setCount(getCartCount()));
  }, []);

  return count;
}
