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
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { useWarningStore } from '@/store/warning';
import { useAuthStore } from '@/store/auth';
import ApprovalTimeline from '@/components/ApprovalTimeline';
import type { User } from '@/types';

const { TextArea } = Input;
const { confirm } = Modal;

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
  pending: { color: 'warning', text: '待处理' },
  processing: { color: 'processing', text: '处理中' },
  resolved: { color: 'success', text: '已解决' },
};

const stepRoleMap: Record<number, User['role'][]> = {
  1: ['institution', 'academic'],
  2: ['city'],
  3: ['province'],
};

export default function WarningDetail() {
  const { warningId } = useParams<{ warningId: string }>();
  const navigate = useNavigate();
  const { currentWarning, fetchWarningDetail, approveStep, rejectStep, submitRectificationPlan, loading } = useWarningStore();
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [operationType, setOperationType] = useState<'approve' | 'reject' | 'plan' | null>(null);

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
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        textStyle: { color: '#1f2937' },
      },
      legend: {
        data: ['机构合格率', '区域均值', '预警阈值'],
        textStyle: { color: '#6b7280' },
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
        axisLine: { lineStyle: { color: 'rgba(156, 163, 175, 0.5)' } },
        axisLabel: { color: '#6b7280' },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: 'rgba(156, 163, 175, 0.5)' } },
        axisLabel: { color: '#6b7280', formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(229, 231, 235, 0.8)' } },
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
                { offset: 0, color: 'rgba(59, 130, 246, 0.25)' },
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

  const showConfirm = (action: 'approve' | 'reject' | 'plan', comment: string) => {
    const step = currentWarning?.approvalFlow.currentStep as 1 | 2 | 3;
    if (!currentWarning) return;

    let title = '';
    let content = '';
    let okText = '';
    let okType: 'primary' | 'danger' | 'default' = 'primary';

    if (action === 'approve') {
      title = '确认通过';
      content = `确认通过第 ${step} 步审批？此操作将推进到下一步。`;
      okText = '确认通过';
      okType = 'primary';
    } else if (action === 'reject') {
      title = '确认驳回';
      content = '确认驳回此审批？驳回后将退回上一步重新处理，驳回意见将记录在时间线中。';
      okText = '确认驳回';
      okType = 'danger';
    } else if (action === 'plan') {
      title = '提交整改方案';
      content = '确认提交此整改方案？提交后将继续审批流程。';
      okText = '确认提交';
      okType = 'primary';
    }

    confirm({
      title,
      icon: action === 'reject' ? <ExclamationCircleOutlined className="text-red-500" /> : <ExclamationCircleOutlined className="text-blue-500" />,
      content: (
        <div>
          <p className="mb-3 text-gray-700">{content}</p>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">审批意见：</p>
            <p className="text-gray-800 font-medium">{comment || '（未填写意见）'}</p>
          </div>
        </div>
      ),
      okText,
      okType,
      cancelText: '取消',
      onOk: async () => {
        await executeOperation(action, comment);
      },
    });
  };

  const executeOperation = async (action: 'approve' | 'reject' | 'plan', comment: string) => {
    try {
      setSubmitting(true);
      setOperationType(action);

      if (!currentWarning) return;
      const step = currentWarning.approvalFlow.currentStep as 1 | 2 | 3;

      if (action === 'approve') {
        approveStep(step, comment);
        message.success('审批通过，已推进到下一步');
      } else if (action === 'reject') {
        rejectStep(step, comment);
        message.success('已驳回，已退回上一步处理');
      } else if (action === 'plan') {
        submitRectificationPlan(step, comment);
        message.success('整改方案已提交');
      }

      form.resetFields();
    } finally {
      setTimeout(() => {
        setSubmitting(false);
        setOperationType(null);
      }, 500);
    }
  };

  const handleSubmit = async (action: 'approve' | 'reject' | 'plan') => {
    try {
      const values = await form.validateFields();
      showConfirm(action, values.comment || '');
    } catch {
      // Validation failed
    }
  };

  if (loading && !currentWarning) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentWarning) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="mb-4">未找到该预警记录</p>
          <Button onClick={() => navigate('/warnings')} icon={<ArrowLeftOutlined />}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const statusCfg = statusConfig[currentWarning.status] || statusConfig.pending;
  const currentStepData = currentWarning.approvalFlow.steps[currentWarning.approvalFlow.currentStep - 1];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/warnings')}
          >
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">预警详情</h1>
            <p className="text-gray-500 text-sm">预警编号：{currentWarning.id}</p>
          </div>
          <Tag color={statusCfg.color} style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: 14 }}>
            {statusCfg.text}
          </Tag>
        </div>

        <Card
          className="mb-6 shadow-sm"
          title={
            <span className="text-gray-900 font-semibold">预警基本信息</span>
          }
        >
          <Descriptions
            column={2}
            labelStyle={{ color: '#6b7280', width: 120, fontWeight: 500 }}
            contentStyle={{ color: '#1f2937' }}
          >
            <Descriptions.Item label="预警类型">
              <Tag color={currentWarning.type === 'pass_rate' ? 'error' : 'purple'}>
                {warningTypeMap[currentWarning.type] || currentWarning.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="机构名称">
              <span className="font-medium">{currentWarning.institutionName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="所属地区">
              {regionMap[currentWarning.regionCode] || currentWarning.regionCode}
            </Descriptions.Item>
            <Descriptions.Item label="连续异常月份">
              <span className="text-orange-600 font-semibold">
                {currentWarning.consecutiveMonths} 个月
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="阈值">
              {currentWarning.threshold}%
            </Descriptions.Item>
            <Descriptions.Item label="实际值">
              <span className="text-red-600 font-semibold">
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
              <p className="text-gray-700">{currentWarning.description}</p>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          className="mb-6 shadow-sm"
          title={
            <span className="text-gray-900 font-semibold">审批流程</span>
          }
          styles={{ body: { padding: '24px' } }}
        >
          <ApprovalTimeline
            steps={currentWarning.approvalFlow.steps}
            currentStep={currentWarning.approvalFlow.currentStep}
          />
        </Card>

        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card
              className="mb-6 shadow-sm"
              title={
                <span className="text-gray-900 font-semibold">审批工作台</span>
              }
            >
              {isCompleted ? (
                <div className="text-center py-8">
                  <CheckCircleOutlined className="text-5xl text-green-500 mb-4" />
                  <p className="text-green-600 text-lg font-medium">该预警已完成审批流程</p>
                  {currentWarning.approvalFlow.finalDecision && (
                    <p className="text-gray-500 mt-2">
                      最终决定：
                      {currentWarning.approvalFlow.finalDecision === 'adjust_plan' && '调整培训计划'}
                      {currentWarning.approvalFlow.finalDecision === 'suspend_qualification' && '暂停培训资质'}
                      {currentWarning.approvalFlow.finalDecision === 'dismiss' && '驳回预警'}
                    </p>
                  )}
                </div>
              ) : !canOperate ? (
                <div className="text-center py-8">
                  <CloseCircleOutlined className="text-5xl text-gray-300 mb-4" />
                  <p className="text-gray-500">当前步骤无需您审批</p>
                  <p className="text-gray-400 text-sm mt-2">
                    当前步骤：{currentStepData?.title || '-'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    待处理角色：
                    {currentStepData?.role === 'institution' && '机构负责人'}
                    {currentStepData?.role === 'city' && '市级管理员'}
                    {currentStepData?.role === 'province' && '省级管理员'}
                    {currentStepData?.role === 'academic' && '专家委员会'}
                  </p>
                </div>
              ) : (
                <Form form={form} layout="vertical">
                  <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-blue-700 text-sm">
                      当前审批步骤：
                      <span className="font-semibold ml-1">
                        {currentStepData?.title}
                      </span>
                    </p>
                    <p className="text-blue-600 text-xs mt-1">
                      您的角色：{user?.role === 'institution' ? '机构负责人' : user?.role === 'city' ? '市级管理员' : user?.role === 'province' ? '省级管理员' : '专家委员会'}
                    </p>
                  </div>
                  <Form.Item
                    name="comment"
                    label={<span className="text-gray-700 font-medium">审批意见</span>}
                    rules={[{ required: true, message: '请输入审批意见' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="请输入您的审批意见..."
                      className="!bg-white"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={submitting && operationType === 'approve'}
                        onClick={() => handleSubmit('approve')}
                      >
                        通过
                      </Button>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        loading={submitting && operationType === 'reject'}
                        onClick={() => handleSubmit('reject')}
                      >
                        驳回
                      </Button>
                      {currentWarning.approvalFlow.currentStep === 1 && (
                        <Button
                          icon={<FileTextOutlined />}
                          loading={submitting && operationType === 'plan'}
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
              className="mb-6 shadow-sm"
              title={
                <span className="text-gray-900 font-semibold">近6个月合格率趋势</span>
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
