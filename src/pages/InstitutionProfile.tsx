import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Table, Button, Alert, Empty, Descriptions, List, Badge } from 'antd';
import { ArrowLeft, AlertTriangle, FileText, Award, TrendingUp } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useAuthStore } from '@/store/auth';
import { useWarningStore } from '@/store/warning';
import { institutions, planValidationResults, regionNameMap } from '@/mock/data';
import type { Warning, AbnormalItem } from '@/types';

const levelMap: Record<string, { text: string; color: string }> = {
  primary: { text: '初级', color: 'green' },
  intermediate: { text: '中级', color: 'blue' },
  advanced: { text: '高级', color: 'purple' },
};

const qualificationStatusMap: Record<string, { text: string; color: string }> = {
  active: { text: '正常运营', color: 'green' },
  suspended: { text: '暂停运营', color: 'orange' },
  pending: { text: '待审核', color: 'default' },
};

const warningTypeMap: Record<string, string> = {
  pass_rate: '合格率预警',
  employment_rate: '就业率预警',
};

const severityMap: Record<string, { text: string; color: string }> = {
  minor: { text: '轻微', color: 'blue' },
  major: { text: '严重', color: 'orange' },
  critical: { text: '危急', color: 'red' },
};

const itemTypeMap: Record<string, string> = {
  class_hours: '课时异常',
  teacher_qualification: '师资资质',
  curriculum: '课程设置',
};

const generateInstitutionTrend = (basePass: number, baseAttendance: number) => {
  const data = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const weekNum = Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    data.push({
      week: `${date.getFullYear()}年第${weekNum}周`,
      passRate: +(basePass + (Math.random() * 6 - 3)).toFixed(1),
      attendanceRate: +(baseAttendance + (Math.random() * 4 - 2)).toFixed(1),
    });
  }
  return data;
};

