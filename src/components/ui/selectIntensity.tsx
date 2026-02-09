import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
export default function SelectIntensity({ inputName }: { inputName: string }) {
  const intensity = ["1", "2", "3"];

  return (
    <Select name={inputName}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih Intensitas" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Daftar Intensitas</SelectLabel>
          {intensity.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
