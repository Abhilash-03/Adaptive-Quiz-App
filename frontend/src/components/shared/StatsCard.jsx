import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

export function StatsCard({ 
  title,
  label, // alias for title
  value, 
  icon: Icon, 
  suffix,
  iconColor = "text-primary",
  color, // alias for iconColor
  iconBgColor,
  trend,
  onClick,
  link,
  variant = "default" // default or compact
}) {
  // Support aliases
  const displayTitle = title || label;
  const displayIconColor = iconColor || color;

  const content = (
    <CardContent className={variant === "compact" ? "p-4" : "pt-6"}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={cn(
            "flex items-center justify-center shrink-0",
            variant === "compact" 
              ? "h-10 w-10 rounded-lg" 
              : "h-12 w-12 rounded-lg",
            iconBgColor || "bg-primary/10"
          )}>
            <Icon className={cn(
              variant === "compact" ? "h-5 w-5" : "h-6 w-6", 
              displayIconColor
            )} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{displayTitle}</p>
          <p className="text-2xl font-bold">
            {value}
            {suffix && <span className="text-base font-normal text-muted-foreground">{suffix}</span>}
          </p>
          {trend && (
            <p className={cn(
              "text-xs",
              trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
            )}>
              {trend > 0 ? "+" : ""}{trend}% from last period
            </p>
          )}
        </div>
      </div>
    </CardContent>
  );

  if (link) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <Link to={link}>{content}</Link>
      </Card>
    );
  }

  if (onClick) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <button onClick={onClick} className="w-full text-left">{content}</button>
      </Card>
    );
  }

  return <Card>{content}</Card>;
}

export function StatsGrid({ children, stats, columns = 4 }) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns] || gridCols[4])}>
      {children || (stats && stats.map((stat, idx) => (
        <StatsCard key={idx} {...stat} />
      )))}
    </div>
  );
}

export default StatsCard;
