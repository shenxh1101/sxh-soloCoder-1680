import { useState } from 'react';
import { Upload, Table, Tag, Button, Progress, Space, message, Card } from 'antd';
import type { UploadProps, UploadFile } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import {
  InboxOutlined,
  DownloadOutlined,
  BellOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { planValidationResults } from '@/mock/data';
import type { PlanValidationResult, AbnormalItem } from '@/types';

const { Dragger } = Upload;

const statusConfig: Record<string, { color: string; text: string }> = {
  pass: { color: 'green', text: '校验通过' },
  warning: { color: 'orange', text: '存在异常' },
  error: { color: 'red', text: '严重异常' },
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

export default function TrainingPlan() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      return true;
    },
    customRequest: ({ file, onSuccess, onError, onProgress }) => {
      setUploading(true);
      setUploadProgress(0);

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(100);
          onProgress?.({ percent: 100 }, file);
          setTimeout(() => {
            setUploading(false);
            onSuccess?.(file);
            message.success('文件上传成功，正在校验...');
            setTimeout(() => {
              message.success('校验完成！');
            }, 1000);
          }, 500);
        } else {
          setUploadProgress(progress);
          onProgress?.({ percent: progress }, file);
        }
      }, 300);

      return {
        abort: () => {
          clearInterval(interval);
          onError?.(new Error('上传取消'));
          setUploading(false);
        },
      };
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(-1));
    },
    showUploadList: false,
  };

  const handleDownloadTemplate = () => {
    message.success('标准模板下载中...');
  };

  const handlePushNotification = () => {
    const hasAbnormal = planValidationResults.some(
      (r) => r.abnormalItems.length > 0
    );
    if (!hasAbnormal) {
      message.info('暂无异常需要推送');
      return;
    }
    message.success('异常提醒已推送至教务管理员');
  };

  const abnormalColumns: ColumnsType<AbnormalItem> = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 200,
      render: (text: string) => (
        <span className="text-white font-medium">{text}</span>
      ),
    },
    {
      title: '异常类型',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 100,
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
      width: 120,
      align: 'center',
      render: (val: number | string) => (
        <span className="text-slate-300">{val}</span>
      ),
    },
    {
      title: '实际值',
      dataIndex: 'actualValue',
      key: 'actualValue',
      width: 120,
      align: 'center',
      render: (val: number | string) => (
        <span className="text-slate-300">{val}</span>
      ),
    },
    {
      title: '偏差%',
      dataIndex: 'deviation',
      key: 'deviation',
      width: 100,
      align: 'right',
      render: (val: number) => {
        const isHigh = Math.abs(val) > 15;
        return (
          <span className={isHigh ? 'text-red-500 font-semibold' : 'text-slate-300'}>
            {val > 0 ? '+' : ''}
            {val}%
          </span>
        );
      },
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
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
      render: (text: string) => <span className="text-slate-400">{text}</span>,
    },
  ];

  const columns: ColumnsType<PlanValidationResult> = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 260,
      render: (text: string) => (
        <Space>
          <FileExcelOutlined className="text-green-400" />
          <span className="text-white">{text}</span>
        </Space>
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 160,
      render: (date: string) => (
        <span className="text-slate-400">{dayjs(date).format('YYYY-MM-DD HH:mm')}</span>
      ),
    },
    {
      title: '上传人',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      width: 100,
      render: (text: string) => <span className="text-slate-300">{text}</span>,
    },
    {
      title: '课程总数',
      dataIndex: 'totalCourses',
      key: 'totalCourses',
      width: 100,
      align: 'center',
      render: (val: number) => <span className="text-white font-medium">{val}</span>,
    },
    {
      title: '异常项数',
      dataIndex: 'abnormalItems',
      key: 'abnormalCount',
      width: 100,
      align: 'center',
      render: (items: AbnormalItem[]) => {
        const count = items.length;
        return (
          <span className={count > 0 ? 'text-orange-400 font-medium' : 'text-slate-400'}>
            {count}
          </span>
        );
      },
    },
    {
      title: '总体状态',
      dataIndex: 'overallStatus',
      key: 'overallStatus',
      width: 120,
      align: 'center',
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.pass;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  const expandedRowRender = (record: PlanValidationResult) => {
    if (record.abnormalItems.length === 0) {
      return (
        <div className="py-8 text-center text-slate-500">
          <p className="text-sm">该培训计划无异常项</p>
        </div>
      );
    }
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 -mx-4">
        <h4 className="text-sm font-semibold text-white mb-3">
          异常项详情（共 {record.abnormalItems.length} 项）
        </h4>
        <Table
          columns={abnormalColumns}
          dataSource={record.abnormalItems}
          rowKey={(item, index) => `${record.id}-${index}`}
          pagination={false}
          size="small"
          className="bg-transparent"
          scroll={{ x: 900 }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">培训计划校验</h1>
            <p className="text-slate-400 text-sm">上传培训计划Excel文件，自动校验课时、师资、课程设置是否符合标准</p>
          </div>
        </div>

        <Card
          className="bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 border-0"
          styles={{ body: { padding: '24px' } }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">上传培训计划</h3>
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              className="!text-blue-400 !px-0"
            >
              下载标准模板
            </Button>
          </div>

          <Dragger {...uploadProps} className="!bg-slate-800/30 !border-slate-700 hover:!border-blue-500/50">
            <p className="ant-upload-drag-icon !mb-4">
              <InboxOutlined className="text-blue-400 text-5xl" />
            </p>
            <p className="ant-upload-text text-white text-lg mb-2">
              点击或拖拽文件到此区域上传
            </p>
            <p className="ant-upload-hint text-slate-400 text-sm mb-4">
              支持 .xlsx / .xls 格式，单个文件不超过 10MB
            </p>
          </Dragger>

          {fileList.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-slate-800/50 ring-1 ring-white/5">
              {fileList.map((file) => (
                <div key={file.uid} className="flex items-center gap-3">
                  <FileExcelOutlined className="text-green-400 text-xl" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm truncate">{file.name}</span>
                      <span className="text-slate-400 text-xs ml-2">
                        {(file.size! / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    {uploading && (
                      <Progress
                        percent={Math.round(uploadProgress)}
                        size="small"
                        showInfo={true}
                        strokeColor="#3b82f6"
                        trailColor="#1e293b"
                      />
                    )}
                    {!uploading && (
                      <div className="flex items-center gap-2">
                        <Tag color="green">上传成功</Tag>
                        <span className="text-slate-500 text-xs">
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
          className="bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 border-0"
          styles={{ body: { padding: 0 } }}
          title={
            <div className="flex items-center justify-between py-2">
              <h3 className="text-base font-semibold text-white">校验结果历史</h3>
              <Button
                type="primary"
                icon={<BellOutlined />}
                onClick={handlePushNotification}
                className="!bg-blue-500 hover:!bg-blue-600"
              >
                推送异常提醒至教务管理员
              </Button>
            </div>
          }
        >
          {planValidationResults.length === 0 ? (
            <div className="py-16">
              <div className="text-center">
                <InboxOutlined className="text-5xl text-slate-600 mb-4" />
                <p className="text-slate-400">暂无上传记录</p>
                <p className="text-slate-500 text-sm mt-1">请在上方区域上传培训计划Excel文件</p>
              </div>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={planValidationResults}
              rowKey="id"
              expandable={{
                expandedRowRender,
                defaultExpandAllRows: false,
                rowExpandable: () => true,
              }}
              scroll={{ x: 1000 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
                pageSizeOptions: ['10', '20', '50'],
              }}
              className="bg-transparent"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
