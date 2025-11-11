import { FormEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import SelectProductCategories from "../ui/selectProductCategories";

export interface ProductFormInputProps {
  productName?: string;
  productCategoryId?: string;
}

export default function ProductForm({
  productName,
  productCategoryId,
  isLoad,
  handleSubmit,
}: ProductFormInputProps & {
  isLoad: boolean;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
      <Input
        placeholder="Nama produk"
        name="nama-produk"
        defaultValue={productName}
      />
      <SelectProductCategories defaultValue={productCategoryId} />
      <Button type="submit" disabled={isLoad}>
        Simpan {isLoad && <LoaderCircle className="animate-spin" />}
      </Button>
    </form>
  );
}
