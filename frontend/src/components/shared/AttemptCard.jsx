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
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
            {/* Status Icon */}
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
              attempt.status === "completed"
                ? passed ? "bg-green-100" : "bg-red-100"
                : attempt.status === "in-progress"
                ? "bg-yellow-100"
                : "bg-gray-100"
            )}>
              {attempt.status === "completed" ? (
                passed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )
              ) : attempt.status === "in-progress" ? (
                <Clock className="h-6 w-6 text-yellow-600" />
              ) : (
                <XCircle className="h-6 w-6 text-gray-600" />
              )}
            </div>

            {/* Quiz Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{quiz?.title || "Unknown Quiz"}</h3>
                <Badge variant="outline">{quiz?.category}</Badge>
                {attempt.status === "in-progress" && (
                  <Badge variant="secondary">In Progress</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(attempt.startTime || attempt.createdAt)}
                </span>
                {attempt.timeTaken && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTimeTaken(attempt.timeTaken)}
                  </span>
                )}
              </div>
            </div>

            {/* Score */}
            {attempt.status === "completed" && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={cn(
                    "text-2xl font-bold",
                    passed ? "text-green-600" : "text-red-600"
                  )}>
                    {scorePercent}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(attempt.score || 0)}/{attempt.totalMarks || quiz?.totalMarks}
                  </p>
                </div>
                <div className="w-24 hidden sm:block">
                  <Progress 
                    value={scorePercent} 
                    className={cn(
                      "h-2",
                      passed ? "[&>div]:bg-green-600" : "[&>div]:bg-red-600"
                    )}
                  />
                </div>
              </div>
            )}

            {attempt.status === "in-progress" && (
              <Button variant="outline" size="sm">
                Resume
              </Button>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
