import { SearchParams } from "@/lib/types";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";
import { MoreVertical } from "lucide-react";
import SearchData from "@/components/ui/searchData";
import AddEmployeeBtn from "@/components/ui/addEmployee";
import { validateSessionServer } from "@/actions/validateSession";
import { deleteEmployee, getAllEmployees } from "@/actions/employees";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toTitleCase } from "@/lib/utils";
import Paginator from "@/components/ui/paginator";
import { buttonVariants } from "@/components/ui/button";
import DeleteDialog from "@/components/ui/deleteDialog";
import EditDialogEmployee from "@/components/ui/editDialogEmployee";
import TableEmployeesDataSkeleton from "@/components/skeleton/tableEmployeesDataSkeleton";

export default async function Page({ searchParams }: SearchParams) {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/${session.user.username}`);
  }
  const { q, page = "1" } = await searchParams;

  return (
    <div className="space-y-4 py-3">
      <section>
        <p className="text-lg font-semibold">Daftar Karyawan.</p>
      </section>
      <section className="flex justify-between items-center">
        <div className="basis-1/3">
          <SearchData placeholder="Cari NIK / nama karyawan" />
        </div>
        <AddEmployeeBtn />
      </section>
      <Suspense
        key={(q as string) + page}
        fallback={<TableEmployeesDataSkeleton />}
      >
        <TableEmployeesData
          currentPage={Number(page)}
          search={(q as string)}
        />
      </Suspense>
    </div>
  );
}

async function TableEmployeesData({
  currentPage,
  search,
}: {
  currentPage: number;
  search: string | undefined;
}) {
  const employees = await getAllEmployees(currentPage, search);
  let tableRowData: ReactNode | undefined;

  if ("error" in employees) {
    tableRowData = (
      <TableRow>
        <TableCell colSpan={7} className="text-center text-muted-foreground">
          {employees.error}
        </TableCell>
      </TableRow>
    );
  } else if (employees.data.length === 0) {
    tableRowData = (
      <TableRow>
        <TableCell colSpan={7} className="text-center text-muted-foreground">
          {search
            ? "Karyawan tidak ditemukan"
            : "Belum ada karyawan yang ditambahkan"}
        </TableCell>
      </TableRow>
    );
  } else {
    tableRowData = employees.data.map((employee, idx) => (
      <TableRow key={employee.username}>
        <TableCell className="pl-4 py-1">
          {(currentPage - 1) * 12 + idx + 1}
        </TableCell>
        <TableCell className="py-1 font-mono">{employee.username}</TableCell>
        <TableCell className="py-1">{employee.name}</TableCell>
        <TableCell className="py-1">{employee.position}</TableCell>
        <TableCell className="py-1">{employee.department}</TableCell>
        <TableCell className="py-1">
          {employee.plantArea ? toTitleCase(employee.plantArea) : ""}
        </TableCell>
        <TableCell className="text-right py-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <MoreVertical className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditDialogEmployee
                id={employee.id}
                username={employee.username}
                name={employee.name}
                position={employee.position}
                departmentId={employee.departmentId || undefined}
                plantAreaId={employee.plantAreaId || undefined}
              />
              <DropdownMenuSeparator />
              <DeleteDialog
                dialogTitle="Karyawan"
                variant="dropDown"
                deleteFnAction={deleteEmployee}
                id={employee.id}
                data={employee.name}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  }

  return (
    <>
      <section className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent">
              <TableHead className="pl-2">No</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Departemen</TableHead>
              <TableHead>Area Pabrik</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{tableRowData}</TableBody>
        </Table>
      </section>
      <section>
        {!("error" in employees) && employees.totalPages > 1 && (
          <Paginator
            currentPage={employees.page}
            totalPages={employees.totalPages}
          />
        )}
      </section>
    </>
  );
}
