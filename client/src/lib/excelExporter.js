/*
* D:\QLDT-app\client\src\lib\excelExporter.js
* Phiên bản cập nhật: 18/08/2025
* Tóm tắt:
* - Nâng cấp `exportToExcel` để có thể nhận và chèn thêm khối dữ liệu thống kê vào cuối file.
* - Bổ sung hàm mới `exportToCSV` để xuất dữ liệu ra định dạng file CSV.
*/
import * as XLSX from 'xlsx';
import moment from 'moment-timezone';

/**
 * Xuất dữ liệu ra file Excel với các tùy chọn định dạng, tiêu đề và khối thống kê.
 * @param {object} options - Các tùy chọn để xuất file.
 * @param {Array<object>} options.data - Mảng dữ liệu chính.
 * @param {string} options.filename - Tên file.
 * @param {object} [options.columnConfig={}] - Cấu hình cột.
 * @param {string} [options.mainTitle=''] - Tiêu đề chính.
 * @param {string} [options.subTitle=''] - Tiêu đề phụ.
 * @param {Array<object>} [options.statsData=[]] - Dữ liệu thống kê để chèn vào cuối file.
 */
export const exportToExcel = ({ data, filename, columnConfig = {}, mainTitle = '', subTitle = '', statsData = [] }) => {
  if (!data || data.length === 0) {
    console.error("No data to export.");
    return;
  }

  const timestamp = `Thời gian xuất dữ liệu: ${moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}`;
  const worksheet = XLSX.utils.aoa_to_sheet([[]]);

  XLSX.utils.sheet_add_aoa(worksheet, [[mainTitle]], { origin: 'A1' });
  XLSX.utils.sheet_add_aoa(worksheet, [[subTitle]], { origin: 'A2' });
  XLSX.utils.sheet_add_aoa(worksheet, [[timestamp]], { origin: 'A3' });

  XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A5' });

  const numCols = Object.keys(data[0]).length;
  if (numCols > 1) {
      worksheet['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: numCols - 1 } },
          { s: { r: 2, c: 0 }, e: { r: 2, c: numCols - 1 } }
      ];
  }

  const headers = Object.keys(data[0]);
  const columnWidths = headers.map((key, index) => {
    if (index === 0) return { wch: 5 };
    const headerWidth = key.length;
    const dataWidths = data.map(row => {
      const value = row[key];
      if (value === null || value === undefined) return 0;
      if (value instanceof Date) return 12;
      const config = columnConfig[key] || {};
      if (typeof value === 'number' && config.format && config.format.includes(',')) {
         return value.toLocaleString('vi-VN').length;
      }
      return String(value).length;
    });
    return { wch: Math.max(headerWidth, ...dataWidths) + 2 };
  });
  worksheet['!cols'] = columnWidths;

  const dataStartRow = 4;
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  ['A1', 'A2', 'A3'].forEach(cellRef => {
      if(worksheet[cellRef]) {
          worksheet[cellRef].s = {
              font: { bold: true },
              alignment: { vertical: 'center', horizontal: 'center' }
          };
      }
  });

  for (let R = dataStartRow; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R };
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      const cell = worksheet[cell_ref];
      if (!cell) continue;
      const headerText = headers[C];
      const config = columnConfig[headerText] || {};
      if (R === dataStartRow) {
        cell.s = {
          font: { bold: true, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "E9E9E9" } },
          alignment: { vertical: 'center', horizontal: 'center' }
        };
      } else {
        if (!cell.s) cell.s = {};
        cell.s.alignment = { vertical: 'center', horizontal: config.align || 'left' };
        if (config.format && typeof cell.v === 'number') cell.z = config.format;
        if (cell.v instanceof Date) {
            cell.t = 'd';
            cell.z = config.format || 'dd/mm/yyyy';
        }
        if (config.type) cell.t = config.type;
      }
    }
  }

  // BỔ SUNG: Chèn khối thống kê
  if (statsData.length > 0) {
    let lastRow = range.e.r + 3; // Bắt đầu sau 2 dòng trống
    const statsRows = statsData.map(item => 
        // Nếu không có label (dòng trống), trả về mảng rỗng. Ngược lại, thêm ô trống ở đầu để bắt đầu từ cột B.
        item.label ? ['', item.label, item.value] : []
    );
    XLSX.utils.sheet_add_aoa(worksheet, statsRows, { origin: `A${lastRow}` });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Xuất dữ liệu ra file CSV.
 * @param {object} options - Các tùy chọn để xuất file.
 * @param {Array<object>} options.data - Mảng dữ liệu JSON.
 * @param {string} options.filename - Tên file (không có phần mở rộng).
 */
export const exportToCSV = ({ data, filename }) => {
    if (!data || data.length === 0) {
        console.error("No data to export.");
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    
    // Thêm BOM để Excel đọc đúng UTF-8
    const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};