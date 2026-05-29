export async function downloadImage(url: string, fileName: string) {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("fetch failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
