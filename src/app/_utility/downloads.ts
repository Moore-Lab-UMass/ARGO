import html2canvas from "html2canvas";

//Imported from old SCREEN
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const downloadLink = document.createElement("a")
  downloadLink.href = url
  downloadLink.download = filename
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}

export function downloadTSV(text, filename) {
  downloadBlob(new Blob([text], { type: "text/plain" }), filename)
}

export const fetchFileSize = async (url: string, setFileSize: React.Dispatch<React.SetStateAction<number>>) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      setFileSize(parseInt(contentLength, 10));
    }
  } catch (error) {
    console.log("error fetching file size for ", url, error)
  }
}

export async function downloadChart(
  chartContainer: HTMLElement | null,
  filename = "chart.png"
) {
  if (!chartContainer) return;

  try {
    const canvas = await html2canvas(chartContainer, {
      backgroundColor: null,
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Failed to download chart", err);
  }
}