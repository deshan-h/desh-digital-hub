export const parseTimestamp = (ts) => {
  if (!ts) return new Date();
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

/**
 * Converts Google Drive view/share links or Dropbox links into direct download links.
 * Example input: https://drive.google.com/file/d/1aB2c3D4e5/view?usp=sharing
 * Example output: https://drive.google.com/uc?export=download&id=1aB2c3D4e5
 */
export const formatDirectDownloadLink = (url) => {
  if (!url) return '';
  let trimmed = url.trim();

  // 1. Google Drive Links
  if (trimmed.includes('drive.google.com')) {
    // Matches /file/d/FILE_ID/
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileDMatch[1]}`;
    }

    // Matches ?id=FILE_ID or &id=FILE_ID
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${idParamMatch[1]}`;
    }
  }

  // 2. Dropbox Links (change dl=0 to dl=1)
  if (trimmed.includes('dropbox.com')) {
    if (trimmed.includes('dl=0')) {
      return trimmed.replace('dl=0', 'dl=1');
    }
    if (!trimmed.includes('dl=1')) {
      return trimmed.includes('?') ? `${trimmed}&dl=1` : `${trimmed}?dl=1`;
    }
  }

  // Ensure http/https prefix
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }

  return trimmed;
};
