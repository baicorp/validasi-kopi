import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Suspense } from "react";
import { toTitleCase } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/ui/deleteDialog";
import TambahRasaMix from "@/components/ui/tambahRasaMix";
import { deleteRasaMix, getAllRasaMix } from "@/actions/rasaMix";
import EditDialogRasaMix from "@/components/ui/editDialogRasaMix";

export default async function Page() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TambahRasaMix />
      </div>
      <div className="rounded-lg border overflow-hidden">
        <Table className="relative">
          <TableHeader>
            <TableRow className="bg-accent sticky top-0 z-10">
              <TableHead className="pl-2">No</TableHead>
              <TableHead>Nama Treshold Mix</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Suspense fallback={<ListRasaMixSkeleton />}>
              <ListRasaMix />
            </Suspense>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ListRasaMixSkeleton() {
  const skeleton = [0, 1, 2, 3, 4].map((number) => {
    return (
      <TableRow key={number}>
        <TableCell className="py-3.5">
          <span className="block w-6 h-4 bg-accent rounded-full animate-pulse"></span>
        </TableCell>
        <TableCell className="py-3.5">
          <span className="block w-28 h-4 bg-accent rounded-full animate-pulse"></span>
        </TableCell>
        <TableCell className="py-3.5 flex justify-end">
          <span className="block w-4 h-4 bg-accent rounded-full animate-pulse"></span>
        </TableCell>
      </TableRow>
    );
  });
  return skeleton;
}

async function ListRasaMix() {
  const listRasaMix = await getAllRasaMix();

  if (listRasaMix.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center text-muted-foreground">
          Data masih kosong.
        </TableCell>
      </TableRow>
    );
  }

  return listRasaMix.map((row, idx) => (
    <TableRow key={row.id}>
      <TableCell className="pl-4 py-1">{idx + 1}</TableCell>
      <TableCell className="py-1">{toTitleCase(row.rasaMix)}</TableCell>
      <TableCell className="text-right py-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditDialogRasaMix
              idRasaMix={row.id.toString()}
              rasaMix={row?.rasaMix}
            />
            <DropdownMenuSeparator />
            <DeleteDialog
              dialogTitle="row"
              variant="dropDown"
              deleteFnAction={deleteRasaMix}
              idProduk={row.id.toString()}
              namaProduk={row.rasaMix}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  ));
}
