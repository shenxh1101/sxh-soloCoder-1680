import type { User, RegionData, Warning, WeeklyReport, Institution, OptimizationSuggestion, PlanValidationResult, NationalStandard, OccupationData, OccupationCategory } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin_national',
    role: 'national',
    regionCode: '000000',
    name: '国家管理员',
  },
  {
    id: '2',
    username: 'admin_province',
    role: 'province',
    regionCode: '440000',
    name: '省级管理员',
  },
  {
    id: '3',
    username: 'admin_city',
    role: 'city',
    regionCode: '440100',
    name: '市级管理员',
  },
  {
    id: '4',
    username: 'institution',
    role: 'institution',
    regionCode: '440100',
    institutionId: 'INS001',
    name: '机构负责人',
  },
  {
    id: '5',
    username: 'academic',
    role: 'academic',
    regionCode: '440100',
    institutionId: 'INS001',
    name: '教务管理员',
  },
];

const generateTrendData = () => {
  const data = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      passRate: 75 + Math.random() * 15,
      attendanceRate: 85 + Math.random() * 10,
    });
  }
  return data;
};

export const mockNationalMetrics: RegionData = {
  regionCode: '000000',
  regionName: '全国',
  regionLevel: 'country',
  metrics: {
    totalTrainees: 1256800,
    passRate: 82.5,
    employmentRate: 76.8,
    skillImprovementIndex: 85.2,
    certificateTimeliness: 91.3,
    updatedAt: '2026-06-22T10:00:00Z',
  },
  trend: generateTrendData(),
};

export const mockProvinceData: RegionData[] = [
  {
    regionCode: '440000',
    regionName: '广东省',
    regionLevel: 'province',
    metrics: {
      totalTrainees: 156800,
      passRate: 86.3,
      employmentRate: 80.5,
      skillImprovementIndex: 88.1,
      certificateTimeliness: 93.2,
      updatedAt: '2026-06-22T10:00:00Z',
    },
    trend: generateTrendData(),
  },
  {
    regionCode: '320000',
    regionName: '江苏省',
    regionLevel: 'province',
    metrics: {
      totalTrainees: 142500,
      passRate: 84.7,
      employmentRate: 78.9,
      skillImprovementIndex: 86.5,
      certificateTimeliness: 92.1,
      updatedAt: '2026-06-22T10:00:00Z',
    },
    trend: generateTrendData(),
  },
  {
    regionCode: '330000',
    regionName: '浙江省',
    regionLevel: 'province',
    metrics: {
      totalTrainees: 128600,
      passRate: 85.1,
      employmentRate: 79.3,
      skillImprovementIndex: 87.2,
      certificateTimeliness: 92.5,
      updatedAt: '2026-06-22T10:00:00Z',
    },
    trend: generateTrendData(),
  },
  {
    regionCode: '310000',
    regionName: '上海市',
    regionLevel: 'province',
    metrics: {
      totalTrainees: 98700,
      passRate: 88.2,
      employmentRate: 82.1,
      skillImprovementIndex: 89.5,
      certificateTimeliness: 94.1,
      updatedAt: '2026-06-22T10:00:00Z',
    },
    trend: generateTrendData(),
  },
  {
    regionCode: '110000',
    regionName: '北京市',
    regionLevel: 'province',
    metrics: {
      totalTrainees: 87600,
      passRate: 87.5,
      employmentRate: 81.6,
      skillImprovementIndex: 88.9,
      certificateTimeliness: 93.8,
      updatedAt: '2026-06-22T10:00:00Z',
    },
    trend: generateTrendData(),
  },
];

export const mockCityData: Record<string, RegionData[]> = {
  '440000': [
    {
      regionCode: '440100',
      regionName: '广州市',
      regionLevel: 'city',
      metrics: {
        totalTrainees: 45600,
        passRate: 87.2,
        employmentRate: 81.8,
        skillImprovementIndex: 89.1,
        certificateTimeliness: 94.0,
        updatedAt: '2026-06-22T10:00:00Z',
      },
      trend: generateTrendData(),
    },
    {
      regionCode: '440300',
      regionName: '深圳市',
      regionLevel: 'city',
      metrics: {
        totalTrainees: 52300,
        passRate: 88.5,
        employmentRate: 83.2,
        skillImprovementIndex: 90.3,
        certificateTimeliness: 94.8,
        updatedAt: '2026-06-22T10:00:00Z',
      },
      trend: generateTrendData(),
    },
    {
      regionCode: '440600',
      regionName: '佛山市',
      regionLevel: 'city',
      metrics: {
        totalTrainees: 28900,
        passRate: 85.1,
        employmentRate: 79.5,
        skillImprovementIndex: 86.8,
        certificateTimeliness: 92.3,
        updatedAt: '2026-06-22T10:00:00Z',
      },
      trend: generateTrendData(),
    },
  ],
};

