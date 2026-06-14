import { Badge } from "@/components/ui/badge";
import { entityBrandBadgeClass, entityBrandLabel, entityBrandTone } from "@/lib/entity-brand";
import { cn } from "@/lib/utils";

type EntityBrandBadgeProps = {
  brand: string;
  className?: string;
};

export function EntityBrandBadge({ brand, className }: EntityBrandBadgeProps) {
  const tone = entityBrandTone(brand);
  return (
    <Badge variant="outline" className={cn("shrink-0 font-semibold", entityBrandBadgeClass[tone], className)}>
      {entityBrandLabel(brand)}
    </Badge>
  );
}
