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
import { Button } from "@/components/ui/button";
import Paginator from "@/components/ui/paginator";
import DeleteDialog from "@/components/ui/deleteDialog";
import EditDialogEmployee from "@/components/ui/editDialogEmployee";
import TableEmployeesDataSkeleton from "@/components/skeleton/tableEmployeesDataSkeleton";

export default async function Page({ searchParams }: SearchParams) {
  const currentPage = ((await searchParams).page as string) ?? "1";
  const search = (await searchParams).q as string;

  const session = await validateSessionServer();

  if (session.user.role !== "admin") {
    redirect(`/${session.user.username}`);
  }

  return (
    <section className="py-3 space-y-4">
      <div>
        <p className="text-lg font-semibold">Daftar Karyawan</p>
      </div>
      <div className="flex justify-between items-center">
        <div className="basis-1/3">
          <SearchData placeholder="Cari nama karyawan" />
        </div>
        <AddEmployeeBtn />
      </div>
      <Suspense
        key={search + currentPage}
        fallback={<TableEmployeesDataSkeleton />}
      >
        <TableEmployeesData currentPage={Number(currentPage)} search={search} />
      </Suspense>
    </section>
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
        <TableCell colSpan={4} className="text-center">
          {employees.error}
        </TableCell>
      </TableRow>
    );
  } else if (employees.data.length === 0) {
    tableRowData = (
      <TableRow>
        <TableCell colSpan={4} className="text-center">
          Belum ada karyawan yang ditambahkan
        </TableCell>
      </TableRow>
    );
  } else {
    tableRowData = employees.data.map((employee, idx) => (
      <TableRow key={employee.username}>
        <TableCell className="pl-4 py-1">
          {(currentPage - 1) * 12 + idx + 1}
        </TableCell>
        <TableCell className="py-1">{employee.username}</TableCell>
        <TableCell className="py-1">{employee.name}</TableCell>
        <TableCell className="py-1">{employee.position}</TableCell>
        <TableCell className="py-1">{employee.department}</TableCell>
        <TableCell className="py-1">{employee.plantArea}</TableCell>
        <TableCell className="text-right py-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditDialogEmployee
                id={employee.id}
                username={employee.username}
                name={employee.name}
                position={employee.position}
                departmentId={employee.departmentId?.toString()}
                plantAreaId={employee.plantAreaId?.toString()}
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
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border overflow-hidden">
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
      </div>
      <div>
        {!("error" in employees) && employees.totalPages > 1 && (
          <Paginator
            currentPage={employees.page}
            totalPages={employees.totalPages}
          />
        )}
      </div>
    </div>
  );
}
