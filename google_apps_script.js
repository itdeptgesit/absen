/**
 * SCRIPT UNTUK GOOGLE SPREADSHEET
 * 
 * CARA PENGGUNAAN:
 * 1. Buka Google Spreadsheet baru.
 * 2. Klik menu "Ekstensi" > "Apps Script".
 * 3. Hapus semua kode yang ada, lalu paste kode di bawah ini.
 * 4. Klik ikon "Simpan" (atau Ctrl+S).
 * 5. Klik tombol "Terapkan" (Deploy) di kanan atas > "Deployment baru".
 * 6. Pilih jenis: "Aplikasi Web".
 * 7. Isi Deskripsi (misal: "API Absensi V1").
 * 8. Jalankan sebagai: "Saya (email Anda)".
 * 9. Yang memiliki akses: "Siapa saja" (PENTING!).
 * 10. Klik "Terapkan". Jika diminta otorisasi, setujui semuanya (Advanced -> Go to script).
 * 11. Copy URL Web App yang muncul.
 * 12. Paste URL tersebut di file `src/App.tsx` pada baris `const GOOGLE_SCRIPT_URL = '...'`.
 */

const SHEET_NAME = 'Sheet1'; // Pastikan nama sheet sesuai dengan yang ada di Spreadsheet Anda

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    // Jika sheet belum ada, buat otomatis
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Sheet dengan nama ' + SHEET_NAME + ' tidak ditemukan.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Jika ini baris pertama, tambahkan Header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Nama Lengkap', 'Departemen', 'Company', 'Kehadiran']);
      
      // Styling header sedikit
      const headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#0ea5e9');
      headerRange.setFontColor('white');
    }

    // Ambil data dari request web
    const timestamp = new Date();
    const nama = e.parameter.nama || '';
    const departemen = e.parameter.departemen || '';
    const company = e.parameter.company || '';
    const kehadiran = e.parameter.kehadiran || '';

    // Masukkan ke baris baru
    sheet.appendRow([timestamp, nama, departemen, company, kehadiran]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data berhasil disimpan'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi doGet untuk menarik data (digunakan oleh halaman Admin)
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Sheet dengan nama ' + SHEET_NAME + ' tidak ditemukan.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Jika tidak ada data atau hanya ada header
    if (values.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const headers = values[0];
    const rows = values.slice(1);
    
    // Format data menjadi array of objects
    const formattedData = rows.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: formattedData
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
