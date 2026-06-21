import { useEffect, useMemo } from 'react';
import {
  Breadcrumb,
  Button,
  Card,
  Collapse,
  Tag,
  List,
  Row,
  Col,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  HomeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { useReportStore } from '@/store/report';
import MetricsCard from '@/components/MetricsCard';
import type { OptimizationSuggestion } from '@/types';
import { cn } from '@/lib/utils';

const priorityConfig: Record<string, { color: string; text: string }> = {
  high: { color: 'red', text: '高优先级' },
  medium: { color: 'orange', text: '中优先级' },
  low: { color: 'blue', text: '低优先级' },
};

const categoryConfig: Record<string, { label: string; icon: string }> = {
  curriculum: { label: '课程内容', icon: '📚' },
  teacher: { label: '师资配置', icon: '👨‍🏫' },
};

export default function ReportDetail() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { currentReport, fetchReportDetail, loading } = useReportStore();

  useEffect(() => {
    if (reportId) {
      fetchReportDetail(reportId);
    }
  }, [reportId, fetchReportDetail]);

  const handleDownload = () => {
    message.success('PDF 下载已开始');
  };

  const overviewComparisonOption = useMemo(() => {
    if (!currentReport) return {};
    const passRateData = currentReport.sections.find((s) => s.type === 'pass_rate_comparison');
    const data = passRateData?.data as {
      currentWeek: number;
      lastWeek: number;
      samePeriodLastYear: number;
    } | undefined;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#fff' },
        valueFormatter: (val: number) => `${val}%`,
      },
      legend: {
        data: ['本周', '上周', '去年同期'],
        textStyle: { color: '#94a3b8' },
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: ['合格率', '就业率'],
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.3)' } },
        axisLabel: { color: '#94a3b8' },
      },
      yAxis: {
        type: 'value',
        min: 60,
        max: 100,
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.3)' } },
        axisLabel: { color: '#94a3b8', formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
      },
      series: [
        {
          name: '本周',
          type: 'bar',
          data: [data?.currentWeek ?? 82.5, currentReport.metrics.employmentRate],
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#1d4ed8' },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
          barWidth: 24,
        },
        {
          name: '上周',
          type: 'bar',
          data: [data?.lastWeek ?? 81.2, currentReport.metrics.employmentRate - 0.8],
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#8b5cf6' },
                { offset: 1, color: '#6d28d9' },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
          barWidth: 24,
        },
        {
          name: '去年同期',
          type: 'bar',
          data: [data?.samePeriodLastYear ?? 78.6, currentReport.metrics.employmentRate - 3.5],
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#64748b' },
                { offset: 1, color: '#475569' },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
          barWidth: 24,
        },
      ],
    };
  }, [currentReport]);

  const passRateTrendOption = useMemo(() => {
    if (!currentReport) return {};
    const trendSection = currentReport.sections.find((s) => s.type === 'trend_analysis');
    const trendData = (trendSection?.data as { week: string; passRate: number }[]) || [];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#fff' },
        valueFormatter: (val: number) => `${val}%`,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trendData.map((d) => d.week),
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.3)' } },
        axisLabel: { color: '#94a3b8', fontSize: 11, rotate: 30 },
      },
      yAxis: {
        type: 'value',
        min: 70,
        max: 95,
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.3)' } },
        axisLabel: { color: '#94a3b8', formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
      },
      series: [
        {
          name: '合格率',
          type: 'line',
          smooth: true,
          data: trendData.map((d) => d.passRate),
          lineStyle: { color: '#10b981', width: 3 },
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0)' },
              ],
            },
          },
          symbol: 'circle',
          symbolSize: 8,
          markLine: {
            silent: true,
            lineStyle: { color: '#f59e0b', type: 'dashed' },
            data: [
              {
                type: 'average',
                name: '平均值',
                label: { color: '#f59e0b', formatter: '平均 {c}%' },
              },
            ],
          },
        },
      ],
    };
  }, [currentReport]);

  const employmentDistributionOption = useMemo(() => {
    if (!currentReport) return {};
    const empSection = currentReport.sections.find((s) => s.type === 'employment_distribution');
    const empData = (empSection?.data as { category: string; percentage: number }[]) || [];
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#64748b'];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#fff' },
        formatter: '{b}: {c}% ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 20,
        top: 'center',
        textStyle: { color: '#94a3b8' },
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 14,
      },
      series: [
        {
          name: '就业去向',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#0f172a',
            borderWidth: 3,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold',
              color: '#f1f5f9',
              formatter: '{b}\n{c}%',
            },
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          labelLine: {
            show: false,
          },
          data: empData.map((d, i) => ({
            value: d.percentage.toFixed(1),
            name: d.category,
            itemStyle: { color: colors[i % colors.length] },
          })),
        },
      ],
    };
  }, [currentReport]);

  const certificateCycleOption = useMemo(() => {
    if (!currentReport) return {};
    const certSection = currentReport.sections.find((s) => s.type === 'certificate_cycle');
    const certData =
      (certSection?.data as {
        distribution: { occupation: string; averageDays: number }[];
      }) || null;
    const distData = certData?.distribution || [];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#fff' },
        axisPointer: { type: 'shadow' },
        valueFormatter: (val: number) => `${val} 天`,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: distData.map((d) => d.occupation),
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.3)' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.3)' } },
        axisLabel: { color: '#94a3b8', formatter: '{value} 天' },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
      },
      series: [
        {
          name: '平均取证天数',
          type: 'bar',
          data: distData.map((d) => d.averageDays),
          itemStyle: {
            color: (params: { dataIndex: number }) => {
              const colors = [
                '#3b82f6',
                '#8b5cf6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#06b6d4',
                '#ec4899',
              ];
              return colors[params.dataIndex % colors.length];
            },
            borderRadius: [8, 8, 0, 0],
          },
          barWidth: '50%',
          label: {
            show: true,
            position: 'top',
            color: '#f1f5f9',
            formatter: '{c} 天',
            fontSize: 12,
          },
        },
      ],
    };
  }, [currentReport]);

  const renderSuggestionItem = (item: OptimizationSuggestion) => {
    const priorityCfg = priorityConfig[item.priority] || priorityConfig.medium;
    const categoryCfg = categoryConfig[item.category] || categoryConfig.curriculum;

    return (
      <List.Item
        key={item.id}
        className="!border-white/5 !px-4 !py-4 hover:bg-white/5 transition-colors"
      >
        <List.Item.Meta
          avatar={
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">
              {categoryCfg.icon}
            </div>
          }
          title={
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-medium">{categoryCfg.label}</span>
              <Tag color={priorityCfg.color} style={{ margin: 0 }}>
                {priorityCfg.text}
              </Tag>
            </div>
          }
          description={<p className="text-slate-300 text-sm leading-relaxed m-0">{item.content}</p>}
        />
      </List.Item>
    );
  };

  const collapseItems = useMemo(() => {
    if (!currentReport) return [];

    const passRateSection = currentReport.sections.find((s) => s.type === 'pass_rate_comparison');
    const trendSection = currentReport.sections.find((s) => s.type === 'trend_analysis');
    const empSection = currentReport.sections.find((s) => s.type === 'employment_distribution');
    const certSection = currentReport.sections.find((s) => s.type === 'certificate_cycle');

    return [
      {
        key: '1',
        label: (
          <span className="text-white font-medium">
            <FileTextOutlined className="mr-2 text-blue-400" />
            培训效能总览
          </span>
        ),
        children: (
          <div className="space-y-6">
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} lg={6}>
                <MetricsCard
                  title="培训合格率"
                  value={currentReport.metrics.passRate}
                  suffix="%"
                  trend={currentReport.metrics.weekOverWeekChange}
                  trendLabel="较上周"
                  color="blue"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <MetricsCard
                  title="就业转化率"
                  value={currentReport.metrics.employmentRate}
                  suffix="%"
                  trend={0.9}
                  trendLabel="较上周"
                  color="green"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <MetricsCard
                  title="同比变化"
                  value={Math.abs(currentReport.metrics.yearOverYearChange)}
                  suffix="%"
                  trend={currentReport.metrics.yearOverYearChange}
                  trendLabel="较去年同期"
                  color="purple"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <MetricsCard
                  title="环比变化"
                  value={Math.abs(currentReport.metrics.weekOverWeekChange)}
                  suffix="%"
                  trend={currentReport.metrics.weekOverWeekChange}
                  trendLabel="较上周"
                  color="orange"
                />
              </Col>
            </Row>

            <Card
              className="bg-slate-900/30 ring-1 ring-white/5 border-0"
              title={
                <span className="text-white font-medium">核心指标同比环比对比</span>
              }
            >
              <ReactECharts
                option={overviewComparisonOption}
                style={{ height: 360 }}
                opts={{ renderer: 'canvas' }}
              />
              {passRateSection?.analysis && (
                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    <span className="font-semibold">分析结论：</span>
                    {passRateSection.analysis}
                  </p>
                </div>
              )}
            </Card>
          </div>
        ),
      },
      {
        key: '2',
        label: (
          <span className="text-white font-medium">
            <ArrowUpOutlined className="mr-2 text-emerald-400" />
            合格率同比环比分析
          </span>
        ),
        children: (
          <Card
            className="bg-slate-900/30 ring-1 ring-white/5 border-0"
            title={
              <span className="text-white font-medium">近12周合格率走势</span>
            }
          >
            <ReactECharts
              option={passRateTrendOption}
              style={{ height: 360 }}
              opts={{ renderer: 'canvas' }}
            />
            {trendSection?.analysis && (
              <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-300 text-sm leading-relaxed">
                  <span className="font-semibold">趋势分析：</span>
                  {trendSection.analysis}
                </p>
              </div>
            )}
          </Card>
        ),
      },
      {
        key: '3',
        label: (
          <span className="text-white font-medium">
            <ArrowUpOutlined className="mr-2 text-purple-400" />
            就业去向分布
          </span>
        ),
        children: (
          <Card
            className="bg-slate-900/30 ring-1 ring-white/5 border-0"
            title={
              <span className="text-white font-medium">行业分布占比</span>
            }
          >
            <ReactECharts
              option={employmentDistributionOption}
              style={{ height: 360 }}
              opts={{ renderer: 'canvas' }}
            />
            {empSection?.analysis && (
              <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-purple-300 text-sm leading-relaxed">
                  <span className="font-semibold">分布分析：</span>
                  {empSection.analysis}
                </p>
              </div>
            )}
          </Card>
        ),
      },
      {
        key: '4',
        label: (
          <span className="text-white font-medium">
            <ArrowDownOutlined className="mr-2 text-orange-400" />
            证书获取周期分析
          </span>
        ),
        children: (
          <Card
            className="bg-slate-900/30 ring-1 ring-white/5 border-0"
            title={
              <span className="text-white font-medium">各职业平均取证天数</span>
            }
          >
            <ReactECharts
              option={certificateCycleOption}
              style={{ height: 360 }}
              opts={{ renderer: 'canvas' }}
            />
            {certSection?.analysis && (
              <div className="mt-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-orange-300 text-sm leading-relaxed">
                  <span className="font-semibold">周期分析：</span>
                  {certSection.analysis}
                </p>
              </div>
            )}
          </Card>
        ),
      },
      {
        key: '5',
        label: (
          <span className="text-white font-medium">
            <FileTextOutlined className="mr-2 text-cyan-400" />
            优化建议
          </span>
        ),
        children: (
          <Card
            className="bg-slate-900/30 ring-1 ring-white/5 border-0"
            styles={{ body: { padding: 0 } }}
          >
            <List
              dataSource={currentReport.optimizationSuggestions}
              renderItem={renderSuggestionItem}
              className="!bg-transparent"
              split={true}
            />
          </Card>
        ),
      },
    ];
  }, [currentReport, overviewComparisonOption, passRateTrendOption, employmentDistributionOption, certificateCycleOption]);

  if (loading && !currentReport) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="mb-4 text-lg">未找到该报告</p>
          <Button type="primary" onClick={() => navigate('/reports')} icon={<ArrowLeftOutlined />}>
            返回报告列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <Breadcrumb
            className="mb-4"
            items={[
              {
                title: (
                  <span
                    className="cursor-pointer hover:text-white text-slate-400 transition-colors flex items-center gap-1"
                    onClick={() => navigate('/')}
                  >
                    <HomeOutlined />
                    首页
                  </span>
                ),
              },
              {
                title: (
                  <span
                    className="cursor-pointer hover:text-white text-slate-400 transition-colors"
                    onClick={() => navigate('/reports')}
                  >
                    诊断报告
                  </span>
                ),
              },
              {
                title: <span className="text-white">报告详情</span>,
              },
            ]}
          />

          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reports')}>
              返回列表
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                {currentReport.year}年第{currentReport.weekNumber}周 · {currentReport.regionName}培训效能诊断报告
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-slate-400">
                  报告周期：{currentReport.weekStart} ~ {currentReport.weekEnd}
                </span>
                <span className="text-slate-400">
                  生成时间：{dayjs(currentReport.generatedAt).format('YYYY-MM-DD HH:mm:ss')}
                </span>
                <Tag
                  color={currentReport.status === 'generated' ? 'green' : 'blue'}
                  style={{ margin: 0 }}
                >
                  {currentReport.status === 'generated' ? '已生成' : '生成中'}
                </Tag>
              </div>
            </div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              className="flex-shrink-0"
            >
              下载 PDF
            </Button>
          </div>
        </div>

        <Card
          className={cn(
            'bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 border-0'
          )}
          styles={{ body: { padding: '24px' } }}
        >
          <Collapse
            defaultActiveKey={['1', '2', '3', '4', '5']}
            items={collapseItems}
            className="bg-transparent border-0"
            size="large"
            ghost
          />
        </Card>
      </div>
    </div>
  );
}
