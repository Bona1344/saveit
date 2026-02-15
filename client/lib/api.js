const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchInfo(url) {
  try {
    const response = await fetch(`${API_URL}/api/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch media info.');
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Make sure the backend is running.');
    }
    throw err;
  }
}

export async function startDownload(url, formatId, quality) {
  try {
    const response = await fetch(`${API_URL}/api/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, format_id: formatId, quality }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to start download.');
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Make sure the backend is running.');
    }
    throw err;
  }
}

export async function checkStatus(jobId) {
  try {
    const response = await fetch(`${API_URL}/api/status/${jobId}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to check download status.');
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Make sure the backend is running.');
    }
    throw err;
  }
}

export function getFileDownloadUrl(filename) {
  return `${API_URL}/api/file/${filename}`;
}
