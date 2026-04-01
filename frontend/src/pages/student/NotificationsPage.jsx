import { useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
  Button,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { PageHeader, NotificationList } from "@/components/shared";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteReadNotifications,
} from "@/hooks";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteReadNotifications = useDeleteReadNotifications();

  const notifications = data?.notifications || [];

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  const handleMarkRead = (id) => {
    markAsRead.mutate(id);
  };

  const handleDelete = (id) => {
    deleteNotification.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with your quiz activities"
        icon={Bell}
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            {readCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteReadNotifications.mutate()}
                disabled={deleteReadNotifications.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear read
              </Button>
            )}
          </div>
        }
      />

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({readCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications list */}
      <NotificationList
        notifications={filteredNotifications}
        onMarkRead={handleMarkRead}
        onDelete={handleDelete}
        emptyMessage={
          filter === "unread"
            ? "No unread notifications"
            : filter === "read"
            ? "No read notifications"
            : "No notifications yet"
        }
      />
    </div>
  );
}
