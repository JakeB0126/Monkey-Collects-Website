import { getActiveProductBySlug, products, type Product } from "@/lib/products";

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartLine = {
  product: Product;
  quantity: number;
  lineSubtotalCents: number;
};

export const CART_STORAGE_KEY = "monkey-collects-cart";

export function canAddProductToCart(product: Product) {
  return product.status === "active" && product.stockQuantity > 0;
}

export function getCartProduct(slug: string) {
  const product = getActiveProductBySlug(slug);

  if (!product || !canAddProductToCart(product)) {
    return undefined;
  }

  return product;
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
          item.quantity > 0
      )
      .map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);

        return {
          productId: item.productId,
          quantity: product ? Math.min(item.quantity, product.stockQuantity) : item.quantity
        };
      })
      .filter((item) => item.quantity > 0);
  } catch {
    return [];
  }
}

export function writeCartItems(cartItems: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

export function addCartItem(cartItems: CartItem[], product: Product) {
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

  return [...cartItems, { productId: product.id, quantity: 1 }];
}

export function updateCartItemQuantity(cartItems: CartItem[], productId: string, quantity: number) {
  const product = products.find((candidate) => candidate.id === productId);

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
    const product = products.find((candidate) => candidate.id === item.productId);

    if (!product || !canAddProductToCart(product)) {
      return lines;
    }

    const quantity = Math.min(item.quantity, product.stockQuantity);

    if (quantity <= 0) {
      return lines;
    }

    return [
      ...lines,
      {
        product,
        quantity,
        lineSubtotalCents: product.priceCents * quantity
      }
    ];
  }, []);
}

export function getCartSubtotalCents(cartLines: CartLine[]) {
  return cartLines.reduce((subtotal, line) => subtotal + line.lineSubtotalCents, 0);
}
