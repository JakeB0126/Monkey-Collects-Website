"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent
} from "react";
import {
  emptyProductFormState,
  type ProductFormState,
  type ProductFormValues
} from "@/lib/admin-product-form";
import {
  formatProductImageUploadLimit,
  isAllowedProductImage,
  MAX_PRODUCT_IMAGE_UPLOAD_BYTES
} from "@/lib/product-image-upload";
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

type DropdownOption = {
  label: string;
  value: string;
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

function AdminDropdown({
  label,
  name,
  onChange,
  options,
  value
}: {
  label: string;
  name: string;
  onChange?: (value: string) => void;
  options: DropdownOption[];
  value: string;
}) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectedOption = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setIsOpen(false);
    }
  }

  function selectOption(nextValue: string) {
    setSelectedValue(nextValue);
    onChange?.(nextValue);
    setIsOpen(false);
  }

  return (
    <div className="relative" onBlur={handleBlur}>
      <input type="hidden" name={name} value={selectedValue} />
      <span id={id} className="text-sm font-bold text-neutral-700">
        {label}
      </span>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={id}
        onClick={() => setIsOpen((current) => !current)}
        className="mt-2 flex w-full items-center justify-between gap-3 rounded-md border border-neutral-300 bg-white px-3 py-2 text-left text-sm text-ink shadow-sm transition hover:border-neutral-400 focus:border-store-red focus:outline-none focus:ring-2 focus:ring-red-100"
      >
        <span>{selectedOption?.label ?? "Choose an option"}</span>
        <span aria-hidden="true" className="text-xs text-neutral-500">
          v
        </span>
      </button>
      {isOpen ? (
        <div
          role="listbox"
          aria-labelledby={id}
          className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-md border border-neutral-200 bg-white p-1 text-sm shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option.value || "empty"}
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              onClick={() => selectOption(option.value)}
              className={`block w-full rounded px-3 py-2 text-left transition ${
                option.value === selectedValue
                  ? "bg-red-50 font-bold text-store-red"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getOptions(options: string[], currentValue: string) {
  return Array.from(new Set([...options, currentValue].map((option) => option.trim()).filter(Boolean))).sort();
}

function formatOptionLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getImageUrlsFromText(value: string) {
  return value
    .split(/\r?\n/)
    .map((image) => image.trim())
    .filter(Boolean);
}

function getImageUploadError(file: File) {
  if (!isAllowedProductImage(file.name, file.type)) {
    return "Upload JPG, PNG, or WebP product images only.";
  }

  if (file.size > MAX_PRODUCT_IMAGE_UPLOAD_BYTES) {
    return `Each product image must be ${formatProductImageUploadLimit()} or smaller.`;
  }

  return null;
}

export function ProductForm({ action, filterOptions, product, submitLabel }: ProductFormProps) {
  const [state, formAction] = useActionState(action, getInitialState(product));
  const values: ProductFormValues = state.values;
  const [selectedCategory, setSelectedCategory] = useState(values.category);
  const [imageUrls, setImageUrls] = useState(values.images);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<{ name: string; url: string }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productTypeOptions = getOptions(filterOptions.productTypes, values.productType);
  const pokemonSetOptions = getOptions(filterOptions.pokemonSets, values.pokemonSet);
  const isPokemonTcg = selectedCategory === "pokemon_tcg";
  const savedImageUrls = getImageUrlsFromText(imageUrls);

  useEffect(() => {
    setImageUrls(values.images);
  }, [values.images]);

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedImagePreviews]);

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    const invalidFile = files.find((file) => getImageUploadError(file));

    selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setSelectedImagePreviews([]);

    if (invalidFile) {
      setUploadError(getImageUploadError(invalidFile));
      event.currentTarget.value = "";
      return;
    }

    setUploadError(null);
    setSelectedImagePreviews(files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })));
  }

  async function uploadSelectedImages() {
    const files = Array.from(fileInputRef.current?.files ?? []);

    if (files.length === 0) {
      setUploadError("Choose at least one image to upload.");
      return;
    }

    const invalidFile = files.find((file) => getImageUploadError(file));

    if (invalidFile) {
      setUploadError(getImageUploadError(invalidFile));
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fetch("/admin/product-images", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as { urls?: string[]; error?: string };

      if (!response.ok || !result.urls?.length) {
        setUploadError(result.error ?? "Image upload failed. Try again.");
        return;
      }

      setImageUrls([...savedImageUrls, ...result.urls].join("\n"));
      setSelectedImagePreviews([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setUploadError("Image upload failed. Check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  }

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
          rows={5}
          defaultValue={values.description}
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <FieldError message={state.fieldErrors.description} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <AdminDropdown
            label="Category"
            name="category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={productCategories.map((category) => ({
              label: category === "pokemon_tcg" ? "Pokemon TCG" : formatOptionLabel(category),
              value: category
            }))}
          />
          <FieldError message={state.fieldErrors.category} />
        </div>
        <div>
          <AdminDropdown
            label="Product Type"
            name="productType"
            value={values.productType}
            options={[
              { label: "No product type", value: "" },
              ...productTypeOptions.map((productType) => ({
                label: productType,
                value: productType
              }))
            ]}
          />
          <FieldError message={state.fieldErrors.productType} />
        </div>
        {isPokemonTcg ? (
          <div>
            <AdminDropdown
              label="Pokemon Set"
              name="pokemonSet"
              value={values.pokemonSet}
              options={[
                { label: "No Pokemon set", value: "" },
                ...pokemonSetOptions.map((pokemonSet) => ({
                  label: pokemonSet,
                  value: pokemonSet
                }))
              ]}
            />
            <FieldError message={state.fieldErrors.pokemonSet} />
          </div>
        ) : (
          <input type="hidden" name="pokemonSet" value="" />
        )}
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
        <div>
          <AdminDropdown
            label="Status"
            name="status"
            value={values.status}
            options={productStatuses.map((status) => ({
              label: formatOptionLabel(status),
              value: status
            }))}
          />
          <FieldError message={state.fieldErrors.status} />
        </div>
      </div>

      <div>
        <span className="text-sm font-bold text-neutral-700">Images</span>
        <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-4">
          <label className="block">
            <span className="text-sm font-bold text-neutral-700">Upload from computer</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelection}
              className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={uploadSelectedImages}
            disabled={isUploading || selectedImagePreviews.length === 0}
            className="mt-3 rounded-md bg-store-red px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {isUploading ? "Uploading..." : "Upload selected images"}
          </button>
          {uploadError ? <p className="mt-2 text-sm font-semibold text-store-red">{uploadError}</p> : null}
          {selectedImagePreviews.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {selectedImagePreviews.map((preview) => (
                <div key={preview.url} className="rounded-md border border-neutral-200 bg-white p-2">
                  <img src={preview.url} alt="" className="aspect-[4/3] w-full rounded object-cover" />
                  <p className="mt-2 truncate text-xs font-semibold text-neutral-600">{preview.name}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-neutral-700">Image URLs</span>
          <textarea
            name="images"
            required
            rows={4}
            value={imageUrls}
            onChange={(event) => setImageUrls(event.currentTarget.value)}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <FieldError message={state.fieldErrors.images} />
        </label>

        {savedImageUrls.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {savedImageUrls.map((image) => (
              <div key={image} className="rounded-md border border-neutral-200 bg-white p-2">
                <img src={image} alt="" className="aspect-[4/3] w-full rounded bg-neutral-100 object-cover" />
                <p className="mt-2 truncate text-xs font-semibold text-neutral-600">{image}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

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
