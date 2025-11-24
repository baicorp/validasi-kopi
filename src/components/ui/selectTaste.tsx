import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
export default function SelectTaste({ inputName }: { inputName: string }) {
  const taste = ["asam", "asin", "manis", "pahit", "tidak berasa"];

  return (
    <Select name={inputName}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih Rasa" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Daftar Rasa</SelectLabel>
          {taste.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
