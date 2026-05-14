"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_UPDATED_EVENT, readCartItems } from "@/lib/cart";

type HeaderCartLinkProps = {
  className: string;
  initialCount: number;
};

function getCartQuantity() {
  return readCartItems().reduce((count, item) => count + item.quantity, 0);
}

export function HeaderCartLink({ className, initialCount }: HeaderCartLinkProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    function refreshCount() {
      setCount(getCartQuantity());
    }

    refreshCount();
    window.addEventListener(CART_UPDATED_EVENT, refreshCount);
    window.addEventListener("storage", refreshCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refreshCount);
      window.removeEventListener("storage", refreshCount);
    };
  }, []);

  return (
    <Link href="/cart" className={className}>
      Cart ({count})
    </Link>
  );
}
