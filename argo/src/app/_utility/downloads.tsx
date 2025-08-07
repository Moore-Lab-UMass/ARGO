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