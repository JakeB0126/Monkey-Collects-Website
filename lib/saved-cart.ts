import { getPrismaClient } from "@/lib/prisma";

export type SavedCartInputItem = {
  productId: string;
  quantity: number;
};

function normalizeSavedCartItems(items: SavedCartInputItem[]) {
  const quantityByProductId = new Map<string, number>();

  for (const item of items) {
    if (typeof item.productId !== "string" || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      continue;
    }

    quantityByProductId.set(item.productId, (quantityByProductId.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(quantityByProductId, ([productId, quantity]) => ({
    productId,
    quantity
  }));
}

export async function getSavedCartForUser(userId: string) {
  const prisma = getPrismaClient();

  return prisma.savedCart.findUnique({
    where: {
      userId
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });
}

export async function getOrCreateSavedCartForUser(userId: string) {
  const prisma = getPrismaClient();

  return prisma.savedCart.upsert({
    where: {
      userId
    },
    update: {},
    create: {
      userId
    }
  });
}

export async function syncLocalCartItemsToSavedCart(userId: string, items: SavedCartInputItem[]) {
  const normalizedItems = normalizeSavedCartItems(items);
  const prisma = getPrismaClient();
  const cart = await getOrCreateSavedCartForUser(userId);

  if (normalizedItems.length === 0) {
    return readSavedCartItemsWithProducts(userId);
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: normalizedItems.map((item) => item.productId)
      }
    },
    select: {
      id: true,
      stockQuantity: true
    }
  });
  const stockQuantityByProductId = new Map(products.map((product) => [product.id, product.stockQuantity]));
  const mergeItems = normalizedItems.filter((item) => (stockQuantityByProductId.get(item.productId) ?? 0) > 0);

  if (mergeItems.length === 0) {
    return readSavedCartItemsWithProducts(userId);
  }

  const existingItems = await prisma.cartItem.findMany({
    where: {
      cartId: cart.id,
      productId: {
        in: mergeItems.map((item) => item.productId)
      }
    },
    select: {
      productId: true,
      quantity: true
    }
  });
  const existingQuantityByProductId = new Map(existingItems.map((item) => [item.productId, item.quantity]));

  await prisma.$transaction(
    mergeItems.map((item) => {
      const existingQuantity = existingQuantityByProductId.get(item.productId) ?? 0;
      const stockQuantity = stockQuantityByProductId.get(item.productId) ?? 0;

      return prisma.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: item.productId
          },
        },
        update: {
          quantity: Math.min(existingQuantity + item.quantity, stockQuantity)
        },
        create: {
          cartId: cart.id,
          productId: item.productId,
          quantity: Math.min(item.quantity, stockQuantity)
        }
      });
    })
  );

  return readSavedCartItemsWithProducts(userId);
}

export async function replaceSavedCartItemsForUser(userId: string, items: SavedCartInputItem[]) {
  const normalizedItems = normalizeSavedCartItems(items);
  const prisma = getPrismaClient();
  const cart = await getOrCreateSavedCartForUser(userId);

  if (normalizedItems.length === 0) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id
      }
    });

    return readSavedCartItemsWithProducts(userId);
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: normalizedItems.map((item) => item.productId)
      }
    },
    select: {
      id: true,
      stockQuantity: true
    }
  });
  const stockQuantityByProductId = new Map(products.map((product) => [product.id, product.stockQuantity]));
  const validItems = normalizedItems
    .map((item) => ({
      ...item,
      quantity: Math.min(item.quantity, stockQuantityByProductId.get(item.productId) ?? 0)
    }))
    .filter((item) => item.quantity > 0);

  await prisma.$transaction([
    prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: {
          notIn: validItems.map((item) => item.productId)
        }
      }
    }),
    ...validItems.map((item) =>
      prisma.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: item.productId
          }
        },
        update: {
          quantity: item.quantity
        },
        create: {
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity
        }
      })
    )
  ]);

  return readSavedCartItemsWithProducts(userId);
}

export async function readSavedCartItemsWithProducts(userId: string) {
  const prisma = getPrismaClient();
  const cart = await prisma.savedCart.findUnique({
    where: {
      userId
    },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      items: {
        orderBy: {
          createdAt: "asc"
        },
        select: {
          id: true,
          productId: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
              category: true,
              productType: true,
              priceCents: true,
              stockQuantity: true,
              status: true,
              images: true
            }
          }
        }
      }
    }
  });

  if (cart) {
    return cart;
  }

  return {
    ...(await getOrCreateSavedCartForUser(userId)),
    items: []
  };
}

export async function updateSavedCartItemQuantity(userId: string, productId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Quantity must be a non-negative integer.");
  }

  const cart = await getOrCreateSavedCartForUser(userId);
  const prisma = getPrismaClient();

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId
      }
    });

    return readSavedCartItemsWithProducts(userId);
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId
      }
    },
    update: {
      quantity
    },
    create: {
      cartId: cart.id,
      productId,
      quantity
    }
  });

  return readSavedCartItemsWithProducts(userId);
}

export async function removeSavedCartItem(userId: string, productId: string) {
  const cart = await getSavedCartForUser(userId);

  if (!cart) {
    return readSavedCartItemsWithProducts(userId);
  }

  const prisma = getPrismaClient();

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      productId
    }
  });

  return readSavedCartItemsWithProducts(userId);
}
