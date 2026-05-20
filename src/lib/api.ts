import { invoke } from "@tauri-apps/api/core";
import type {
  ActivityCollection,
  Credentials,
  CustomerCollection,
  ProjectCollection,
  TimesheetCollectionExpanded,
  TimesheetEditForm,
  TimesheetEntity,
  TimesheetFilterParams,
  UserEntity,
} from "./types.generated";

export const kimaiApi = {
  setCredentials: (url: string, token: string) =>
    invoke<void>("set_credentials", { url, token }),

  getCredentials: () =>
    invoke<Credentials | null>("get_credentials"),

  validateConnection: (url: string, token: string) =>
    invoke<UserEntity>("validate_connection", { url, token }),

  validateStoredConnection: () =>
    invoke<UserEntity>("validate_stored_connection"),

  clearStoredCredentials: () =>
    invoke<void>("clear_stored_credentials"),

  getMe: () => invoke<UserEntity>("get_me"),

  getCustomers: () =>
    invoke<CustomerCollection[]>("get_customers"),

  getProjects: (customerId?: number) =>
    invoke<ProjectCollection[]>("get_projects", { customerId }),

  getActivities: (projectId?: number) =>
    invoke<ActivityCollection[]>("get_activities", { projectId }),

  getActiveTimer: () =>
    invoke<TimesheetCollectionExpanded | null>("get_active_timer"),

  getTimerDisplaySeconds: () =>
    invoke<number | null>("get_timer_display_seconds"),

  resetTimerDisplayAnchor: (timerId?: number) =>
    invoke<void>("reset_timer_display_anchor", { timerId }),

  clearTimerDisplayAnchor: () =>
    invoke<void>("clear_timer_display_anchor"),

  startTimer: (params: {
    projectId: number;
    activityId: number;
    description?: string;
    tags?: string;
    billable?: boolean;
  }) =>
    invoke<TimesheetEntity>("start_timer", {
      projectId: params.projectId,
      activityId: params.activityId,
      description: params.description,
      tags: params.tags,
      billable: params.billable,
    }),

  stopTimer: (id: number) => invoke<TimesheetEntity>("stop_timer", { id }),

  restartTimer: (id: number) => invoke<TimesheetEntity>("restart_timer", { id }),

  getRecent: (size?: number) =>
    invoke<TimesheetCollectionExpanded[]>("get_recent", { size }),

  getTodayTimesheets: () =>
    invoke<TimesheetCollectionExpanded[]>("get_today_timesheets"),

  getWorkingStats: () =>
    invoke<{
      today_seconds: number;
      week_seconds: number;
      month_seconds: number;
      year_seconds: number;
    }>("get_working_stats"),

  listTimesheets: (params: TimesheetFilterParams) =>
    invoke<TimesheetCollectionExpanded[]>("list_timesheets", {
      page: params.page,
      size: params.size,
      begin: params.begin,
      end: params.end,
      customer: params.customer,
      project: params.project,
      activity: params.activity,
      orderBy: params.orderBy,
      order: params.order,
      term: params.term,
    }),

  updateTimesheet: (id: number, form: TimesheetEditForm) =>
    invoke<TimesheetEntity>("update_timesheet", { id, form }),

  deleteTimesheet: (id: number) => invoke<void>("delete_timesheet", { id }),
};
