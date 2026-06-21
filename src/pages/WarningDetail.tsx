import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Form,
  Input,
  Space,
  message,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { useWarningStore } from '@/store/warning';
import { useAuthStore } from '@/store/auth';
import ApprovalTimeline from '@/components/ApprovalTimeline';
import type { User } from '@/types';

const { TextArea } = Input;

const warningTypeMap: Record<string, string> = {
  pass_rate: '合格率预警',
  employment_rate: '就业率预警',
};

const regionMap: Record<string, string> = {
  '440100': '广州市',
  '440300': '深圳市',
  '440600': '佛山市',
  '440000': '广东省',
};

const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '待处理' },
  processing: { color: 'blue', text: '处理中' },
  resolved: { color: 'green', text: '已解决' },
};

const stepRoleMap: Record<number, User['role'][]> = {
  1: ['institution', 'academic'],
  2: ['city'],
  3: ['province'],
};

export default function WarningDetail() {
  const { warningId } = useParams<{ warningId: string }>();
  const navigate = useNavigate();
  const { currentWarning, fetchWarningDetail, approveStep, loading } = useWarningStore();
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (warningId) {
      fetchWarningDetail(warningId);
    }
  }, [warningId, fetchWarningDetail]);

  const canOperate = useMemo(() => {
    if (!currentWarning || !user) return false;
    const step = currentWarning.approvalFlow.currentStep;
    if (step === 0 || step > 3) return false;
    const allowedRoles = stepRoleMap[step];
    return allowedRoles.includes(user.role);
  }, [currentWarning, user]);

  const isCompleted = useMemo(() => {
    if (!currentWarning) return false;
    return currentWarning.approvalFlow.currentStep > 3 || currentWarning.status === 'resolved';
  }, [currentWarning]);

  const trendOption = useMemo(() => {
    const months = [];
    const passRates = [];
    const regionAvg = 75;
    const threshold = currentWarning?.threshold || 65;
    for (let i = 5; i >= 0; i--) {
      const date = dayjs().subtract(i, 'month');
      months.push(date.format('YYYY-MM'));
      const base = currentWarning?.actualValue || 58;
      passRates.push(+(base + Math.random() * 10 - 5).toFixed(1));
    }

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#fff' },
      },
      legend: {
        data: ['机构合格率', '区域均值', '预警阈值'],
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
        boundaryGap: false,
        data: months,
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.3)' } },
        axisLabel: { color: '#94a3b8' },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.3)' } },
        axisLabel: { color: '#94a3b8', formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
      },
      series: [
        {
          name: '机构合格率',
          type: 'line',
          smooth: true,
          data: passRates,
          lineStyle: { color: '#3b82f6', width: 3 },
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0)' },
              ],
            },
          },
          symbol: 'circle',
          symbolSize: 8,
        },
        {
          name: '区域均值',
          type: 'line',
          data: months.map(() => regionAvg),
          lineStyle: { color: '#10b981', width: 2, type: 'dashed' },
          itemStyle: { color: '#10b981' },
          symbol: 'none',
        },
        {
          name: '预警阈值',
          type: 'line',
          data: months.map(() => threshold),
          lineStyle: { color: '#ef4444', width: 2, type: 'dashed' },
          itemStyle: { color: '#ef4444' },
          symbol: 'none',
          markArea: {
            silent: true,
            itemStyle: { color: 'rgba(239, 68, 68, 0.05)' },
            data: [
              [{ yAxis: 0 }, { yAxis: threshold }],
            ],
          },
        },
      ],
    };
  }, [currentWarning]);

  const handleSubmit = async (action: 'approve' | 'reject' | 'plan') => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (!currentWarning) return;
      const step = currentWarning.approvalFlow.currentStep as 1 | 2 | 3;
      const comment = values.comment || '';

      if (action === 'approve') {
        approveStep(step, comment);
        message.success('审批通过成功');
      } else if (action === 'reject') {
        message.success('已驳回');
      } else if (action === 'plan') {
        approveStep(step, `整改方案：${comment}`);
        message.success('整改方案已提交');
      }

      form.resetFields();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !currentWarning) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentWarning) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="mb-4">未找到该预警记录</p>
          <Button onClick={() => navigate('/warnings')} icon={<ArrowLeftOutlined />}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const statusCfg = statusConfig[currentWarning.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/warnings')}
          >
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">预警详情</h1>
            <p className="text-slate-400 text-sm">预警编号：{currentWarning.id}</p>
          </div>
          <Tag color={statusCfg.color} style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: 14 }}>
            {statusCfg.text}
          </Tag>
        </div>

        <Card
          className="mb-6 bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 border-0"
          title={
            <span className="text-white font-semibold">预警基本信息</span>
          }
        >
          <Descriptions
            column={2}
            labelStyle={{ color: '#94a3b8', width: 120 }}
            contentStyle={{ color: '#fff' }}
          >
            <Descriptions.Item label="预警类型">
              <Tag color={currentWarning.type === 'pass_rate' ? 'red' : 'purple'}>
                {warningTypeMap[currentWarning.type] || currentWarning.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="机构名称">
              {currentWarning.institutionName}
            </Descriptions.Item>
            <Descriptions.Item label="所属地区">
              {regionMap[currentWarning.regionCode] || currentWarning.regionCode}
            </Descriptions.Item>
            <Descriptions.Item label="连续异常月份">
              <span className="text-orange-400 font-semibold">
                {currentWarning.consecutiveMonths} 个月
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="阈值">
              {currentWarning.threshold}%
            </Descriptions.Item>
            <Descriptions.Item label="实际值">
              <span className="text-red-500 font-semibold">
                {currentWarning.actualValue}%
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={statusCfg.color}>{statusCfg.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {dayjs(currentWarning.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="详细描述" span={2}>
              <p className="text-slate-200">{currentWarning.description}</p>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          className="mb-6 bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 border-0"
          title={
            <span className="text-white font-semibold">审批流程</span>
          }
        >
          <ApprovalTimeline
            steps={currentWarning.approvalFlow.steps}
            currentStep={currentWarning.approvalFlow.currentStep}
          />
        </Card>

        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card
              className="mb-6 bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 border-0"
              title={
                <span className="text-white font-semibold">审批工作台</span>
              }
            >
              {isCompleted ? (
                <div className="text-center py-8">
                  <CheckCircleOutlined className="text-5xl text-green-500 mb-4" />
                  <p className="text-green-400 text-lg">该预警已完成审批流程</p>
                </div>
              ) : !canOperate ? (
                <div className="text-center py-8">
                  <CloseCircleOutlined className="text-5xl text-slate-600 mb-4" />
                  <p className="text-slate-400">当前步骤无需您审批</p>
                  <p className="text-slate-500 text-sm mt-2">
                    当前步骤：{currentWarning.approvalFlow.steps[currentWarning.approvalFlow.currentStep - 1]?.title || '-'}
                  </p>
                </div>
              ) : (
                <Form form={form} layout="vertical">
                  <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-blue-300 text-sm">
                      当前审批步骤：
                      <span className="font-semibold ml-1">
                        {currentWarning.approvalFlow.steps[currentWarning.approvalFlow.currentStep - 1]?.title}
                      </span>
                    </p>
                  </div>
                  <Form.Item
                    name="comment"
                    label={<span className="text-slate-300">审批意见</span>}
                    rules={[{ required: true, message: '请输入审批意见' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="请输入您的审批意见..."
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        borderColor: 'rgba(148, 163, 184, 0.2)',
                        color: '#fff',
                      }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={submitting}
                        onClick={() => handleSubmit('approve')}
                      >
                        通过
                      </Button>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        loading={submitting}
                        onClick={() => handleSubmit('reject')}
                      >
                        驳回
                      </Button>
                      {currentWarning.approvalFlow.currentStep === 1 && (
                        <Button
                          icon={<FileTextOutlined />}
                          loading={submitting}
                          onClick={() => handleSubmit('plan')}
                        >
                          提交整改方案
                        </Button>
                      )}
                    </Space>
                  </Form.Item>
                </Form>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              className="mb-6 bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 border-0"
              title={
                <span className="text-white font-semibold">近6个月合格率趋势</span>
              }
            >
              <ReactECharts
                option={trendOption}
                style={{ height: 320 }}
                opts={{ renderer: 'canvas' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