export default function InstitutionProfile() {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canAccessInstitution = useAuthStore((state) => state.canAccessInstitution);
  const filterWarnings = useAuthStore((state) => state.filterWarnings);
  const warnings = useWarningStore((state) => state.warnings);

  const institution = useMemo(() => {
    return institutions.find((i) => i.id === institutionId);
  }, [institutionId]);

  const hasAccess = useMemo(() => {
    if (!institutionId) return false;
    return canAccessInstitution(institutionId);
  }, [institutionId, canAccessInstitution]);

  const institutionWarnings = useMemo(() => {
    if (!institutionId) return [];
    return filterWarnings(warnings).filter((w) => w.institutionId === institutionId);
  }, [warnings, institutionId, filterWarnings]);

  const institutionAbnormalItems = useMemo(() => {
    if (!institution) return [];
    const items: Array<AbnormalItem & { planId: string; fileName: string; uploadedAt: string }> = [];
    planValidationResults.forEach((plan) => {
      if (plan.regionCode === institution.regionCode) {
        plan.abnormalItems.forEach((item) => {
          items.push({ ...item, planId: plan.id, fileName: plan.fileName, uploadedAt: plan.uploadedAt });
        });
      }
    });
    return items;
  }, [institution]);

  const trendOption = useMemo(() => {
    if (!institution) return {};
    const trendData = generateInstitutionTrend(institution.metrics.passRate, 88);
    const weeks = trendData.map((t) => t.week);

    return {
      title: {
        text: '近12周趋势分析',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#1f2937',
          fontSize: 16,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        textStyle: { color: '#1f2937' },
        valueFormatter: (val: number) => `${val.toFixed(1)}%`,
      },
      legend: {
        data: ['合格率', '出勤率'],
        bottom: 10,
        textStyle: { color: '#6b7280' },
        icon: 'roundRect',
      },
      grid: {
        left: 50,
        right: 30,
        top: 60,
        bottom: 60,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: weeks,
        axisLine: { lineStyle: { color: 'rgba(156, 163, 175, 0.5)' } },
        axisLabel: { color: '#6b7280', fontSize: 10 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 50,
        max: 100,
        axisLabel: {
          color: '#6b7280',
          formatter: '{value}%',
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(229, 231, 235, 0.8)' } },
      },
      series: [
        {
          name: '合格率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: trendData.map((t) => t.passRate),
          lineStyle: { width: 3, color: '#3b82f6' },
          itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.25)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
            ]),
          },
        },
        {
          name: '出勤率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: trendData.map((t) => t.attendanceRate),
          lineStyle: { width: 3, color: '#10b981' },
          itemStyle: { color: '#10b981', borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.02)' },
            ]),
          },
        },
      ],
    };
  }, [institution]);

  const certificateOption = useMemo(() => {
    if (!institution) return {};
    const total = institution.metrics.totalTrainees;
    const certData = [
      { name: '电工证', value: Math.round(total * 0.28), color: '#3b82f6' },
      { name: '焊工证', value: Math.round(total * 0.2), color: '#8b5cf6' },
      { name: '家政服务证', value: Math.round(total * 0.22), color: '#10b981' },
      { name: '育婴师证', value: Math.round(total * 0.15), color: '#f59e0b' },
      { name: 'IT技能证', value: Math.round(total * 0.1), color: '#ef4444' },
      { name: '其他', value: Math.round(total * 0.05), color: '#64748b' },
    ];

    return {
      title: {
        text: '证书类型分布',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#1f2937',
          fontSize: 16,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        textStyle: { color: '#1f2937' },
        formatter: '{b}: {c} 张 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 20,
        top: 'center',
        textStyle: { color: '#6b7280' },
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 12,
      },
      series: [
        {
          name: '证书数量',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '55%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
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
              color: '#1f2937',
              formatter: '{b}\n{c} 张',
            },
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          labelLine: {
            show: false,
          },
          data: certData.map((c) => ({
            value: c.value,
            name: c.name,
            itemStyle: { color: c.color },
          })),
        },
      ],
    };
  }, [institution]);

  const warningColumns = [
    {
      title: '预警类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="red" icon={<AlertTriangle size={12} />}>
          {warningTypeMap[type] || type}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '实际值',
      dataIndex: 'actualValue',
      key: 'actualValue',
      render: (val: number, record: Warning) => (
        <span>
          <span className="text-red-600 font-semibold">{val}%</span>
          <span className="text-gray-400 text-xs ml-1">(阈值 {record.threshold}%)</span>
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: '待处理', color: 'orange' },
          institution_approved: { text: '机构已确认', color: 'blue' },
          district_approved: { text: '区级已复核', color: 'blue' },
          province_approved: { text: '省级已批准', color: 'green' },
          rejected: { text: '已驳回', color: 'red' },
          rectification_in_progress: { text: '整改中', color: 'processing' },
          pending_review: { text: '待复查', color: 'warning' },
          closed: { text: '已闭环', color: 'success' },
        };
        const cfg = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => new Date(val).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Warning) => (
        <Button type="link" size="small" onClick={() => navigate(`/warnings/${record.id}`)}>
          查看详情
        </Button>
      ),
    },
  ];

  const abnormalColumns = [
    {
      title: '异常类型',
      dataIndex: 'itemType',
      key: 'itemType',
      render: (type: string) => <Tag>{itemTypeMap[type] || type}</Tag>,
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (s: string) => {
        const cfg = severityMap[s] || { text: s, color: 'default' };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: '标准值',
      dataIndex: 'standardValue',
      key: 'standardValue',
    },
    {
      title: '实际值',
      dataIndex: 'actualValue',
      key: 'actualValue',
    },
    {
      title: '偏差',
      dataIndex: 'deviation',
      key: 'deviation',
      render: (val: number) => (
        <span className={val < 0 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
          {val > 0 ? '+' : ''}{val}%
        </span>
      ),
    },
    {
      title: '问题描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  if (!institution) {
    return (
      <div className="space-y-4">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <Card>
          <Empty description="未找到该机构信息" />
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-4">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <Alert
          type="error"
          showIcon
          message="访问被拒绝"
          description="您没有权限查看该机构的详情信息。"
        />
      </div>
    );
  }

  const levelCfg = levelMap[institution.level];
  const statusCfg = qualificationStatusMap[institution.qualificationStatus];
  const regionName = regionNameMap[institution.regionCode] || institution.regionCode;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">机构画像</h2>
      </div>

      <Card className="shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
              {institution.name.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900">{institution.name}</h3>
                <Tag color={levelCfg.color}>{levelCfg.text}</Tag>
                <Tag color={statusCfg.color}>{statusCfg.text}</Tag>
              </div>
              <p className="text-sm text-gray-500 mt-1">所属地区：{regionName}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {institution.metrics.totalTrainees.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">在培人数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {institution.metrics.passRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">合格率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {institution.metrics.employmentRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">就业率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {institution.metrics.certificateTimeliness.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">证书及时率</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="联系人">{institution.contactPerson}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{institution.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="技能提升指数">
              {institution.metrics.skillImprovementIndex.toFixed(1)}
            </Descriptions.Item>
            <Descriptions.Item label="数据更新时间">
              {new Date(institution.metrics.updatedAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="shadow-sm" styles={{ body: { padding: 0 } }}>
          <ReactECharts
            option={trendOption}
            style={{ height: 380, width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>

        <Card className="shadow-sm" styles={{ body: { padding: 0 } }}>
          <ReactECharts
            option={certificateOption}
            style={{ height: 380, width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>
      </div>

      <Card
        className="shadow-sm"
        title={
          <span className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            关联预警
            <Badge count={institutionWarnings.length} className="ml-2" />
          </span>
        }
      >
        {institutionWarnings.length === 0 ? (
          <Empty description="暂无关联预警" />
        ) : (
          <Table
            dataSource={institutionWarnings}
            rowKey="id"
            size="small"
            columns={warningColumns}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>

      <Card
        className="shadow-sm"
        title={
          <span className="flex items-center gap-2">
            <FileText size={18} className="text-orange-500" />
            培训计划异常
            <Badge count={institutionAbnormalItems.length} className="ml-2" />
          </span>
        }
      >
        {institutionAbnormalItems.length === 0 ? (
          <Empty description="暂无培训计划异常" />
        ) : (
          <Table
            dataSource={institutionAbnormalItems}
            rowKey={(r, i) => `${r.planId}-${i}`}
            size="small"
            columns={abnormalColumns}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>
    </div>
  );
}
