import * as echarts from 'echarts';

let mapRegistered = false;

export async function registerChinaMap(): Promise<void> {
  if (mapRegistered) return;

  try {
    const response = await fetch(
      'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
    );
    if (response.ok) {
      const geoJson = await response.json();
      echarts.registerMap('china', geoJson);
      mapRegistered = true;
    } else {
      registerFallbackMap();
    }
  } catch {
    registerFallbackMap();
  }
}

function registerFallbackMap() {
  const fallbackGeoJson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: '北京', adcode: 110000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[116.2, 39.5], [116.8, 39.5], [116.8, 40.2], [116.2, 40.2], [116.2, 39.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '天津', adcode: 120000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[117.0, 38.6], [117.8, 38.6], [117.8, 39.2], [117.0, 39.2], [117.0, 38.6]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '上海', adcode: 310000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[121.0, 30.7], [121.9, 30.7], [121.9, 31.5], [121.0, 31.5], [121.0, 30.7]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '重庆', adcode: 500000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[105.3, 28.2], [110.2, 28.2], [110.2, 32.2], [105.3, 32.2], [105.3, 28.2]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '河北', adcode: 130000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[113.5, 36.0], [119.8, 36.0], [119.8, 42.6], [113.5, 42.6], [113.5, 36.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '山西', adcode: 140000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[110.2, 34.5], [114.5, 34.5], [114.5, 40.7], [110.2, 40.7], [110.2, 34.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '辽宁', adcode: 210000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[118.8, 38.4], [125.7, 38.4], [125.7, 43.5], [118.8, 43.5], [118.8, 38.4]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '吉林', adcode: 220000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[121.6, 40.9], [131.3, 40.9], [131.3, 46.3], [121.6, 46.3], [121.6, 40.9]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '黑龙江', adcode: 230000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[121.2, 43.4], [135.1, 43.4], [135.1, 53.6], [121.2, 53.6], [121.2, 43.4]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '江苏', adcode: 320000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[116.4, 30.8], [121.9, 30.8], [121.9, 35.1], [116.4, 35.1], [116.4, 30.8]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '浙江', adcode: 330000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[118.0, 27.0], [123.2, 27.0], [123.2, 31.4], [118.0, 31.4], [118.0, 27.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '安徽', adcode: 340000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[114.9, 29.4], [119.6, 29.4], [119.6, 34.6], [114.9, 34.6], [114.9, 29.4]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '福建', adcode: 350000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[115.8, 23.5], [120.7, 23.5], [120.7, 28.3], [115.8, 28.3], [115.8, 23.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '江西', adcode: 360000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[113.5, 24.4], [118.5, 24.4], [118.5, 30.1], [113.5, 30.1], [113.5, 24.4]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '山东', adcode: 370000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[114.8, 34.2], [122.7, 34.2], [122.7, 38.4], [114.8, 38.4], [114.8, 34.2]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '河南', adcode: 410000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[110.4, 31.4], [116.6, 31.4], [116.6, 36.4], [110.4, 36.4], [110.4, 31.4]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '湖北', adcode: 420000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[108.3, 29.0], [116.1, 29.0], [116.1, 33.3], [108.3, 33.3], [108.3, 29.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '湖南', adcode: 430000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[108.8, 24.6], [114.3, 24.6], [114.3, 30.1], [108.8, 30.1], [108.8, 24.6]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '广东', adcode: 440000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[109.5, 20.2], [117.2, 20.2], [117.2, 25.5], [109.5, 25.5], [109.5, 20.2]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '海南', adcode: 460000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[108.6, 18.2], [111.1, 18.2], [111.1, 20.2], [108.6, 20.2], [108.6, 18.2]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '四川', adcode: 510000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[97.4, 26.0], [108.6, 26.0], [108.6, 34.3], [97.4, 34.3], [97.4, 26.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '贵州', adcode: 520000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[103.6, 24.6], [109.6, 24.6], [109.6, 29.2], [103.6, 29.2], [103.6, 24.6]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '云南', adcode: 530000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[97.5, 21.1], [106.2, 21.1], [106.2, 29.2], [97.5, 29.2], [97.5, 21.1]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '陕西', adcode: 610000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[105.5, 31.7], [111.2, 31.7], [111.2, 39.6], [105.5, 39.6], [105.5, 31.7]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '甘肃', adcode: 620000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[92.3, 32.5], [108.7, 32.5], [108.7, 42.8], [92.3, 42.8], [92.3, 32.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '青海', adcode: 630000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[89.4, 31.5], [103.1, 31.5], [103.1, 39.2], [89.4, 39.2], [89.4, 31.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '台湾', adcode: 710000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[120.0, 21.9], [122.0, 21.9], [122.0, 25.3], [120.0, 25.3], [120.0, 21.9]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '内蒙古', adcode: 150000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[97.2, 37.4], [126.1, 37.4], [126.1, 53.6], [97.2, 53.6], [97.2, 37.4]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '广西', adcode: 450000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[104.3, 20.5], [112.1, 20.5], [112.1, 26.4], [104.3, 26.4], [104.3, 20.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '西藏', adcode: 540000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[78.4, 26.9], [99.1, 26.9], [99.1, 36.5], [78.4, 36.5], [78.4, 26.9]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '宁夏', adcode: 640000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[104.3, 35.2], [107.7, 35.2], [107.7, 39.4], [104.3, 39.4], [104.3, 35.2]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '新疆', adcode: 650000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[73.5, 34.3], [96.4, 34.3], [96.4, 49.2], [73.5, 49.2], [73.5, 34.3]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '香港', adcode: 810000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[113.8, 22.1], [114.4, 22.1], [114.4, 22.6], [113.8, 22.6], [113.8, 22.1]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '澳门', adcode: 820000 },
        geometry: {
          type: 'Polygon',
          coordinates: [[[113.5, 22.1], [113.6, 22.1], [113.6, 22.3], [113.5, 22.3], [113.5, 22.1]]],
        },
      },
    ],
  };

  echarts.registerMap('china', fallbackGeoJson as unknown as Parameters<typeof echarts.registerMap>[1]);
  mapRegistered = true;
}
