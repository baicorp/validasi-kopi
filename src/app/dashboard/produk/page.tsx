import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Suspense } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProduk, getAllProduct } from "@/actions/produk";
import EditDialog from "@/components/ui/editDialog";
import DeleteDialog from "@/components/ui/deleteDialog";
import TambahProduk from "@/components/ui/tambahProduk";

export default async function Page() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TambahProduk />
      </div>
      <div className="rounded-lg border overflow-hidden">
        <Table className="relative">
          <TableHeader>
            <TableRow className="bg-accent sticky top-0 z-10">
              <TableHead className="pl-2">No</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Suspense fallback={<ListProdukSkeleton />}>
              <ListProduk />
            </Suspense>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ListProdukSkeleton() {
  const skeleton = [0, 1, 2, 3, 4].map((number) => {
    return (
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
    );
  });
  return skeleton;
}

async function ListProduk() {
  const listProduk = await getAllProduct();

  if (listProduk.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center">
          Tidak ada produk
        </TableCell>
      </TableRow>
    );
  }

  return listProduk.map((produk, idx) => (
    <TableRow key={produk.id}>
      <TableCell className="pl-4 py-1">{idx + 1}</TableCell>
      <TableCell className="py-1">{produk.namaProduk}</TableCell>
      <TableCell className="py-1">{produk.namaKategori}</TableCell>
      <TableCell className="text-right py-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditDialog
              idProduk={produk.id.toString()}
              namaProduk={produk?.namaProduk}
              idKategori={produk.idKategori?.toString() as string}
            />
            <DropdownMenuSeparator />
            <DeleteDialog
              dialogTitle="produk"
              variant="dropDown"
              deleteFnAction={deleteProduk}
              idProduk={produk.id.toString()}
              namaProduk={produk.namaProduk}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  ));
}
