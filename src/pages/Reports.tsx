import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Tag,
  Select,
  Input,
  Space,
  Row,
  Col,
  Spin,
  Button,
  Modal,
  Form,
  DatePicker,
  message,
} from 'antd';
import {
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  FileTextOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { useReportStore } from '@/store/report';
import { useAuthStore } from '@/store/auth';
import { regionHierarchy, regionNameMap } from '@/mock/data';
import type { WeeklyReport } from '@/types';
import { cn } from '@/lib/utils';

dayjs.extend(weekOfYear);

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusConfig: Record<string, { color: string; text: string; icon: any }> = {
  generated: { color: 'success', text: '已生成', icon: CheckCircleOutlined },
  generating: { color: 'processing', text: '生成中', icon: LoadingOutlined },
  draft: { color: 'warning', text: '草稿', icon: FileTextOutlined },
};

const miniMetricColor: Record<string, string> = {
  passRate: 'text-emerald-600',
  employmentRate: 'text-blue-600',
  yearOverYearChange: 'text-purple-600',
  weekOverWeekChange: 'text-orange-600',
};

const miniMetricLabel: Record<string, string> = {
  passRate: '合格率',
  employmentRate: '就业率',
  yearOverYearChange: '同比',
  weekOverWeekChange: '环比',
};

const getWeekRange = (year: number, weekNumber: number) => {
  const startOfYear = dayjs(`${year}-01-01`);
  const weekStart = startOfYear.week(weekNumber).startOf('week');
  const weekEnd = weekStart.endOf('week');
  return { weekStart: weekStart.format('YYYY-MM-DD'), weekEnd: weekEnd.format('YYYY-MM-DD') };
};

export default function Reports() {
  const navigate = useNavigate();
  const { reports, fetchReports, loading, generating, generateReport } = useReportStore();
  const { user, filterReports, getAccessibleRegions } = useAuthStore();
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
  const [regionFilter, setRegionFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [generateForm] = Form.useForm();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const accessibleRegions = useMemo(() => {
    const regions = getAccessibleRegions();
    return regions
      .filter((code) => regionHierarchy[code])
      .map((code) => ({ code, name: regionNameMap[code] || code }))
      .filter((r) => r.code !== '000000' || user?.role === 'national');
  }, [getAccessibleRegions, user]);

  const filteredReports = useMemo(() => {
    const data = filterReports(reports);
    return data.filter((r) => {
      const yearMatch = !yearFilter || r.year === yearFilter;
      const regionMatch = !regionFilter || r.regionCode === regionFilter;
      const searchMatch =
        !searchText ||
        r.regionName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.id.toLowerCase().includes(searchText.toLowerCase());
      return yearMatch && regionMatch && searchMatch;
    });
  }, [reports, yearFilter, regionFilter, searchText, filterReports]);

  const yearOptions = useMemo(() => {
    const years = new Set(reports.map((r) => r.year));
    const currentYear = dayjs().year();
    for (let y = currentYear - 2; y <= currentYear; y++) {
      years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [reports]);

  const regionOptions = useMemo(() => {
    const regions = new Map<string, string>();
    filteredReports.forEach((r) => {
      if (!regions.has(r.regionCode)) {
        regions.set(r.regionCode, r.regionName);
      }
    });
    accessibleRegions.forEach((r) => {
      if (!regions.has(r.code)) {
        regions.set(r.code, r.name);
      }
    });
    return Array.from(regions.entries()).map(([code, name]) => ({ code, name }));
  }, [filteredReports, accessibleRegions]);

  const weekOptions = useMemo(() => {
    const weeks = [];
    const currentWeek = dayjs().week();
    for (let w = 1; w <= Math.max(currentWeek, 52); w++) {
      const range = getWeekRange(yearFilter || dayjs().year(), w);
      weeks.push({
        value: w,
        label: `第 ${w} 周 (${range.weekStart} ~ ${range.weekEnd})`,
      });
    }
    return weeks;
  }, [yearFilter]);

  const handleGenerate = async () => {
    try {
      const values = await generateForm.validateFields();
      const region = values.region;
      const weekNumber = values.week;
      const year = values.year || dayjs().year();

      const existingReport = reports.find(
        (r) => r.year === year && r.weekNumber === weekNumber && r.regionCode === region
      );

      if (existingReport) {
        confirm({
          title: '报告已存在',
          content: '该周期该地区已有报告，是否重新生成？',
          okText: '重新生成',
          onOk: async () => {
            await doGenerate(region, weekNumber, year);
          },
        });
      } else {
        await doGenerate(region, weekNumber, year);
      }
    } catch {
      // Validation failed
    }
  };

  const doGenerate = async (region: string, weekNumber: number, year: number) => {
    const result = await generateReport(region, weekNumber, year);
    if (result) {
      message.success('报告生成成功！');
      setGenerateModalVisible(false);
      generateForm.resetFields();
      setTimeout(() => {
        navigate(`/reports/${result.id}`);
      }, 500);
    } else {
      message.error('报告生成失败，请重试');
    }
  };

  const renderMiniMetric = (key: keyof WeeklyReport['metrics'], value: number) => {
    const isChangeMetric = key === 'yearOverYearChange' || key === 'weekOverWeekChange';
    const isPositive = value >= 0;
    const displayValue = isChangeMetric
      ? `${isPositive ? '+' : ''}${value.toFixed(1)}%`
      : `${value.toFixed(1)}%`;

    return (
      <div key={key} className="flex flex-col items-start">
        <span className="text-xs text-gray-500 mb-1">{miniMetricLabel[key]}</span>
        <div className="flex items-center gap-1">
          {isChangeMetric && (
            isPositive ? (
              <ArrowUpOutlined className="text-emerald-500 text-xs" />
            ) : (
              <ArrowDownOutlined className="text-red-500 text-xs" />
            )
          )}
          <span
            className={cn(
              'text-sm font-semibold',
              isChangeMetric
                ? isPositive
                  ? 'text-emerald-500'
                  : 'text-red-500'
                : miniMetricColor[key]
            )}
          >
            {displayValue}
          </span>
        </div>
      </div>
    );
  };

  const renderReportCard = (report: WeeklyReport) => {
    const statusCfg = statusConfig[report.status] || statusConfig.generated;
    const isGenerating = report.status === 'generating';
    const StatusIcon = statusCfg.icon;

    return (
      <Col xs={24} md={12} xl={8} key={report.id}>
        <Card
          className={cn(
            'h-full shadow-sm ring-1 ring-gray-100 border-0 cursor-pointer',
            'transition-all duration-300 hover:-translate-y-1 hover:ring-blue-300 hover:shadow-lg'
          )}
          styles={{ body: { padding: '20px' } }}
          onClick={() => !isGenerating && navigate(`/reports/${report.id}`)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {report.year}年第{report.weekNumber}周
              </h3>
              <p className="text-sm text-gray-500">
                {report.weekStart} ~ {report.weekEnd}
              </p>
            </div>
            <Tag color={statusCfg.color} style={{ margin: 0 }}>
              {report.status === 'draft' && <StatusIcon className="mr-1" />}
              {statusCfg.text}
            </Tag>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <span className="text-sm text-gray-500">地区：</span>
            <Tag color="geekblue" style={{ margin: 0 }}>
              {report.regionName}
            </Tag>
          </div>

          <div className="mb-5">
            <span className="text-xs text-gray-400">
              生成时间：{dayjs(report.generatedAt).format('YYYY-MM-DD HH:mm')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {renderMiniMetric('passRate', report.metrics.passRate)}
            {renderMiniMetric('employmentRate', report.metrics.employmentRate)}
            {renderMiniMetric('yearOverYearChange', report.metrics.yearOverYearChange)}
            {renderMiniMetric('weekOverWeekChange', report.metrics.weekOverWeekChange)}
          </div>

          {isGenerating && (
            <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm">
              <Spin size="small" />
              <span>报告正在生成中...</span>
            </div>
          )}
        </Card>
      </Col>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">诊断报告</h1>
            <p className="text-gray-500 text-sm">
              查看各地区各周期的培训效能诊断报告，或按地区和周次自动生成新报告
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setGenerateModalVisible(true)}
            loading={generating}
          >
            自动生成报告
          </Button>
        </div>

        <Card
          className="mb-6 shadow-sm"
          styles={{ body: { padding: '16px' } }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <Space className="flex-1 flex-wrap">
              <Select
                placeholder="选择年份"
                allowClear
                style={{ width: 140 }}
                value={yearFilter}
                onChange={setYearFilter}
              >
                {yearOptions.map((year) => (
                  <Option key={year} value={year}>
                    {year}年
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="选择地区"
                allowClear
                style={{ width: 160 }}
                value={regionFilter}
                onChange={setRegionFilter}
              >
                {regionOptions.map((r) => (
                  <Option key={r.code} value={r.code}>
                    {r.name}
                  </Option>
                ))}
              </Select>
              <Input
                placeholder="搜索地区或报告编号"
                prefix={<SearchOutlined />}
                style={{ width: 260 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Space>
            <div className="text-sm text-gray-500">
              共 <span className="text-gray-900 font-semibold">{filteredReports.length}</span> 份报告
            </div>
          </div>
        </Card>

        {loading && !generating ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <FileTextOutlined className="text-5xl text-gray-300 mb-4" />
            <p className="text-lg text-gray-500">暂无匹配的报告</p>
            <p className="text-sm text-gray-400 mt-2">请尝试调整筛选条件，或点击右上角生成新报告</p>
          </div>
        ) : (
          <Row gutter={[20, 20]}>
            {filteredReports.map(renderReportCard)}
          </Row>
        )}

        <Modal
          title="自动生成诊断报告"
          open={generateModalVisible}
          onCancel={() => setGenerateModalVisible(false)}
          footer={null}
          width={500}
          destroyOnClose
        >
          <Form form={generateForm} layout="vertical">
            <Form.Item
              name="region"
              label="选择地区"
              rules={[{ required: true, message: '请选择地区' }]}
            >
              <Select placeholder="请选择要生成报告的地区">
                {accessibleRegions.map((r) => (
                  <Option key={r.code} value={r.code}>
                    {r.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="year"
              label="选择年份"
              rules={[{ required: true, message: '请选择年份' }]}
              initialValue={dayjs().year()}
            >
              <Select placeholder="请选择年份">
                {yearOptions.map((year) => (
                  <Option key={year} value={year}>
                    {year}年
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="week"
              label="选择周次"
              rules={[{ required: true, message: '请选择周次' }]}
              initialValue={dayjs().week()}
            >
              <Select placeholder="请选择周次" showSearch>
                {weekOptions.map((w) => (
                  <Option key={w.value} value={w.value}>
                    {w.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <p className="text-sm text-blue-700 mb-1">
                <strong>生成内容包括：</strong>
              </p>
              <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                <li>培训效能核心指标总览（4大指标）</li>
                <li>合格率、就业率同比环比分析</li>
                <li>就业去向分布分析</li>
                <li>证书获取周期统计</li>
                <li>课程内容和师资配置优化建议</li>
              </ul>
            </div>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={() => setGenerateModalVisible(false)}>
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={handleGenerate}
                  loading={generating}
                  icon={<FileTextOutlined />}
                >
                  生成报告草稿
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
