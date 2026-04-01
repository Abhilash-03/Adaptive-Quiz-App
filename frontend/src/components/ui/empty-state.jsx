import { cn } from "@/lib/utils";
import { Button } from "./button";
import { FileQuestion, BookOpen, Users, Search, Inbox, Plus } from "lucide-react";

const icons = {
  quiz: BookOpen,
  question: FileQuestion,
  student: Users,
  search: Search,
  default: Inbox,
};

function EmptyState({
  icon = "default",
  title,
  description,
  action,
  actionLabel,
  className,
}) {
  const Icon = typeof icon === "string" ? icons[icon] || icons.default : icon;

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
