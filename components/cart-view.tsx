"use client";

import { useEffect, useMemo, useState } from "react";
import {
  startCheckout,
  validateCartItems,
  type CartValidationIssue,
  type CartValidationResult
} from "@/app/cart/actions";
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

function getIssuesForProduct(productId: string, issues: CartValidationIssue[]) {
  return issues.filter((issue) => issue.productId === productId);
}

export function CartView() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [isValidatingCart, setIsValidatingCart] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [unavailableItems, setUnavailableItems] = useState<CartValidationIssue[]>([]);
  const [stockIssues, setStockIssues] = useState<CartValidationIssue[]>([]);
  const [priceChanges, setPriceChanges] = useState<CartValidationIssue[]>([]);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const cartLines = useMemo(() => getCartLines(cartItems), [cartItems]);
  const subtotalCents = getCartSubtotalCents(cartLines);

  function applyValidationResult(result: CartValidationResult) {
    const nextCartItems: CartItem[] = result.validItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.productId,
        slug: item.slug,
        name: item.name,
        productType: item.productType,
        priceCents: item.priceCents,
        stockQuantity: item.stockQuantity,
        status: item.status,
        images: item.images
      }
    }));

    setCartItems(nextCartItems);
    writeCartItems(nextCartItems);
    setUnavailableItems(result.unavailableItems);
    setStockIssues(result.stockIssues);
    setPriceChanges(result.priceChanges);
  }

  useEffect(() => {
    const storedItems = readCartItems();

    setCartItems(storedItems);
    setHasLoadedCart(true);

    if (storedItems.length === 0) {
      return;
    }

    setIsValidatingCart(true);
    validateCartItems(
      storedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceCents: item.product.priceCents
      }))
    )
      .then(applyValidationResult)
      .catch(() => {
        setUnavailableItems([
          {
            productId: "cart-validation",
            message: "Cart could not be refreshed. Please try again."
          }
        ]);
      })
      .finally(() => {
        setIsValidatingCart(false);
      });
  }, []);

  function saveCartItems(nextCartItems: CartItem[]) {
    setCartItems(nextCartItems);
    writeCartItems(nextCartItems);
    setCheckoutError(null);
  }

  async function handleCheckout() {
    setCheckoutError(null);
    setIsStartingCheckout(true);

    try {
      const result = await startCheckout(
        cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.product.priceCents
        }))
      );

      if (result.status === "success") {
        window.location.assign(result.checkoutUrl);
        return;
      }

      setCheckoutError(result.message);

      if (result.status === "cart_error") {
        applyValidationResult(result.validation);
      }
    } catch {
      setCheckoutError("Checkout could not be started. Please try again.");
    } finally {
      setIsStartingCheckout(false);
    }
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
      {isValidatingCart ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm font-semibold text-neutral-700 shadow-sm">
          Refreshing cart prices and availability...
        </div>
      ) : null}

      {unavailableItems.length > 0 || stockIssues.length > 0 || priceChanges.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-neutral-800 shadow-sm">
          {[...unavailableItems, ...stockIssues, ...priceChanges].map((issue, index) => (
            <p key={`${issue.productId}-${index}`} className="font-semibold">
              {issue.message}
            </p>
          ))}
        </div>
      ) : null}

      {checkoutError ? (
        <div className="rounded-lg border border-store-red bg-red-50 p-4 text-sm font-semibold text-store-red shadow-sm">
          {checkoutError}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        {cartLines.map((line) => {
          const image = line.product.images[0] ?? "/product-placeholder.svg";
          const lineIssues = [
            ...getIssuesForProduct(line.product.id, stockIssues),
            ...getIssuesForProduct(line.product.id, priceChanges)
          ];

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
                  {lineIssues.map((issue) => (
                    <p key={issue.message} className="mt-2 text-sm font-semibold text-store-red">
                      {issue.message}
                    </p>
                  ))}
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
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => saveCartItems([])}
            className="rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold transition hover:bg-neutral-100"
          >
            Clear cart
          </button>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isValidatingCart || isStartingCheckout}
            className="rounded-md bg-store-red px-4 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {isStartingCheckout ? "Starting checkout..." : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
