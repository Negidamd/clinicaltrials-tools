"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SensitivityTableProps {
  /** Label for the varying parameter (rows) */
  rowLabel: string;
  /** Values for the varying parameter */
  rowValues: number[];
  /** Format function for row values */
  formatRowValue?: (v: number) => string;
  /** Label for the column parameter */
  columnLabel: string;
  /** Values for the column parameter */
  columnValues: number[];
  /** Format function for column values */
  formatColumnValue?: (v: number) => string;
  /** Compute sample size given (rowValue, columnValue) */
  computeN: (rowValue: number, colValue: number) => number;
  /** The currently selected row value (to highlight) */
  currentRowValue?: number;
  /** The currently selected column value (to highlight) */
  currentColValue?: number;
}

export function SensitivityTable({
  rowLabel,
  rowValues,
  formatRowValue = (v) => v.toString(),
  columnLabel,
  columnValues,
  formatColumnValue = (v) => v.toString(),
  computeN,
  currentRowValue,
  currentColValue,
}: SensitivityTableProps) {
  const grid = useMemo(() => {
    return rowValues.map((rv) => ({
      rowValue: rv,
      cells: columnValues.map((cv) => {
        const n = computeN(rv, cv);
        return { colValue: cv, n: isFinite(n) && n > 0 ? Math.ceil(n) : null };
      }),
    }));
  }, [rowValues, columnValues, computeN]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Sensitivity Analysis</CardTitle>
        <p className="text-xs text-muted-foreground">
          Sample size (N) varying {rowLabel} and {columnLabel}
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium w-24">
                {rowLabel} \ {columnLabel}
              </TableHead>
              {columnValues.map((cv) => (
                <TableHead
                  key={cv}
                  className={`text-xs text-center ${
                    currentColValue !== undefined && cv === currentColValue
                      ? "bg-[#E6F7F7] font-bold text-[#0D7377]"
                      : ""
                  }`}
                >
                  {formatColumnValue(cv)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {grid.map((row) => (
              <TableRow key={row.rowValue}>
                <TableCell
                  className={`text-xs font-medium ${
                    currentRowValue !== undefined && row.rowValue === currentRowValue
                      ? "bg-[#E6F7F7] font-bold text-[#0D7377]"
                      : ""
                  }`}
                >
                  {formatRowValue(row.rowValue)}
                </TableCell>
                {row.cells.map((cell) => {
                  const isHighlighted =
                    currentRowValue !== undefined &&
                    currentColValue !== undefined &&
                    row.rowValue === currentRowValue &&
                    cell.colValue === currentColValue;
                  return (
                    <TableCell
                      key={cell.colValue}
                      className={`text-xs text-center font-mono ${
                        isHighlighted
                          ? "bg-[#0D7377] text-white font-bold"
                          : currentRowValue !== undefined && row.rowValue === currentRowValue
                          ? "bg-[#E6F7F7]"
                          : currentColValue !== undefined && cell.colValue === currentColValue
                          ? "bg-[#E6F7F7]"
                          : ""
                      }`}
                      style={{ fontFamily: "var(--font-mono-custom)" }}
                    >
                      {cell.n !== null ? cell.n.toLocaleString() : "—"}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
