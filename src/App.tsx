import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect } from "react";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Warnings from "@/pages/Warnings";
import WarningDetail from "@/pages/WarningDetail";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import TrainingPlan from "@/pages/TrainingPlan";
import Institutions from "@/pages/Institutions";
import Layout from "@/components/Layout";
import { useAuthStore } from "@/store/auth";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isLoggedIn, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function RequireNoAuth({ children }: { children: JSX.Element }) {
  const { isLoggedIn, checkAuth } = useAuthStore();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoggedIn) {
    return <Navigate to={from} replace />;
  }
  return children;
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#1e40af",
          colorInfo: "#1e40af",
          colorSuccess: "#10b981",
          colorWarning: "#f97316",
          colorError: "#ef4444",
          borderRadius: 6,
          fontFamily: '"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <RequireNoAuth>
                <Login />
              </RequireNoAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Layout>
                  <Dashboard />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/warnings"
            element={
              <RequireAuth>
                <Layout>
                  <Warnings />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/warnings/:warningId"
            element={
              <RequireAuth>
                <Layout>
                  <WarningDetail />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/warnings/rules"
            element={
              <RequireAuth>
                <Layout>
                  <div className="card-base p-10 text-center">
                    <h3 className="font-serif text-xl text-slate-800 mb-3">预警规则配置</h3>
                    <p className="text-slate-500">预警阈值参数配置模块正在开发中...</p>
                  </div>
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/training-plan"
            element={
              <RequireAuth>
                <Layout>
                  <TrainingPlan />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth>
                <Layout>
                  <Reports />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/reports/:reportId"
            element={
              <RequireAuth>
                <Layout>
                  <ReportDetail />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/institutions"
            element={
              <RequireAuth>
                <Layout>
                  <Institutions />
                </Layout>
              </RequireAuth>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
