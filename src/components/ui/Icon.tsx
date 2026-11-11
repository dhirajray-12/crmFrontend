import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { Loader2 } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

type IconName = keyof typeof dynamicIconImports;

interface IconProps extends LucideProps {
  name: IconName;
}

export const Icon = ({
  name,
  className = "",
  size = 24,
  ...props
}: IconProps) => {
  const LucideIcon = lazy(
    dynamicIconImports[name] as () => Promise<{ default: ComponentType<LucideProps> }>,
  );

  return (
    <Suspense
      fallback={<Loader2 className={`animate-spin ${className}`} size={size} />}
    >
      <LucideIcon className={className} size={size} {...props} />
    </Suspense>
  );
};
