/*jslint bitwise: true */
/*global XLSX, saveAs */
define(['./module', 'js-xlsx'], function (module) {
  "use strict";

  /**
   * Data format should have the same format as File example variable below.
   * Empty boxes are represented by null. Example:
   * var FileLine1, FileLine2 = [1, 2, null, '4th column', ...];
   * var File = [FileLine1, FileLine2, ...];
   */
  module.factory('core/common/files/ExportService', ['$log', function ($log) {
    /**
     * Utils
     */

    function datenum(v, date1904) {
      if (date1904) {
        v += 1462;
      }
      var epoch = Date.parse(v);
      return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    }

    function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
      }
      return buf;
    }

    /**
     * Export Specific Methods
     */

    function Workbook() {
      if (!(this instanceof Workbook)) {
        return new Workbook();
      }
      this.SheetNames = [];
      this.Sheets = {};
    }

    function buildWorkbookSheet(data) {
      var ws = {};
      var range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}};
      for (var R = 0; R !== data.length; ++R) {
        for (var C = 0; C !== data[R].length; ++C) {
          if (range.s.r > R) {
            range.s.r = R;
          }
          if (range.s.c > C) {
            range.s.c = C;
          }
          if (range.e.r < R) {
            range.e.r = R;
          }
          if (range.e.c < C) {
            range.e.c = C;
          }
          var cell = {v: data[R][C]};
          if (cell.v === null) {
            continue;
          }
          var cell_ref = XLSX.utils.encode_cell({c: C, r: R});

          if (typeof cell.v === 'number') {
            cell.t = 'n';
          } else if (typeof cell.v === 'boolean') {
            cell.t = 'b';
          } else if (cell.v instanceof Date) {
            cell.t = 'n';
            cell.z = XLSX.SSF._table[14];
            cell.v = datenum(cell.v);
          } else {
            cell.t = 's';
          }

          ws[cell_ref] = cell;
        }
      }
      if (range.s.c < 10000000) {
        ws['!ref'] = XLSX.utils.encode_range(range);
      }
      return ws;
    }

    /**
     * Export data and save it
     * @param sheets Array of sheets. Contains sheet names and sheet data.
     * @param fileName File name of the exported file.
     * @param extension Extension of the exported file.
     */
    var exportData = function (sheets, fileName, extension) {
      extension = extension.replace('.', '');
      var workBook = new Workbook();

      for (var i = 0; i < sheets.length; ++i) {
        var workbookSheet = {};
        workbookSheet = buildWorkbookSheet(sheets[i].data);
        if (extension === "csv") {
          workbookSheet = XLSX.utils.sheet_to_csv(workbookSheet);
          saveAs(new Blob([workbookSheet], {type: "text/csv;charset=utf-8"}), fileName + "-" + i + "." + extension);
          if (i + 1 === sheets.length) {
            return;
          }
        } else {
          workBook.SheetNames.push(sheets[i].name);
          workBook.Sheets[sheets[i].name] = workbookSheet;
        }
      }

      var output = XLSX.write(workBook, {bookType: 'xlsx', bookSST: false, type: 'binary'});
      saveAs(new Blob([s2ab(output)], {type: "application/octet-stream"}), fileName + "." + extension);
    };

    return {
      exportData: exportData
    };
  }]);
});