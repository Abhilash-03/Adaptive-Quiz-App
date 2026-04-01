import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const difficultyColors = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function QuestionBrowserItem({ question, selected, onToggle, compact = false }) {
  return (
    <div
      className={cn(
        "group relative rounded-lg border-2 cursor-pointer transition-all duration-200",
        compact ? "p-2.5" : "p-3",
        selected 
          ? "border-primary bg-primary/5" 
          : "border-transparent bg-muted/40 hover:bg-muted/60 hover:border-muted-foreground/20"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-2.5">
        {/* Custom checkbox */}
        <div className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
          selected 
            ? "border-primary bg-primary text-primary-foreground" 
            : "border-muted-foreground/30 group-hover:border-muted-foreground/50"
        )}>
          {selected && (
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium line-clamp-2 transition-colors",
            compact ? "text-xs" : "text-sm",
            selected ? "text-foreground" : "text-foreground/80"
          )}>
            {question.questionText}
          </p>
          
          <div className={cn(
            "flex flex-wrap items-center gap-1.5",
            compact ? "mt-1.5" : "mt-2"
          )}>
            <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
              {question.category}
            </Badge>
            <Badge className={cn("text-[10px] font-medium px-1.5 py-0", difficultyColors[question.difficultyLevel])}>
              {question.difficultyLevel}
            </Badge>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {question.points || 1} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
