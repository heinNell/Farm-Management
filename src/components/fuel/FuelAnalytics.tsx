import { BarChart3, Calendar, DollarSign, Droplet, FileText, Filter, TrendingDown, TrendingUp, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Asset, FuelRecord, OperatingSession } from '../../types/database';
import { exportFuelRecordsToExcel } from '../../utils/fuelExcelUtils';

interface FuelAnalyticsProps {
  fuelRecords: FuelRecord[];
  assets: Asset[];
  operatingSessions: OperatingSession[];
}

interface FilterOptions {
  assetId: string;
  driverId: string;
  farmLocation: string;
  dateFrom: string;
  dateTo: string;
  fuelType: string;
}

interface AssetKPI {
  assetId: string;
  assetName: string;
  totalFuelQuantity: number;
  totalCost: number;
  averageConsumption: number;
  costPerHour: number;
  totalHours: number;
  recordCount: number;
  averageFuelEfficiency: number;
}

interface DriverKPI {
  driverName: string;
  totalFuelQuantity: number;
  totalCost: number;
  averageConsumption: number;
  costPerHour: number;
  totalHours: number;
  recordCount: number;
  assetsOperated: number;
}

interface FarmKPI {
  location: string;
  totalFuelQuantity: number;
  totalCost: number;
  averageConsumption: number;
  costPerHour: number;
  totalHours: number;
  recordCount: number;
  assetsCount: number;
}

