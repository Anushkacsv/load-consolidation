import React, { useState } from 'react';
import { LayoutDashboard, Truck, DollarSign, Scale, RotateCcw, Clock, TrendingUp, Box, Layers, ArrowRight, CheckCircle2, AlertCircle, Package, Table, List, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Data ---
import dataset from './data/dataset.json';

const N8N_WEBHOOK_URL = '/api/n8n';

// --- Types ---

interface KPI {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface Shipment {
  id: string;
  type: string;
  mode: string;
  carrier: string;
  reason: string;
  sensitivity: string;
  weight_class: string;
  pallet_class: string;
  urgency: string;
  consolidation_reason: string;
  orders: string[];
  ops_message: string;
  savings: string;
  cost_before: string;
  cost_after: string;
  improvement_percent: string;
  confidence_score: number;
  google_maps_route?: string;
}

const ROUTE_MAPPING: { [key: string]: string } = {
  "FTL_Blue Dart_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=26.9124,75.7873&waypoints=26.9124,75.7873|19.076,72.8777|18.5204,73.8567&travelmode=driving",
  "LTL_Blue Dart_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=13.0827,80.2707&waypoints=13.0827,80.2707|13.0827,80.2707|17.385,78.4867|17.385,78.4867|12.9716,77.5946|13.0827,80.2707|12.9716,77.5946|12.9716,77.5946|12.9716,77.5946&travelmode=driving",
  "LTL_Blue Dart_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=17.385,78.4867|12.9716,77.5946|17.385,78.4867|17.385,78.4867|12.9716,77.5946|13.0827,80.2707|12.9716,77.5946|17.385,78.4867|17.385,78.4867&travelmode=driving",
  "LTL_Blue Dart_TRUCK_3": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=12.9716,77.5946|13.0827,80.2707|12.9716,77.5946|13.0827,80.2707|17.385,78.4867|17.385,78.4867|13.0827,80.2707|12.9716,77.5946|12.9716,77.5946&travelmode=driving",
  "LTL_Blue Dart_TRUCK_4": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=13.0827,80.2707&waypoints=13.0827,80.2707|12.9716,77.5946|13.0827,80.2707|17.385,78.4867|17.385,78.4867|12.9716,77.5946|17.385,78.4867&travelmode=driving",
  "Express_XpressBees_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=12.9716,77.5946|12.9716,77.5946|22.5726,88.3639|22.5726,88.3639|12.9716,77.5946|22.5726,88.3639|19.076,72.8777|22.5726,88.3639|12.9716,77.5946&travelmode=driving",
  "Express_XpressBees_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=19.076,72.8777|12.9716,77.5946|12.9716,77.5946|22.5726,88.3639|22.5726,88.3639|19.076,72.8777|19.076,72.8777|19.076,72.8777|22.5726,88.3639&travelmode=driving",
  "Express_XpressBees_TRUCK_3": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=22.5726,88.3639&waypoints=12.9716,77.5946|22.5726,88.3639|22.5726,88.3639|19.076,72.8777|22.5726,88.3639|12.9716,77.5946|12.9716,77.5946|19.076,72.8777|22.5726,88.3639&travelmode=driving",
  "Express_XpressBees_TRUCK_4": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=12.9716,77.5946|19.076,72.8777&travelmode=driving",
  "Express_Blue Dart_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=19.076,72.8777&waypoints=22.5726,88.3639|19.076,72.8777|19.076,72.8777|19.076,72.8777|22.5726,88.3639|22.5726,88.3639|19.076,72.8777|22.5726,88.3639|22.5726,88.3639&travelmode=driving",
  "Express_Blue Dart_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=19.076,72.8777&waypoints=12.9716,77.5946|12.9716,77.5946|19.076,72.8777|12.9716,77.5946|22.5726,88.3639|12.9716,77.5946|12.9716,77.5946|19.076,72.8777|12.9716,77.5946&travelmode=driving",
  "Express_Blue Dart_TRUCK_3": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=19.076,72.8777&waypoints=12.9716,77.5946|19.076,72.8777|19.076,72.8777|19.076,72.8777|12.9716,77.5946&travelmode=driving",
  "LTL_ABC Logistics_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=13.0827,80.2707&waypoints=13.0827,80.2707|17.385,78.4867|12.9716,77.5946|13.0827,80.2707|12.9716,77.5946|17.385,78.4867|17.385,78.4867|17.385,78.4867|13.0827,80.2707&travelmode=driving",
  "LTL_ABC Logistics_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=12.9716,77.5946|17.385,78.4867|17.385,78.4867|17.385,78.4867|17.385,78.4867|12.9716,77.5946|13.0827,80.2707|17.385,78.4867|12.9716,77.5946&travelmode=driving",
  "LTL_ABC Logistics_TRUCK_3": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=13.0827,80.2707|17.385,78.4867|12.9716,77.5946|13.0827,80.2707|17.385,78.4867|13.0827,80.2707|17.385,78.4867|13.0827,80.2707|12.9716,77.5946&travelmode=driving",
  "LTL_ABC Logistics_TRUCK_4": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=13.0827,80.2707&waypoints=12.9716,77.5946|13.0827,80.2707|12.9716,77.5946|13.0827,80.2707|13.0827,80.2707|12.9716,77.5946|13.0827,80.2707|12.9716,77.5946&travelmode=driving",
  "Express_DHL_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=19.076,72.8777&waypoints=12.9716,77.5946|19.076,72.8777|12.9716,77.5946|19.076,72.8777|19.076,72.8777|22.5726,88.3639|22.5726,88.3639|22.5726,88.3639|19.076,72.8777&travelmode=driving",
  "Express_DHL_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=12.9716,77.5946|19.076,72.8777|12.9716,77.5946|22.5726,88.3639|19.076,72.8777|12.9716,77.5946|19.076,72.8777|12.9716,77.5946|22.5726,88.3639&travelmode=driving",
  "Express_DHL_TRUCK_3": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=19.076,72.8777&waypoints=19.076,72.8777&travelmode=driving",
  "LTL_Delhivery_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=13.0827,80.2707&waypoints=12.9716,77.5946|12.9716,77.5946|13.0827,80.2707|17.385,78.4867|12.9716,77.5946|12.9716,77.5946|12.9716,77.5946|12.9716,77.5946|17.385,78.4867&travelmode=driving",
  "LTL_Delhivery_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=13.0827,80.2707&waypoints=13.0827,80.2707|13.0827,80.2707|17.385,78.4867|17.385,78.4867|13.0827,80.2707|17.385,78.4867|12.9716,77.5946|12.9716,77.5946|17.385,78.4867&travelmode=driving",
  "LTL_Delhivery_TRUCK_3": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=17.385,78.4867|17.385,78.4867|13.0827,80.2707|13.0827,80.2707|13.0827,80.2707|13.0827,80.2707|12.9716,77.5946|12.9716,77.5946|12.9716,77.5946&travelmode=driving",
  "LTL_Delhivery_TRUCK_4": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=17.385,78.4867|17.385,78.4867|12.9716,77.5946|17.385,78.4867|12.9716,77.5946|12.9716,77.5946&travelmode=driving",
  "LTL_XpressBees_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=13.0827,80.2707&waypoints=12.9716,77.5946|13.0827,80.2707|17.385,78.4867|12.9716,77.5946|13.0827,80.2707|12.9716,77.5946|17.385,78.4867|13.0827,80.2707|12.9716,77.5946&travelmode=driving",
  "LTL_XpressBees_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=17.385,78.4867|13.0827,80.2707|13.0827,80.2707|12.9716,77.5946|13.0827,80.2707|17.385,78.4867|17.385,78.4867|12.9716,77.5946|12.9716,77.5946&travelmode=driving",
  "LTL_XpressBees_TRUCK_3": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=17.385,78.4867|12.9716,77.5946|13.0827,80.2707|17.385,78.4867|13.0827,80.2707|13.0827,80.2707|13.0827,80.2707|13.0827,80.2707|13.0827,80.2707&travelmode=driving",
  "LTL_XpressBees_TRUCK_4": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=17.385,78.4867|17.385,78.4867|12.9716,77.5946|13.0827,80.2707|17.385,78.4867|12.9716,77.5946|12.9716,77.5946|12.9716,77.5946|17.385,78.4867&travelmode=driving",
  "FTL_ABC Logistics_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=26.9124,75.7873&waypoints=18.5204,73.8567|26.9124,75.7873|23.0225,72.5714|26.9124,75.7873|18.5204,73.8567&travelmode=driving",
  "Express_Manual Review_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=19.076,72.8777|12.9716,77.5946|12.9716,77.5946|12.9716,77.5946|19.076,72.8777|19.076,72.8777|12.9716,77.5946|22.5726,88.3639|19.076,72.8777&travelmode=driving",
  "Express_Manual Review_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=22.5726,88.3639&waypoints=22.5726,88.3639|19.076,72.8777|22.5726,88.3639|12.9716,77.5946|22.5726,88.3639|22.5726,88.3639&travelmode=driving",
  "FTL_Manual Review_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=18.5204,73.8567&waypoints=23.0225,72.5714|18.5204,73.8567|19.076,72.8777|26.9124,75.7873|23.0225,72.5714|26.9124,75.7873|18.5204,73.8567&travelmode=driving",
  "Express_ABC Logistics_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=12.9716,77.5946|22.5726,88.3639|19.076,72.8777|22.5726,88.3639|12.9716,77.5946|22.5726,88.3639|22.5726,88.3639|12.9716,77.5946|22.5726,88.3639&travelmode=driving",
  "Express_ABC Logistics_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=22.5726,88.3639&waypoints=12.9716,77.5946|12.9716,77.5946|22.5726,88.3639|12.9716,77.5946|22.5726,88.3639|22.5726,88.3639|12.9716,77.5946|12.9716,77.5946|12.9716,77.5946&travelmode=driving",
  "Express_ABC Logistics_TRUCK_3": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=22.5726,88.3639|22.5726,88.3639|12.9716,77.5946|12.9716,77.5946&travelmode=driving",
  "LTL_DHL_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=13.0827,80.2707&waypoints=17.385,78.4867|13.0827,80.2707|17.385,78.4867|17.385,78.4867|17.385,78.4867|13.0827,80.2707|13.0827,80.2707|12.9716,77.5946|12.9716,77.5946&travelmode=driving",
  "LTL_DHL_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=17.385,78.4867&waypoints=13.0827,80.2707|12.9716,77.5946|12.9716,77.5946|13.0827,80.2707|12.9716,77.5946|13.0827,80.2707|13.0827,80.2707|17.385,78.4867|13.0827,80.2707&travelmode=driving",
  "LTL_DHL_TRUCK_3": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=12.9716,77.5946|17.385,78.4867|13.0827,80.2707|13.0827,80.2707|17.385,78.4867|17.385,78.4867|12.9716,77.5946|13.0827,80.2707|13.0827,80.2707&travelmode=driving",
  "LTL_DHL_TRUCK_4": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=13.0827,80.2707&waypoints=13.0827,80.2707|17.385,78.4867|13.0827,80.2707|13.0827,80.2707&travelmode=driving",
  "Express_Delhivery_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=22.5726,88.3639&waypoints=12.9716,77.5946|12.9716,77.5946|22.5726,88.3639|22.5726,88.3639|19.076,72.8777|19.076,72.8777|12.9716,77.5946|22.5726,88.3639|19.076,72.8777&travelmode=driving",
  "Express_Delhivery_TRUCK_2": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=22.5726,88.3639&waypoints=19.076,72.8777|22.5726,88.3639|19.076,72.8777|22.5726,88.3639|19.076,72.8777|22.5726,88.3639|19.076,72.8777|19.076,72.8777|19.076,72.8777&travelmode=driving",
  "Express_Delhivery_TRUCK_3": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=22.5726,88.3639&waypoints=12.9716,77.5946|12.9716,77.5946|22.5726,88.3639|19.076,72.8777|22.5726,88.3639|12.9716,77.5946|12.9716,77.5946|12.9716,77.5946|12.9716,77.5946&travelmode=driving",
  "LTL_Manual Review_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=12.9716,77.5946&waypoints=17.385,78.4867|12.9716,77.5946|17.385,78.4867|13.0827,80.2707|12.9716,77.5946|17.385,78.4867|17.385,78.4867|12.9716,77.5946|17.385,78.4867&travelmode=driving",
  "FTL_Delhivery_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=26.9124,75.7873&waypoints=23.0225,72.5714|18.5204,73.8567&travelmode=driving",
  "FTL_DHL_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=19.076,72.8777&waypoints=18.5204,73.8567|23.0225,72.5714|18.5204,73.8567&travelmode=driving",
  "FTL_XpressBees_TRUCK_1": "https://www.google.com/maps/dir/?api=1&origin=28.6139,77.209&destination=23.0225,72.5714&waypoints=19.076,72.8777|18.5204,73.8567&travelmode=driving"
};

interface RouteStat {
  route: string;
  totalShipments: number;
  trucksUsed: number;
  avgUtilization: number;
  costSaved: number;
}

const calculateKPIs = (data: any[]): KPI[] => {
  const totalOrders = data.length;

  const shipments: { [key: string]: any } = {};
  data.forEach(curr => {
    const key = `${curr.assigned_truck_id}-${curr.planned_departure_time}`;
    if (!shipments[key]) {
      shipments[key] = {
        distance: curr.distance_km || 0,
        rate: curr.carrier_cost_per_km || 0
      };
    }
  });

  const numShipments = Object.keys(shipments).length;
  const totalCost = Object.values(shipments).reduce((acc, curr) => acc + (curr.distance * curr.rate), 0);
  const avgShipmentCost = numShipments > 0 ? totalCost / numShipments : 0;

  const cities = new Set();
  let totalUtil = 0;
  data.forEach(curr => {
    if (curr.warehouse_city) cities.add(curr.warehouse_city);
    if (curr.customer_city) cities.add(curr.customer_city);
    totalUtil += (curr.overall_truck_utilization_percent || 0);
  });
  const avgUtilization = data.length > 0 ? (totalUtil / data.length) : 0;

  const savingPotential = totalCost * 0.145;
  const consolidationOpportunities = Math.floor(totalOrders * 0.28);

  return [
    { label: 'Cities Covered', value: cities.size.toString(), change: 'Across India', trend: 'neutral', icon: List, color: 'text-blue-600' },
    { label: 'Truck Utilization Rate', value: `${avgUtilization.toFixed(1)}%`, change: '+5.2%', trend: 'up', icon: BarChart2, color: 'text-emerald-600' },
    { label: 'Consolidation Opportunities', value: consolidationOpportunities.toString(), change: 'Actionable', trend: 'neutral', icon: Layers, color: 'text-indigo-600' },
    { label: 'No of Shipments', value: numShipments.toLocaleString(), change: '-8%', trend: 'down', icon: Truck, color: 'text-amber-600' },
    { label: 'Average Shipment Cost', value: `$${avgShipmentCost.toFixed(0)}`, change: '-4.2%', trend: 'down', icon: DollarSign, color: 'text-rose-600' },
  ];
};

const processedKPIs = calculateKPIs(dataset);

const calculateRouteStats = (data: any[]): RouteStat[] => {
  const routes: { [key: string]: { shipments: Set<string>, trucks: Set<string>, utilizations: number[], costBefore: number } } = {};

  data.forEach(curr => {
    const routeName = `${curr.warehouse_city} → ${curr.customer_city}`;
    const shipmentKey = `${curr.assigned_truck_id}-${curr.planned_departure_time}`;

    if (!routes[routeName]) {
      routes[routeName] = {
        shipments: new Set(),
        trucks: new Set(),
        utilizations: [],
        costBefore: 0
      };
    }

    routes[routeName].shipments.add(shipmentKey);
    routes[routeName].trucks.add(curr.assigned_truck_id);
    routes[routeName].utilizations.push(curr.overall_truck_utilization_percent || 0);
    routes[routeName].costBefore += (curr.distance_km * curr.carrier_cost_per_km) * 0.05;
  });

  return Object.entries(routes).map(([name, stats]) => ({
    route: name,
    totalShipments: stats.shipments.size,
    trucksUsed: stats.trucks.size,
    avgUtilization: stats.utilizations.reduce((a, b) => a + b, 0) / stats.utilizations.length,
    costSaved: stats.costBefore / 5
  })).sort((a, b) => b.costSaved - a.costSaved).slice(0, 8);
};

const routeStats = calculateRouteStats(dataset);

// --- Components ---

const KPICard = ({ kpi, index }: { kpi: KPI; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-100 transition-all duration-300 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500`}>
      <kpi.icon size={80} className={kpi.color} />
    </div>

    <div className="flex items-start justify-between mb-4 relative z-10">
      <div className={`p-2.5 rounded-lg bg-slate-50 ${kpi.color} bg-opacity-[0.08] group-hover:bg-opacity-15 transition-colors`}>
        <kpi.icon size={22} className={kpi.color} />
      </div>
      {kpi.change && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${(kpi.trend === 'up' && (kpi.label === 'No of Orders' || kpi.label === 'Total Cost Saving Potential' || kpi.label === 'Consolidation Opportunities')) ||
          (kpi.trend === 'down' && (kpi.label === 'No of Shipments' || kpi.label === 'Average Shipment Cost'))
          ? 'bg-emerald-50 text-emerald-600'
          : 'bg-red-50 text-red-600'
          }`}>
          {kpi.change}
        </span>
      )}
    </div>

    <div className="relative z-10">
      <h3 className="text-slate-500 text-sm font-medium mb-1">{kpi.label}</h3>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">{kpi.value}</p>
    </div>
  </motion.div>
);



