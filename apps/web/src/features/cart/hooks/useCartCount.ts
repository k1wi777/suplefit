"use client";

import { useEffect, useState } from "react";
import { getCartCount, subscribeCart } from "../utils/cart";

export function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setCount(getCartCount());
    });
    const unsubscribe = subscribeCart(() => {
      if (active) setCount(getCartCount());
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return count;
}
