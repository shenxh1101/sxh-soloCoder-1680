import { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Button, Input, Select, Tabs, Space, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useWarningStore } from '@/store/warning';
import { useAuthStore } from '@/store/auth';
import { regionNameMap } from '@/mock/data';
import type { Warning } from '@/types';

const warningTypeMap: Record<string, string> = {
  pass_rate: '合格率预警',
  employment_rate: '就业率预警',
};

const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '待处理' },
  processing: { color: 'blue', text: '处理中' },
  resolved: { color: 'green', text: '已解决' },
  rejected: { color: 'red', text: '已驳回' },
  rectification: { color: 'purple', text: '整改中' },
};

const approvalStatusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '待审批' },
  institution_approved: { color: 'blue', text: '机构已确认' },
  district_approved: { color: 'cyan', text: '区级已复核' },
  province_approved: { color: 'green', text: '省级已批准' },
  rejected: { color: 'red', text: '已驳回' },
  rectification_submitted: { color: 'purple', text: '整改方案已提交' },
};

export default function Warnings() {
  const navigate = useNavigate();
  const { warnings, fetchWarnings, loading } = useWarningStore();
  const { filterWarnings, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [warningType, setWarningType] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    fetchWarnings();
  }, [fetchWarnings]);

  const filteredWarnings = useMemo(() => {
    const permissionFiltered = filterWarnings(warnings);
    return permissionFiltered.filter((w) => {
      const statusMatch = activeTab === 'all' || w.status === activeTab;
      const typeMatch = !warningType || w.type === warningType;
      const searchMatch =
        !searchText ||
        w.institutionName.toLowerCase().includes(searchText.toLowerCase()) ||
        w.id.toLowerCase().includes(searchText.toLowerCase());
      return statusMatch && typeMatch && searchMatch;
    });
  }, [warnings, activeTab, warningType, searchText, filterWarnings]);

  const columns: ColumnsType<Warning> = [
    {
      title: '预警编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left',
    },
    {
      title: '预警类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'pass_rate' ? 'red' : 'purple'}>
          {warningTypeMap[type] || type}
        </Tag>
      ),
    },
    {
      title: '机构名称',
      dataIndex: 'institutionName',
      key: 'institutionName',
      width: 220,
      ellipsis: true,
    },
    {
      title: '所属地区',
      dataIndex: 'regionCode',
      key: 'regionCode',
      width: 100,
      render: (code: string) => regionNameMap[code] || code,
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 80,
      align: 'right',
      render: (val: number) => `${val}%`,
    },
    {
      title: '实际值',
      dataIndex: 'actualValue',
      key: 'actualValue',
      width: 100,
      align: 'right',
      render: (val: number) => (
        <span className="text-red-500 font-semibold">{val}%</span>
      ),
    },
    {
      title: '连续月份',
      dataIndex: 'consecutiveMonths',
      key: 'consecutiveMonths',
      width: 100,
      align: 'center',
      render: (val: number) => `${val} 个月`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '审批进度',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      width: 120,
      align: 'center',
      render: (status: string) => {
        const config = approvalStatusConfig[status] || approvalStatusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/warnings/${record.id}`)}
        >
          详情
        </Button>
      ),
    },
  ];

  const permissionFilteredWarnings = filterWarnings(warnings);
  const tabItems = [
    { key: 'all', label: `全部 (${permissionFilteredWarnings.length})` },
    { key: 'pending', label: `待处理 (${permissionFilteredWarnings.filter((w) => w.status === 'pending').length})` },
    { key: 'processing', label: `处理中 (${permissionFilteredWarnings.filter((w) => w.status === 'processing').length})` },
    { key: 'resolved', label: `已解决 (${permissionFilteredWarnings.filter((w) => w.status === 'resolved').length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">预警中心</h1>
            <p className="text-slate-500 text-sm">监控培训机构异常指标，及时预警处置</p>
            {user && user.role !== 'national' && (
              <p className="text-blue-600 text-xs mt-1">
                当前数据范围：{regionNameMap[user.regionCode] || '全国'}
              </p>
            )}
          </div>
          <Space>
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => navigate('/warnings/rules')}
            >
              预警规则配置
            </Button>
          </Space>
        </div>

        <Card
          className="mb-4 bg-white border border-slate-200 shadow-sm"
          styles={{ body: { padding: '16px' } }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              className="flex-1"
              style={{ minWidth: 400 }}
            />
            <Space className="ml-auto">
              <Select
                placeholder="预警类型"
                allowClear
                style={{ width: 150 }}
                value={warningType}
                onChange={setWarningType}
                options={[
                  { value: 'pass_rate', label: '合格率预警' },
                  { value: 'employment_rate', label: '就业率预警' },
                ]}
              />
              <Input
                placeholder="搜索机构名称或预警编号"
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Space>
          </div>
        </Card>

        <Card
          className="bg-white border border-slate-200 shadow-sm"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={filteredWarnings}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['10', '20', '50'],
            }}
            className="bg-transparent"
          />
        </Card>
      </div>
    </div>
  );
}
