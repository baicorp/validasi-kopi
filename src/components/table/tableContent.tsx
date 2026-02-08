import React from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";

export default function TableContent({
  nilai,
  listKode,
}: {
  nilai: string;
  listKode: string[][];
}) {
  return (
    <div className="border border-neutral-300 rounded-md overflow-hidden">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={17}
              className="text-center bg-accent font-medium"
            >
              {nilai.replace("&", " + ").toUpperCase()}
            </TableCell>
          </TableRow>
          {listKode.map((barisKode, index) => (
            <TableRow key={index}>
              {barisKode.map((kode, index) =>
                index !== 0 && index % 5 === 0 ? (
                  <React.Fragment key={kode + "-wrap"}>
                    <TableCellFix
                      key={kode + "-empty"}
                      className="bg-amber-100"
                    />
                    <TableCellFix key={kode}>{kode}</TableCellFix>
                  </React.Fragment>
                ) : (
                  <TableCellFix key={kode}>{kode}</TableCellFix>
                ),
              )}
              {/*hanya tambahkan TabelCellSisa di row terakhir*/}
              {listKode.length - 1 === index && (
                <CellSisa
                  totalListKode={listKode[listKode.length - 1].length}
                />
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CellSisa({ totalListKode }: { totalListKode: number }) {
  const arrKosong = Array.from(
    { length: 15 - totalListKode },
    (_, index) => index,
  );

  let currentIndex = totalListKode - 1;

  return arrKosong.map((_, index) => {
    currentIndex++;
    return currentIndex % 5 === 0 ? (
      <React.Fragment key={index + "-wrap"}>
        <TableCellFix key={index + "-empty"} className="bg-amber-100" />
        <TableCellFix key={index}></TableCellFix>
      </React.Fragment>
    ) : (
      <TableCellFix key={index}></TableCellFix>
    );
  });
}

function TableCellFix({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <TableCell
      className={cn(
        "w-12 text-xs font-mono text-center border border-neutral-300",
        className,
      )}
    >
      {props.children}
    </TableCell>
  );
}
