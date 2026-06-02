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
import { SearchParams } from "@/lib/types";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Paginator from "@/components/ui/paginator";
import SearchData from "@/components/ui/searchData";
import AddProductBtn from "@/components/ui/addProduct";
import DeleteDialog from "@/components/ui/deleteDialog";
import EditDialogProduct from "@/components/ui/editDialogProduct";
import { deleteProduct, getAllProduct } from "@/actions/products";
import { validateSessionServer } from "@/actions/validateSession";
import TableProductsDataSkeleton from "@/components/skeleton/tableProductsDataSkeleton";

export default async function Page({ searchParams }: SearchParams) {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/${session.user.username}`);
  }

  const { q, page = "1", categoryId } = await searchParams;

  return (
    <section className="space-y-4 py-3">
      <div>
        <p className="text-lg font-semibold">Daftar Produk.</p>
        <p className="text-muted-foreground">
          Daftar semua produk untuk uji identifikasi
        </p>
      </div>
      <div className="flex justify-between items-center">
        <div className="basis-1/3">
          <SearchData placeholder="Cari nama produk" />
        </div>
        <AddProductBtn />
      </div>
      <Suspense
        key={(q as string) + page}
        fallback={<TableProductsDataSkeleton />}
      >
        <TableProductsData
          currentPage={Number(page as string)}
          search={q as string}
          categoryId={categoryId as string}
        />
      </Suspense>
    </section>
  );
}

async function TableProductsData({
  currentPage,
  search,
  categoryId,
}: {
  currentPage: number;
  search: string | undefined;
  categoryId: string | undefined;
}) {
  const products = await getAllProduct(currentPage, search, categoryId);
  let tableRowData: ReactNode | undefined;

  if ("error" in products) {
    tableRowData = (
      <TableRow>
        <TableCell colSpan={4} className="text-center text-muted-foreground">
          {products.error}
        </TableCell>
      </TableRow>
    );
  } else if (products.data.length === 0) {
    tableRowData = (
      <TableRow>
        <TableCell colSpan={4} className="text-center text-muted-foreground">
          {search
            ? "Produk tidak ditemukan"
            : "Belum ada produk yang ditambahkan"}
        </TableCell>
      </TableRow>
    );
  } else {
    tableRowData = products.data.map((product, idx) => (
      <TableRow key={product.id}>
        <TableCell className="pl-4 py-1">
          {(currentPage - 1) * 12 + idx + 1}
        </TableCell>
        <TableCell className="py-1">{product.productName}</TableCell>
        <TableCell className="py-1">{product.categoryName}</TableCell>
        <TableCell className="text-right py-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditDialogProduct
                productId={product.id}
                productName={product.productName}
                productCategoryId={product.productCategoryId || undefined}
              />
              <DropdownMenuSeparator />
              <DeleteDialog
                dialogTitle="produk"
                variant="dropDown"
                deleteFnAction={deleteProduct}
                id={product.id}
                data={product.productName}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent">
              <TableHead className="pl-2">No</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{tableRowData}</TableBody>
        </Table>
      </div>
      <div>
        {!("error" in products) && products.totalPages > 1 && (
          <Paginator
            currentPage={products.page}
            totalPages={products.totalPages}
          />
        )}
      </div>
    </div>
  );
}
