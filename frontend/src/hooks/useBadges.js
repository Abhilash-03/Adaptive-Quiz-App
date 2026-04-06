import { useQuery } from "@tanstack/react-query";
import badgeService from "@/services/badgeService";

export function useBadges() {
  return useQuery({
    queryKey: ["badges", "definitions"],
    queryFn: badgeService.getAllBadges,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useMyBadges() {
  return useQuery({
    queryKey: ["badges", "my"],
    queryFn: badgeService.getMyBadges,
  });
}

export function useUserBadges(userId) {
  return useQuery({
    queryKey: ["badges", "user", userId],
    queryFn: () => badgeService.getUserBadges(userId),
    enabled: !!userId,
  });
}

export function useRecentBadges(days = 7) {
  return useQuery({
    queryKey: ["badges", "recent", days],
    queryFn: () => badgeService.getRecentBadges(days),
  });
}

export function useBadgeLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ["badges", "leaderboard", limit],
    queryFn: () => badgeService.getLeaderboard(limit),
  });
}
