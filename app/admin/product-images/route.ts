import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import {
  formatProductImageUploadLimit,
  getProductImageExtension,
  isAllowedProductImage,
  MAX_PRODUCT_IMAGE_UPLOAD_BYTES
} from "@/lib/product-image-upload";

export const runtime = "nodejs";

function getSafeFileName(fileName: string) {
  const extension = getProductImageExtension(fileName);
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${baseName || "product-image"}.${extension}`;
}

function hasBlobWriteCredentials() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID)
  );
}

export async function POST(request: Request) {
  if (!hasBlobWriteCredentials()) {
    return NextResponse.json(
      { error: "Image uploads are not configured. Add Vercel Blob storage and try again." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: "Choose at least one image to upload." }, { status: 400 });
  }

  for (const file of files) {
    if (!isAllowedProductImage(file.name, file.type)) {
      return NextResponse.json(
        { error: "Upload JPG, PNG, or WebP product images only." },
        { status: 400 }
      );
    }

    if (file.size > MAX_PRODUCT_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `Each product image must be ${formatProductImageUploadLimit()} or smaller.` },
        { status: 400 }
      );
    }
  }

  try {
    const blobs = await Promise.all(
      files.map((file) =>
        put(`product-images/${crypto.randomUUID()}-${getSafeFileName(file.name)}`, file, {
          access: "public",
          addRandomSuffix: true,
          contentType: file.type
        })
      )
    );

    return NextResponse.json({ urls: blobs.map((blob) => blob.url) });
  } catch {
    return NextResponse.json(
      { error: "Image upload failed. Check Vercel Blob storage and try again." },
      { status: 500 }
    );
  }
}
