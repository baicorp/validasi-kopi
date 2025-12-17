import { Input } from "./input";
import { Label } from "./label";

export default function InputParticipants() {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label htmlFor="total-participants" className="font-medium">
          Masukkan jumlah peserta
        </Label>
        <span className="block text-sm text-muted-foreground">
          Peserta minimal 1 dan maksimal 200
        </span>
      </div>
      <Input
        type="number"
        id="total-participants"
        name="total-participants"
        min={1}
        placeholder="Minimal 1 peserta"
      />
    </div>
  );
}
