export const MAX_PRODUCT_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

export const allowedProductImageTypes = ["image/jpeg", "image/png", "image/webp"];
export const allowedProductImageExtensions = ["jpg", "jpeg", "png", "webp"];

export function formatProductImageUploadLimit() {
  return `${MAX_PRODUCT_IMAGE_UPLOAD_BYTES / 1024 / 1024} MB`;
}

export function getProductImageExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isAllowedProductImage(fileName: string, fileType: string) {
  return (
    allowedProductImageTypes.includes(fileType) &&
    allowedProductImageExtensions.includes(getProductImageExtension(fileName))
  );
}
