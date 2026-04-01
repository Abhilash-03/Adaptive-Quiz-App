import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ScoreDisplay({ 
  score, 
  total, 
  passingScore,
  size = "default",
  showProgress = true,
  className 
}) {
  const percentage = total ? Math.round((score / total) * 100) : 0;
  const passed = passingScore !== undefined ? score >= passingScore : null;

  const sizeStyles = {
    sm: "text-lg",
    default: "text-2xl",
    lg: "text-4xl",
    xl: "text-5xl",
  };

  return (
    <div className={cn("text-center", className)}>
      <p className={cn(
        "font-bold",
        sizeStyles[size],
        passed === true ? "text-green-600" : passed === false ? "text-red-600" : ""
      )}>
        {percentage}%
      </p>
      <p className="text-sm text-muted-foreground">
        {score}/{total}
      </p>
      {showProgress && (
        <Progress 
          value={percentage} 
          className={cn(
            "mt-2 h-2",
            passed === true && "[&>div]:bg-green-600",
            passed === false && "[&>div]:bg-red-600"
          )}
        />
      )}
      {passed !== null && (
        <p className={cn(
          "text-sm mt-1",
          passed ? "text-green-600" : "text-red-600"
        )}>
          {passed ? "Passed" : "Not Passed"}
        </p>
      )}
    </div>
  );
}

export function AttemptStatusIcon({ status, passed, className }) {
  if (status === "completed") {
    return passed ? (
      <CheckCircle2 className={cn("h-5 w-5 text-green-600", className)} />
    ) : (
      <XCircle className={cn("h-5 w-5 text-red-600", className)} />
    );
  }
  
  if (status === "in-progress") {
    return <Clock className={cn("h-5 w-5 text-yellow-600", className)} />;
  }
  
  return <XCircle className={cn("h-5 w-5 text-gray-600", className)} />;
}

export function AttemptStatusCircle({ status, passed, size = "default", className }) {
  const sizeStyles = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  const bgColor = status === "completed"
    ? passed ? "bg-green-100" : "bg-red-100"
    : status === "in-progress"
    ? "bg-yellow-100"
    : "bg-gray-100";

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center",
      bgColor,
      sizeStyles[size],
      className
    )}>
      <AttemptStatusIcon 
        status={status} 
        passed={passed} 
        className={iconSizes[size]} 
      />
    </div>
  );
}

export default ScoreDisplay;
