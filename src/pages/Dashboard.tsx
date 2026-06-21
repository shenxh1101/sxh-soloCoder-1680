import { useEffect, useMemo, useState } from 'react';
import { Segmented } from 'antd';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import MetricsCard from '@/components/MetricsCard';
import RankingList from '@/components/RankingList';
import { useDashboardStore } from '@/store/dashboard';
import { registerChinaMap } from '@/lib/chinaMap';
import type { RankingItem } from '@/types';

type TabFilter = 'province' | 'occupation';

const provinceNameMap: Record<string, string> = {
  '北京市': '北京', '天津市': '天津', '上海市': '上海', '重庆市': '重庆',
  '河北省': '河北', '山西省': '山西', '辽宁省': '辽宁', '吉林省': '吉林',
  '黑龙江省': '黑龙江', '江苏省': '江苏', '浙江省': '浙江', '安徽省': '安徽',
  '福建省': '福建', '江西省': '江西', '山东省': '山东', '河南省': '河南',
  '湖北省': '湖北', '湖南省': '湖南', '广东省': '广东', '海南省': '海南',
  '四川省': '四川', '贵州省': '贵州', '云南省': '云南', '陕西省': '陕西',
  '甘肃省': '甘肃', '青海省': '青海', '台湾省': '台湾', '内蒙古自治区': '内蒙古',
  '广西壮族自治区': '广西', '西藏自治区': '西藏', '宁夏回族自治区': '宁夏',
  '新疆维吾尔自治区': '新疆', '香港特别行政区': '香港', '澳门特别行政区': '澳门',
};

