import { Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Volume2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { PageHeader } from "@/components/shared";
import { useSettingsStore } from "@/store/settingsStore";

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    emailNotifications,
    setEmailNotifications,
    soundEffects,
    setSoundEffects,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Customize your experience"
        icon={SettingsIcon}
      />

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the app looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred theme
              </p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme preview */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => setTheme("light")}
              className={`p-3 rounded-lg border-2 transition-colors ${
                theme === "light" ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="h-16 rounded bg-white border shadow-sm" />
              <p className="text-xs mt-2 text-center">Light</p>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-3 rounded-lg border-2 transition-colors ${
                theme === "dark" ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="h-16 rounded bg-slate-900 border border-slate-700" />
              <p className="text-xs mt-2 text-center">Dark</p>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`p-3 rounded-lg border-2 transition-colors ${
                theme === "system" ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="h-16 rounded bg-linear-to-r from-white to-slate-900 border" />
              <p className="text-xs mt-2 text-center">System</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive quiz reminders and results via email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Sound Effects
              </Label>
              <p className="text-sm text-muted-foreground">
                Play sounds for quiz actions
              </p>
            </div>
            <Switch
              checked={soundEffects}
              onCheckedChange={setSoundEffects}
            />
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Application</span>
            <span>QuizAI</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            An adaptive online quiz platform with intelligent difficulty adjustment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
