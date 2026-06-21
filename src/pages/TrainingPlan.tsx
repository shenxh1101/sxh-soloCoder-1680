import { useState } from 'react';
import { Upload, Table, Tag, Button, Progress, Space, message, Card, Descriptions } from 'antd';
import type { UploadProps, UploadFile } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import {
  InboxOutlined,
  DownloadOutlined,
  BellOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { planValidationResults, nationalStandards, regionNameMap } from '@/mock/data';
import { useAuthStore } from '@/store/auth';
import type { PlanValidationResult, AbnormalItem, TrainingCourse, NationalStandard, OccupationCategory } from '@/types';

const { Dragger } = Upload;

const occupationMap: Record<string, OccupationCategory> = {
  '电工': 'electrician',
  '焊工': 'welder',
  '家政服务': 'housekeeping',
  '育婴师': 'nursery',
  'IT技术': 'it',
  '汽车维修': 'auto_repair',
  '中式烹调师': 'chef',
};

const statusConfig: Record<string, { color: string; text: string }> = {
  pass: { color: 'success', text: '校验通过' },
  warning: { color: 'warning', text: '存在异常' },
  error: { color: 'error', text: '严重异常' },
};

const itemTypeConfig: Record<string, { color: string; text: string }> = {
  class_hours: { color: 'blue', text: '课时' },
  teacher_qualification: { color: 'purple', text: '师资' },
  curriculum: { color: 'cyan', text: '课程设置' },
};

const severityConfig: Record<string, { color: string; text: string }> = {
  minor: { color: 'default', text: '轻微' },
  major: { color: 'orange', text: '一般' },
  critical: { color: 'red', text: '严重' },
};

const levelMap: Record<string, 'primary' | 'intermediate' | 'advanced'> = {
  '初级': 'primary',
  '中级': 'intermediate',
  '高级': 'advanced',
};

export default function TrainingPlan() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [validating, setValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [results, setResults] = useState<PlanValidationResult[]>(planValidationResults);
  const [pushedIds, setPushedIds] = useState<Set<string>>(new Set());
  const user = useAuthStore((state) => state.user);

  const parseExcel = async (file: File): Promise<TrainingCourse[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          const courses: TrainingCourse[] = jsonData.map((row: any) => ({
            name: row['课程名称'] || row['name'] || '',
            occupation: occupationMap[row['职业类别'] || row['occupation']] || 'other',
            level: levelMap[row['培训等级'] || row['level']] || 'primary',
            actualHours: Number(row['实际课时'] || row['hours'] || 0),
            teacher: row['授课教师'] || row['teacher'] || '',
            teacherQualification: row['教师资质'] || row['qualification'] || '',
            courses: (row['包含课程'] || row['courses'] || '').split(/[,，、]/).filter(Boolean),
          }));
          
          resolve(courses);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const validateAgainstStandard = (course: TrainingCourse, standard: NationalStandard): AbnormalItem[] => {
    const abnormalities: AbnormalItem[] = [];

    const hoursDeviation = standard.requiredHours > 0 
      ? Math.round(((course.actualHours - standard.requiredHours) / standard.requiredHours) * 100) 
      : 0;
    
    if (Math.abs(hoursDeviation) > 15) {
      abnormalities.push({
        courseName: course.name,
        itemType: 'class_hours',
        standardValue: `${standard.requiredHours}课时`,
        actualValue: `${course.actualHours}课时`,
        deviation: hoursDeviation,
        severity: Math.abs(hoursDeviation) > 30 ? 'critical' : 'major',
        description: `课时${hoursDeviation > 0 ? '超出' : '不足'}标准${Math.abs(hoursDeviation)}%，${hoursDeviation > 0 ? '建议精简内容' : '建议增加实操训练课时'}`,
      });
    }

    const requiredQual = standard.requiredTeachers;
    const qualOrder = ['初级', '中级', '高级', '技师', '高级技师', '工程师', '高级工程师'];
    const actualIdx = qualOrder.findIndex(q => course.teacherQualification.includes(q));
    const requiredIdx = qualOrder.findIndex(q => requiredQual.includes(q));
    
    if (actualIdx >= 0 && requiredIdx >= 0 && actualIdx < requiredIdx) {
      abnormalities.push({
        courseName: course.name,
        itemType: 'teacher_qualification',
        standardValue: requiredQual,
        actualValue: course.teacherQualification,
        deviation: Math.round(((requiredIdx - actualIdx) / Math.max(qualOrder.length, 1)) * 100),
        severity: 'major',
        description: `教师资质不符合要求，需要${requiredQual}以上资质`,
      });
    }

    const missingCourses = standard.requiredCourses.filter(
      c => !course.courses.some(cc => cc.includes(c) || c.includes(cc))
    );
    
    if (missingCourses.length > 0) {
      const coverage = Math.round(((standard.requiredCourses.length - missingCourses.length) / standard.requiredCourses.length) * 100);
      if (coverage < 85) {
        abnormalities.push({
          courseName: course.name,
          itemType: 'curriculum',
          standardValue: `${standard.requiredCourses.length}门课程`,
          actualValue: `${course.courses.length}门课程`,
          deviation: 100 - coverage,
          severity: missingCourses.length > 2 ? 'critical' : 'major',
          description: `课程设置缺少以下必修内容：${missingCourses.join('、')}`,
        });
      }
    }

    return abnormalities;
  };

  const performValidation = async (file: File, fileName: string) => {
    setValidating(true);
    setValidationProgress(10);

    try {
      const courses = await parseExcel(file);
      setValidationProgress(40);

      if (courses.length === 0) {
        message.error('未解析到有效课程数据，请检查Excel格式');
        setValidating(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      setValidationProgress(60);

      let allAbnormalities: AbnormalItem[] = [];
      
      courses.forEach(course => {
        const standard = nationalStandards.find(
          s => s.occupation === course.occupation && s.level === course.level
        );
        
        if (standard) {
          const abnormalities = validateAgainstStandard(course, standard);
          allAbnormalities = [...allAbnormalities, ...abnormalities];
        }
      });

      setValidationProgress(85);
      await new Promise(resolve => setTimeout(resolve, 300));

      const criticalCount = allAbnormalities.filter(a => a.severity === 'critical').length;
      const majorCount = allAbnormalities.filter(a => a.severity === 'major').length;
      
      let overallStatus: 'pass' | 'warning' | 'error' = 'pass';
      if (criticalCount > 0) overallStatus = 'error';
      else if (majorCount > 0) overallStatus = 'warning';

      const newResult: PlanValidationResult = {
        id: `VAL-${Date.now()}`,
        fileName,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.name || '当前用户',
        regionCode: user?.regionCode || '000000',
        regionName: user?.regionCode ? regionNameMap[user.regionCode] : '全国',
        totalCourses: courses.length,
        validatedCourses: courses.length,
        abnormalItems: allAbnormalities,
        overallStatus,
        validationSummary: {
          hoursPassed: courses.length - allAbnormalities.filter(a => a.itemType === 'class_hours').length,
          teachersPassed: courses.length - allAbnormalities.filter(a => a.itemType === 'teacher_qualification').length,
          curriculumPassed: courses.length - allAbnormalities.filter(a => a.itemType === 'curriculum').length,
          totalCourses: courses.length,
        },
      };

      setResults(prev => [newResult, ...prev]);
      setValidationProgress(100);
      message.success(`校验完成！共检查${courses.length}门课程，发现${allAbnormalities.length}项异常`);
    } catch (error) {
      message.error('Excel解析失败，请检查文件格式');
      console.error(error);
    } finally {
      setTimeout(() => {
        setValidating(false);
        setValidationProgress(0);
      }, 500);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    fileList,
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        /\.(xlsx|xls)$/i.test(file.name);
      if (!isExcel) {
        message.error('只能上传 Excel 文件！');
        return Upload.LIST_IGNORE;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB！');
        return Upload.LIST_IGNORE;
      }

      performValidation(file as File, file.name);
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(-1));
    },
    showUploadList: false,
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['课程名称', '职业类别', '培训等级', '实际课时', '授课教师', '教师资质', '包含课程'],
      ['电工基础培训班', '电工', '初级', 96, '张三', '中级技师', '电工基础、安全用电、电气识图'],
      ['焊工技能提升班', '焊工', '中级', 140, '李四', '高级焊工', '焊接冶金基础、氩弧焊、二氧化碳气体保护焊'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, '培训计划');
    XLSX.writeFile(wb, '培训计划模板.xlsx');
  };

  const handlePushNotification = (record: PlanValidationResult) => {
    if (record.abnormalItems.length === 0) {
      message.info('该记录无异常，无需推送');
      return;
    }
    
    setPushedIds(prev => new Set(prev).add(record.id));
    message.success(`已推送${record.abnormalItems.length}项异常提醒至教务管理员`);
  };

  const handlePushAllAbnormal = () => {
    const abnormalResults = results.filter(r => r.abnormalItems.length > 0 && !pushedIds.has(r.id));
    if (abnormalResults.length === 0) {
      message.info('暂无未推送的异常记录');
      return;
    }
    
    const totalAbnormal = abnormalResults.reduce((sum, r) => sum + r.abnormalItems.length, 0);
    abnormalResults.forEach(r => setPushedIds(prev => new Set(prev).add(r.id)));
    message.success(`已推送${abnormalResults.length}条记录共${totalAbnormal}项异常至教务管理员`);
  };

  const abnormalColumns: ColumnsType<AbnormalItem> = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 180,
      render: (text: string) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: '异常类型',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 80,
      align: 'center',
      render: (type: string) => {
        const config = itemTypeConfig[type] || itemTypeConfig.class_hours;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '标准值',
      dataIndex: 'standardValue',
      key: 'standardValue',
      width: 140,
      align: 'center',
      render: (val: number | string) => (
        <span className="text-gray-600 font-medium">{val}</span>
      ),
    },
    {
      title: '实际值',
      dataIndex: 'actualValue',
      key: 'actualValue',
      width: 140,
      align: 'center',
      render: (val: number | string) => (
        <span className="text-gray-600 font-medium">{val}</span>
      ),
    },
    {
      title: '偏差%',
      dataIndex: 'deviation',
      key: 'deviation',
      width: 90,
      align: 'right',
      render: (val: number) => {
        const isAbnormal = Math.abs(val) > 15;
        return (
          <span className={`font-semibold ${isAbnormal ? 'text-red-600' : 'text-gray-600'}`}>
            {val > 0 ? '+' : ''}{val}%
            {isAbnormal && <ExclamationCircleOutlined className="ml-1" />}
          </span>
        );
      },
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 90,
      align: 'center',
      render: (severity: string) => {
        const config = severityConfig[severity] || severityConfig.minor;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '异常描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
  ];

  const columns: ColumnsType<PlanValidationResult> = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 240,
      render: (text: string, record) => (
        <Space>
          <FileExcelOutlined className="text-green-600" />
          <span className="font-medium text-gray-800">{text}</span>
          {pushedIds.has(record.id) && <Tag color="blue">已推送</Tag>}
        </Space>
      ),
    },
    {
      title: '所属地区',
      dataIndex: 'regionName',
      key: 'regionName',
      width: 100,
      render: (text: string) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 160,
      render: (date: string) => (
        <span className="text-gray-600">{dayjs(date).format('YYYY-MM-DD HH:mm')}</span>
      ),
    },
    {
      title: '上传人',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      width: 90,
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: '课程总数',
      dataIndex: 'totalCourses',
      key: 'totalCourses',
      width: 90,
      align: 'center',
      render: (val: number) => <span className="font-semibold text-gray-800">{val}</span>,
    },
    {
      title: '异常项数',
      dataIndex: 'abnormalItems',
      key: 'abnormalCount',
      width: 90,
      align: 'center',
      render: (items: AbnormalItem[]) => {
        const count = items.length;
        return (
          <span className={`font-semibold ${count > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {count > 0 ? count : <CheckCircleOutlined />}
          </span>
        );
      },
    },
    {
      title: '总体状态',
      dataIndex: 'overallStatus',
      key: 'overallStatus',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.pass;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<BellOutlined />}
          onClick={() => handlePushNotification(record)}
          disabled={record.abnormalItems.length === 0 || pushedIds.has(record.id)}
        >
          {pushedIds.has(record.id) ? '已推送' : '推送异常'}
        </Button>
      ),
    },
  ];

  const expandedRowRender = (record: PlanValidationResult) => {
    if (record.abnormalItems.length === 0) {
      return (
        <div className="py-8 text-center">
          <CheckCircleOutlined className="text-4xl text-green-500 mb-3" />
          <p className="text-gray-500">该培训计划所有项均符合国家标准</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 rounded-lg p-4 -mx-4">
        {record.validationSummary && (
          <div className="mb-4">
            <Descriptions size="small" column={4} bordered>
              <Descriptions.Item label="课程总数">
                {record.validationSummary.totalCourses}门
              </Descriptions.Item>
              <Descriptions.Item label="课时校验通过">
                <span className="text-green-600 font-medium">
                  {record.validationSummary.hoursPassed}/{record.validationSummary.totalCourses}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="师资校验通过">
                <span className="text-green-600 font-medium">
                  {record.validationSummary.teachersPassed}/{record.validationSummary.totalCourses}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="课程设置校验通过">
                <span className="text-green-600 font-medium">
                  {record.validationSummary.curriculumPassed}/{record.validationSummary.totalCourses}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
        <h4 className="text-sm font-semibold text-gray-800 mb-3">
          异常项详情（共 {record.abnormalItems.length} 项，偏离超过15%自动进入异常列表）
        </h4>
        <Table
          columns={abnormalColumns}
          dataSource={record.abnormalItems}
          rowKey={(item, index) => `${record.id}-${index}`}
          pagination={false}
          size="small"
          scroll={{ x: 900 }}
        />
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">培训计划校验</h1>
            <p className="text-gray-500 text-sm">上传培训计划Excel文件，自动校验课时、师资、课程设置是否符合国家标准，偏离超过15%自动进入异常列表</p>
          </div>
        </div>

        <Card
          className="shadow-sm"
          styles={{ body: { padding: '24px' } }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">上传培训计划</h3>
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
            >
              下载标准模板
            </Button>
          </div>

          <Dragger {...uploadProps} className="!bg-blue-50/50">
            <p className="ant-upload-drag-icon !mb-4">
              <InboxOutlined className="text-blue-500 text-5xl" />
            </p>
            <p className="ant-upload-text text-gray-900 text-lg mb-2">
              点击或拖拽文件到此区域上传
            </p>
            <p className="ant-upload-hint text-gray-500 text-sm mb-4">
              支持 .xlsx / .xls 格式，单个文件不超过 10MB
            </p>
          </Dragger>

          {(validating || fileList.length > 0) && (
            <div className="mt-4 p-4 rounded-lg bg-blue-50 ring-1 ring-blue-100">
              {fileList.map((file) => (
                <div key={file.uid} className="flex items-center gap-3">
                  <FileExcelOutlined className="text-green-600 text-xl" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-900 text-sm font-medium truncate">{file.name}</span>
                      <span className="text-gray-500 text-xs ml-2">
                        {(file.size! / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    {validating ? (
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>正在校验中... {Math.round(validationProgress)}%</span>
                        </div>
                        <Progress
                          percent={Math.round(validationProgress)}
                          size="small"
                          showInfo={false}
                          strokeColor="#2563eb"
                          trailColor="#dbeafe"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Tag color="green">校验完成</Tag>
                        <span className="text-gray-400 text-xs">
                          {dayjs().format('YYYY-MM-DD HH:mm:ss')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          className="shadow-sm"
          styles={{ body: { padding: 0 } }}
          title={
            <div className="flex items-center justify-between py-2">
              <h3 className="text-base font-semibold text-gray-900">校验结果历史</h3>
              <Button
                type="primary"
                icon={<BellOutlined />}
                onClick={handlePushAllAbnormal}
                disabled={results.filter(r => r.abnormalItems.length > 0 && !pushedIds.has(r.id)).length === 0}
              >
                批量推送异常
              </Button>
            </div>
          }
        >
          {results.length === 0 ? (
            <div className="py-16">
              <div className="text-center">
                <InboxOutlined className="text-5xl text-gray-300 mb-4" />
                <p className="text-gray-500">暂无上传记录</p>
                <p className="text-gray-400 text-sm mt-1">请在上方区域上传培训计划Excel文件</p>
              </div>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={results}
              rowKey="id"
              expandable={{
                expandedRowRender,
                defaultExpandAllRows: false,
                rowExpandable: () => true,
              }}
              scroll={{ x: 1100 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
