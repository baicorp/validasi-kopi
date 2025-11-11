import { FormEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import { Label } from "../ui/label";

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
      <div className="space-y-2">
        <Label htmlFor="employee-nik">Nomor induk karyawan</Label>
        <Input
          placeholder="NIK"
          id="employee-nik"
          defaultValue={username}
          name="employee-nik"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="employee-name">Nama karyawan</Label>
        <Input
          placeholder="Nama Karyawan"
          defaultValue={name}
          id="employee-name"
          name="employee-name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="employee-position">Jabatan karyawan</Label>
        <Input
          placeholder="Jabatan"
          defaultValue={position}
          id="employee-position"
          name="employee-position"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="employee-password" className="text-muted-foreground">
          Kata sandi
        </Label>
        <Input
          placeholder="Default password : supersecure"
          readOnly
          disabled
          id="employee-password"
          name="employee-password"
          required
        />
      </div>
      <Button type="submit" disabled={isLoad} className="ml-auto">
        {username ? "Simpan perubahan" : "Tambahkan karyawan"}
        {isLoad && <LoaderCircle className="animate-spin" />}
      </Button>
    </form>
  );
}
