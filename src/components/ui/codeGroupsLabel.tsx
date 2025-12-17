import { Badge } from "./badge";

export default function CodeGroupsLabel({ label }: { label: string[] }) {
  return label.map((label) => (
    <Badge key={label} variant={"outline"}>
      {label}
    </Badge>
  ));
}
