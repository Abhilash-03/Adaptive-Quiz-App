import { useState } from "react";
import { Bell, Send, CheckCheck, Trash2, Users } from "lucide-react";
import {
  Button,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from "@/components/ui";
import { PageHeader, NotificationList } from "@/components/shared";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteReadNotifications,
  useSendNotification,
  useUsers,
  useQuizzes,
} from "@/hooks";

export default function TeacherNotificationsPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [filter, setFilter] = useState("all");

  // Inbox data
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteReadNotifications = useDeleteReadNotifications();

  const notifications = data?.notifications || [];
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  // Send notification form
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement",
    sendToAll: true,
    selectedUsers: [],
    quizId: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const sendNotification = useSendNotification();
  const { data: usersData } = useUsers({ role: "student", limit: 100 });
  const { data: quizzesData } = useQuizzes({ limit: 50 });

  const students = usersData?.users || [];
  const quizzes = quizzesData?.quizzes || [];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const toggleUserSelection = (userId) => {
    setFormData((prev) => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter((id) => id !== userId)
        : [...prev.selectedUsers, userId],
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.message.trim()) errors.message = "Message is required";
    if (!formData.sendToAll && formData.selectedUsers.length === 0) {
      errors.selectedUsers = "Select at least one student";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSend = () => {
    if (!validateForm()) return;

    const payload = {
      title: formData.title.trim(),
      message: formData.message.trim(),
      type: formData.type,
    };

    // Add quizId if selected
    if (formData.quizId) {
      payload.quizId = formData.quizId;
    }

    if (formData.sendToAll) {
      // Send to all students - get all student IDs
      const allStudentIds = students.map((s) => s._id);
      if (allStudentIds.length > 0) {
        payload.userIds = allStudentIds;
      } else if (!payload.quizId) {
        // If no students loaded and no quiz, we need quizId for backend fallback
        // Set a flag for backend to handle "all students"
        payload.sendToAll = true;
      }
    } else {
      payload.userIds = formData.selectedUsers;
    }

    sendNotification.mutate(payload, {
      onSuccess: () => {
        setFormData({
          title: "",
          message: "",
          type: "announcement",
          sendToAll: true,
          selectedUsers: [],
          quizId: "",
        });
      },
    });
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
        description="Manage and send notifications to students"
        icon={Bell}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox">
            <Bell className="h-4 w-4 mr-2" />
            Inbox {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </TabsTrigger>
        </TabsList>

        {/* Inbox Tab */}
        <TabsContent value="inbox" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs px-2">
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs px-2">
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="read" className="text-xs px-2">
                  Read ({readCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all
                </Button>
              )}
              {readCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteReadNotifications.mutate()}
                  disabled={deleteReadNotifications.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <NotificationList
            notifications={filteredNotifications}
            onMarkRead={(id) => markAsRead.mutate(id)}
            onDelete={(id) => deleteNotification.mutate(id)}
          />
        </TabsContent>

        {/* Send Tab */}
        <TabsContent value="send" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
              <CardDescription>
                Send announcements or reminders to your students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input
                  placeholder="Notification title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={formErrors.title ? "border-destructive" : ""}
                />
                {formErrors.title && (
                  <p className="text-xs text-destructive">{formErrors.title}</p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label>Message *</Label>
                <Textarea
                  placeholder="Write your notification message..."
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className={formErrors.message ? "border-destructive" : ""}
                  rows={4}
                />
                {formErrors.message && (
                  <p className="text-xs text-destructive">{formErrors.message}</p>
                )}
              </div>

              {/* Type and Quiz */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => handleChange("type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="quiz-reminder">Quiz Reminder</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Related Quiz (Optional)</Label>
                  <Select
                    value={formData.quizId || "__none__"}
                    onValueChange={(v) => handleChange("quizId", v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {quizzes.map((quiz) => (
                        <SelectItem key={quiz._id} value={quiz._id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-3">
                <Label>Recipients</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sendToAll"
                    checked={formData.sendToAll}
                    onCheckedChange={(c) => handleChange("sendToAll", c)}
                  />
                  <Label htmlFor="sendToAll" className="cursor-pointer">
                    Send to all students ({students.length})
                  </Label>
                </div>

                {!formData.sendToAll && (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {students.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No students found
                      </p>
                    ) : (
                      students.map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={student._id}
                            checked={formData.selectedUsers.includes(student._id)}
                            onCheckedChange={() => toggleUserSelection(student._id)}
                          />
                          <Label
                            htmlFor={student._id}
                            className="cursor-pointer text-sm flex-1"
                          >
                            {student.name}
                            <span className="text-muted-foreground ml-2 text-xs">
                              {student.email}
                            </span>
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {formErrors.selectedUsers && (
                  <p className="text-xs text-destructive">{formErrors.selectedUsers}</p>
                )}
              </div>

              {/* Send button */}
              <Button
                onClick={handleSend}
                disabled={sendNotification.isPending}
                className="w-full sm:w-auto"
              >
                {sendNotification.isPending ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
