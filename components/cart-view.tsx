"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCartLines,
  getCartSubtotalCents,
  readCartItems,
  removeCartItem,
  updateCartItemQuantity,
  writeCartItems,
  type CartItem
} from "@/lib/cart";
import { formatPrice } from "@/lib/products";

export function CartView() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const cartLines = useMemo(() => getCartLines(cartItems), [cartItems]);
  const subtotalCents = getCartSubtotalCents(cartLines);

  useEffect(() => {
    const storedItems = readCartItems();

    setCartItems(storedItems);
    setHasLoadedCart(true);
  }, []);

  function saveCartItems(nextCartItems: CartItem[]) {
    setCartItems(nextCartItems);
    writeCartItems(nextCartItems);
  }

  if (!hasLoadedCart) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-base leading-7 text-neutral-700">Loading cart...</p>
      </div>
    );
  }

  if (cartLines.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-base leading-7 text-neutral-700">
          Your cart is empty. Add a product from a product detail page to start a local cart.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        {cartLines.map((line) => {
          const image = line.product.images[0] ?? "/product-placeholder.svg";

          return (
            <div
              key={line.product.id}
              className="grid gap-4 border-b border-neutral-200 p-4 last:border-b-0 sm:grid-cols-[120px_1fr] sm:p-5"
            >
              <img
                src={image}
                alt={line.product.name}
                className="aspect-[4/3] w-full rounded-md bg-neutral-100 object-cover sm:w-[120px]"
              />
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <h2 className="text-lg font-bold text-ink">{line.product.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-neutral-600">{line.product.productType}</p>
                  <p className="mt-3 text-sm text-neutral-700">Price: {formatPrice(line.product.priceCents)}</p>
                  <p className="mt-1 text-sm text-neutral-700">
                    Line subtotal: {formatPrice(line.lineSubtotalCents)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      saveCartItems(updateCartItemQuantity(cartItems, line.product.id, line.quantity - 1))
                    }
                    className="h-10 w-10 rounded-md border border-neutral-300 bg-white text-lg font-bold transition hover:bg-neutral-100"
                    aria-label={`Decrease quantity for ${line.product.name}`}
                  >
                    -
                  </button>
                  <span className="min-w-12 rounded-md bg-neutral-100 px-3 py-2 text-center text-sm font-bold">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      saveCartItems(updateCartItemQuantity(cartItems, line.product.id, line.quantity + 1))
                    }
                    disabled={line.quantity >= line.product.stockQuantity}
                    className="h-10 w-10 rounded-md border border-neutral-300 bg-white text-lg font-bold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                    aria-label={`Increase quantity for ${line.product.name}`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => saveCartItems(removeCartItem(cartItems, line.product.id))}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold transition hover:bg-neutral-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-neutral-500">Cart subtotal</p>
          <p className="mt-1 text-2xl font-bold text-store-red">{formatPrice(subtotalCents)}</p>
        </div>
        <button
          type="button"
          onClick={() => saveCartItems([])}
          className="rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold transition hover:bg-neutral-100"
        >
          Clear cart
        </button>
      </div>
    </div>
  );
}
