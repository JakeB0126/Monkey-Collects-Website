"use client";

import { useState } from "react";
import { addCartItem, getCartProduct, readCartItems, writeCartItems } from "@/lib/cart";

type AddToCartButtonProps = {
  productSlug: string;
};

export function AddToCartButton({ productSlug }: AddToCartButtonProps) {
  const [message, setMessage] = useState("");
  const product = getCartProduct(productSlug);

  function handleAddToCart() {
    if (!product) {
      setMessage("This product is not available.");
      return;
    }

    const currentCart = readCartItems();
    const nextCart = addCartItem(currentCart, product);
    const nextItem = nextCart.find((item) => item.productId === product.id);

    writeCartItems(nextCart);

    if (nextItem?.quantity === product.stockQuantity) {
      setMessage(`Added. Cart has the maximum available quantity: ${product.stockQuantity}.`);
      return;
    }

    setMessage("Added to cart.");
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!product}
        className="w-full rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 sm:w-auto"
      >
        Add to cart
      </button>
      {message ? <p className="mt-3 text-sm font-semibold text-neutral-700">{message}</p> : null}
    </div>
  );
}
