export default function ErrorComp({ error }: { error: string | undefined }) {
  return (
    <div className="h-80 text-muted-foreground flex justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-2">
        <span className="block">{error}</span>
      </div>
    </div>
  );
}
