import { Link } from "react-router-dom";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar 
} from "lucide-react";
import { Card, CardContent, Button, Badge, Progress } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatDateTime, formatTimeTaken } from "@/lib/utils";

// Attempt Card for displaying quiz attempt history
export function AttemptCard({ attempt }) {
  const quiz = attempt.quiz;
  const scorePercent = Math.round(attempt.percentage || 0);
  const passed = attempt.isPassed;

  const linkTo = attempt.status === "in-progress" 
    ? `/student/quiz/${quiz?._id}/attempt/${attempt._id}`
    : `/student/attempt/${attempt._id}`;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Link to={linkTo} className="block">
          <div className="flex flex-col gap-4 p-4 hover:bg-accent/50 transition-colors">
            {/* Top row: Icon + Quiz Info */}
            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div className={cn(
                "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0",
                attempt.status === "completed"
                  ? passed ? "bg-green-100" : "bg-red-100"
                  : attempt.status === "in-progress"
                  ? "bg-yellow-100"
                  : "bg-gray-100"
              )}>
                {attempt.status === "completed" ? (
                  passed ? (
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  )
                ) : attempt.status === "in-progress" ? (
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                ) : (
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                )}
              </div>

              {/* Quiz Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start sm:items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm sm:text-base leading-tight">{quiz?.title || "Unknown Quiz"}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">{quiz?.category}</Badge>
                    {attempt.status === "in-progress" && (
                      <Badge variant="secondary" className="text-xs">In Progress</Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    {formatDateTime(attempt.startTime || attempt.createdAt)}
                  </span>
                  {attempt.timeTaken && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      {formatTimeTaken(attempt.timeTaken)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom row: Score or Resume button */}
            {attempt.status === "completed" && (
              <div className="flex items-center justify-between gap-4 pl-13 sm:pl-15">
                <div className="flex-1">
                  <Progress 
                    value={scorePercent} 
                    className={cn(
                      "h-2",
                      passed ? "[&>div]:bg-green-600" : "[&>div]:bg-red-600"
                    )}
                  />
                </div>
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-xl sm:text-2xl font-bold",
                    passed ? "text-green-600" : "text-red-600"
                  )}>
                    {scorePercent}%
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {Math.round(attempt.score || 0)}/{attempt.totalMarks || quiz?.totalMarks}
                  </p>
                </div>
              </div>
            )}

            {attempt.status === "in-progress" && (
              <div className="pl-13 sm:pl-15">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Resume
                </Button>
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