const FuelAnalytics: React.FC<FuelAnalyticsProps> = ({ fuelRecords, assets }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    assetId: '',
    driverId: '',
    farmLocation: '',
    dateFrom: '',
    dateTo: '',
    fuelType: ''
  });

  const [activeView, setActiveView] = useState<'overview' | 'assets' | 'drivers' | 'farms'>('overview');

  // Get unique values for filter dropdowns
  const uniqueDrivers = useMemo(() => {
    const drivers = new Set<string>();
    fuelRecords.forEach((r: FuelRecord) => {
      if (r.driver_name) drivers.add(r.driver_name);
    });
    return Array.from(drivers).sort();
  }, [fuelRecords]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    assets.forEach((a: Asset) => {
      if (a.location) locations.add(a.location);
    });
    fuelRecords.forEach((r: FuelRecord) => {
      if (r.location) locations.add(r.location);
    });
    return Array.from(locations).sort();
  }, [assets, fuelRecords]);

  const uniqueFuelTypes = useMemo(() => {
    const types = new Set<string>();
    fuelRecords.forEach((r: FuelRecord) => types.add(r.fuel_type));
    return Array.from(types).sort();
  }, [fuelRecords]);

  // Filter records based on current filters
  const filteredRecords = useMemo(() => {
    return fuelRecords.filter((record: FuelRecord) => {
      if (filters.assetId && record.asset_id !== filters.assetId) return false;
      if (filters.driverId && record.driver_name !== filters.driverId) return false;
      if (filters.fuelType && record.fuel_type !== filters.fuelType) return false;
      
      if (filters.farmLocation) {
        const asset = assets.find(a => a.id === record.asset_id);
        if (!asset || asset.location !== filters.farmLocation) return false;
      }
      
      if (filters.dateFrom) {
        const recordDate = new Date(record.filling_date || record.date);
        if (recordDate < new Date(filters.dateFrom)) return false;
      }
      
      if (filters.dateTo) {
        const recordDate = new Date(record.filling_date || record.date);
        if (recordDate > new Date(filters.dateTo)) return false;
      }
      
      return true;
    });
  }, [fuelRecords, assets, filters]);

  // Calculate Asset KPIs
  const assetKPIs = useMemo(() => {
    const kpiMap = new Map<string, AssetKPI>();
    
    filteredRecords.forEach((record: FuelRecord) => {
      const asset = assets.find(a => a.id === record.asset_id);
      if (!asset) return;
      
      const existing = kpiMap.get(asset.id) || {
        assetId: asset.id,
        assetName: asset.name,
        totalFuelQuantity: 0,
        totalCost: 0,
        averageConsumption: 0,
        costPerHour: 0,
        totalHours: 0,
        recordCount: 0,
        averageFuelEfficiency: 0
      };
      
      existing.totalFuelQuantity += record.quantity;
      existing.totalCost += record.cost;
      existing.recordCount += 1;
      
      if (record.hour_difference) {
        existing.totalHours += record.hour_difference;
      }
      
      kpiMap.set(asset.id, existing);
    });
    
    // Calculate averages and derived metrics
    const kpis = Array.from(kpiMap.values()).map(kpi => {
      // Calculate average consumption rate (L/H) as weighted average: Total Fuel / Total Hours
      // This is more accurate than averaging individual consumption_rate values
      kpi.averageConsumption = kpi.totalHours > 0 ? kpi.totalFuelQuantity / kpi.totalHours : 0;
      
      kpi.costPerHour = kpi.totalHours > 0 ? kpi.totalCost / kpi.totalHours : 0;
      kpi.averageFuelEfficiency = kpi.averageConsumption > 0 ? 1 / kpi.averageConsumption : 0;
      
      return kpi;
    });
    
    return kpis.sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredRecords, assets]);

  // Calculate Driver KPIs
  const driverKPIs = useMemo(() => {
    const kpiMap = new Map<string, DriverKPI>();
    
    filteredRecords.forEach((record: FuelRecord) => {
      if (!record.driver_name) return;
      
      const existing = kpiMap.get(record.driver_name) || {
        driverName: record.driver_name,
        totalFuelQuantity: 0,
        totalCost: 0,
        averageConsumption: 0,
        costPerHour: 0,
        totalHours: 0,
        recordCount: 0,
        assetsOperated: 0
      };
      
      existing.totalFuelQuantity += record.quantity;
      existing.totalCost += record.cost;
      existing.recordCount += 1;
      
      if (record.hour_difference) {
        existing.totalHours += record.hour_difference;
      }
      
      kpiMap.set(record.driver_name, existing);
    });
    
    // Calculate averages and count unique assets per driver
    const kpis = Array.from(kpiMap.values()).map(kpi => {
      const driverRecords = filteredRecords.filter((r: FuelRecord) => r.driver_name === kpi.driverName);
      const uniqueAssets = new Set(driverRecords.map((r: FuelRecord) => r.asset_id));
      kpi.assetsOperated = uniqueAssets.size;
      
      // Calculate average consumption rate (L/H) as weighted average: Total Fuel / Total Hours
      // This is more accurate than averaging individual consumption_rate values
      kpi.averageConsumption = kpi.totalHours > 0 ? kpi.totalFuelQuantity / kpi.totalHours : 0;
      
      kpi.costPerHour = kpi.totalHours > 0 ? kpi.totalCost / kpi.totalHours : 0;
      
      return kpi;
    });
    
    return kpis.sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredRecords]);

  // Calculate Farm KPIs
  const farmKPIs = useMemo(() => {
    const kpiMap = new Map<string, FarmKPI>();
    
    filteredRecords.forEach((record: FuelRecord) => {
      const asset = assets.find(a => a.id === record.asset_id);
      // Use asset location first, then fall back to fuel record location, then 'Unknown'
      const location = asset?.location || record.location || 'Unknown';
      
      const existing = kpiMap.get(location) || {
        location,
        totalFuelQuantity: 0,
        totalCost: 0,
        averageConsumption: 0,
        costPerHour: 0,
        totalHours: 0,
        recordCount: 0,
        assetsCount: 0
      };
      
      existing.totalFuelQuantity += record.quantity;
      existing.totalCost += record.cost;
      existing.recordCount += 1;
      
      if (record.hour_difference) {
        existing.totalHours += record.hour_difference;
      }
      
      kpiMap.set(location, existing);
    });
    
    // Calculate averages and count unique assets per location
    const kpis = Array.from(kpiMap.values()).map(kpi => {
      const locationRecords = filteredRecords.filter((r: FuelRecord) => {
        const asset = assets.find((a: Asset) => a.id === r.asset_id);
        const recordLocation = asset?.location || r.location || 'Unknown';
        return recordLocation === kpi.location;
      });
      
      const uniqueAssets = new Set(locationRecords.map((r: FuelRecord) => r.asset_id));
      kpi.assetsCount = uniqueAssets.size;
      
      // Calculate average consumption rate (L/H) as weighted average: Total Fuel / Total Hours
      // This is more accurate than averaging individual consumption_rate values
      kpi.averageConsumption = kpi.totalHours > 0 ? kpi.totalFuelQuantity / kpi.totalHours : 0;
      
      kpi.costPerHour = kpi.totalHours > 0 ? kpi.totalCost / kpi.totalHours : 0;
      
      return kpi;
    });
    
    return kpis.sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredRecords, assets]);

  // Overall summary metrics
  const summaryMetrics = useMemo(() => {
    const totalQuantity = filteredRecords.reduce((sum: number, r: FuelRecord) => sum + r.quantity, 0);
    const totalCost = filteredRecords.reduce((sum: number, r: FuelRecord) => sum + r.cost, 0);
    const totalHours = filteredRecords.reduce((sum: number, r: FuelRecord) => sum + (r.hour_difference || 0), 0);
    
    // Calculate average consumption rate (L/H) as weighted average: Total Fuel / Total Hours
    // This is more accurate than averaging individual consumption_rate values
    const avgConsumption = totalHours > 0 ? totalQuantity / totalHours : 0;
    
    const highestCostPerHour = Math.max(...assetKPIs.map(k => k.costPerHour), 0);
    const lowestCostPerHour = Math.min(...assetKPIs.filter(k => k.costPerHour > 0).map(k => k.costPerHour), Infinity);
    
    return {
      totalQuantity,
      totalCost,
      totalHours,
      avgConsumption,
      costPerHour: totalHours > 0 ? totalCost / totalHours : 0,
      highestCostPerHour: highestCostPerHour > 0 ? highestCostPerHour : 0,
      lowestCostPerHour: lowestCostPerHour !== Infinity ? lowestCostPerHour : 0,
      recordCount: filteredRecords.length
    };
  }, [filteredRecords, assetKPIs]);

  const handleClearFilters = () => {
    setFilters({
      assetId: '',
      driverId: '',
      farmLocation: '',
      dateFrom: '',
      dateTo: '',
      fuelType: ''
    });
  };

  const handleExportReport = () => {
    exportFuelRecordsToExcel(filteredRecords, assets);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <FileText className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
            <select
              value={filters.assetId}
              onChange={(e) => setFilters({ ...filters, assetId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Assets</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
            <select
              value={filters.driverId}
              onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Drivers</option>
              {uniqueDrivers.map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location</label>
            <select
              value={filters.farmLocation}
              onChange={(e) => setFilters({ ...filters, farmLocation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
            <select
              value={filters.fuelType}
              onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {uniqueFuelTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fuel</p>
              <p className="text-2xl font-bold text-gray-900">{summaryMetrics.totalQuantity.toFixed(1)}L</p>
              <p className="text-xs text-gray-500 mt-1">{summaryMetrics.recordCount} records</p>
            </div>
            <Droplet className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">${summaryMetrics.totalCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">${summaryMetrics.costPerHour.toFixed(2)}/hr avg</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Consumption</p>
              <p className="text-2xl font-bold text-gray-900">{summaryMetrics.avgConsumption.toFixed(2)} L/h</p>
              <p className="text-xs text-gray-500 mt-1">{summaryMetrics.totalHours.toFixed(0)} hrs total</p>
            </div>
            <TrendingDown className="h-12 w-12 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cost/Hour Range</p>
              <p className="text-2xl font-bold text-gray-900">${summaryMetrics.highestCostPerHour.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Low: ${summaryMetrics.lowestCostPerHour.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeView === 'overview'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveView('assets')}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeView === 'assets'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
              By Asset ({assetKPIs.length})
            </button>
            <button
              onClick={() => setActiveView('drivers')}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeView === 'drivers'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4" />
              By Driver ({driverKPIs.length})
            </button>
            <button
              onClick={() => setActiveView('farms')}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeView === 'farms'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
              By Farm ({farmKPIs.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overview View */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Summary Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Top 5 Assets by Cost</h4>
                  <div className="space-y-2">
                    {assetKPIs.slice(0, 5).map((kpi, idx) => (
                      <div key={kpi.assetId} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{idx + 1}. {kpi.assetName}</span>
                        <span className="font-medium">${kpi.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Top 5 Drivers by Cost</h4>
                  <div className="space-y-2">
                    {driverKPIs.slice(0, 5).map((kpi, idx) => (
                      <div key={kpi.driverName} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{idx + 1}. {kpi.driverName}</span>
                        <span className="font-medium">${kpi.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Farms by Cost</h4>
                  <div className="space-y-2">
                    {farmKPIs.map((kpi, idx) => (
                      <div key={kpi.location} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{idx + 1}. {kpi.location}</span>
                        <span className="font-medium">${kpi.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assets View */}
          {activeView === 'assets' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Fuel</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost/Hour</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg L/h</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assetKPIs.map((kpi) => (
                    <tr key={kpi.assetId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{kpi.assetName}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{kpi.totalFuelQuantity.toFixed(1)}L</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">${kpi.totalCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                        ${kpi.costPerHour.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{kpi.averageConsumption.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{kpi.totalHours.toFixed(0)}h</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{kpi.recordCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Drivers View */}
          {activeView === 'drivers' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Fuel</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost/Hour</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg L/h</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Assets</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {driverKPIs.map((kpi) => (
                    <tr key={kpi.driverName} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{kpi.driverName}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{kpi.totalFuelQuantity.toFixed(1)}L</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">${kpi.totalCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                        ${kpi.costPerHour.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{kpi.averageConsumption.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{kpi.totalHours.toFixed(0)}h</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{kpi.assetsOperated}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{kpi.recordCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Farms View */}
          {activeView === 'farms' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm Location</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Fuel</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost/Hour</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg L/h</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Assets</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {farmKPIs.map((kpi) => (
                    <tr key={kpi.location} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{kpi.location}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{kpi.totalFuelQuantity.toFixed(1)}L</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">${kpi.totalCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                        ${kpi.costPerHour.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{kpi.averageConsumption.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{kpi.totalHours.toFixed(0)}h</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{kpi.assetsCount}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{kpi.recordCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuelAnalytics;