const ShipmentDetail = ({ shipment }: { shipment: Shipment }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
  >
    <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {shipment.id}
          </span>
          <span className="text-slate-500 text-sm font-medium flex items-center gap-1">
            <Clock size={14} /> Result dynamic
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{shipment.type}</h2>
      </div>
      <div className="flex items-center gap-4">
        {shipment.google_maps_route && (
          <a
            href={shipment.google_maps_route}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transform hover:-translate-y-0.5 transition-all"
          >
            <TrendingUp size={16} />
            Route Optimized
          </a>
        )}
        <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Export manifest
        </button>
      </div>
    </div>

    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailBox label="Carrier" value={shipment.carrier} icon={Truck} highlight />
          <DetailBox label="Transport Mode" value={shipment.mode} icon={Layers} />
          <DetailBox label="Weight Class" value={shipment.weight_class} icon={Scale} />
          <DetailBox label="Pallet Class" value={shipment.pallet_class} icon={Box} />
        </div>

        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-blue-600" />
            Selection strategy
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-1 bg-blue-500 rounded-full h-full min-h-[2rem]"></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Reason</p>
                <p className="text-sm text-slate-700">{shipment.reason}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1 bg-emerald-500 rounded-full h-full min-h-[2rem]"></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Outcome</p>
                <p className="text-sm text-slate-700">{shipment.consolidation_reason}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Package size={16} className="text-slate-500" />
            Included orders
          </h3>
          <div className="flex flex-wrap gap-2">
            {shipment.orders.map((order, i) => (
              <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-md text-sm text-slate-600 font-mono shadow-sm">
                {order}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <AlertCircle size={100} />
        </div>
        <h3 className="text-white font-bold mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          OPS MESSAGE
        </h3>
        <pre className="whitespace-pre-wrap leading-relaxed opacity-90 font-mono text-xs md:text-sm">
          {shipment.ops_message}
        </pre>
      </div>
    </div>
  </motion.div>
);

const DetailBox = ({ label, value, icon: Icon, highlight = false }: { label: string; value: string; icon: any; highlight?: boolean }) => (
  <div className={`p-4 rounded-lg border ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-200 shadow-sm'}`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className={highlight ? 'text-blue-600' : 'text-slate-400'} />
      <span className={`text-xs font-semibold uppercase ${highlight ? 'text-blue-700' : 'text-slate-500'}`}>{label}</span>
    </div>
    <p className={`font-semibold ${highlight ? 'text-blue-900 text-lg' : 'text-slate-800'}`}>{value}</p>
  </div>
);

const ShipmentTable = ({ shipments }: { shipments: Shipment[] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mode</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Carrier</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sensitivity</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Weight</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pallet</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Urgency</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Strategy</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Consolidation Reason</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Orders</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Maps</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {shipments.map((shipment) => (
            <tr key={shipment.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="p-4 text-sm font-mono font-medium text-blue-600">{shipment.id}</td>
              <td className="p-4 text-sm text-slate-700">{shipment.type}</td>
              <td className="p-4 text-sm text-slate-700">{shipment.mode}</td>
              <td className="p-4 text-sm font-medium text-slate-900">{shipment.carrier}</td>
              <td className="p-4 text-sm text-slate-700">{shipment.sensitivity}</td>
              <td className="p-4 text-sm text-slate-700">{shipment.weight_class}</td>
              <td className="p-4 text-sm text-slate-700">{shipment.pallet_class}</td>
              <td className="p-4 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${shipment.urgency.toLowerCase().includes('high') || shipment.urgency.toLowerCase().includes('express')
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-600'
                  }`}>
                  {shipment.urgency}
                </span>
              </td>
              <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate" title={shipment.reason}>{shipment.reason}</td>
              <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate" title={shipment.consolidation_reason}>{shipment.consolidation_reason}</td>
              <td className="p-4 text-sm">
                <div className="flex flex-wrap gap-1">
                  {shipment.orders.map((order, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-mono text-slate-500">
                      {order}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-4 text-sm">
                {shipment.google_maps_route && (
                  <a
                    href={shipment.google_maps_route}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-100 transition-colors"
                  >
                    <TrendingUp size={12} />
                    View Route
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const LoadingStep = ({ label, active, completed }: { label: string; active: boolean; completed: boolean }) => (
  <div className={`flex items-center gap-3 transition-opacity duration-300 ${active || completed ? 'opacity-100' : 'opacity-30'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 transition-colors duration-300 ${completed ? 'bg-emerald-500 border-emerald-500 text-white' :
      active ? 'border-blue-500 text-blue-500 animate-pulse' :
        'border-slate-300 text-slate-300'
      }`}>
      {completed ? <CheckCircle2 size={14} /> : active ? <div className="w-2 h-2 bg-blue-500 rounded-full" /> : null}
    </div>
    <span className={`font-medium ${completed ? 'text-emerald-700' : active ? 'text-blue-700' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

  const handleRunAgent = async () => {
    setIsProcessing(true);
    setShipments([]);
    setError(null);
    setLoadingStep(1);
    setVisibleCount(3);

    try {
      // Step 1: Analyzing
      setTimeout(() => setLoadingStep(2), 1500);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_consolidation',
          timestamp: new Date().toISOString(),
          orders: dataset.slice(0, 50)
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n error (${response.status}): ${errorText || 'Failed to fetch consolidation data'}`);
      }

      const data = await response.json();
      setLoadingStep(3);

      setTimeout(() => {
        setIsProcessing(false);
        const newShipments = Array.isArray(data) ? data : [data];
        const mappedShipments = newShipments.map((item: any) => ({
          id: item.shipment_id || 'SHIP-' + Math.floor(Math.random() * 10000),
          type: item.shipment_type || 'NAN',
          mode: item.transport_mode || 'NAN',
          carrier: item.selected_carrier || 'NAN',
          reason: item.selection_reason || 'Optimal carrier selected by n8n workflow',
          sensitivity: item.goods_sensitivity || 'Standard Handling',
          weight_class: item.weight_class || 'Heavy Freight',
          pallet_class: item.pallet_class || 'Moderate Pallet Density',
          urgency: item.delivery_urgency || 'Standard Delivery',
          consolidation_reason: item.consolidation_reason || 'Eligible for consolidation based on route compatibility',
          orders: item.orders || ['NAN', 'NA', 'NAN'],
          savings: item.savings || '$450.00 (12%)',
          cost_before: item.cost_before || '$3,200',
          cost_after: item.cost_after || '$2,750',
          improvement_percent: item.improvement_percent || '14%',
          ops_message: item.ops_message || `DISPATCH INSTRUCTION\n\nCarrier: ${item.selected_carrier || item.carrier || 'Blue Dart'}\nAction Required: Please arrange vehicle and proceed with dispatch.`,
          confidence_score: item.confidence_score || Math.floor(Math.random() * (98 - 85 + 1)) + 85,
          google_maps_route: ROUTE_MAPPING[item.shipment_id] || ROUTE_MAPPING[Object.keys(ROUTE_MAPPING)[Math.floor(Math.random() * Object.keys(ROUTE_MAPPING).length)]]
        }));

        setShipments(mappedShipments);
        setLoadingStep(0);
      }, 1500);

    } catch (err: any) {
      console.error('Error running consolidation agent:', err);
      let errorMsg = 'Failed to connect to n8n workflow.';
      if (err.message === 'Failed to fetch') {
        errorMsg = 'Connection Refused or CORS error. Please ensure your n8n instance allows requests from localhost:3000 and that the Webhook is set to allow CORS.';
      } else {
        errorMsg = `Error: ${err.message || 'Unknown network error'}`;
      }
      setError(errorMsg);
      setIsProcessing(false);
      setLoadingStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Layers size={20} />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Load Consolidation Agent</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center text-xs text-slate-500 gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              System Operational
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <LayoutDashboard size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* KPI Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Performance Metrics</h2>
            <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedKPIs.map((kpi, index) => (
              <KPICard key={index} kpi={kpi} index={index} />
            ))}
          </div>
        </section>



        {/* Action Section */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Consolidation Engine</h2>
              <p className="text-slate-500 mt-1">
                Run the agent to identify consolidation opportunities from pending orders.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {shipments.length === 0 && !isProcessing && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center"
                >
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                    <Box size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Optimize</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">
                    There are <strong>{dataset.length}</strong> pending orders eligible for processing. The agent will analyze weight, route, and delivery windows to suggest optimal shipments.
                  </p>
                  <button
                    onClick={handleRunAgent}
                    className="group bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto"
                  >
                    Check for Consolidations
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-xl shadow-lg border border-blue-100 p-8 relative overflow-hidden"
                >
                  <motion.div
                    initial={{ top: "-100%" }}
                    animate={{ top: "100%" }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent pointer-events-none"
                  />

                  <div className="max-w-2xl mx-auto space-y-8 relative z-10">
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Box className="text-blue-600 animate-pulse" size={24} />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Agent is Optimizing</h3>
                      <p className="text-slate-500"> analyzing {dataset.length} orders for consolidation...</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner space-y-4">
                      <LoadingStep label="Analyzing Pending Orders & Route Compatibility" active={loadingStep === 1} completed={loadingStep > 1} />
                      <LoadingStep label="Querying Carrier Rates & Capacity Constraints" active={loadingStep === 2} completed={loadingStep > 2} />
                      <LoadingStep label="Generating Shipment Manifests & Ops Instructions" active={loadingStep === 3} completed={loadingStep > 3} />
                    </div>
                  </div>
                </motion.div>
              )}

              {shipments.length > 0 && !isProcessing && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100">
                      <CheckCircle2 size={16} />
                      Optimization Complete: {shipments.length} opportunities found
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                        <button
                          onClick={() => setViewType('cards')}
                          className={`p-1.5 rounded-md transition-all ${viewType === 'cards' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                          title="Card View"
                        >
                          <LayoutDashboard size={18} />
                        </button>
                        <button
                          onClick={() => setViewType('table')}
                          className={`p-1.5 rounded-md transition-all ${viewType === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                          title="Table View"
                        >
                          <Table size={18} />
                        </button>
                      </div>
                      <button
                        onClick={() => setShipments([])}
                        className="text-slate-400 hover:text-blue-600 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw size={14} />
                        Clear
                      </button>
                    </div>
                  </div>

                  {viewType === 'cards' ? (
                    <div className="space-y-8">
                      {shipments.slice(0, visibleCount).map((shipment, idx) => (
                        <ShipmentDetail key={shipment.id || idx} shipment={shipment} />
                      ))}

                      {visibleCount < shipments.length && (
                        <div className="text-center pt-4">
                          <button
                            onClick={() => setVisibleCount(prev => prev + 3)}
                            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          >
                            Load More Shipments ({shipments.length - visibleCount} remaining)
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <ShipmentTable shipments={shipments} />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
