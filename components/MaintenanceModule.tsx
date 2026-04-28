import React, { useState } from 'react';
import { getMaintenanceStations } from '../services/maintenanceService';
import { MaintenanceStation } from '../types';

const MaintenanceModule: React.FC = () => {
  // 新增：查询条件状态
  const [region, setRegion] = useState<string>(''); // 地区（如“黑龙江”“江苏”）
  const [brand, setBrand] = useState<string>('');   // 品牌（如“约翰迪尔”“久保田”）
  const [stations, setStations] = useState<MaintenanceStation[]>([]); // 筛选后的维修站

  // 处理维修网点查询
  const handleSearchStations = () => {
    // 调用服务函数，传入地区/品牌筛选条件
    const matchedStations = getMaintenanceStations(region, brand);
    setStations(matchedStations);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-xl font-bold mb-4">维修网点查询</h3>
      
      {/* 1. 查询条件区 */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">地区</label>
          <input
            type="text"
            placeholder="输入地区（如：黑龙江、江苏）"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border p-2 rounded w-full md:w-40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">品牌</label>
          <input
            type="text"
            placeholder="输入品牌（如：约翰迪尔）"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="border p-2 rounded w-full md:w-40"
          />
        </div>
        <button 
          onClick={handleSearchStations}
          className="bg-blue-500 text-white p-2 rounded w-full md:w-32"
        >
          查询网点
        </button>
      </div>

      {/* 2. 维修网点结果区 */}
      {stations.length > 0 ? (
        <div className="space-y-3">
          {stations.map(station => (
            <div key={station.id} className="border p-3 rounded bg-slate-50">
              <p><span className="font-semibold">名称：</span>{station.name}</p>
              <p><span className="font-semibold">授权品牌：</span>{station.brand}</p>
              <p><span className="font-semibold">类型：</span>{station.type}</p>
              <p><span className="font-semibold">地址：</span>{station.location}</p>
              <p><span className="font-semibold">电话：</span>{station.contact}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 italic">请输入地区/品牌，点击“查询网点”获取结果</p>
      )}
    </div>
  );
};

export default MaintenanceModule;