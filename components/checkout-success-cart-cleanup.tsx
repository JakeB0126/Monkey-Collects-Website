"use client";

import { useEffect } from "react";
import { writeCartItems } from "@/lib/cart";

type CheckoutSuccessCartCleanupProps = {
  skip?: boolean;
};

export function CheckoutSuccessCartCleanup({ skip = false }: CheckoutSuccessCartCleanupProps) {
  useEffect(() => {
    if (skip) {
      return;
    }

    writeCartItems([]);
  }, [skip]);

  return null;
}
