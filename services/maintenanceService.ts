import { MaintenanceStation, RepairStep } from '../types';

// 1. 修正：完整定义维修站数据+筛选逻辑
export const getMaintenanceStations = (region: string, brand: string): MaintenanceStation[] => {
  // 先定义完整的维修站数组（添加类型声明）
  const ALL_MAINTENANCE_STATIONS: MaintenanceStation[] = [
    {
      id: 1,
      name: "农机维修总站",
      brand: "约翰迪尔授权服务站",
      type: "企业维修中心",
      location: "江苏省南京市江宁区农机路88号",
      contact: "025-12345678"
    },
    {
      id: 2,
      name: "丰收农机服务站",
      brand: "久保田合作服务站",
      type: "第三方服务站",
      location: "山东省济南市历城区农业路123号",
      contact: "0531-87654321"
    }
  ];

  // 添加筛选逻辑（根据地区、品牌匹配）
  return ALL_MAINTENANCE_STATIONS.filter(station => {
    const regionMatch = region.trim() === '' || station.location.includes(region.trim());
    const brandMatch = brand.trim() === '' || station.brand.includes(brand.trim());
    return regionMatch && brandMatch;
  });
};

// 2. 原有函数保留（无错误）
export const getRepairSteps = (machineType: string): RepairStep[] => {
  if (machineType === "履带式机具") {
    return [
      { step: 1, content: "检查履带松紧度，松开张紧装置" },
      { step: 2, content: "拆卸履带销，移除旧履带" },
      { step: 3, content: "安装新履带，调整张紧度至标准值" },
      { step: 4, content: "测试运转，确保无异常异响" }
    ];
  }
  return [];
};

// 3. 原有函数保留（无错误）
export const getMachineTypeBySoilMoisture = (moisture: number): string => {
  return "履带式机具";
};