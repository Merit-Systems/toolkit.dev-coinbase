import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <span
      data-slot="skeleton"
      className={cn("bg-accent block animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
