import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function TableEmployeesDataSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-accent">
            <TableHead className="pl-2">No</TableHead>
            <TableHead>NIK</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <TableRow key={number}>
              <TableCell className="py-3.5">
                <span className="block w-6 h-4 bg-accent rounded-full animate-pulse"></span>
              </TableCell>
              <TableCell className="py-3.5">
                <span className="block w-28 h-4 bg-accent rounded-full animate-pulse"></span>
              </TableCell>
              <TableCell className="py-3.5">
                <span className="block w-10 h-4 bg-accent rounded-full animate-pulse"></span>
              </TableCell>
              <TableCell className="py-3.5 flex justify-end">
                <span className="block w-4 h-4 bg-accent rounded-full animate-pulse"></span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
