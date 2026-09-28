/** Converts a `data:application/pdf;base64,...` URI (as produced by jsPDF) into a Blob. */
export const dataUriToBlob = (dataUri: string): Blob => {
  const binary = atob(dataUri.split(',')[1] ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'application/pdf' });
};
