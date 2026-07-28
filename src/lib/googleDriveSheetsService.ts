import { Pangkalan, UploadedDocument } from '../types';
import { DEFAULT_ADMIN_SHEET_ID, DEFAULT_ADMIN_SHEET_URL, INITIAL_PANGKALAN_LIST } from '../data/pangkalanData';

function parseRowsToPangkalan(rows: any[][]): Pangkalan[] {
  const fetchedList: Pangkalan[] = [];
  rows.forEach((row: any[], index: number) => {
    if (!row || row.length < 3 || !row[1]) return;

    const id = String(row[1]).trim();
    const nama = String(row[2] || '').trim();
    if (!id || !nama || id.toLowerCase() === 'id pangkalan') return;

    const alamat = String(row[3] || '').trim();
    const kelurahan = String(row[4] || '').trim();
    const kecamatan = String(row[5] || '').trim();
    const kabupaten = String(row[6] || 'NAGEKEO').trim();
    const propinsi = String(row[7] || 'NTT').trim();
    const kuota = parseInt(String(row[8]), 10) || 200;
    const status = String(row[9] || 'Aktif').trim();

    fetchedList.push({
      id,
      no: parseInt(String(row[0]), 10) || index + 1,
      nama,
      alamat: alamat || 'Mbay',
      kelurahan: kelurahan || 'Mbay',
      kecamatan: kecamatan || 'Aesesa',
      kabupaten: kabupaten || 'NAGEKEO',
      propinsi: propinsi || 'NTT',
      kuotaHarianLiter: kuota,
      kuotaBulananLiter: kuota * 30,
      statusPerizinan: (status.toLowerCase().includes('aktif') ? 'Aktif' : status) as any,
      namaUsaha: `Pangkalan ${nama}`,
      namaAgen: 'PT. PUTRA NGADA ENERGI (NAGEKEO)',
      agenId: 'agen_1',
    });
  });
  return fetchedList;
}

/**
 * Fetch existing Pangkalan rows from Google Sheet with API or CSV fallback
 */
