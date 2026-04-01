import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Badge } from "@/components/ui";

export function PageHeader({ 
  title, 
  description, 
  badges = [], 
  showBack = false, 
  actions,
  children 
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 mt-0.5">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          {badges.length > 0 && (
            <div className="flex items-center gap-2 mb-1">
              {badges.map((badge, idx) => (
                <Badge key={idx} variant={badge.variant || "outline"}>
                  {badge.icon && <badge.icon className="mr-1 h-3 w-3" />}
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
          {children}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
