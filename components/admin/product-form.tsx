"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  emptyProductFormState,
  type ProductFormState,
  type ProductFormValues
} from "@/lib/admin-product-form";
import { productCategories, productStatuses, type Product } from "@/lib/products";

type ProductFormProps = {
  action: (previousState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  filterOptions: {
    productTypes: string[];
    pokemonSets: string[];
  };
  product?: Product;
  submitLabel: string;
};

function getInitialState(product?: Product): ProductFormState {
  if (!product) {
    return emptyProductFormState;
  }

  return {
    values: {
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      productType: product.productType,
      pokemonSet: product.pokemonSet ?? "",
      priceCents: String(product.priceCents),
      stockQuantity: String(product.stockQuantity),
      status: product.status,
      featured: product.featured,
      images: product.images.join("\n")
    },
    fieldErrors: {}
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm font-semibold text-store-red">{message}</p>;
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
    >
      {label}
    </button>
  );
}

function getOptions(options: string[], currentValue: string) {
  return Array.from(new Set([...options, currentValue].map((option) => option.trim()).filter(Boolean))).sort();
}

export function ProductForm({ action, filterOptions, product, submitLabel }: ProductFormProps) {
  const [state, formAction] = useActionState(action, getInitialState(product));
  const values: ProductFormValues = state.values;
  const productTypeOptions = getOptions(filterOptions.productTypes, values.productType);
  const pokemonSetOptions = getOptions(filterOptions.pokemonSets, values.pokemonSet);

  return (
    <form action={formAction} className="mt-8 space-y-6 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      {state.formError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-store-red">
          {state.formError}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Name</span>
          <input
            name="name"
            required
            defaultValue={values.name}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <FieldError message={state.fieldErrors.name} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Slug</span>
          <input
            name="slug"
            required
            defaultValue={values.slug}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <FieldError message={state.fieldErrors.slug} />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-neutral-700">Description</span>
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={values.description}
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <FieldError message={state.fieldErrors.description} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Category</span>
          <select
            name="category"
            required
            defaultValue={values.category}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {productCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.category} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Product Type</span>
          <select
            name="productType"
            required
            defaultValue={values.productType}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Choose a product type
            </option>
            {productTypeOptions.map((productType) => (
              <option key={productType} value={productType}>
                {productType}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.productType} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Pokemon Set</span>
          <select
            name="pokemonSet"
            defaultValue={values.pokemonSet}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">No Pokemon set</option>
            {pokemonSetOptions.map((pokemonSet) => (
              <option key={pokemonSet} value={pokemonSet}>
                {pokemonSet}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.pokemonSet} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Price Cents</span>
          <input
            name="priceCents"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={values.priceCents}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <FieldError message={state.fieldErrors.priceCents} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Stock Quantity</span>
          <input
            name="stockQuantity"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={values.stockQuantity}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <FieldError message={state.fieldErrors.stockQuantity} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Status</span>
          <select
            name="status"
            required
            defaultValue={values.status}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {productStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.status} />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-neutral-700">Image URLs</span>
        <textarea
          name="images"
          required
          rows={4}
          defaultValue={values.images}
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <FieldError message={state.fieldErrors.images} />
      </label>

      <label className="flex items-center gap-3 text-sm font-bold text-neutral-700">
        <input name="featured" type="checkbox" defaultChecked={values.featured} className="h-4 w-4" />
        Featured product
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton label={submitLabel} />
        <Link
          href="/admin/products"
          className="rounded-md border border-neutral-300 bg-white px-5 py-3 text-center text-sm font-bold text-ink transition hover:bg-neutral-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
