import { CartView } from "@/components/cart-view";
import type { CartItem } from "@/lib/cart";
import { getCurrentCustomerSession } from "@/lib/customer-auth";
import { readSavedCartItemsWithProducts } from "@/lib/saved-cart";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const customer = await getCurrentCustomerSession();
  const savedCart = customer ? await readSavedCartItemsWithProducts(customer.id) : null;
  const initialSavedCartItems: CartItem[] =
    savedCart?.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        productType: item.product.productType,
        priceCents: item.product.priceCents,
        stockQuantity: item.product.stockQuantity,
        status: item.product.status,
        images: item.product.images
      }
    })) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Cart</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Your cart</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Review quantities before checkout. The server refreshes product availability and pricing before payment.
      </p>
      <div className="mt-6">
        <CartView initialSavedCartItems={initialSavedCartItems} />
      </div>
    </div>
  );
}
