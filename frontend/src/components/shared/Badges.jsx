import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const difficultyStyles = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function DifficultyBadge({ level, className, showLabel = true }) {
  if (!level) return null;
  
  return (
    <Badge className={cn("capitalize", difficultyStyles[level], className)}>
      {showLabel ? level : level[0].toUpperCase()}
    </Badge>
  );
}

const statusStyles = {
  published: { className: "bg-green-100 text-green-800", label: "Published" },
  draft: { className: "bg-gray-100 text-gray-800", label: "Draft" },
  completed: { className: "bg-blue-100 text-blue-800", label: "Completed" },
  "in-progress": { className: "bg-yellow-100 text-yellow-800", label: "In Progress" },
  abandoned: { className: "bg-gray-100 text-gray-800", label: "Abandoned" },
  passed: { className: "bg-green-100 text-green-800", label: "Passed" },
  failed: { className: "bg-red-100 text-red-800", label: "Failed" },
};

export function StatusBadge({ status, className, icon: Icon }) {
  const style = statusStyles[status] || { className: "bg-gray-100 text-gray-800", label: status };
  
  return (
    <Badge className={cn(style.className, className)}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {style.label}
    </Badge>
  );
}

const typeLabels = {
  mcq: "Multiple Choice",
  "true-false": "True/False",
  "short-answer": "Short Answer",
};

export function QuestionTypeBadge({ type, className }) {
  return (
    <Badge variant="outline" className={className}>
      {typeLabels[type] || type}
    </Badge>
  );
}

export default DifficultyBadge;
