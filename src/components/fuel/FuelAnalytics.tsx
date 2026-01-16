import
  {
    BarChart3,
    Calendar,
    DollarSign,
    Droplet,
    FileText,
    Filter,
    TrendingDown,
    TrendingUp,
    Users,
  } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Asset, FuelRecord } from '../../types/database';
import { exportFuelRecordsToExcel } from '../../utils/fuelExcelUtils';
import { DateInput } from '../ui/DateInput';

interface FuelAnalyticsProps {
  fuelRecords: FuelRecord[];
  assets: Asset[];
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

export const FuelAnalytics: React.FC<FuelAnalyticsProps> = ({ fuelRecords, assets }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    assetId: '',
    driverId: '',
    farmLocation: '',
    dateFrom: '',
    dateTo: '',
    fuelType: '',
  });

  const [activeView, setActiveView] = useState<'overview' | 'assets' | 'drivers' | 'farms'>('overview');

  // Unique filter options
  const uniqueDrivers = useMemo(() => {
    return [...new Set(fuelRecords.map(r => r.driver_name).filter((d): d is string => Boolean(d)))].sort();
  }, [fuelRecords]);

  const uniqueLocations = useMemo(() => {
    const fromAssets = assets.map(a => a.location).filter((l): l is string => Boolean(l));
    const fromRecords = fuelRecords.map(r => r.location).filter((l): l is string => Boolean(l));
    return [...new Set([...fromAssets, ...fromRecords])].sort();
  }, [assets, fuelRecords]);

  const uniqueFuelTypes = useMemo(() => {
    return [...new Set(fuelRecords.map(r => r.fuel_type))].sort();
  }, [fuelRecords]);

  // Filtered records with improved date handling
  const filteredRecords = useMemo(() => {
    return fuelRecords.filter(record => {
      if (filters.assetId && record.asset_id !== filters.assetId) return false;
      if (filters.driverId && record.driver_name !== filters.driverId) return false;
      if (filters.fuelType && record.fuel_type !== filters.fuelType) return false;

      if (filters.farmLocation) {
        const asset = assets.find(a => a.id === record.asset_id);
        const location = asset?.location || record.location || '';
        if (location !== filters.farmLocation) return false;
      }

      const recordDateStr = record.filling_date || record.date || '';
      if (!recordDateStr) return true;

      const recordDate = new Date(recordDateStr);
      if (isNaN(recordDate.getTime())) return true;

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (recordDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (recordDate > endOfDay) return false;
      }

      return true;
    });
  }, [fuelRecords, assets, filters]);

  // Asset KPIs
  const assetKPIs = useMemo(() => {
    const map = new Map<string, AssetKPI>();

    filteredRecords.forEach(r => {
      const asset = assets.find(a => a.id === r.asset_id);
      if (!asset) return;

      const kpi = map.get(asset.id) ?? {
        assetId: asset.id,
        assetName: asset.name,
        totalFuelQuantity: 0,
        totalCost: 0,
        averageConsumption: 0,
        costPerHour: 0,
        totalHours: 0,
        recordCount: 0,
        averageFuelEfficiency: 0,
      };

      kpi.totalFuelQuantity += r.quantity;
      kpi.totalCost += r.cost;
      kpi.recordCount += 1;
      if (r.hour_difference) kpi.totalHours += r.hour_difference;

      map.set(asset.id, kpi);
    });

    return Array.from(map.values())
      .map(kpi => {
        kpi.averageConsumption = kpi.totalHours ? kpi.totalFuelQuantity / kpi.totalHours : 0;
        kpi.costPerHour = kpi.totalHours ? kpi.totalCost / kpi.totalHours : 0;
        kpi.averageFuelEfficiency = kpi.averageConsumption ? 1 / kpi.averageConsumption : 0;
        return kpi;
      })
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredRecords, assets]);

  // Driver KPIs
  const driverKPIs = useMemo(() => {
    const map = new Map<string, DriverKPI>();

    filteredRecords.forEach(r => {
      if (!r.driver_name) return;
      const kpi = map.get(r.driver_name) ?? {
        driverName: r.driver_name,
        totalFuelQuantity: 0,
        totalCost: 0,
        averageConsumption: 0,
        costPerHour: 0,
        totalHours: 0,
        recordCount: 0,
        assetsOperated: 0,
      };

      kpi.totalFuelQuantity += r.quantity;
      kpi.totalCost += r.cost;
      kpi.recordCount += 1;
      if (r.hour_difference) kpi.totalHours += r.hour_difference;

      map.set(r.driver_name, kpi);
    });

    return Array.from(map.values())
      .map(kpi => {
        const driverRecords = filteredRecords.filter(r => r.driver_name === kpi.driverName);
        kpi.assetsOperated = new Set(driverRecords.map(r => r.asset_id)).size;
        kpi.averageConsumption = kpi.totalHours ? kpi.totalFuelQuantity / kpi.totalHours : 0;
        kpi.costPerHour = kpi.totalHours ? kpi.totalCost / kpi.totalHours : 0;
        return kpi;
      })
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredRecords]);

  // Farm KPIs
  const farmKPIs = useMemo(() => {
    const map = new Map<string, FarmKPI>();

    filteredRecords.forEach(r => {
      const asset = assets.find(a => a.id === r.asset_id);
      const location = asset?.location || r.location || 'Unknown';

      const kpi = map.get(location) ?? {
        location,
        totalFuelQuantity: 0,
        totalCost: 0,
        averageConsumption: 0,
        costPerHour: 0,
        totalHours: 0,
        recordCount: 0,
        assetsCount: 0,
      };

      kpi.totalFuelQuantity += r.quantity;
      kpi.totalCost += r.cost;
      kpi.recordCount += 1;
      if (r.hour_difference) kpi.totalHours += r.hour_difference;

      map.set(location, kpi);
    });

    return Array.from(map.values())
      .map(kpi => {
        const locationRecords = filteredRecords.filter(r => {
          const a = assets.find(a => a.id === r.asset_id);
          return (a?.location || r.location || 'Unknown') === kpi.location;
        });

        kpi.assetsCount = new Set(locationRecords.map(r => r.asset_id)).size;
        kpi.averageConsumption = kpi.totalHours ? kpi.totalFuelQuantity / kpi.totalHours : 0;
        kpi.costPerHour = kpi.totalHours ? kpi.totalCost / kpi.totalHours : 0;
        return kpi;
      })
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredRecords, assets]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalQuantity = filteredRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalCost = filteredRecords.reduce((sum, r) => sum + r.cost, 0);
    const totalHours = filteredRecords.reduce((sum, r) => sum + (r.hour_difference ?? 0), 0);

    const avgConsumption = totalHours ? totalQuantity / totalHours : 0;
    const costPerHours = assetKPIs.map(k => k.costPerHour).filter(v => v > 0);

    return {
      totalQuantity,
      totalCost,
      totalHours,
      avgConsumption,
      costPerHour: totalHours ? totalCost / totalHours : 0,
      highestCostPerHour: costPerHours.length ? Math.max(...costPerHours) : 0,
      lowestCostPerHour: costPerHours.length ? Math.min(...costPerHours) : 0,
      recordCount: filteredRecords.length,
    };
  }, [filteredRecords, assetKPIs]);

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  const handleClearFilters = () => {
    setFilters({
      assetId: '',
      driverId: '',
      farmLocation: '',
      dateFrom: '',
      dateTo: '',
      fuelType: '',
    });
  };

  const handleExportReport = () => {
    exportFuelRecordsToExcel(filteredRecords, assets);
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>

          <div className="flex gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear all
              </button>
            )}
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <FileText size={16} />
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Asset</label>
            <select
              value={filters.assetId}
              onChange={e => setFilters(prev => ({ ...prev, assetId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">All Assets</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Driver</label>
            <select
              value={filters.driverId}
              onChange={e => setFilters(prev => ({ ...prev, driverId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">All Drivers</option>
              {uniqueDrivers.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <select
              value={filters.farmLocation}
              onChange={e => setFilters(prev => ({ ...prev, farmLocation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fuel Type</label>
            <select
              value={filters.fuelType}
              onChange={e => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">All Types</option>
              {uniqueFuelTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date From</label>
            <DateInput
              value={filters.dateFrom}
              onChange={val => setFilters(prev => ({ ...prev, dateFrom: val }))}
              placeholder="Start date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date To</label>
            <DateInput
              value={filters.dateTo}
              onChange={val => setFilters(prev => ({ ...prev, dateTo: val }))}
              placeholder="End date"
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
              <p className="text-2xl font-bold text-gray-900">{summaryMetrics.totalQuantity.toFixed(1)} L</p>
              <p className="text-xs text-gray-500 mt-1">{summaryMetrics.recordCount} records</p>
            </div>
            <Droplet className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">R {summaryMetrics.totalCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">R {summaryMetrics.costPerHour.toFixed(2)}/hr avg</p>
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
              <p className="text-2xl font-bold text-gray-900">R {summaryMetrics.highestCostPerHour.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Low: R {summaryMetrics.lowestCostPerHour.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeView === 'overview'
                  ? 'border-b-3 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:border-b-3 hover:border-gray-300'
              }`}
            >
              <BarChart3 size={16} />
              Overview
            </button>

            <button
              onClick={() => setActiveView('assets')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeView === 'assets'
                  ? 'border-b-3 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:border-b-3 hover:border-gray-300'
              }`}
            >
              <Calendar size={16} />
              By Asset ({assetKPIs.length})
            </button>

            <button
              onClick={() => setActiveView('drivers')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeView === 'drivers'
                  ? 'border-b-3 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:border-b-3 hover:border-gray-300'
              }`}
            >
              <Users size={16} />
              By Driver ({driverKPIs.length})
            </button>

            <button
              onClick={() => setActiveView('farms')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeView === 'farms'
                  ? 'border-b-3 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:border-b-3 hover:border-gray-300'
              }`}
            >
              <Calendar size={16} />
              By Farm ({farmKPIs.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overview */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Summary Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-5 bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-3">Top 5 Assets by Cost</h4>
                  <div className="space-y-2">
                    {assetKPIs.slice(0, 5).map((kpi, idx) => (
                      <div key={kpi.assetId} className="flex justify-between text-sm">
                        <span className="text-gray-700">{idx + 1}. {kpi.assetName}</span>
                        <span className="font-medium">R {kpi.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                    {assetKPIs.length === 0 && <p className="text-gray-500 text-sm">No data available</p>}
                  </div>
                </div>

                <div className="border rounded-lg p-5 bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-3">Top 5 Drivers by Cost</h4>
                  <div className="space-y-2">
                    {driverKPIs.slice(0, 5).map((kpi, idx) => (
                      <div key={kpi.driverName} className="flex justify-between text-sm">
                        <span className="text-gray-700">{idx + 1}. {kpi.driverName}</span>
                        <span className="font-medium">R {kpi.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                    {driverKPIs.length === 0 && <p className="text-gray-500 text-sm">No data available</p>}
                  </div>
                </div>

                <div className="border rounded-lg p-5 bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-3">Farms by Cost</h4>
                  <div className="space-y-2">
                    {farmKPIs.slice(0, 8).map((kpi, idx) => (
                      <div key={kpi.location} className="flex justify-between text-sm">
                        <span className="text-gray-700">{idx + 1}. {kpi.location}</span>
                        <span className="font-medium">R {kpi.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                    {farmKPIs.length === 0 && <p className="text-gray-500 text-sm">No data available</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assets Table */}
          {activeView === 'assets' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fuel</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Hour</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg L/h</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assetKPIs.map(kpi => (
                    <tr key={kpi.assetId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{kpi.assetName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{kpi.totalFuelQuantity.toFixed(1)} L</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">R {kpi.totalCost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">R {kpi.costPerHour.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{kpi.averageConsumption.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{kpi.totalHours.toFixed(0)} h</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{kpi.recordCount}</td>
                    </tr>
                  ))}
                  {assetKPIs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No asset data available for the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Drivers Table */}
          {activeView === 'drivers' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fuel</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Hour</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg L/h</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Assets</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {driverKPIs.map(kpi => (
                    <tr key={kpi.driverName} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{kpi.driverName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{kpi.totalFuelQuantity.toFixed(1)} L</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">R {kpi.totalCost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">R {kpi.costPerHour.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{kpi.averageConsumption.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{kpi.totalHours.toFixed(0)} h</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{kpi.assetsOperated}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{kpi.recordCount}</td>
                    </tr>
                  ))}
                  {driverKPIs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No driver data available for the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Farms Table */}
          {activeView === 'farms' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fuel</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Hour</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg L/h</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Assets</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {farmKPIs.map(kpi => (
                    <tr key={kpi.location} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{kpi.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{kpi.totalFuelQuantity.toFixed(1)} L</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">R {kpi.totalCost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">R {kpi.costPerHour.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{kpi.averageConsumption.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{kpi.totalHours.toFixed(0)} h</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{kpi.assetsCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{kpi.recordCount}</td>
                    </tr>
                  ))}
                  {farmKPIs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No farm/location data available for the current filters
                      </td>
                    </tr>
                  )}
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