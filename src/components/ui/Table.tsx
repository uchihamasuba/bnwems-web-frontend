import React from 'react';

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  emptyText?: string;
}

function renderCellValue<T>(row: T, col: TableColumn<T>): React.ReactNode {
  if (col.render) return col.render(row);
  const value = (row as Record<string, unknown>)[col.key];
  return value == null ? '' : String(value);
}

function renderBody<T>(props: Readonly<TableProps<T>>) {
  const { columns, rows, rowKey, isLoading, emptyText } = props;

  if (isLoading) {
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-400">
          Đang tải...
        </td>
      </tr>
    );
  }

  if (rows.length === 0) {
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-400">
          {emptyText}
        </td>
      </tr>
    );
  }

  return rows.map((row) => (
    <tr key={rowKey(row)} className="hover:bg-slate-50">
      {columns.map((col) => (
        <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.className ?? ''}`}>
          {renderCellValue(row, col)}
        </td>
      ))}
    </tr>
  ));
}

export function Table<T>(props: Readonly<TableProps<T>>) {
  const { columns, isLoading = false, emptyText = 'Không có dữ liệu' } = props;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 ${col.className ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{renderBody({ ...props, isLoading, emptyText })}</tbody>
      </table>
    </div>
  );
}

export default Table;
