import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kimaiApi } from "@/lib/api";
import type {
  TimesheetCollectionExpanded,
  TimesheetEditForm,
  TimesheetFilterParams,
} from "@/lib/types.generated";

export const queryKeys = {
  me: ["me"] as const,
  customers: ["customers"] as const,
  projects: (customerId?: number) => ["projects", customerId] as const,
  activities: (projectId?: number) => ["activities", projectId] as const,
  activeTimer: ["activeTimer"] as const,
  todayTimesheets: ["todayTimesheets"] as const,
  recent: (size?: number) => ["recent", size] as const,
  timesheets: (filters: TimesheetFilterParams) => ["timesheets", filters] as const,
};

export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: () => kimaiApi.getMe(),
  });

export const useCustomers = () =>
  useQuery({
    queryKey: queryKeys.customers,
    queryFn: () => kimaiApi.getCustomers(),
  });

export const useProjects = (customerId?: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.projects(customerId),
    queryFn: () => kimaiApi.getProjects(customerId),
    enabled,
  });

export const useActivities = (projectId?: number) =>
  useQuery({
    queryKey: queryKeys.activities(projectId),
    queryFn: () => kimaiApi.getActivities(projectId),
    enabled: !!projectId,
  });

export const useActiveTimer = () =>
  useQuery({
    queryKey: queryKeys.activeTimer,
    queryFn: () => kimaiApi.getActiveTimer(),
    refetchInterval: 5000,
  });

export const useTodayTimesheets = () =>
  useQuery({
    queryKey: queryKeys.todayTimesheets,
    queryFn: () => kimaiApi.getTodayTimesheets(),
  });

export const useRecent = (size = 10) =>
  useQuery({
    queryKey: queryKeys.recent(size),
    queryFn: () => kimaiApi.getRecent(size),
  });

export const useTimesheets = (filters: TimesheetFilterParams) =>
  useQuery({
    queryKey: queryKeys.timesheets(filters),
    queryFn: () => kimaiApi.listTimesheets(filters),
  });

export const useStartTimer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      projectId: number;
      activityId: number;
      description?: string;
      tags?: string;
      billable?: boolean;
    }) => kimaiApi.startTimer(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTimesheets });
      queryClient.invalidateQueries({ queryKey: queryKeys.recent() });
    },
  });
};

export const useRestartTimer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => kimaiApi.restartTimer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTimesheets });
      queryClient.invalidateQueries({ queryKey: queryKeys.recent() });
    },
  });
};

export const useStopTimer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => kimaiApi.stopTimer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTimesheets });
      queryClient.invalidateQueries({ queryKey: queryKeys.recent() });
    },
  });
};

export const useUpdateTimesheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: number; form: TimesheetEditForm }) =>
      kimaiApi.updateTimesheet(id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTimesheets });
    },
  });
};

export const useDeleteTimesheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => kimaiApi.deleteTimesheet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTimesheets });
    },
  });
};

export function useLiveDuration(timer: TimesheetCollectionExpanded | null | undefined) {
  return useQuery({
    queryKey: ["liveDuration", timer?.id, timer?.begin],
    queryFn: async () => {
      if (!timer) return 0;
      const remote = await kimaiApi.getActiveTimerDuration();
      if (remote != null) return remote;
      const begin = new Date(timer.begin).getTime();
      return Math.max(0, Math.floor((Date.now() - begin) / 1000));
    },
    enabled: !!timer,
    refetchInterval: 1000,
  });
}
