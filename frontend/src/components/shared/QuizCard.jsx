import { Link } from "react-router-dom";
import { 
  Clock, 
  FileQuestion, 
  Target, 
  Users,
  Globe,
  Lock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Play
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { DifficultyBadge } from "./Badges";

const formatDuration = (minutes) => {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

// Student Quiz Card
export function StudentQuizCard({ quiz, linkPrefix = "/student" }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b bg-linear-to-r from-primary/5 to-primary/10">
          <Badge variant="outline" className="mb-2">
            {quiz.category}
          </Badge>
          <h3 className="font-semibold text-lg">{quiz.title}</h3>
          {quiz.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {quiz.description}
            </p>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <FileQuestion className="h-4 w-4 text-muted-foreground" />
              <span>{quiz.totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDuration(quiz.duration)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{quiz.passingMarks}/{quiz.totalMarks} to pass</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DifficultyBadge level={quiz.initialDifficulty} className="text-xs" />
            </div>
          </div>

          {quiz.isAdaptive && (
            <Badge variant="secondary" className="text-xs">
              Adaptive Difficulty
            </Badge>
          )}

          {/* Attempt Status */}
          {quiz.userAttempts > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  Attempts: {quiz.userAttempts}/{quiz.allowedAttempts}
                </span>
                {quiz.bestScore !== undefined && (
                  <span className="font-medium">
                    Best: {Math.round(quiz.bestScore)}%
                  </span>
                )}
              </div>
              {quiz.bestScore !== undefined && (
                <Progress value={quiz.bestScore} className="h-1.5" />
              )}
            </div>
          )}
        </div>

        {/* Action */}
        <div className="p-4 pt-0">
          <Link to={`${linkPrefix}/quiz/${quiz._id}`}>
            <Button className="w-full" variant={quiz.userAttempts > 0 ? "outline" : "default"}>
              <Play className="mr-2 h-4 w-4" />
              {quiz.userAttempts > 0 ? "View Details" : "Start Quiz"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Teacher Quiz Card
export function TeacherQuizCard({ 
  quiz, 
  linkPrefix = "/teacher",
  onTogglePublish,
  onDelete 
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{quiz.title}</h3>
              {quiz.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {quiz.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`${linkPrefix}/quiz/${quiz._id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`${linkPrefix}/quiz/${quiz._id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onTogglePublish && (
                  <DropdownMenuItem onClick={() => onTogglePublish(quiz._id)}>
                    {quiz.isPublished ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        Publish
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(quiz)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{quiz.category}</Badge>
            <Badge variant={quiz.isPublished ? "default" : "secondary"}>
              {quiz.isPublished ? (
                <>
                  <Globe className="mr-1 h-3 w-3" />
                  Published
                </>
              ) : (
                <>
                  <Lock className="mr-1 h-3 w-3" />
                  Draft
                </>
              )}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <FileQuestion className="h-4 w-4" />
              <span>{quiz.totalQuestions || quiz.questions?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(quiz.duration)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{quiz.attemptCount || 0}</span>
            </div>
          </div>

          {quiz.isAdaptive && (
            <Badge variant="outline" className="text-xs">
              Adaptive Quiz
            </Badge>
          )}
        </div>

        {/* Action */}
        <div className="p-4 pt-0">
          <Link to={`${linkPrefix}/quiz/${quiz._id}`}>
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default StudentQuizCard;