export const mockWarnings: Warning[] = [
  {
    id: 'WARN001',
    type: 'pass_rate',
    level: 1,
    institutionId: 'INS001',
    institutionName: '广州市职业技能培训中心',
    regionCode: '440100',
    description: '连续3个月培训合格率低于区域均值20%',
    threshold: 65,
    actualValue: 58.2,
    consecutiveMonths: 3,
    status: 'pending',
    approvalStatus: 'pending',
    createdAt: '2026-06-20T09:00:00Z',
    approvalFlow: {
      id: 'FLOW001',
      warningId: 'WARN001',
      currentStep: 1,
      steps: [
        {
          id: 'STEP001-1',
          step: 1,
          title: '机构确认',
          role: 'institution',
          status: 'current',
        },
        {
          id: 'STEP001-2',
          step: 2,
          title: '区级复核',
          role: 'district',
          status: 'pending',
        },
        {
          id: 'STEP001-3',
          step: 3,
          title: '省级批准',
          role: 'province',
          status: 'pending',
        },
      ],
    },
  },
  {
    id: 'WARN002',
    type: 'employment_rate',
    level: 1,
    institutionId: 'INS002',
    institutionName: '深圳市技能培训学院',
    regionCode: '440300',
    description: '就业率持续下降，近3个月下降超过15%',
    threshold: 70,
    actualValue: 55.8,
    consecutiveMonths: 3,
    status: 'processing',
    approvalStatus: 'institution_approved',
    createdAt: '2026-06-18T14:30:00Z',
    approvalFlow: {
      id: 'FLOW002',
      warningId: 'WARN002',
      currentStep: 2,
      steps: [
        {
          id: 'STEP002-1',
          step: 1,
          title: '机构确认',
          role: 'institution',
          status: 'completed',
          operator: '张院长',
          operatorName: '张院长',
          time: '2026-06-19 10:00',
          operatedAt: '2026-06-19T10:00:00Z',
          opinion: '已确认问题，正在制定整改方案',
          comment: '已确认问题，正在制定整改方案',
        },
        {
          id: 'STEP002-2',
          step: 2,
          title: '区级复核',
          role: 'district',
          status: 'current',
        },
        {
          id: 'STEP002-3',
          step: 3,
          title: '省级批准',
          role: 'province',
          status: 'pending',
        },
      ],
    },
  },
  {
    id: 'WARN003',
    type: 'pass_rate',
    level: 1,
    institutionId: 'INS003',
    institutionName: '佛山市职业教育中心',
    regionCode: '440600',
    description: '连续4个月培训合格率低于区域均值25%',
    threshold: 65,
    actualValue: 48.5,
    consecutiveMonths: 4,
    status: 'resolved',
    approvalStatus: 'province_approved',
    createdAt: '2026-05-15T08:00:00Z',
    approvalFlow: {
      id: 'FLOW003',
      warningId: 'WARN003',
      currentStep: 3,
      steps: [
        {
          id: 'STEP003-1',
          step: 1,
          title: '机构确认',
          role: 'institution',
          status: 'completed',
          operator: '李主任',
          operatorName: '李主任',
          time: '2026-05-16 09:00',
          operatedAt: '2026-05-16T09:00:00Z',
          opinion: '确认存在问题，已提交整改计划',
          comment: '确认存在问题，已提交整改计划',
        },
        {
          id: 'STEP003-2',
          step: 2,
          title: '区级复核',
          role: 'district',
          status: 'completed',
          operator: '王科长',
          operatorName: '王科长',
          time: '2026-05-18 14:00',
          operatedAt: '2026-05-18T14:00:00Z',
          opinion: '复核通过，同意整改方案',
          comment: '复核通过，同意整改方案',
        },
        {
          id: 'STEP003-3',
          step: 3,
          title: '省级批准',
          role: 'province',
          status: 'completed',
          operator: '陈处长',
          operatorName: '陈处长',
          time: '2026-05-20 11:00',
          operatedAt: '2026-05-20T11:00:00Z',
          opinion: '批准调整培训计划，限期3个月整改',
          comment: '批准调整培训计划，限期3个月整改',
        },
      ],
      finalDecision: 'adjust_plan',
    },
  },
];

