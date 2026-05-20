/** Kimai API types (subset used by kimai-desktop) */

export interface UserEntity {
  id: number;
  username: string;
  title?: string;
  alias?: string;
  enabled: boolean;
  color?: string;
}

export interface CustomerCollection {
  id: number;
  name: string;
  color?: string;
  visible: boolean;
}

export interface ProjectCollection {
  id: number;
  name: string;
  customer: number;
  visible: boolean;
  color?: string;
}

export interface ActivityCollection {
  id: number;
  name: string;
  project?: number;
  visible: boolean;
  color?: string;
}

export interface TimesheetEditForm {
  begin?: string;
  end?: string;
  project: number;
  activity: number;
  description?: string;
  fixedRate?: number;
  hourlyRate?: number;
  user?: number;
  tags?: string;
  exported?: boolean;
  billable?: boolean;
}

export interface TimesheetEntity {
  id: number;
  begin: string;
  end?: string;
  duration?: number;
  project: number;
  activity: number;
  user?: number;
  description?: string;
  tags?: string[];
  rate?: number;
  billable?: boolean;
  exported?: boolean;
}

export interface TimesheetCollection {
  id: number;
  begin: string;
  end?: string;
  duration?: number;
  project: number;
  activity: number;
  user?: number;
  description?: string;
  tags?: string[];
  rate?: number;
  billable?: boolean;
  exported?: boolean;
}

export interface CustomerRef {
  id: number;
  name: string;
}

export interface ProjectExpanded {
  id: number;
  name: string;
  customer?: CustomerRef;
}

export interface ActivityExpanded {
  id: number;
  name: string;
}

export interface TimesheetCollectionExpanded {
  id: number;
  begin: string;
  end?: string;
  duration?: number;
  description?: string;
  tags?: string[];
  rate?: number;
  internalRate?: number;
  billable?: boolean;
  project: ProjectExpanded;
  activity: ActivityExpanded;
}

export interface Credentials {
  url: string;
  token: string;
}

export interface TimesheetFilterParams {
  page?: number;
  size?: number;
  begin?: string;
  end?: string;
  customer?: number;
  project?: number;
  activity?: number;
  orderBy?: string;
  order?: string;
  term?: string;
}
