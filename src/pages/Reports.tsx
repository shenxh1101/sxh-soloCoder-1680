import { useEffect, useMemo, useState } from 'react';
import { Card, Tag, Select, Input, Space, Row, Col, Spin } from 'antd';
import { SearchOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useReportStore } from '@/store/report';
import type { WeeklyReport } from '@/types';
import { cn } from '@/lib/utils';

const { Option } = Select;

const statusConfig: Record<string, { color: string; text: string }> = {
  generated: { color: 'green', text: '已生成' },
  generating: { color: 'blue', text: '生成中' },
};

const miniMetricColor: Record<string, string> = {
  passRate: 'text-emerald-400',
  employmentRate: 'text-blue-400',
  yearOverYearChange: 'text-purple-400',
  weekOverWeekChange: 'text-orange-400',
};

const miniMetricLabel: Record<string, string> = {
  passRate: '合格率',
  employmentRate: '就业率',
  yearOverYearChange: '同比',
  weekOverWeekChange: '环比',
};

export default function Reports() {
  const navigate = useNavigate();
  const { reports, fetchReports, loading } = useReportStore();
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
  const [regionFilter, setRegionFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const yearOptions = useMemo(() => {
    const years = new Set(reports.map((r) => r.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [reports]);

  const regionOptions = useMemo(() => {
    const regions = new Map<string, string>();
    reports.forEach((r) => {
      if (!regions.has(r.regionCode)) {
        regions.set(r.regionCode, r.regionName);
      }
    });
    return Array.from(regions.entries()).map(([code, name]) => ({ code, name }));
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const yearMatch = !yearFilter || r.year === yearFilter;
      const regionMatch = !regionFilter || r.regionCode === regionFilter;
      const searchMatch =
        !searchText ||
        r.regionName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.id.toLowerCase().includes(searchText.toLowerCase());
      return yearMatch && regionMatch && searchMatch;
    });
  }, [reports, yearFilter, regionFilter, searchText]);

  const renderMiniMetric = (key: keyof WeeklyReport['metrics'], value: number) => {
    const isChangeMetric = key === 'yearOverYearChange' || key === 'weekOverWeekChange';
    const isPositive = value >= 0;
    const displayValue = isChangeMetric
      ? `${isPositive ? '+' : ''}${value.toFixed(1)}%`
      : `${value.toFixed(1)}%`;

    return (
      <div key={key} className="flex flex-col items-start">
        <span className="text-xs text-slate-400 mb-1">{miniMetricLabel[key]}</span>
        <div className="flex items-center gap-1">
          {isChangeMetric && (
            isPositive ? (
              <ArrowUpOutlined className="text-emerald-400 text-xs" />
            ) : (
              <ArrowDownOutlined className="text-red-400 text-xs" />
            )
          )}
          <span
            className={cn(
              'text-sm font-semibold',
              isChangeMetric
                ? isPositive
                  ? 'text-emerald-400'
                  : 'text-red-400'
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

    return (
      <Col xs={24} md={12} xl={8} key={report.id}>
        <Card
          className={cn(
            'h-full bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 border-0 cursor-pointer',
            'transition-all duration-300 hover:-translate-y-1 hover:ring-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10'
          )}
          styles={{ body: { padding: '20px' } }}
          onClick={() => !isGenerating && navigate(`/reports/${report.id}`)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {report.year}年第{report.weekNumber}周
              </h3>
              <p className="text-sm text-slate-400">
                {report.weekStart} ~ {report.weekEnd}
              </p>
            </div>
            <Tag color={statusCfg.color} style={{ margin: 0 }}>
              {statusCfg.text}
            </Tag>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <span className="text-sm text-slate-400">地区：</span>
            <span className="text-sm text-white font-medium">{report.regionName}</span>
          </div>

          <div className="mb-5">
            <span className="text-xs text-slate-500">
              生成时间：{dayjs(report.generatedAt).format('YYYY-MM-DD HH:mm')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            {renderMiniMetric('passRate', report.metrics.passRate)}
            {renderMiniMetric('employmentRate', report.metrics.employmentRate)}
            {renderMiniMetric('yearOverYearChange', report.metrics.yearOverYearChange)}
            {renderMiniMetric('weekOverWeekChange', report.metrics.weekOverWeekChange)}
          </div>

          {isGenerating && (
            <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm">
              <Spin size="small" />
              <span>报告正在生成中...</span>
            </div>
          )}
        </Card>
      </Col>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">诊断报告</h1>
          <p className="text-slate-400 text-sm">查看各地区各周期的培训效能诊断报告</p>
        </div>

        <Card
          className="mb-6 bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 border-0"
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
            <div className="text-sm text-slate-400">
              共 <span className="text-white font-semibold">{filteredReports.length}</span> 份报告
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">暂无匹配的报告</p>
            <p className="text-sm mt-2">请尝试调整筛选条件</p>
          </div>
        ) : (
          <Row gutter={[20, 20]}>
            {filteredReports.map(renderReportCard)}
          </Row>
        )}
      </div>
    </div>
  );
}