export const planValidationResults: PlanValidationResult[] = [
  {
    id: 'PV20260622001',
    fileName: '2026年第三季度培训计划.xlsx',
    uploadedBy: '李主任',
    uploadedAt: '2026-06-22T09:30:00Z',
    regionCode: '440100',
    regionName: '广州市',
    totalCourses: 28,
    validatedCourses: 28,
    abnormalItems: [
      {
        courseName: '高级电工技能培训',
        itemType: 'class_hours',
        standardValue: 120,
        actualValue: 96,
        deviation: -20,
        description: '课时低于标准要求，缺少24课时的实操训练内容',
        severity: 'major',
      },
      {
        courseName: '中级焊工认证班',
        itemType: 'teacher_qualification',
        standardValue: '高级技师',
        actualValue: '中级技师',
        deviation: 0,
        description: '授课教师资质不符合要求，需配备高级技师及以上职称教师',
        severity: 'critical',
      },
      {
        courseName: '家政服务初级培训班',
        itemType: 'curriculum',
        standardValue: 8,
        actualValue: 6,
        deviation: -25,
        description: '课程设置缺少2门必修模块：老年人护理、婴幼儿急救',
        severity: 'major',
      },
      {
        courseName: '计算机基础应用',
        itemType: 'class_hours',
        standardValue: 80,
        actualValue: 75,
        deviation: -6.25,
        description: '课时略低于标准，偏差在允许范围内',
        severity: 'minor',
      },
    ],
    overallStatus: 'error',
    validationSummary: {
      totalCourses: 28,
      hoursPassed: 27,
      teachersPassed: 27,
      curriculumPassed: 27,
    },
  },
  {
    id: 'PV20260621002',
    fileName: '职业技能提升计划-Q3.xlsx',
    uploadedBy: '王科长',
    uploadedAt: '2026-06-21T14:20:00Z',
    regionCode: '440300',
    regionName: '深圳市',
    totalCourses: 35,
    validatedCourses: 35,
    abnormalItems: [
      {
        courseName: '育婴师职业资格培训',
        itemType: 'teacher_qualification',
        standardValue: '高级育婴师',
        actualValue: '中级育婴师',
        deviation: 0,
        description: '主讲教师资质未达标，需持有高级育婴师及以上证书',
        severity: 'critical',
      },
      {
        courseName: '中式烹调师培训班',
        itemType: 'class_hours',
        standardValue: 200,
        actualValue: 170,
        deviation: -15,
        description: '实操课时不足，缺少30学时的后厨实操训练',
        severity: 'major',
      },
    ],
    overallStatus: 'warning',
    validationSummary: {
      totalCourses: 35,
      hoursPassed: 34,
      teachersPassed: 34,
      curriculumPassed: 35,
    },
  },
  {
    id: 'PV20260620003',
    fileName: '2026年度下半年培训规划.xlsx',
    uploadedBy: '张院长',
    uploadedAt: '2026-06-20T10:45:00Z',
    regionCode: '440000',
    regionName: '广东省',
    totalCourses: 42,
    validatedCourses: 42,
    abnormalItems: [
      {
        courseName: '汽车维修基础班',
        itemType: 'curriculum',
        standardValue: 10,
        actualValue: 10,
        deviation: 0,
        description: '课程模块数量符合标准，但「新能源汽车基础」内容深度不足',
        severity: 'minor',
      },
    ],
    overallStatus: 'pass',
    validationSummary: {
      totalCourses: 42,
      hoursPassed: 42,
      teachersPassed: 42,
      curriculumPassed: 41,
    },
  },
  {
    id: 'PV20260619004',
    fileName: '新员工入职培训方案.xlsx',
    uploadedBy: '陈教务',
    uploadedAt: '2026-06-19T16:00:00Z',
    regionCode: '310000',
    regionName: '上海市',
    totalCourses: 15,
    validatedCourses: 15,
    abnormalItems: [],
    overallStatus: 'pass',
    validationSummary: {
      totalCourses: 15,
      hoursPassed: 15,
      teachersPassed: 15,
      curriculumPassed: 15,
    },
  },
  {
    id: 'PV20260618005',
    fileName: '技能大赛赛前集训计划.xlsx',
    uploadedBy: '刘老师',
    uploadedAt: '2026-06-18T11:15:00Z',
    regionCode: '110000',
    regionName: '北京市',
    totalCourses: 22,
    validatedCourses: 22,
    abnormalItems: [
      {
        courseName: '数控加工精密操作',
        itemType: 'class_hours',
        standardValue: 160,
        actualValue: 128,
        deviation: -20,
        description: '集训课时严重不足，建议增加32课时的专项训练',
        severity: 'major',
      },
      {
        courseName: '工业机器人编程',
        itemType: 'curriculum',
        standardValue: 12,
        actualValue: 9,
        deviation: -25,
        description: '缺少机器人视觉识别、离线编程等3个核心模块',
        severity: 'critical',
      },
      {
        courseName: 'PLC自动化控制',
        itemType: 'teacher_qualification',
        standardValue: '高级工程师',
        actualValue: '工程师',
        deviation: 0,
        description: '指导教师职称偏低，建议配备高级工程师及以上人员',
        severity: 'major',
      },
    ],
    overallStatus: 'error',
    validationSummary: {
      totalCourses: 22,
      hoursPassed: 21,
      teachersPassed: 21,
      curriculumPassed: 21,
    },
  },
];

const defaultOptimizationSuggestions: OptimizationSuggestion[] = [
  {
    id: 'SUG001',
    category: 'curriculum',
    content: '建议加强西部地区培训机构扶持力度，缩小区域培训质量差距，重点倾斜实操设备和数字化培训资源',
    priority: 'high',
  },
  {
    id: 'SUG002',
    category: 'curriculum',
    content: '推进数字化培训平台建设，增加线上直播和录播课程比例，提升偏远地区培训可及性',
    priority: 'high',
  },
  {
    id: 'SUG003',
    category: 'teacher',
    content: '建立培训机构师资动态评估机制，对连续两学期合格率低于70%的授课教师开展专项培训',
    priority: 'high',
  },
  {
    id: 'SUG004',
    category: 'curriculum',
    content: '优化课程结构，增加新兴产业（新能源、人工智能、生物医药）相关实训内容，对接市场需求',
    priority: 'medium',
  },
  {
    id: 'SUG005',
    category: 'teacher',
    content: '实施"双师型"教师培养计划，鼓励教师赴企业实践，提升实操教学能力',
    priority: 'medium',
  },
  {
    id: 'SUG006',
    category: 'curriculum',
    content: '完善就业跟踪服务体系，建立毕业学员6个月就业状态回访机制，优化就业指导服务',
    priority: 'medium',
  },
  {
    id: 'SUG007',
    category: 'teacher',
    content: '优化教师绩效激励方案，将学员合格率、就业率纳入绩效考核指标',
    priority: 'low',
  },
  {
    id: 'SUG008',
    category: 'curriculum',
    content: '优化证书发放流程，推进电子证书普及，进一步缩短证书发放周期',
    priority: 'low',
  },
];

const generate12WeekPassRate = (base: number) => {
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date('2026-06-22');
    date.setDate(date.getDate() - i * 7);
    const weekNum = Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    data.push({
      week: `${date.getFullYear()}年第${weekNum}周`,
      passRate: +(base + (Math.random() * 6 - 3)).toFixed(1),
    });
  }
  return data;
};

