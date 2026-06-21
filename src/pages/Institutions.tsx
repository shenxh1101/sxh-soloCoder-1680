import { useMemo, useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Input,
  Select,
  Cascader,
  Space,
  Card,
  Modal,
  Popconfirm,
  message,
  Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { institutions as mockInstitutions, regionHierarchy, regionNameMap } from '@/mock/data';
import { useAuthStore } from '@/store/auth';
import type { Institution } from '@/types';

const levelConfig: Record<string, { color: string; text: string }> = {
  primary: { color: 'blue', text: '初级' },
  intermediate: { color: 'orange', text: '中级' },
  advanced: { color: 'purple', text: '高级' },
};

const statusConfig: Record<string, { color: string; text: string }> = {
  active: { color: 'green', text: '正常' },
  suspended: { color: 'red', text: '暂停' },
  pending: { color: 'default', text: '待审核' },
};

const buildRegionOptions = (regionCode: string, depth: number = 0): any[] => {
  const region = regionHierarchy[regionCode];
  if (!region || !region.children || region.children.length === 0 || depth >= 2) {
    return [];
  }
  return region.children.map((code) => ({
    value: code,
    label: regionNameMap[code] || code,
    children: buildRegionOptions(code, depth + 1),
  }));
};

export default function Institutions() {
  const { filterInstitutions, user, getViewScope, getAccessibleRegions } = useAuthStore();
  const [dataSource, setDataSource] = useState<Institution[]>([]);
  const [regionValue, setRegionValue] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);

  const viewScope = useMemo(() => getViewScope(), [getViewScope]);

  useEffect(() => {
    const filtered = filterInstitutions(mockInstitutions);
    setDataSource(filtered);
  }, [filterInstitutions]);

  const regionOptions = useMemo(() => {
    if (!user || user.role === 'national') {
      return buildRegionOptions('000000');
    }

    if (user.role === 'province') {
      return [
        {
          value: user.regionCode,
          label: regionNameMap[user.regionCode] || user.regionCode,
          children: buildRegionOptions(user.regionCode, 1),
        },
      ];
    }

    if (user.role === 'city') {
      return [
        {
          value: user.regionCode,
          label: regionNameMap[user.regionCode] || user.regionCode,
        },
      ];
    }

    if (user.role === 'institution' || user.role === 'academic') {
      return [];
    }

    return buildRegionOptions('000000');
  }, [user]);

  const showRegionFilter = user?.role !== 'institution' && user?.role !== 'academic';

  const filteredData = useMemo(() => {
    return dataSource.filter((item) => {
      const regionMatch =
        regionValue.length === 0 ||
        regionValue.includes(item.regionCode) ||
        (regionValue.length === 1 && item.regionCode.startsWith(regionValue[0].slice(0, 2)));
      const statusMatch = !statusFilter || item.qualificationStatus === statusFilter;
      const levelMatch = !levelFilter || item.level === levelFilter;
      const searchMatch =
        !searchText || item.name.toLowerCase().includes(searchText.toLowerCase());
      return regionMatch && statusMatch && levelMatch && searchMatch;
    });
  }, [dataSource, regionValue, statusFilter, levelFilter, searchText]);

  const handleViewDetail = (record: Institution) => {
    setCurrentInstitution(record);
    setDetailVisible(true);
  };

  const handleQualificationAction = (
    record: Institution,
    action: 'suspend' | 'resume' | 'approve'
  ) => {
    const actionMap = {
      suspend: { newStatus: 'suspended' as const, successText: '机构资质已暂停' },
      resume: { newStatus: 'active' as const, successText: '机构资质已恢复' },
      approve: { newStatus: 'active' as const, successText: '机构资质审核通过' },
    };
    const { newStatus, successText } = actionMap[action];

    setDataSource((prev) =>
      prev.map((item) =>
        item.id === record.id ? { ...item, qualificationStatus: newStatus } : item
      )
    );
    message.success(successText);
  };

  const handleReset = () => {
    setRegionValue([]);
    setStatusFilter(undefined);
    setLevelFilter(undefined);
    setSearchText('');
  };

  const columns: ColumnsType<Institution> = [
    {
      title: '机构名称',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '所属地区',
      dataIndex: 'regionCode',
      key: 'regionCode',
      width: 120,
      render: (code: string) => regionNameMap[code] || code,
    },
    {
      title: '培训等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      align: 'center',
      filters: [
        { text: '初级', value: 'primary' },
        { text: '中级', value: 'intermediate' },
        { text: '高级', value: 'advanced' },
      ],
      onFilter: (value, record) => record.level === value,
      render: (level: string) => {
        const config = levelConfig[level] || levelConfig.primary;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '资质状态',
      dataIndex: 'qualificationStatus',
      key: 'qualificationStatus',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 140,
    },
    {
      title: '培训人数',
      dataIndex: ['metrics', 'totalTrainees'],
      key: 'totalTrainees',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.metrics.totalTrainees - b.metrics.totalTrainees,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '合格率',
      dataIndex: ['metrics', 'passRate'],
      key: 'passRate',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.metrics.passRate - b.metrics.passRate,
      render: (val: number) => {
        if (val === 0) return '-';
        const color = val < 70 ? 'text-red-500' : val < 85 ? 'text-yellow-500' : 'text-green-500';
        return <span className={`font-semibold ${color}`}>{val.toFixed(1)}%</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          {record.qualificationStatus === 'active' && (
            <Popconfirm
              title="确认暂停该机构资质？"
              description="暂停后该机构将无法进行培训相关操作"
              okText="确认暂停"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleQualificationAction(record, 'suspend')}
            >
              <Button type="link" size="small" danger icon={<PauseOutlined />}>
                暂停
              </Button>
            </Popconfirm>
          )}
          {record.qualificationStatus === 'suspended' && (
            <Popconfirm
              title="确认恢复该机构资质？"
              okText="确认恢复"
              cancelText="取消"
              onConfirm={() => handleQualificationAction(record, 'resume')}
            >
              <Button type="link" size="small" icon={<PlayCircleOutlined />}>
                恢复
              </Button>
            </Popconfirm>
          )}
          {record.qualificationStatus === 'pending' && (
            <Popconfirm
              title="确认审核通过该机构资质？"
              okText="确认审核"
              cancelText="取消"
              onConfirm={() => handleQualificationAction(record, 'approve')}
            >
              <Button type="link" size="small" icon={<CheckCircleOutlined />} style={{ color: '#10b981' }}>
                审核
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-serif">机构管理</h1>
            <p className="text-sm text-slate-500 mt-0.5">管理培训机构资质，维护培训组织信息</p>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => message.info('新增机构功能开发中')}
            >
              新增机构
            </Button>
          </Space>
        </div>

        {viewScope.level !== 'country' && (
          <Alert
            message={`当前数据范围：${viewScope.name}（${['机构负责人', '市级管理员', '省级管理员'][
              ['institution', 'city', 'province'].indexOf(viewScope.level)
            ] || viewScope.level}）`}
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        <Card className="bg-white border border-slate-200 shadow-sm mb-4" styles={{ body: { padding: '16px' } }}>
          <div className="flex flex-wrap items-center gap-4">
            {showRegionFilter && (
              <Cascader
                options={regionOptions}
                value={regionValue}
                onChange={(value) => setRegionValue((value as string[]) || [])}
                placeholder="选择地区"
                style={{ width: 200 }}
                allowClear
                showSearch
              />
            )}
            <Select
              placeholder="资质状态"
              allowClear
              style={{ width: 140 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'active', label: '正常' },
                { value: 'suspended', label: '暂停' },
                { value: 'pending', label: '待审核' },
              ]}
            />
            <Select
              placeholder="培训等级"
              allowClear
              style={{ width: 140 }}
              value={levelFilter}
              onChange={setLevelFilter}
              options={[
                { value: 'primary', label: '初级' },
                { value: 'intermediate', label: '中级' },
                { value: 'advanced', label: '高级' },
              ]}
            />
            <Input
              placeholder="搜索机构名称"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button onClick={handleReset}>重置</Button>
          </div>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm" styles={{ body: { padding: 0 } }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['10', '20', '50'],
              defaultPageSize: 10,
            }}
            className="bg-transparent"
          />
        </Card>

        <Modal
          title="机构详情"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              关闭
            </Button>,
          ]}
          width={600}
        >
          {currentInstitution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-500 text-sm mb-1">机构编号</div>
                  <div className="font-medium text-slate-800">{currentInstitution.id}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-sm mb-1">机构名称</div>
                  <div className="font-medium text-slate-800">{currentInstitution.name}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-sm mb-1">所属地区</div>
                  <div className="text-slate-800">
                    {regionNameMap[currentInstitution.regionCode] || currentInstitution.regionCode}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-sm mb-1">培训等级</div>
                  <div>
                    <Tag color={levelConfig[currentInstitution.level].color}>
                      {levelConfig[currentInstitution.level].text}
                    </Tag>
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-sm mb-1">资质状态</div>
                  <div>
                    <Tag color={statusConfig[currentInstitution.qualificationStatus].color}>
                      {statusConfig[currentInstitution.qualificationStatus].text}
                    </Tag>
                  </div>
                </div>
                <div></div>
                <div>
                  <div className="text-slate-500 text-sm mb-1">联系人</div>
                  <div className="text-slate-800">{currentInstitution.contactPerson}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-sm mb-1">联系电话</div>
                  <div className="text-slate-800">{currentInstitution.contactPhone}</div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="text-slate-700 font-medium mb-3">培训指标</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-slate-500 text-sm">累计培训人数</div>
                    <div className="text-xl font-bold text-slate-800 mt-1 font-serif">
                      {currentInstitution.metrics.totalTrainees.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-slate-500 text-sm">培训合格率</div>
                    <div className="text-xl font-bold text-slate-800 mt-1 font-serif">
                      {currentInstitution.metrics.passRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-slate-500 text-sm">就业率</div>
                    <div className="text-xl font-bold text-slate-800 mt-1 font-serif">
                      {currentInstitution.metrics.employmentRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-slate-500 text-sm">技能提升指数</div>
                    <div className="text-xl font-bold text-slate-800 mt-1 font-serif">
                      {currentInstitution.metrics.skillImprovementIndex.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
