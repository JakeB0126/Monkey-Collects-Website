import type { Product, ProductStatus } from "@/lib/products";

export type CartItem = {
  productId: string;
  quantity: number;
  product: CartProductSnapshot;
};

export type CartLine = {
  product: CartProductSnapshot;
  quantity: number;
  lineSubtotalCents: number;
};

export type CartProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  productType: string;
  priceCents: number;
  stockQuantity: number;
  status: ProductStatus;
  images: string[];
};

export const CART_STORAGE_KEY = "monkey-collects-cart";
export const CART_UPDATED_EVENT = "monkey-collects-cart-updated";

export function toCartProductSnapshot(product: Product): CartProductSnapshot {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    productType: product.productType,
    priceCents: product.priceCents,
    stockQuantity: product.stockQuantity,
    status: product.status,
    images: product.images
  };
}

export function canAddProductToCart(product: CartProductSnapshot) {
  return product.status === "active" && product.stockQuantity > 0;
}

export function readCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!storedCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart
      .filter(
        (item): item is CartItem =>
          typeof item?.productId === "string" &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          typeof item.product?.id === "string" &&
          typeof item.product.name === "string" &&
          typeof item.product.productType === "string" &&
          typeof item.product.priceCents === "number" &&
          typeof item.product.stockQuantity === "number" &&
          typeof item.product.status === "string" &&
          Array.isArray(item.product.images)
      )
      .map((item) => ({
        ...item,
        quantity: Math.min(item.quantity, item.product.stockQuantity)
      }))
      .filter((item) => item.quantity > 0);
  } catch {
    return [];
  }
}

export function writeCartItems(cartItems: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { cartItems } }));
}

export function addCartItem(cartItems: CartItem[], product: CartProductSnapshot) {
  if (!canAddProductToCart(product)) {
    return cartItems;
  }

  const existingItem = cartItems.find((item) => item.productId === product.id);

  if (existingItem) {
    return cartItems.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: Math.min(item.quantity + 1, product.stockQuantity) }
        : item
    );
  }

  return [...cartItems, { productId: product.id, quantity: 1, product }];
}

export function updateCartItemQuantity(cartItems: CartItem[], productId: string, quantity: number) {
  const product = cartItems.find((item) => item.productId === productId)?.product;

  if (!product || !canAddProductToCart(product)) {
    return cartItems.filter((item) => item.productId !== productId);
  }

  if (quantity <= 0) {
    return cartItems.filter((item) => item.productId !== productId);
  }

  return cartItems.map((item) =>
    item.productId === productId ? { ...item, quantity: Math.min(quantity, product.stockQuantity) } : item
  );
}

export function removeCartItem(cartItems: CartItem[], productId: string) {
  return cartItems.filter((item) => item.productId !== productId);
}

export function getCartLines(cartItems: CartItem[]) {
  return cartItems.reduce<CartLine[]>((lines, item) => {
    if (!canAddProductToCart(item.product)) {
      return lines;
    }

    const quantity = Math.min(item.quantity, item.product.stockQuantity);

    if (quantity <= 0) {
      return lines;
    }

    return [
      ...lines,
      {
        product: item.product,
        quantity,
        lineSubtotalCents: item.product.priceCents * quantity
      }
    ];
  }, []);
}

export function getCartSubtotalCents(cartLines: CartLine[]) {
  return cartLines.reduce((subtotal, line) => subtotal + line.lineSubtotalCents, 0);
}
