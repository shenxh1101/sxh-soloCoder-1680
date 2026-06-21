import { useState, useEffect, useMemo } from 'react';
import { Segmented, Card, Tag, List } from 'antd';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import MetricsCard from '@/components/MetricsCard';
import RankingList from '@/components/RankingList';
import { useDashboardStore } from '@/store/dashboard';
import { useAuthStore } from '@/store/auth';
import { registerChinaMap } from '@/lib/chinaMap';
import type { RankingItem, OccupationData } from '@/types';

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

const occupationColors: Record<string, string> = {
  '电工': '#3b82f6',
  '焊工': '#8b5cf6',
  '家政服务': '#10b981',
  '育婴师': '#f59e0b',
  'IT技术': '#ef4444',
  '汽车维修': '#06b6d4',
  '中式烹调师': '#ec4899',
  '其他': '#64748b',
};

export default function Dashboard() {
  const [mapReady, setMapReady] = useState(false);
  const user = useAuthStore((state) => state.user);
  const filterProvinces = useAuthStore((state) => state.filterProvinces);

  const {
    viewMode,
    nationalMetrics,
    provinceData,
    selectedProvince,
    cityData,
    occupationData,
    selectedOccupation,
    loading,
    fetchNationalData,
    fetchProvinceData,
    selectProvince,
    clearSelection,
    setViewMode,
    selectOccupation,
  } = useDashboardStore();

  const filteredProvinceData = useMemo(() => {
    return filterProvinces(provinceData);
  }, [provinceData, filterProvinces]);

  useEffect(() => {
    registerChinaMap().then(() => setMapReady(true));
  }, []);

  useEffect(() => {
    fetchNationalData();
  }, [fetchNationalData]);

  useEffect(() => {
    if (selectedProvince && viewMode === 'province') {
      fetchProvinceData(selectedProvince);
    }
  }, [selectedProvince, viewMode, fetchProvinceData]);

  const handleViewModeChange = (value: 'province' | 'occupation') => {
    setViewMode(value);
  };

  const rankingData: RankingItem[] = useMemo(() => {
    if (viewMode === 'occupation') {
      return [...occupationData]
        .sort((a, b) => b.passRate - a.passRate)
        .map((o, idx) => ({
          name: o.name,
          value: o.passRate,
          change: idx < 3 ? 2.1 - idx * 0.5 : (idx % 2 === 0 ? 0.8 : -0.6),
        }));
    }

    return [...filteredProvinceData]
      .sort((a, b) => b.metrics.passRate - a.metrics.passRate)
      .map((p, idx) => ({
        name: p.regionName,
        value: p.metrics.passRate,
        change: idx < 3 ? 2.1 - idx * 0.5 : (idx % 2 === 0 ? 0.8 : -0.6),
      }));
  }, [viewMode, filteredProvinceData, occupationData]);

  const mapOption = useMemo(() => {
    const data = filteredProvinceData.map((p) => ({
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
        formatter: (params: { name: string; data?: { passRate?: number; value?: number; fullName?: string } }) => {
          if (!params.data) return params.name;
          const d = params.data;
          return `
            <div style="padding: 4px;">
              <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${d.fullName || params.name}</div>
              <div style="margin-bottom: 4px;">培训人数：<span style="font-weight: 600; color: #2563eb;">${(d.value || 0).toLocaleString()}</span> 人</div>
              <div>合格率：<span style="font-weight: 600; color: #10b981;">${d.passRate?.toFixed(1) || '0.0'}%</span></div>
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
        textStyle: { color: '#6b7280' },
        inRange: {
          color: ['#dbeafe', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
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
            areaColor: '#2563eb',
            shadowBlur: 20,
            shadowColor: 'rgba(37, 99, 235, 0.3)',
          },
        },
        itemStyle: {
          borderColor: 'rgba(156, 163, 175, 0.5)',
          borderWidth: 1,
          areaColor: '#f3f4f6',
        },
        select: {
          label: {
            show: true,
            color: '#fff',
          },
          itemStyle: {
            areaColor: '#4f46e5',
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
  }, [filteredProvinceData]);

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
    if (viewMode === 'occupation') {
      const selectedOcc = occupationData.find((o) => o.code === selectedOccupation);
      const trendData = selectedOcc?.attendanceTrend || occupationData[0]?.attendanceTrend || [];
      const dates = trendData.map((t) => t.date.slice(5).replace('-', '/'));

      const seriesData = selectedOccupation
        ? [{
            name: selectedOcc?.name || '',
            data: trendData.map((t) => t.rate),
            color: occupationColors[selectedOcc?.name || ''] || '#3b82f6',
          }]
        : occupationData.slice(0, 5).map((o) => ({
            name: o.name,
            data: o.attendanceTrend.map((t) => t.rate),
            color: occupationColors[o.name] || '#3b82f6',
          }));

      return {
        title: {
          text: selectedOccupation ? `${selectedOcc?.name}出勤趋势` : '各职业类别出勤趋势',
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
          data: seriesData.map((s) => s.name),
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
          data: dates,
          axisLine: { lineStyle: { color: 'rgba(156, 163, 175, 0.5)' } },
          axisLabel: { color: '#6b7280' },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          min: 70,
          max: 100,
          axisLabel: {
            color: '#6b7280',
            formatter: '{value}%',
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: 'rgba(229, 231, 235, 0.8)' } },
        },
        series: seriesData.map((s) => ({
          name: s.name,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: s.data,
          lineStyle: { width: 2, color: s.color },
          itemStyle: { color: s.color, borderWidth: 2, borderColor: '#fff' },
        })),
      };
    }

    const nationalTrend = nationalMetrics?.trend || [];
    const selectedProvinceData = filteredProvinceData.find((p) => p.regionCode === selectedProvince);
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
        data: [
          '全国',
          selectedProvinceData?.regionName || '选中省份',
          selectedCity?.regionName || '选中地市',
        ].filter(Boolean),
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
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(156, 163, 175, 0.5)' } },
        axisLabel: { color: '#6b7280' },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 70,
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
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
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
                    { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
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
                    { offset: 0, color: 'rgba(245, 158, 11, 0.25)' },
                    { offset: 1, color: 'rgba(245, 158, 11, 0.02)' },
                  ]),
                },
              },
            ]
          : []),
      ],
    };
  }, [viewMode, nationalMetrics, filteredProvinceData, selectedProvince, cityData, occupationData, selectedOccupation]);

  const certificateOption = useMemo(() => {
    if (viewMode === 'occupation') {
      const data = occupationData.map((o) => ({
        name: o.name,
        value: o.certificateCount,
        itemStyle: { color: occupationColors[o.name] || '#64748b' },
      }));

      return {
        title: {
          text: '各职业证书分布',
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
            data: data,
          },
        ],
      };
    }

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
          name: '证书类型',
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
          data: certificateTypes.map((c) => ({
            value: c.value,
            name: c.name,
            itemStyle: { color: c.color },
          })),
        },
      ],
    };
  }, [viewMode, occupationData]);

  const occupationTraineesOption = useMemo(() => {
    const sortedData = [...occupationData].sort((a, b) => b.totalTrainees - a.totalTrainees);
    return {
      title: {
        text: '各职业培训人数',
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
        formatter: '{b}: {c} 人',
      },
      grid: {
        left: 80,
        right: 30,
        top: 50,
        bottom: 40,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: '#6b7280',
          formatter: (val: number) => (val / 10000).toFixed(1) + '万',
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(229, 231, 235, 0.8)' } },
      },
      yAxis: {
        type: 'category',
        data: sortedData.map((o) => o.name),
        axisLabel: { color: '#6b7280' },
        axisLine: { lineStyle: { color: 'rgba(156, 163, 175, 0.5)' } },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: sortedData.map((o) => ({
            value: o.totalTrainees,
            itemStyle: {
              color: occupationColors[o.name] || '#3b82f6',
              borderRadius: [0, 4, 4, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#6b7280',
            formatter: (params: { value: number }) => (params.value / 10000).toFixed(1) + '万',
          },
          barWidth: 20,
        },
      ],
    };
  }, [occupationData]);

  const renderProvinceView = () => (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
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
              <div className="text-gray-500 text-sm">地图加载中...</div>
            </div>
          )}
          {selectedProvince && cityData.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  {filteredProvinceData.find((p) => p.regionCode === selectedProvince)?.regionName}
                  - 地市列表
                </h4>
                <button
                  onClick={clearSelection}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  清除选择
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cityData.map((city) => (
                  <div
                    key={city.regionCode}
                    className="rounded-lg bg-gray-50 px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-900">{city.regionName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>培训 {city.metrics.totalTrainees.toLocaleString()}</span>
                      <span className="text-emerald-600">
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
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <ReactECharts
            option={attendanceOption}
            style={{ height: 380, width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <ReactECharts
            option={certificateOption}
            style={{ height: 380, width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>
    </>
  );

  const renderOccupationView = () => (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <ReactECharts
            option={occupationTraineesOption}
            style={{ height: 520, width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>

        <div>
          <Card title="职业类别总览" className="shadow-sm h-full" styles={{ body: { padding: 0 } }}>
            <List
              dataSource={[...occupationData].sort((a, b) => b.totalTrainees - a.totalTrainees)}
              renderItem={(item: OccupationData) => (
                <List.Item
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedOccupation === item.code ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => selectOccupation(selectedOccupation === item.code ? null : item.code)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: occupationColors[item.name] || '#3b82f6' }}
                      />
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Tag color="blue">{(item.totalTrainees / 10000).toFixed(1)}万人</Tag>
                      <Tag color="green">{item.passRate.toFixed(1)}%</Tag>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <ReactECharts
            option={attendanceOption}
            style={{ height: 380, width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <ReactECharts
            option={certificateOption}
            style={{ height: 380, width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              职业培训效能数据看板
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {user?.name && (
                <span className="mr-4">
                  当前身份：
                  <Tag color="blue" className="ml-1">
                    {user.role === 'national'
                      ? '国家级管理员'
                      : user.role === 'province'
                      ? '省级管理员'
                      : user.role === 'city'
                      ? '市级管理员'
                      : user.role === 'institution'
                      ? '机构负责人'
                      : '专家委员会'}
                  </Tag>
                </span>
              )}
              {nationalMetrics?.metrics.updatedAt
                ? `数据更新时间：${new Date(nationalMetrics.metrics.updatedAt).toLocaleString('zh-CN')}`
                : '加载中...'}
            </p>
          </div>
          <Segmented
            value={viewMode}
            onChange={handleViewModeChange}
            options={[
              { label: '按省份', value: 'province' },
              { label: '按职业分类', value: 'occupation' },
            ]}
            size="large"
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

        {viewMode === 'province' ? renderProvinceView() : renderOccupationView()}
      </div>
    </div>
  );
}