export async function fetchPangkalanFromGoogleSheets(
  accessToken?: string | null,
  spreadsheetId: string = DEFAULT_ADMIN_SHEET_ID
): Promise<Pangkalan[]> {
  // 1. Try Google Sheets API if token provided
  if (accessToken) {
    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A2:J500`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.values && Array.isArray(data.values)) {
          return parseRowsToPangkalan(data.values);
        }
      }
    } catch (err) {
      console.warn('API fetch failed, attempting public CSV fallback:', err);
    }
  }

  // 2. Try Public CSV export fallback
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
    const res = await fetch(csvUrl);
    if (res.ok) {
      const text = await res.text();
      const lines = text.split(/\r?\n/).map((line) =>
        line.split(',').map((cell) => cell.replace(/^"(.*)"$/, '$1').trim())
      );
      if (lines.length > 1) {
        return parseRowsToPangkalan(lines.slice(1));
      }
    }
  } catch (err) {
    console.warn('CSV export fetch failed:', err);
  }

  return [];
}

/**
 * Export/Sync Pangkalan List to Google Sheets with automatic MERGE (Append & Preserve existing)
 */
export async function exportToGoogleSheets(
  accessToken: string,
  pangkalanList: Pangkalan[],
  existingSheetId?: string,
  allowCreateNewIfMissing: boolean = false
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; mergedPangkalanList: Pangkalan[] }> {
  try {
    let spreadsheetId = existingSheetId || DEFAULT_ADMIN_SHEET_ID;

    // 1. If no sheet ID, check if allowed to create new (Admin only)
    if (!spreadsheetId) {
      if (!allowCreateNewIfMissing) {
        throw new Error(
          'Google Sheet Admin Pusat belum terhubung. Konfigurasi awal Google Sheet Admin hanya dapat dilakukan oleh Admin di menu Pengaturan Admin.'
        );
      }

      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `Data Pangkalan Minyak Tanah PT PNE Nagekeo - Admin Pusat (${new Date().toLocaleDateString('id-ID')})`,
          },
        }),
      });

      if (!createRes.ok) {
        const errJson = await createRes.json();
        throw new Error(errJson.error?.message || 'Gagal membuat Google Spreadsheet Admin Pusat baru');
      }

      const createData = await createRes.json();
      spreadsheetId = createData.spreadsheetId;
    }

    // 2. Read existing rows from Google Sheet first to ensure NO EXISTING DATA IS EVER DELETED/OVERWRITTEN
    let existingSheetRows: Pangkalan[] = [];
    if (accessToken && spreadsheetId) {
      existingSheetRows = await fetchPangkalanFromGoogleSheets(accessToken, spreadsheetId);
    }

    // 3. Merge: Default Initial Data + Existing Google Sheet Rows + Local Pangkalan List
    const mergedMap = new Map<string, Pangkalan>();

    // Step A: Seed with default initial data (PGK-7777, PGK-6228)
    INITIAL_PANGKALAN_LIST.forEach((item) => {
      mergedMap.set(item.id.toLowerCase(), item);
    });

    // Step B: Add existing items from Google Sheet
    existingSheetRows.forEach((item) => {
      if (item.id) {
        const key = item.id.toLowerCase();
        const prev = mergedMap.get(key);
        mergedMap.set(key, prev ? { ...prev, ...item } : item);
      }
    });

    // Step C: Add/update local pangkalan entries
    pangkalanList.forEach((item) => {
      if (item.id) {
        const key = item.id.toLowerCase();
        const prev = mergedMap.get(key);
        mergedMap.set(key, prev ? { ...prev, ...item } : item);
      }
    });

    // Final consolidated array
    const mergedPangkalanList = Array.from(mergedMap.values()).map((p, idx) => ({
      ...p,
      no: idx + 1,
    }));

    // 4. Prepare headers and rows
    const headers = [
      'No',
      'ID Pangkalan',
      'Nama Pemilik / Pangkalan',
      'Alamat',
      'Kelurahan/Desa',
      'Kecamatan',
      'Kabupaten',
      'Provinsi',
      'Kuota Harian (Liter)',
      'Status Perizinan',
    ];

    const rows = mergedPangkalanList.map((p, index) => [
      index + 1,
      p.id,
      p.nama,
      p.alamat,
      p.kelurahan,
      p.kecamatan,
      p.kabupaten || 'NAGEKEO',
      p.propinsi || 'NTT',
      p.kuotaHarianLiter || 200,
      p.statusPerizinan || 'Aktif',
    ]);

    const values = [headers, ...rows];

    // 5. Update spreadsheet content safely
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:J${values.length}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!updateRes.ok) {
      const errJson = await updateRes.json();
      throw new Error(errJson.error?.message || 'Gagal menyimpan data ke Google Sheets');
    }

    return {
      spreadsheetId: spreadsheetId!,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      mergedPangkalanList,
    };
  } catch (err: any) {
    console.error('exportToGoogleSheets error:', err);
    throw err;
  }
}

/**
 * Ensure Drive Folder exists or create one
 */
async function getOrCreateDriveFolder(accessToken: string, folderName: string): Promise<string> {
  // Search for folder
  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData.error?.message || 'Gagal membuat folder di Google Drive');
  }

  const folderData = await createRes.json();
  return folderData.id;
}

/**
 * Upload Document / File to Google Drive
 */
export async function uploadFileToGoogleDrive(
  accessToken: string,
  doc: {
    fileName: string;
    fileType: string;
    fileDataUrl: string; // base64
    pangkalanName: string;
  }
): Promise<{ fileId: string; webViewLink: string }> {
  try {
    const folderId = await getOrCreateDriveFolder(accessToken, 'Berkas Pangkalan Nagekeo - PT PNE');

    // Extract base64
    const base64Parts = doc.fileDataUrl.split(',');
    const mimeType = doc.fileType || 'application/pdf';
    const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];

    // Convert base64 to Blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const fileBlob = new Blob([byteArray], { type: mimeType });

    // Multipart upload
    const metadata = {
      name: `[${doc.pangkalanName}] ${doc.fileName}`,
      parents: [folderId],
      mimeType: mimeType,
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', fileBlob);

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!uploadRes.ok) {
      const errJson = await uploadRes.json();
      throw new Error(errJson.error?.message || 'Gagal mengunggah berkas ke Google Drive');
    }

    const resData = await uploadRes.json();
    return {
      fileId: resData.id,
      webViewLink: resData.webViewLink || `https://drive.google.com/file/d/${resData.id}/view`,
    };
  } catch (err: any) {
    console.error('uploadFileToGoogleDrive error:', err);
    throw err;
  }
}
