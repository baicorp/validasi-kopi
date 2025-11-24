import { FormEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import SelectProductCategories from "../ui/selectProductCategories";
import { Label } from "../ui/label";

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
      <div className="space-y-2">
        <Label htmlFor="product-name">Nama produk</Label>
        <Input
          placeholder="Nama produk"
          id="product-name"
          name="product-name"
          defaultValue={productName}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="product-category">Kategori produk</Label>
        <SelectProductCategories defaultValue={productCategoryId} />
      </div>
      <Button type="submit" disabled={isLoad}>
        {productName ? "Simpan perubahan" : "Simpan produk"}
        {isLoad && <LoaderCircle className="animate-spin" />}
      </Button>
    </form>
  );
}
