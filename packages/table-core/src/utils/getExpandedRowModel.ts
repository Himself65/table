import { Table, Row, RowModel, RowData } from '../types'
import { memo } from '../utils'

export function getExpandedRowModel<TData extends RowData>(): (
  table: Table<TData>
) => () => RowModel<TData> {
  return table =>
    memo(
      () => [
        table.getState().expanded,
        table.getPreExpandedRowModel(),
        table.options.paginateExpandedRows,
      ],
      (expanded, rowModel, paginateExpandedRows) => {
        if (
          !rowModel.rows.length ||
          (expanded !== true && !Object.keys(expanded ?? {}).length)
        ) {
          return rowModel
        }

        if (!paginateExpandedRows) {
          // Only expand rows at this point if they are being paginated
          console.log(rowModel.rows)
          return rowModel
        }

        return expandRows(rowModel)
      },
      {
        key: process.env.NODE_ENV === 'development' && 'getExpandedRowModel',
        debug: () => table.options.debugAll ?? table.options.debugTable,
      }
    )
}

export function expandRows<TData extends RowData>(rowModel: RowModel<TData>) {
  const expandedRows: Row<TData>[] = []

  const handleRow = (row: Row<TData>) => {
    expandedRows.push(row)

    if (row.subRows?.length && row.getIsExpanded()) {
      row.subRows.forEach(handleRow)
    }
  }

  rowModel.rows.forEach(handleRow)

  return {
    rows: expandedRows,
    flatRows: rowModel.flatRows,
    rowsById: rowModel.rowsById,
  }
}