const certificateTypes = [
  { name: '电工', value: 1850, color: '#3b82f6' },
  { name: '焊工', value: 1620, color: '#8b5cf6' },
  { name: '家政', value: 2100, color: '#10b981' },
  { name: '育婴', value: 1450, color: '#f59e0b' },
  { name: 'IT', value: 2380, color: '#ef4444' },
  { name: '汽修', value: 1280, color: '#06b6d4' },
  { name: '厨师', value: 1560, color: '#ec4899' },
  { name: '其他', value: 960, color: '#64748b' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabFilter>('province');
  const [mapReady, setMapReady] = useState(false);
  const {
    nationalMetrics,
    provinceData,
    selectedProvince,
    cityData,
    loading,
    fetchNationalData,
    fetchProvinceData,
    selectProvince,
    clearSelection,
  } = useDashboardStore();

  useEffect(() => {
    registerChinaMap().then(() => setMapReady(true));
  }, []);

  useEffect(() => {
    fetchNationalData();
  }, [fetchNationalData]);

  useEffect(() => {
    if (selectedProvince) {
      fetchProvinceData(selectedProvince);
    }
  }, [selectedProvince, fetchProvinceData]);

  const rankingData: RankingItem[] = useMemo(() => {
    return [...provinceData]
      .sort((a, b) => b.metrics.passRate - a.metrics.passRate)
      .map((p, idx) => ({
        name: p.regionName,
        value: p.metrics.passRate,
        change: idx < 3 ? 2.1 - idx * 0.5 : (idx % 2 === 0 ? 0.8 : -0.6),
      }));
  }, [provinceData]);

  const mapOption = useMemo(() => {
    const data = provinceData.map((p) => ({
      name: provinceNameMap[p.regionName] || p.regionName,
      value: p.metrics.totalTrainees,
      passRate: p.metrics.passRate,
      regionCode: p.regionCode,
      fullName: p.regionName,
    }));

    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const minValue = Math.min(...data.map((d) => d.value), 0);

    return {
      title: {
        text: '全国培训热力图',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#f1f5f9',
          fontSize: 16,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#f1f5f9' },
        formatter: (params: { name: string; data?: { passRate?: number; value?: number; fullName?: string } }) => {
          if (!params.data) return params.name;
          const d = params.data;
          return `
            <div style="padding: 4px;">
              <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${d.fullName || params.name}</div>
              <div style="margin-bottom: 4px;">培训人数：<span style="font-weight: 600; color: #60a5fa;">${(d.value || 0).toLocaleString()}</span> 人</div>
              <div>合格率：<span style="font-weight: 600; color: #34d399;">${d.passRate?.toFixed(1) || '0.0'}%</span></div>
            </div>
          `;
        },
      },
      visualMap: {
        min: minValue,
        max: maxValue,
        left: 20,
        bottom: 20,
        text: ['高', '低'],
        textStyle: { color: '#94a3b8' },
        inRange: {
          color: ['#1e3a5f', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
        },
        calculable: true,
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [104, 37],
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
          },
          itemStyle: {
            areaColor: '#3b82f6',
            shadowBlur: 20,
            shadowColor: 'rgba(59, 130, 246, 0.5)',
          },
        },
        itemStyle: {
          borderColor: 'rgba(148, 163, 184, 0.3)',
          borderWidth: 1,
          areaColor: '#0f172a',
        },
        select: {
          label: {
            show: true,
            color: '#fff',
          },
          itemStyle: {
            areaColor: '#6366f1',
          },
        },
      },
      series: [
        {
          name: '培训人数',
          type: 'map',
          map: 'china',
          geoIndex: 0,
          data: data,
        },
      ],
    };
  }, [provinceData]);

  const onMapEvents = useMemo(
    () => ({
      click: (params: { name?: string; data?: { regionCode?: string; fullName?: string } }) => {
        if (params.data?.regionCode) {
          if (selectedProvince === params.data.regionCode) {
            clearSelection();
          } else {
            selectProvince(params.data.regionCode);
          }
        }
      },
    }),
    [selectedProvince, selectProvince, clearSelection]
  );

  const attendanceOption = useMemo(() => {
    const nationalTrend = nationalMetrics?.trend || [];
    const selectedProvinceData = provinceData.find((p) => p.regionCode === selectedProvince);
    const provinceTrend = selectedProvinceData?.trend || [];
    const selectedCity = cityData[0];
    const cityTrend = selectedCity?.trend || [];

    const dates = nationalTrend.map((t) => t.date.slice(5).replace('-', '/'));

    return {
      title: {
        text: '近7天出勤趋势',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#f1f5f9',
          fontSize: 16,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#f1f5f9' },
        valueFormatter: (val: number) => `${val.toFixed(1)}%`,
      },
      legend: {
        data: [
          '全国',
          selectedProvinceData?.regionName || '选中省份',
          selectedCity?.regionName || '选中地市',
        ].filter(Boolean),
        bottom: 10,
        textStyle: { color: '#94a3b8' },
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
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.3)' } },
        axisLabel: { color: '#94a3b8' },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 70,
        max: 100,
        axisLabel: {
          color: '#94a3b8',
          formatter: '{value}%',
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
      },
      series: [
        {
          name: '全国',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: nationalTrend.map((t) => t.attendanceRate),
          lineStyle: { width: 3, color: '#3b82f6' },
          itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ]),
          },
        },
        ...(provinceTrend.length > 0
          ? [
              {
                name: selectedProvinceData?.regionName || '选中省份',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                data: provinceTrend.map((t: { attendanceRate: number }) => t.attendanceRate),
                lineStyle: { width: 3, color: '#10b981' },
                itemStyle: { color: '#10b981', borderWidth: 2, borderColor: '#fff' },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                    { offset: 1, color: 'rgba(16, 185, 129, 0.02)' },
                  ]),
                },
              },
            ]
          : []),
        ...(cityTrend.length > 0
          ? [
              {
                name: selectedCity?.regionName || '选中地市',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                data: cityTrend.map((t: { attendanceRate: number }) => t.attendanceRate),
                lineStyle: { width: 3, color: '#f59e0b' },
                itemStyle: { color: '#f59e0b', borderWidth: 2, borderColor: '#fff' },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
                    { offset: 1, color: 'rgba(245, 158, 11, 0.02)' },
                  ]),
                },
              },
            ]
          : []),
      ],
    };
  }, [nationalMetrics, provinceData, selectedProvince, cityData]);

  const certificateOption = useMemo(() => {
    return {
      title: {
        text: '证书类型分布',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#f1f5f9',
          fontSize: 16,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#f1f5f9' },
        formatter: '{b}: {c} 张 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 20,
        top: 'center',
        textStyle: { color: '#94a3b8' },
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 12,
      },
      series: [
        {
          name: '证书类型',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '55%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
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
              formatter: '{b}\n{c} 张',
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
          data: certificateTypes.map((c) => ({
            value: c.value,
            name: c.name,
            itemStyle: { color: c.color },
          })),
        },
      ],
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">职业培训效能数据看板</h1>
            <p className="text-sm text-slate-400 mt-1">
              {nationalMetrics?.metrics.updatedAt
                ? `数据更新时间：${new Date(nationalMetrics.metrics.updatedAt).toLocaleString('zh-CN')}`
                : '加载中...'}
            </p>
          </div>
          <Segmented
            value={activeTab}
            onChange={(value) => setActiveTab(value as TabFilter)}
            options={[
              { label: '按省份', value: 'province' },
              { label: '按职业分类', value: 'occupation' },
            ]}
            size="large"
            className="!bg-slate-800/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricsCard
            title="培训合格率"
            value={nationalMetrics?.metrics.passRate || 0}
            suffix="%"
            trend={1.3}
            trendLabel="较上周"
            color="blue"
            loading={loading}
          />
          <MetricsCard
            title="就业转化率"
            value={nationalMetrics?.metrics.employmentRate || 0}
            suffix="%"
            trend={0.8}
            trendLabel="较上周"
            color="green"
            loading={loading}
          />
          <MetricsCard
            title="技能提升指数"
            value={nationalMetrics?.metrics.skillImprovementIndex || 0}
            trend={2.1}
            trendLabel="较上月"
            color="purple"
            loading={loading}
          />
          <MetricsCard
            title="证书发放及时率"
            value={nationalMetrics?.metrics.certificateTimeliness || 0}
            suffix="%"
            trend={-0.3}
            trendLabel="较上周"
            color="orange"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 rounded-2xl bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
            {mapReady ? (
              <ReactECharts
                option={mapOption}
                style={{ height: 520, width: '100%' }}
                onEvents={onMapEvents}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className="flex items-center justify-center h-[520px]">
                <div className="text-slate-400 text-sm">地图加载中...</div>
              </div>
            )}
            {selectedProvince && cityData.length > 0 && (
              <div className="border-t border-white/5 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white">
                    {provinceData.find((p) => p.regionCode === selectedProvince)?.regionName}
                    - 地市列表
                  </h4>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    清除选择
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {cityData.map((city) => (
                    <div
                      key={city.regionCode}
                      className="rounded-lg bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium text-white">{city.regionName}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>培训 {city.metrics.totalTrainees.toLocaleString()}</span>
                        <span className="text-emerald-400">
                          合格 {city.metrics.passRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <RankingList data={rankingData} title="合格率排名榜" unit="%" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
            <ReactECharts
              option={attendanceOption}
              style={{ height: 380, width: '100%' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>

          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
            <ReactECharts
              option={certificateOption}
              style={{ height: 380, width: '100%' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
