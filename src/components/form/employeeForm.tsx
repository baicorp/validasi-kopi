import { FormEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";

export interface EmployeeFormInputProps {
  username?: string;
  name?: string;
  position?: string;
}

export default function EmployeeForm({
  username,
  name,
  position,
  isLoad,
  handleSubmit,
}: EmployeeFormInputProps & {
  isLoad: boolean;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
      <Input
        placeholder="NIK"
        defaultValue={username}
        name="employee-nik"
        required
      />
      <Input
        placeholder="Nama Karyawan"
        defaultValue={name}
        name="employee-name"
        required
      />
      <Input
        placeholder="Jabatan"
        defaultValue={position}
        name="employee-position"
        required
      />
      <Input
        placeholder="Default password : supersecure"
        readOnly
        disabled
        name="employee-password"
        required
      />
      <Button type="submit" disabled={isLoad} className="ml-auto">
        Simpan
        {isLoad && <LoaderCircle className="animate-spin" />}
      </Button>
    </form>
  );
}
