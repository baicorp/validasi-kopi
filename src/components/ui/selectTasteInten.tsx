import { listTresholdSingleValue } from "@/lib/constant";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
export default function SelectTasteInten({ inputName }: { inputName: string }) {
  const data = [...listTresholdSingleValue];

  return (
    <Select name={inputName} required>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih Rasa" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Daftar Rasa</SelectLabel>
          {data.map((value, index) => (
            <SelectItem key={index} value={value.tasteIntent}>
              {value.tasteIntent.replace("+", " ")}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
