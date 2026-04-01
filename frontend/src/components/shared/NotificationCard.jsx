import { Bell, Megaphone, Trophy, AlertCircle, Trash2, Check } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const typeConfig = {
  "quiz-reminder": {
    icon: Bell,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  result: {
    icon: Trophy,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  announcement: {
    icon: Megaphone,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  system: {
    icon: AlertCircle,
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
};

export function NotificationCard({ 
  notification, 
  onMarkRead, 
  onDelete,
  compact = false 
}) {
  const config = typeConfig[notification.type] || typeConfig.system;
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      className={cn(
        "group flex gap-3 rounded-lg border transition-colors",
        compact ? "p-3" : "p-4",
        notification.isRead 
          ? "bg-background border-border" 
          : "bg-primary/5 border-primary/20"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        config.bg
      )}>
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium line-clamp-1",
              compact ? "text-sm" : "text-base",
              !notification.isRead && "text-foreground"
            )}>
              {notification.title}
            </p>
            <p className={cn(
              "text-muted-foreground line-clamp-2 mt-0.5",
              compact ? "text-xs" : "text-sm"
            )}>
              {notification.message}
            </p>
          </div>
          {!notification.isRead && (
            <Badge variant="default" className="shrink-0 text-[10px] px-1.5 py-0">
              New
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.isRead && onMarkRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onMarkRead(notification._id)}
                title="Mark as read"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(notification._id)}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationList({ 
  notifications, 
  onMarkRead, 
  onDelete, 
  compact = false,
  emptyMessage = "No notifications" 
}) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification._id}
          notification={notification}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
          compact={compact}
        />
      ))}
    </div>
  );
}
