import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, message } from 'antd';
import { UserRound, Lock, ShieldCheck, Layers, TrendingUp, FileCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import type { User } from '@/types';

interface LoginFormValues {
  username: string;
  password: string;
  role: User['role'];
}

const roleOptions = [
  { label: '国家级', value: 'national' as const },
  { label: '省级', value: 'province' as const },
  { label: '市级', value: 'city' as const },
  { label: '机构负责人', value: 'institution' as const },
  { label: '教务管理员', value: 'academic' as const },
];

const roleHintMap: Record<User['role'], string> = {
  national: 'admin_national',
  province: 'admin_province',
  city: 'admin_city',
  institution: 'institution',
  academic: 'academic',
};

const featureList = [
  {
    icon: <Layers className="h-6 w-6 text-primary-300" />,
    title: '多维度数据看板',
    desc: '实时掌握全国/区域/机构培训效能关键指标',
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-primary-300" />,
    title: '智能预警诊断',
    desc: '自动识别异常指标，生成优化建议与整改方案',
  },
  {
    icon: <FileCheck className="h-6 w-6 text-primary-300" />,
    title: '培训计划校验',
    desc: '自动校验课程设置、师资资质、学时达标情况',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();
  const selectedRole = Form.useWatch('role', form);

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const success = login(values.username, values.password);
      if (success) {
        message.success('登录成功');
        navigate('/dashboard');
      } else {
        message.error('用户名或密码错误');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-primary-400 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">职业培训效能</div>
              <div className="text-sm text-white/60">评估管理平台</div>
            </div>
          </div>

          <h1 className="font-serif text-5xl font-bold text-white leading-tight mb-4">
            职业培训<br />效能评估系统
          </h1>
          <p className="text-lg text-white/70 max-w-md leading-relaxed">
            基于数据驱动的培训质量全流程监管，助力职业教育高质量发展
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          {featureList.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/10">
                {item.icon}
              </div>
              <div>
                <div className="text-base font-semibold text-white mb-1">{item.title}</div>
                <div className="text-sm text-white/60">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-sm text-white/40">
          © 2026 职业培训效能评估平台 · 保留所有权利
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <div className="text-lg font-bold">职业培训效能</div>
              <div className="text-xs text-white/60">评估管理平台</div>
            </div>
          </div>

          <div className="bg-white shadow-2xl rounded-xl p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">欢迎登录</h2>
              <p className="text-sm text-slate-500">请输入您的账号信息以继续</p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ role: 'national' }}
              size="large"
            >
              <Form.Item
                label="角色选择"
                name="role"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select
                  options={roleOptions}
                  placeholder="请选择登录角色"
                />
              </Form.Item>

              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
                extra={
                  selectedRole ? (
                    <span className="text-xs text-slate-400">
                      预设账号：<code className="bg-slate-100 px-1.5 py-0.5 rounded text-primary-700">{roleHintMap[selectedRole]}</code>
                    </span>
                  ) : null
                }
              >
                <Input
                  prefix={<UserRound className="h-4 w-4 text-slate-400" />}
                  placeholder="请输入用户名"
                />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
                extra={<span className="text-xs text-slate-400">演示环境密码任意输入</span>}
              >
                <Input.Password
                  prefix={<Lock className="h-4 w-4 text-slate-400" />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{
                    height: 44,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    border: 'none',
                    fontWeight: 600,
                  }}
                >
                  {loading ? '登录中...' : '登 录'}
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-6 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500 mb-2 font-medium">测试账号速查</div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <span className="text-slate-600"><code className="text-primary-700">admin_national</code> 国家级</span>
                <span className="text-slate-600"><code className="text-primary-700">admin_province</code> 省级</span>
                <span className="text-slate-600"><code className="text-primary-700">admin_city</code> 市级</span>
                <span className="text-slate-600"><code className="text-primary-700">institution</code> 机构</span>
                <span className="text-slate-600 col-span-2"><code className="text-primary-700">academic</code> 教务管理员</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