export function generateWeeklyReport(
  regionCode: string,
  weekNumber: number,
  year: number
): WeeklyReport;
export function generateWeeklyReport(
  id: string,
  year: number,
  weekNumber: number,
  regionCode: string,
  regionName: string,
  status: 'generated' | 'generating' | 'draft',
  passRate: number,
  employmentRate: number,
  yoy: number,
  wow: number
): WeeklyReport;
export function generateWeeklyReport(
  idOrRegionCode: string,
  yearOrWeekNumber: number,
  weekNumberOrYear: number,
  pRegionCode?: string,
  pRegionName?: string,
  pStatus?: 'generated' | 'generating' | 'draft',
  pPassRate?: number,
  pEmploymentRate?: number,
  pYoy?: number,
  pWow?: number
): WeeklyReport {
  let id: string;
  let year: number;
  let weekNumber: number;
  let actualRegionCode: string;
  let actualRegionName: string;
  let actualStatus: 'generated' | 'generating' | 'draft';
  let actualPassRate: number;
  let actualEmploymentRate: number;
  let actualYoy: number;
  let actualWow: number;

  if (pRegionCode === undefined) {
    actualRegionCode = idOrRegionCode;
    weekNumber = yearOrWeekNumber;
    year = weekNumberOrYear;
    id = `REPORT${year}W${weekNumber.toString().padStart(2, '0')}${actualRegionCode}`;
    actualRegionName = regionNameMap[actualRegionCode] || '未知地区';
    actualStatus = 'draft';
    actualPassRate = 75 + Math.random() * 15;
    actualEmploymentRate = 70 + Math.random() * 15;
    actualYoy = Math.random() * 6 - 2;
    actualWow = Math.random() * 4 - 1;
  } else {
    id = idOrRegionCode;
    year = yearOrWeekNumber;
    weekNumber = weekNumberOrYear;
    actualRegionCode = pRegionCode;
    actualRegionName = pRegionName!;
    actualStatus = pStatus!;
    actualPassRate = pPassRate!;
    actualEmploymentRate = pEmploymentRate!;
    actualYoy = pYoy!;
    actualWow = pWow!;
  }

  const passRate = Math.round(actualPassRate * 10) / 10;
  const employmentRate = Math.round(actualEmploymentRate * 10) / 10;
  const yoy = Math.round(actualYoy * 10) / 10;
  const wow = Math.round(actualWow * 10) / 10;
  const baseDate = new Date(year, 0, 1);
  const weekStart = new Date(baseDate);
  weekStart.setDate(baseDate.getDate() + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const generatedDate = new Date(weekEnd);
  generatedDate.setHours(generatedDate.getHours() + 10);

  return {
    id,
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    year,
    weekNumber,
    regionCode: actualRegionCode,
    regionName: actualRegionName,
    status: actualStatus,
    generatedAt: generatedDate.toISOString(),
    metrics: {
      passRate,
      employmentRate,
      yearOverYearChange: yoy,
      weekOverWeekChange: wow,
    },
    sections: [
      {
        title: '培训效能总览',
        type: 'pass_rate_comparison',
        data: {
          currentWeek: passRate,
          lastWeek: +(passRate - wow).toFixed(1),
          samePeriodLastYear: +(passRate - yoy).toFixed(1),
          weekOverWeekChange: wow,
          yearOverYearChange: yoy,
        },
        analysis: `本周培训合格率${wow >= 0 ? '较上周提升' : '较上周下降'}${Math.abs(wow)}个百分点，${yoy >= 0 ? '较去年同期提升' : '较去年同期下降'}${Math.abs(yoy)}个百分点，整体呈${wow >= 0 ? '稳步上升' : '波动调整'}趋势。`,
      },
      {
        title: '合格率同比环比分析',
        type: 'trend_analysis',
        data: generate12WeekPassRate(passRate),
        analysis: '近12周培训合格率整体保持在合理区间，波动幅度可控，呈稳步向好态势。',
      },
      {
        title: '就业去向分布',
        type: 'employment_distribution',
        data: [
          { category: '制造业', percentage: 35.2 + (Math.random() * 4 - 2) },
          { category: '服务业', percentage: 28.6 + (Math.random() * 4 - 2) },
          { category: '信息技术', percentage: 18.3 + (Math.random() * 4 - 2) },
          { category: '建筑业', percentage: 10.5 + (Math.random() * 3 - 1.5) },
          { category: '其他', percentage: 7.4 + (Math.random() * 3 - 1.5) },
        ],
        analysis: '就业去向以制造业和服务业为主，信息技术行业占比稳步提升，显示产业升级趋势带动就业结构优化。',
      },
      {
        title: '证书获取周期分析',
        type: 'certificate_cycle',
        data: {
          averageDays: 15.8 + (Math.random() * 4 - 2),
          targetDays: 20,
          improvement: 4.2,
          distribution: [
            { occupation: '电工', averageDays: 18 },
            { occupation: '焊工', averageDays: 22 },
            { occupation: '家政服务', averageDays: 12 },
            { occupation: '育婴师', averageDays: 14 },
            { occupation: 'IT技术', averageDays: 20 },
            { occupation: '汽车维修', averageDays: 19 },
            { occupation: '中式烹调', averageDays: 16 },
          ],
        },
        analysis: '各职业证书平均获取周期差异明显，家政服务类取证最快，焊工类因实操考核环节较多周期偏长。',
      },
    ],
    optimizationSuggestions: defaultOptimizationSuggestions,
  };
};

export const weeklyReports: WeeklyReport[] = [
  generateWeeklyReport('REPORT2026W25', 2026, 25, '000000', '全国', 'generated', 82.5, 76.8, 3.9, 1.3),
  generateWeeklyReport('REPORT2026W24', 2026, 24, '000000', '全国', 'generated', 81.2, 75.9, 3.4, 0.7),
  generateWeeklyReport('REPORT2026W23', 2026, 23, '000000', '全国', 'generated', 80.5, 75.2, 2.8, -0.5),
  generateWeeklyReport('REPORT2026W22', 2026, 22, '000000', '全国', 'generated', 81.0, 74.8, 3.1, 1.2),
  generateWeeklyReport('REPORT2026W21', 2026, 21, '000000', '全国', 'generated', 79.8, 74.1, 2.5, 0.3),
  generateWeeklyReport('REPORT2026W25-GD', 2026, 25, '440000', '广东省', 'generated', 86.3, 80.5, 4.2, 1.1),
  generateWeeklyReport('REPORT2026W24-GD', 2026, 24, '440000', '广东省', 'generated', 85.2, 79.8, 3.8, 0.9),
  generateWeeklyReport('REPORT2026W23-GD', 2026, 23, '440000', '广东省', 'generated', 84.3, 79.1, 3.5, 0.6),
  generateWeeklyReport('REPORT2026W25-JS', 2026, 25, '320000', '江苏省', 'generated', 84.7, 78.9, 3.6, 0.8),
  generateWeeklyReport('REPORT2026W24-JS', 2026, 24, '320000', '江苏省', 'generated', 83.9, 78.2, 3.2, 0.5),
  generateWeeklyReport('REPORT2026W25-ZJ', 2026, 25, '330000', '浙江省', 'generated', 85.1, 79.3, 3.7, 1.0),
  generateWeeklyReport('REPORT2026W25-SH', 2026, 25, '310000', '上海市', 'generated', 88.2, 82.1, 4.5, 1.4),
  generateWeeklyReport('REPORT2026W25-BJ', 2026, 25, '110000', '北京市', 'generated', 87.5, 81.6, 4.3, 1.2),
  generateWeeklyReport('REPORT2026W25-GZ', 2026, 25, '440100', '广州市', 'generating', 87.2, 81.8, 4.1, 0.9),
  generateWeeklyReport('REPORT2026W25-SZ', 2026, 25, '440300', '深圳市', 'generated', 88.5, 83.2, 4.8, 1.5),
  generateWeeklyReport('REPORT2025W52', 2025, 52, '000000', '全国', 'generated', 79.2, 73.5, 2.8, 0.6),
  generateWeeklyReport('REPORT2025W51', 2025, 51, '000000', '全国', 'generated', 78.6, 72.9, 2.5, 0.4),
  generateWeeklyReport('REPORT2025W50', 2025, 50, '000000', '全国', 'generated', 78.2, 72.5, 2.2, 0.3),
];

export const institutions: Institution[] = [
  {
    id: 'INS001',
    name: '广州市职业技能培训中心',
    regionCode: '440100',
    level: 'advanced',
    qualificationStatus: 'active',
    contactPerson: '张院长',
    contactPhone: '13800138001',
    metrics: {
      totalTrainees: 12580,
      passRate: 88.5,
      employmentRate: 82.3,
      skillImprovementIndex: 90.1,
      certificateTimeliness: 94.5,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS002',
    name: '深圳市技能培训学院',
    regionCode: '440300',
    level: 'advanced',
    qualificationStatus: 'active',
    contactPerson: '李院长',
    contactPhone: '13800138002',
    metrics: {
      totalTrainees: 15600,
      passRate: 91.2,
      employmentRate: 85.6,
      skillImprovementIndex: 92.3,
      certificateTimeliness: 95.1,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS003',
    name: '佛山市职业教育中心',
    regionCode: '440600',
    level: 'intermediate',
    qualificationStatus: 'suspended',
    contactPerson: '王主任',
    contactPhone: '13800138003',
    metrics: {
      totalTrainees: 8900,
      passRate: 58.2,
      employmentRate: 52.1,
      skillImprovementIndex: 60.5,
      certificateTimeliness: 70.2,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS004',
    name: '广州市天河区技能培训学校',
    regionCode: '440100',
    level: 'primary',
    qualificationStatus: 'active',
    contactPerson: '陈校长',
    contactPhone: '13800138004',
    metrics: {
      totalTrainees: 5600,
      passRate: 82.1,
      employmentRate: 76.5,
      skillImprovementIndex: 84.2,
      certificateTimeliness: 90.8,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS005',
    name: '深圳市南山区职业技术学校',
    regionCode: '440300',
    level: 'intermediate',
    qualificationStatus: 'pending',
    contactPerson: '刘校长',
    contactPhone: '13800138005',
    metrics: {
      totalTrainees: 0,
      passRate: 0,
      employmentRate: 0,
      skillImprovementIndex: 0,
      certificateTimeliness: 0,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS006',
    name: '东莞市职业技术培训中心',
    regionCode: '441900',
    level: 'intermediate',
    qualificationStatus: 'active',
    contactPerson: '赵主任',
    contactPhone: '13800138006',
    metrics: {
      totalTrainees: 9800,
      passRate: 85.6,
      employmentRate: 79.8,
      skillImprovementIndex: 86.7,
      certificateTimeliness: 92.3,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS007',
    name: '珠海市职业技能鉴定中心',
    regionCode: '440400',
    level: 'advanced',
    qualificationStatus: 'active',
    contactPerson: '孙院长',
    contactPhone: '13800138007',
    metrics: {
      totalTrainees: 7200,
      passRate: 89.3,
      employmentRate: 83.5,
      skillImprovementIndex: 88.9,
      certificateTimeliness: 93.6,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS008',
    name: '中山市技工学院',
    regionCode: '442000',
    level: 'primary',
    qualificationStatus: 'pending',
    contactPerson: '周校长',
    contactPhone: '13800138008',
    metrics: {
      totalTrainees: 0,
      passRate: 0,
      employmentRate: 0,
      skillImprovementIndex: 0,
      certificateTimeliness: 0,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS009',
    name: '惠州市职业技术学校',
    regionCode: '441300',
    level: 'primary',
    qualificationStatus: 'active',
    contactPerson: '吴校长',
    contactPhone: '13800138009',
    metrics: {
      totalTrainees: 4500,
      passRate: 79.5,
      employmentRate: 74.2,
      skillImprovementIndex: 81.3,
      certificateTimeliness: 88.5,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS010',
    name: '江门市职业教育中心',
    regionCode: '440700',
    level: 'intermediate',
    qualificationStatus: 'suspended',
    contactPerson: '郑主任',
    contactPhone: '13800138010',
    metrics: {
      totalTrainees: 6200,
      passRate: 62.3,
      employmentRate: 58.1,
      skillImprovementIndex: 63.8,
      certificateTimeliness: 72.5,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS011',
    name: '北京市朝阳区职业技能培训中心',
    regionCode: '110100',
    level: 'advanced',
    qualificationStatus: 'active',
    contactPerson: '马院长',
    contactPhone: '13900139001',
    metrics: {
      totalTrainees: 18500,
      passRate: 92.1,
      employmentRate: 87.3,
      skillImprovementIndex: 93.5,
      certificateTimeliness: 96.2,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
  {
    id: 'INS012',
    name: '上海市浦东新区职业技术学院',
    regionCode: '310100',
    level: 'advanced',
    qualificationStatus: 'active',
    contactPerson: '朱院长',
    contactPhone: '13900139002',
    metrics: {
      totalTrainees: 21000,
      passRate: 93.5,
      employmentRate: 89.2,
      skillImprovementIndex: 94.8,
      certificateTimeliness: 97.1,
      updatedAt: '2026-06-22T10:00:00Z',
    },
  },
];

export const nationalStandards: NationalStandard[] = [
  {
    id: 'STD001',
    occupation: 'electrician',
    occupationName: '电工',
    level: 'primary',
    requiredHours: 120,
    requiredTeachers: '中级技师及以上',
    requiredCourses: ['电工基础', '安全用电', '电气识图', '照明电路安装', '低压电器维修'],
  },
  {
    id: 'STD002',
    occupation: 'electrician',
    occupationName: '电工',
    level: 'intermediate',
    requiredHours: 180,
    requiredTeachers: '高级技师',
    requiredCourses: ['电工基础', '电子技术', '电机与变压器', '电力拖动', 'PLC编程基础', '电气故障诊断'],
  },
  {
    id: 'STD003',
    occupation: 'electrician',
    occupationName: '电工',
    level: 'advanced',
    requiredHours: 240,
    requiredTeachers: '高级技师或工程师',
    requiredCourses: ['高级电工技术', '自动控制原理', '变频器应用', '工业机器人基础', '电气系统设计', '新能源电气'],
  },
  {
    id: 'STD004',
    occupation: 'welder',
    occupationName: '焊工',
    level: 'primary',
    requiredHours: 100,
    requiredTeachers: '中级焊工及以上',
    requiredCourses: ['焊接安全', '焊接材料', '手工电弧焊基础', '气焊气割', '焊接质量检验'],
  },
  {
    id: 'STD005',
    occupation: 'welder',
    occupationName: '焊工',
    level: 'intermediate',
    requiredHours: 160,
    requiredTeachers: '高级焊工',
    requiredCourses: ['焊接冶金基础', '氩弧焊', '二氧化碳气体保护焊', '焊接应力变形', '无损检测基础'],
  },
  {
    id: 'STD006',
    occupation: 'welder',
    occupationName: '焊工',
    level: 'advanced',
    requiredHours: 220,
    requiredTeachers: '高级技师或焊接工程师',
    requiredCourses: ['特种焊接技术', '焊接工艺设计', '压力管道焊接', '机器人焊接', '焊接质量控制'],
  },
  {
    id: 'STD007',
    occupation: 'housekeeping',
    occupationName: '家政服务',
    level: 'primary',
    requiredHours: 80,
    requiredTeachers: '高级家政师及以上',
    requiredCourses: ['职业道德', '家居保洁', '衣物洗涤熨烫', '家用电器使用', '家庭饮食基础'],
  },
  {
    id: 'STD008',
    occupation: 'housekeeping',
    occupationName: '家政服务',
    level: 'intermediate',
    requiredHours: 120,
    requiredTeachers: '高级家政师',
    requiredCourses: ['家居美化', '家庭厨艺', '衣物保养', '老年陪护基础', '家庭管理'],
  },
  {
    id: 'STD009',
    occupation: 'nursery',
    occupationName: '育婴师',
    level: 'primary',
    requiredHours: 100,
    requiredTeachers: '高级育婴师及以上',
    requiredCourses: ['婴幼儿生理发育', '婴幼儿喂养', '婴幼儿护理', '婴幼儿安全防护', '婴幼儿启蒙教育'],
  },
  {
    id: 'STD010',
    occupation: 'nursery',
    occupationName: '育婴师',
    level: 'intermediate',
    requiredHours: 150,
    requiredTeachers: '高级育婴师或儿科护士',
    requiredCourses: ['婴幼儿营养配餐', '婴幼儿常见病护理', '早期智力开发', '婴幼儿行为培养', '亲子游戏设计'],
  },
  {
    id: 'STD011',
    occupation: 'it',
    occupationName: 'IT技术',
    level: 'primary',
    requiredHours: 160,
    requiredTeachers: '中级工程师及以上',
    requiredCourses: ['计算机基础', '操作系统', '办公软件', '计算机网络基础', '信息安全基础'],
  },
  {
    id: 'STD012',
    occupation: 'it',
    occupationName: 'IT技术',
    level: 'intermediate',
    requiredHours: 240,
    requiredTeachers: '高级工程师',
    requiredCourses: ['编程语言基础(Python/Java)', '数据库基础', 'Web前端开发', '软件测试', '项目管理基础'],
  },
  {
    id: 'STD013',
    occupation: 'it',
    occupationName: 'IT技术',
    level: 'advanced',
    requiredHours: 320,
    requiredTeachers: '高级工程师或架构师',
    requiredCourses: ['微服务架构', '云原生技术', '大数据基础', '人工智能应用', '信息安全管理'],
  },
  {
    id: 'STD014',
    occupation: 'auto_repair',
    occupationName: '汽车维修',
    level: 'primary',
    requiredHours: 120,
    requiredTeachers: '中级汽修技师及以上',
    requiredCourses: ['汽车构造', '汽车电器基础', '汽车保养', '发动机维护', '底盘维修基础'],
  },
  {
    id: 'STD015',
    occupation: 'auto_repair',
    occupationName: '汽车维修',
    level: 'intermediate',
    requiredHours: 180,
    requiredTeachers: '高级汽修技师',
    requiredCourses: ['发动机电控', '汽车底盘电控', '自动变速器维修', '汽车空调维修', '汽车故障诊断'],
  },
  {
    id: 'STD016',
    occupation: 'chef',
    occupationName: '中式烹调师',
    level: 'primary',
    requiredHours: 100,
    requiredTeachers: '中级烹调师及以上',
    requiredCourses: ['烹饪原料知识', '刀工基础', '火候知识', '调味基础', '热菜制作基础'],
  },
  {
    id: 'STD017',
    occupation: 'chef',
    occupationName: '中式烹调师',
    level: 'intermediate',
    requiredHours: 160,
    requiredTeachers: '高级烹调师',
    requiredCourses: ['烹饪工艺', '食品雕刻', '冷菜制作', '热菜创新', '宴席设计基础'],
  },
];

const generateOccupationTrend = () => {
  const data = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      rate: 82 + Math.random() * 15,
    });
  }
  return data;
};

export const occupationData: OccupationData[] = [
  {
    code: 'electrician',
    name: '电工',
    totalTrainees: 156800,
    passRate: 85.2,
    employmentRate: 78.5,
    attendanceTrend: generateOccupationTrend(),
    certificateCount: 125440,
  },
  {
    code: 'welder',
    name: '焊工',
    totalTrainees: 132500,
    passRate: 82.8,
    employmentRate: 82.1,
    attendanceTrend: generateOccupationTrend(),
    certificateCount: 109710,
  },
  {
    code: 'housekeeping',
    name: '家政服务',
    totalTrainees: 178600,
    passRate: 88.5,
    employmentRate: 85.3,
    attendanceTrend: generateOccupationTrend(),
    certificateCount: 158061,
  },
  {
    code: 'nursery',
    name: '育婴师',
    totalTrainees: 145200,
    passRate: 86.7,
    employmentRate: 88.2,
    attendanceTrend: generateOccupationTrend(),
    certificateCount: 125888,
  },
  {
    code: 'it',
    name: 'IT技术',
    totalTrainees: 203500,
    passRate: 79.3,
    employmentRate: 86.7,
    attendanceTrend: generateOccupationTrend(),
    certificateCount: 161375,
  },
  {
    code: 'auto_repair',
    name: '汽车维修',
    totalTrainees: 98700,
    passRate: 81.5,
    employmentRate: 79.4,
    attendanceTrend: generateOccupationTrend(),
    certificateCount: 80440,
  },
  {
    code: 'chef',
    name: '中式烹调师',
    totalTrainees: 112600,
    passRate: 84.2,
    employmentRate: 83.8,
    attendanceTrend: generateOccupationTrend(),
    certificateCount: 94809,
  },
  {
    code: 'other',
    name: '其他',
    totalTrainees: 82600,
    passRate: 83.1,
    employmentRate: 77.6,
    attendanceTrend: generateOccupationTrend(),
    certificateCount: 68640,
  },
];

export const regionHierarchy: Record<string, { parent: string; name: string; children: string[] }> = {
  '000000': { parent: '', name: '全国', children: ['440000', '320000', '330000', '310000', '110000', '370000', '420000', '430000', '510000', '500000', '530000', '610000', '350000', '340000', '230000', '220000', '210000', '360000', '410000', '450000', '460000', '520000', '540000', '620000', '630000', '640000', '650000', '120000', '130000', '140000', '150000'] },
  '440000': { parent: '000000', name: '广东省', children: ['440100', '440300', '440400', '440600', '440700', '441300', '441900', '442000'] },
  '440100': { parent: '440000', name: '广州市', children: [] },
  '440300': { parent: '440000', name: '深圳市', children: [] },
  '440400': { parent: '440000', name: '珠海市', children: [] },
  '440600': { parent: '440000', name: '佛山市', children: [] },
  '440700': { parent: '440000', name: '江门市', children: [] },
  '441300': { parent: '440000', name: '惠州市', children: [] },
  '441900': { parent: '440000', name: '东莞市', children: [] },
  '442000': { parent: '440000', name: '中山市', children: [] },
  '320000': { parent: '000000', name: '江苏省', children: ['320100', '320200', '320300', '320400', '320500', '320600'] },
  '320100': { parent: '320000', name: '南京市', children: [] },
  '320200': { parent: '320000', name: '无锡市', children: [] },
  '320300': { parent: '320000', name: '徐州市', children: [] },
  '320400': { parent: '320000', name: '常州市', children: [] },
  '320500': { parent: '320000', name: '苏州市', children: [] },
  '320600': { parent: '320000', name: '南通市', children: [] },
  '330000': { parent: '000000', name: '浙江省', children: ['330100', '330200', '330300', '330400', '330500', '330600'] },
  '330100': { parent: '330000', name: '杭州市', children: [] },
  '330200': { parent: '330000', name: '宁波市', children: [] },
  '330300': { parent: '330000', name: '温州市', children: [] },
  '330400': { parent: '330000', name: '嘉兴市', children: [] },
  '330500': { parent: '330000', name: '湖州市', children: [] },
  '330600': { parent: '330000', name: '绍兴市', children: [] },
  '310000': { parent: '000000', name: '上海市', children: ['310100'] },
  '310100': { parent: '310000', name: '上海市辖区', children: [] },
  '110000': { parent: '000000', name: '北京市', children: ['110100'] },
  '110100': { parent: '110000', name: '北京市辖区', children: [] },
  '370000': { parent: '000000', name: '山东省', children: ['370100', '370200'] },
  '370100': { parent: '370000', name: '济南市', children: [] },
  '370200': { parent: '370000', name: '青岛市', children: [] },
  '420000': { parent: '000000', name: '湖北省', children: ['420100'] },
  '420100': { parent: '420000', name: '武汉市', children: [] },
  '430000': { parent: '000000', name: '湖南省', children: ['430100'] },
  '430100': { parent: '430000', name: '长沙市', children: [] },
  '510000': { parent: '000000', name: '四川省', children: ['510100'] },
  '510100': { parent: '510000', name: '成都市', children: [] },
  '500000': { parent: '000000', name: '重庆市', children: ['500100'] },
  '500100': { parent: '500000', name: '重庆市辖区', children: [] },
  '530000': { parent: '000000', name: '云南省', children: ['530100'] },
  '530100': { parent: '530000', name: '昆明市', children: [] },
  '610000': { parent: '000000', name: '陕西省', children: ['610100'] },
  '610100': { parent: '610000', name: '西安市', children: [] },
  '350000': { parent: '000000', name: '福建省', children: ['350100', '350200'] },
  '350100': { parent: '350000', name: '福州市', children: [] },
  '350200': { parent: '350000', name: '厦门市', children: [] },
  '340000': { parent: '000000', name: '安徽省', children: ['340100'] },
  '340100': { parent: '340000', name: '合肥市', children: [] },
  '230000': { parent: '000000', name: '黑龙江省', children: ['230100'] },
  '230100': { parent: '230000', name: '哈尔滨市', children: [] },
  '220000': { parent: '000000', name: '吉林省', children: ['220100'] },
  '220100': { parent: '220000', name: '长春市', children: [] },
  '210000': { parent: '000000', name: '辽宁省', children: ['210100', '210200'] },
  '210100': { parent: '210000', name: '沈阳市', children: [] },
  '210200': { parent: '210000', name: '大连市', children: [] },
  '360000': { parent: '000000', name: '江西省', children: ['360100'] },
  '360100': { parent: '360000', name: '南昌市', children: [] },
  '410000': { parent: '000000', name: '河南省', children: ['410100'] },
  '410100': { parent: '410000', name: '郑州市', children: [] },
  '450000': { parent: '000000', name: '广西壮族自治区', children: ['450100'] },
  '450100': { parent: '450000', name: '南宁市', children: [] },
  '460000': { parent: '000000', name: '海南省', children: ['460100'] },
  '460100': { parent: '460000', name: '海口市', children: [] },
  '520000': { parent: '000000', name: '贵州省', children: ['520100'] },
  '520100': { parent: '520000', name: '贵阳市', children: [] },
  '540000': { parent: '000000', name: '西藏自治区', children: ['540100'] },
  '540100': { parent: '540000', name: '拉萨市', children: [] },
  '620000': { parent: '000000', name: '甘肃省', children: ['620100'] },
  '620100': { parent: '620000', name: '兰州市', children: [] },
  '630000': { parent: '000000', name: '青海省', children: ['630100'] },
  '630100': { parent: '630000', name: '西宁市', children: [] },
  '640000': { parent: '000000', name: '宁夏回族自治区', children: ['640100'] },
  '640100': { parent: '640000', name: '银川市', children: [] },
  '650000': { parent: '000000', name: '新疆维吾尔自治区', children: ['650100'] },
  '650100': { parent: '650000', name: '乌鲁木齐市', children: [] },
  '120000': { parent: '000000', name: '天津市', children: ['120100'] },
  '120100': { parent: '120000', name: '天津市辖区', children: [] },
  '130000': { parent: '000000', name: '河北省', children: ['130100'] },
  '130100': { parent: '130000', name: '石家庄市', children: [] },
  '140000': { parent: '000000', name: '山西省', children: ['140100'] },
  '140100': { parent: '140000', name: '太原市', children: [] },
  '150000': { parent: '000000', name: '内蒙古自治区', children: ['150100'] },
  '150100': { parent: '150000', name: '呼和浩特市', children: [] },
};

export const regionNameMap: Record<string, string> = Object.fromEntries(
  Object.entries(regionHierarchy).map(([code, info]) => [code, info.name])
);
