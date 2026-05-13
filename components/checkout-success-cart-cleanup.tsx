"use client";

import { useEffect } from "react";
import { writeCartItems } from "@/lib/cart";

export function CheckoutSuccessCartCleanup() {
  useEffect(() => {
    writeCartItems([]);
  }, []);

  return null;
}
