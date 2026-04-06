import {
  Rocket,
  Target,
  Flame,
  Crown,
  Trophy,
  Star,
  Stars,
  Medal,
  CheckCircle,
  Zap,
  Award,
  Shield,
  Swords,
  Timer,
  Bolt,
  Hash,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Brain,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icon mapping
const iconMap = {
  rocket: Rocket,
  target: Target,
  flame: Flame,
  crown: Crown,
  trophy: Trophy,
  star: Star,
  stars: Stars,
  medal: Medal,
  "check-circle": CheckCircle,
  zap: Zap,
  award: Award,
  shield: Shield,
  swords: Swords,
  timer: Timer,
  bolt: Bolt,
  hash: Hash,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  "trending-up": TrendingUp,
  brain: Brain,
};

// Tier styles
const tierStyles = {
  bronze: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-700 dark:text-amber-300",
    glow: "shadow-amber-200/50 dark:shadow-amber-900/50",
    gradient: "from-amber-200 to-amber-400 dark:from-amber-800 dark:to-amber-600",
  },
  silver: {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    border: "border-slate-300 dark:border-slate-600",
    text: "text-slate-700 dark:text-slate-300",
    glow: "shadow-slate-200/50 dark:shadow-slate-800/50",
    gradient: "from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-500",
  },
  gold: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border-yellow-400 dark:border-yellow-600",
    text: "text-yellow-700 dark:text-yellow-300",
    glow: "shadow-yellow-200/50 dark:shadow-yellow-900/50",
    gradient: "from-yellow-200 to-yellow-500 dark:from-yellow-700 dark:to-yellow-500",
  },
  platinum: {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    border: "border-violet-400 dark:border-violet-600",
    text: "text-violet-700 dark:text-violet-300",
    glow: "shadow-violet-200/50 dark:shadow-violet-900/50",
    gradient: "from-violet-200 to-violet-500 dark:from-violet-700 dark:to-violet-500",
  },
};

// Single badge component
export function AchievementBadge({
  badge,
  size = "md",
  showTooltip = true,
  locked = false,
  className,
}) {
  const Icon = iconMap[badge?.icon] || Star;
  const tier = badge?.tier || "bronze";
  const styles = tierStyles[tier];

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  };

  const BadgeContent = (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full border-2 transition-all duration-300",
        sizeClasses[size],
        locked
          ? "bg-muted border-muted-foreground/30 text-muted-foreground/50"
          : cn(styles.bg, styles.border, styles.text, "hover:scale-110 shadow-lg", styles.glow),
        className
      )}
    >
      {locked ? (
        <Lock className={cn(iconSizes[size], "opacity-50")} />
      ) : (
        <Icon className={iconSizes[size]} />
      )}
      
      {/* Tier indicator ring */}
      {!locked && (
        <div
          className={cn(
            "absolute inset-0 rounded-full opacity-20 bg-linear-to-br",
            styles.gradient
          )}
        />
      )}
    </div>
  );

  if (!showTooltip || !badge) return BadgeContent;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{BadgeContent}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-center">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-xs opacity-70">{badge.description}</p>
            {badge.earnedAt && (
              <p className="text-xs opacity-80 mt-1">
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            )}
            {locked && (
              <p className="text-xs opacity-60 mt-1 italic">Not yet earned</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Badge grid display
export function BadgeGrid({ badges, emptyMessage = "No badges yet", size = "md" }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {badges.map((badge, idx) => (
        <AchievementBadge key={badge.id || idx} badge={badge} size={size} />
      ))}
    </div>
  );
}

// Badge showcase (earned + locked)
export function BadgeShowcase({ earned = [], available = [], maxDisplay = 12 }) {
  const displayEarned = earned.slice(0, maxDisplay);
  const displayAvailable = available.slice(0, Math.max(0, maxDisplay - displayEarned.length));

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {displayEarned.map((badge, idx) => (
        <AchievementBadge key={`earned-${badge.id || idx}`} badge={badge} />
      ))}
      {displayAvailable.map((badge, idx) => (
        <AchievementBadge key={`locked-${badge.id || idx}`} badge={badge} locked />
      ))}
    </div>
  );
}

// Stats display for badges
export function BadgeStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <span>{stats.bronze || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-slate-400" />
        <span>{stats.silver || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <span>{stats.gold || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-violet-400" />
        <span>{stats.platinum || 0}</span>
      </div>
      <div className="text-muted-foreground">
        Total: <span className="font-semibold text-foreground">{stats.total || 0}</span>
      </div>
    </div>
  );
}

// New badge notification popup
export function NewBadgePopup({ badges, onClose }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
      <div className="bg-card rounded-xl p-6 max-w-sm mx-4 text-center shadow-2xl animate-scaleIn">
        <div className="mb-4">
          <Trophy className="h-12 w-12 mx-auto text-yellow-500 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold mb-2">
          {badges.length === 1 ? "New Badge Earned!" : `${badges.length} New Badges!`}
        </h3>
        <div className="flex justify-center gap-3 my-4">
          {badges.map((badge, idx) => (
            <AchievementBadge key={idx} badge={badge} size="lg" />
          ))}
        </div>
        <div className="space-y-1 mb-4">
          {badges.map((badge, idx) => (
            <div key={idx}>
              <p className="font-semibold">{badge.name}</p>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

export default AchievementBadge;
