export interface TrainingMetrics {
  totalTrainees: number;
  passRate: number;
  employmentRate: number;
  skillImprovementIndex: number;
  certificateTimeliness: number;
  updatedAt: string;
}

export interface RegionData {
  regionCode: string;
  regionName: string;
  regionLevel: 'country' | 'province' | 'city' | 'institution';
  metrics: TrainingMetrics;
  trend: {
    date: string;
    passRate: number;
    attendanceRate: number;
  }[];
}

export interface Institution {
  id: string;
  name: string;
  regionCode: string;
  level: 'primary' | 'intermediate' | 'advanced';
  qualificationStatus: 'active' | 'suspended' | 'pending';
  contactPerson: string;
  contactPhone: string;
  metrics: TrainingMetrics;
}

export type MetricsCardColor = 'blue' | 'purple' | 'green' | 'orange';

export interface RankingItem {
  name: string;
  value: number;
  change?: number | null;
}

export type ApprovalRole = 'institution' | 'district' | 'city' | 'province' | 'academic';

export interface ApprovalStep {
  id: string;
  step: 1 | 2 | 3;
  title: string;
  role: ApprovalRole;
  status: 'pending' | 'approved' | 'rejected' | 'current' | 'completed';
  operator?: string;
  operatorName?: string;
  time?: string;
  operatedAt?: string;
  opinion?: string;
  comment?: string;
}

export interface ApprovalFlow {
  id: string;
  warningId: string;
  currentStep: 0 | 1 | 2 | 3 | 4;
  steps: ApprovalStep[];
  finalDecision?: 'adjust_plan' | 'suspend_qualification' | 'dismiss';
}

export type WarningApprovalStatus = 
  | 'pending' 
  | 'institution_approved' 
  | 'district_approved' 
  | 'province_approved' 
  | 'rejected' 
  | 'rectification_submitted';

export interface Warning {
  id: string;
  type: 'pass_rate' | 'employment_rate';
  level: 1;
  institutionId: string;
  institutionName: string;
  regionCode: string;
  description: string;
  threshold: number;
  actualValue: number;
  consecutiveMonths: number;
  status: 'pending' | 'processing' | 'resolved' | 'rejected' | 'rectification';
  approvalStatus: WarningApprovalStatus;
  createdAt: string;
  approvalFlow: ApprovalFlow;
}

export interface ValidationSummary {
  totalCourses: number;
  hoursPassed: number;
  teachersPassed: number;
  curriculumPassed: number;
}

export interface PlanValidationResult {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  regionCode: string;
  regionName: string;
  totalCourses: number;
  validatedCourses: number;
  abnormalItems: AbnormalItem[];
  overallStatus: 'pass' | 'warning' | 'error';
  validationSummary: ValidationSummary;
}

export interface AbnormalItem {
  courseName: string;
  itemType: 'class_hours' | 'teacher_qualification' | 'curriculum';
  standardValue: number | string;
  actualValue: number | string;
  deviation: number;
  description: string;
  severity: 'minor' | 'major' | 'critical';
}

export interface ReportSection {
  title: string;
  type: 'pass_rate_comparison' | 'employment_distribution' | 'certificate_cycle' | 'trend_analysis';
  data: unknown;
  analysis: string;
}

export interface ReportMetrics {
  passRate: number;
  employmentRate: number;
  yearOverYearChange: number;
  weekOverWeekChange: number;
}

export interface OptimizationSuggestion {
  id: string;
  category: 'curriculum' | 'teacher';
  content: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  year: number;
  weekNumber: number;
  regionCode: string;
  regionName: string;
  status: ReportStatus;
  generatedAt: string;
  metrics: ReportMetrics;
  sections: ReportSection[];
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface User {
  id: string;
  username: string;
  role: 'national' | 'province' | 'city' | 'institution' | 'academic';
  regionCode: string;
  institutionId?: string;
  institutionName?: string;
  name: string;
}

export type OccupationCategory = 'electrician' | 'welder' | 'housekeeping' | 'nursery' | 'it' | 'auto_repair' | 'chef' | 'other';

export interface OccupationData {
  code: OccupationCategory;
  name: string;
  totalTrainees: number;
  passRate: number;
  employmentRate: number;
  attendanceTrend: { date: string; rate: number }[];
  certificateCount: number;
}

export interface NationalStandard {
  id: string;
  occupation: OccupationCategory;
  occupationName: string;
  level: 'primary' | 'intermediate' | 'advanced';
  requiredHours: number;
  requiredTeachers: string;
  requiredCourses: string[];
}

export interface TrainingCourse {
  name: string;
  occupation: OccupationCategory;
  level: 'primary' | 'intermediate' | 'advanced';
  actualHours: number;
  teacher: string;
  teacherQualification: string;
  courses: string[];
}

export type ReportStatus = 'generated' | 'generating' | 'draft';

export type WarningOperation = 'approve' | 'reject' | 'submit_plan' | 'acknowledge';
