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
  regionLevel: 'country' | 'province' | 'city';
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

export interface ApprovalStep {
  id: string;
  step: 1 | 2 | 3;
  title: string;
  role: 'institution' | 'district' | 'province';
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
  currentStep: 0 | 1 | 2 | 3;
  steps: ApprovalStep[];
  finalDecision?: 'adjust_plan' | 'suspend_qualification' | 'dismiss';
}

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
  status: 'pending' | 'processing' | 'resolved';
  createdAt: string;
  approvalFlow: ApprovalFlow;
}

export interface PlanValidationResult {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  totalCourses: number;
  abnormalItems: AbnormalItem[];
  overallStatus: 'pass' | 'warning' | 'error';
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
  status: 'generated' | 'generating';
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
  name: string;
}
