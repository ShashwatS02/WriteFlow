// Dev-friendly mock uploader for images. Returns a data URL or placeholder URL.
export async function mockUpload(file: File) {
  // For dev, return a blob URL
  return URL.createObjectURL(file);
}
