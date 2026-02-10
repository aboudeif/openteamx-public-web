import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function PageHeader({ title, description, children, titleClassName, descriptionClassName }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6">
      <div>
        <h1 className={titleClassName?titleClassName:`text-2xl font-semibold text-foreground`}>{title}</h1>
        {description && (
          <p className={descriptionClassName?descriptionClassName:`text-sm text-muted-foreground mt-1`}>{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
