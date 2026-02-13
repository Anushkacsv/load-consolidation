import { useState } from 'react';
import {
  LayoutDashboard, Truck, DollarSign, Scale, RotateCcw, Clock,
  TrendingUp, Box, Layers, ArrowRight, CheckCircle2, AlertCircle,
  Package, Table, List, BarChart2, Menu, X, ChevronRight,
  MapPin, PieChart as PieIcon, Activity, Zap, MoreHorizontal,
  Calendar, ArrowUpRight, Bell, Send, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Cell, Pie
} from 'recharts';

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

  const totalSavings = totalCost * 0.124;

  return [
    { label: 'Total Orders', value: totalOrders.toLocaleString(), change: 'Across India', trend: 'neutral', icon: List, color: 'text-blue-600' },
    { label: 'Avg Truck Uitilized', value: `${avgUtilization.toFixed(1)}%`, change: '+5.2%', trend: 'up', icon: BarChart2, color: 'text-emerald-600' },
    { label: 'Consolidation Ops', value: consolidationOpportunities.toString(), change: 'Actionable', trend: 'neutral', icon: Layers, color: 'text-indigo-600' },
    { label: 'Total Shipments', value: numShipments.toLocaleString(), change: '-8%', trend: 'down', icon: Truck, color: 'text-amber-600' },
    { label: 'Avg Ship Cost', value: `$${avgShipmentCost.toFixed(0)}`, change: '-4.2%', trend: 'down', icon: DollarSign, color: 'text-rose-600' },
    { label: 'Potential Savings', value: `$${totalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, change: '14.5%', trend: 'up', icon: TrendingUp, color: 'text-violet-600' },
  ];
};

const PendingOptimizationQueue = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Pending Optimization Queue</h3>
          <p className="text-slate-500 text-xs font-medium mt-0.5 flex items-center gap-2">
            <Zap size={14} className="text-blue-600" />
            AI-identified routes ready for immediate consolidation
          </p>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package size={14} />
                  Order ID
                </div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  Route (Origin → Dest)
                </div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale size={14} />
                  Weight
                </div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <List size={14} />
                  Items
                </div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Box size={14} />
                  Volume
                </div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  Delivery
                </div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <TrendingUp size={14} />
                  Potential Savings
                </div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.slice(0, 6).map((order, i) => {
              const weight = order.order_weight_kg;
              const volume = order.order_volume_cbm;
              const deliveryDate = new Date(order.planned_delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const priority = order.customer_priority.toUpperCase();
              const savings = weight * 0.15;

              return (
                <tr key={i} className="hover:bg-blue-50/30 transition-all group cursor-default">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-blue-600 text-sm tracking-tight">{order.order_id}</span>
                      <span className={`text-[10px] font-black tracking-wider w-fit mt-1 px-1.5 py-0.5 rounded ${priority === 'EXPRESS' ? 'text-rose-600 bg-rose-50 border border-rose-100' :
                        priority === 'HIGH' ? 'text-amber-600 bg-amber-50 border border-amber-100' :
                          'text-slate-500 bg-slate-50 border border-slate-100'
                        }`}>
                        {priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold">{order.warehouse_city}</span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                      <span className="text-slate-900 font-bold">{order.customer_city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-bold text-sm tracking-tight">{weight.toLocaleString()} kg</span>
                      <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500/30" style={{ width: `${Math.min(100, (weight / 5000) * 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-bold text-sm tracking-tight">{order.quantity.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase font-black">Units</span></span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">{order.order_pallet_count} Pallets</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-bold text-sm">{volume.toFixed(1)} <span className="text-[10px] text-slate-400 uppercase ml-0.5">cu m</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                      <span>{deliveryDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-emerald-600 font-black text-lg leading-none italic tracking-tight">
                        +${savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                        Est. Savings
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 flex items-center gap-2 ml-auto shadow-sm">
                      Optimize
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
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
    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg border border-slate-100 hover:border-blue-100 transition-all duration-300 relative overflow-hidden group"
  >
    {/* Subtle Background Icon - Moved to Bottom Right & Cleaned Up */}
    <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none transform rotate-12 group-hover:scale-110 group-hover:rotate-6">
      <kpi.icon size={120} className="text-slate-800" strokeWidth={1.5} />
    </div>

    <div className="flex items-start justify-between mb-4 relative z-10">
      <div className={`p-3 rounded-xl bg-slate-50 ${kpi.color} bg-opacity-[0.1] group-hover:bg-opacity-20 transition-colors shadow-sm`}>
        <kpi.icon size={24} className={kpi.color} />
      </div>
      {kpi.change && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${(kpi.trend === 'up' && kpi.label !== 'Total Orders' && kpi.label !== 'Consolidation Ops') ||
          (kpi.trend === 'down' && (kpi.label === 'Total Shipments' || kpi.label === 'Avg Ship Cost'))
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
          : (kpi.trend === 'down' && kpi.label !== 'Total Shipments' && kpi.label !== 'Avg Ship Cost')
            ? 'bg-red-50 text-red-700 border-red-100'
            : kpi.trend === 'neutral'
              ? 'bg-blue-50 text-blue-700 border-blue-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
          {kpi.change}
        </span>
      )}
    </div>

    <div className="relative z-10">
      <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 truncate">{kpi.label}</h3>
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{kpi.value}</p>
    </div>
  </motion.div>
);

const LineChartCard = () => {
  const chartData = [
    { name: 'Mon', usage: 45, cost: 82 }, { name: 'Tue', usage: 52, cost: 78 },
    { name: 'Wed', usage: 48, cost: 85 }, { name: 'Thu', usage: 61, cost: 72 },
    { name: 'Fri', usage: 55, cost: 75 }, { name: 'Sat', usage: 58.8, cost: 68 },
    { name: 'Sun', usage: 54, cost: 70 },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Network Efficiency Trend</h3>
          <div className="flex items-center gap-6">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              Utilization: <span className="font-bold text-emerald-600 text-lg">58.8%</span>
            </p>
            <p className="text-sm text-slate-500 flex items-center gap-2 border-l border-slate-200 pl-6">
              Cost/Ton: <span className="font-bold text-blue-600 text-lg">$68.2</span>
            </p>
          </div>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
          <Activity size={24} />
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="$" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area yAxisId="left" type="monotone" dataKey="usage" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" name="Usage %" />
            <Area yAxisId="right" type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" name="Cost/Ton" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const OrderOverview = ({ data }: { data: any[] }) => {
  // Aggregate Top Cities
  const cityCounts: { [key: string]: number } = {};
  data.forEach(d => { if (d.customer_city) cityCounts[d.customer_city] = (cityCounts[d.customer_city] || 0) + 1; });
  const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCityCount = topCities.length > 0 ? topCities[0][1] : 1;

  // Aggregate Goods Type
  const typeCounts: { [key: string]: number } = {};
  data.forEach(d => { if (d.goods_type) typeCounts[d.goods_type] = (typeCounts[d.goods_type] || 0) + 1; });
  const totalGoodsType = Object.values(typeCounts).reduce((a, b) => a + b, 0);
  const goodsDistribution = Object.entries(typeCounts).map(([name, value]) => ({
    name,
    value,
    percent: ((value / totalGoodsType) * 100).toFixed(1)
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <MapPin size={24} className="text-blue-600" />
          </div>
          Top Destination Cities
        </h3>
        <div className="space-y-4">
          {topCities.map(([city, count], i) => (
            <div key={city} className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-400 w-8 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2 gap-2">
                  <span className="text-base font-semibold text-slate-800 truncate">{city}</span>
                  <span className="text-sm font-bold text-slate-600 whitespace-nowrap">{count} orders</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCityCount) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <PieIcon size={24} className="text-indigo-600" />
          </div>
          Goods Type Distribution
        </h3>
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-12">
          <div className="h-[200px] w-[220px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={goodsDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {goodsDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {goodsDistribution.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-sm font-semibold text-slate-700 capitalize">{item.name}</span>
                <span className="text-sm font-bold text-slate-900">({item.percent}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



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
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Units</th>
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
              <td className="p-4 text-sm text-slate-700">{Math.floor(Math.random() * 500) + 100}</td>
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'consolidation' | 'shipments' | 'ai'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

  // Filter States
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [weightFilter, setWeightFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredShipments = shipments.filter(shipment => {
    const matchesCarrier = carrierFilter === 'all' || shipment.carrier === carrierFilter;
    const matchesMode = modeFilter === 'all' || shipment.mode === modeFilter;
    const matchesWeight = weightFilter === 'all' || shipment.weight_class === weightFilter;
    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'consolidated' ? shipment.type.toLowerCase().includes('consolidated') :
        typeFilter === 'single' ? !shipment.type.toLowerCase().includes('consolidated') : true);

    return matchesCarrier && matchesMode && matchesWeight && matchesType;
  });

  // Shipment Overview States
  const [shipmentCarrier, setShipmentCarrier] = useState<string>('All Carriers');
  const [shipmentMode, setShipmentMode] = useState<string>('All Modes');
  const [shipmentPriority, setShipmentPriority] = useState<string>('All Priorities');

  const allShipmentCarriers = Array.from(new Set(dataset.map(d => d.carrier_name))).sort();
  const allPriorities = Array.from(new Set(dataset.map(d => d.customer_priority))).sort();

  const filteredDataset = dataset.filter(d => {
    const matchesCarrier = shipmentCarrier === 'All Carriers' || d.carrier_name === shipmentCarrier;
    const matchesPriority = shipmentPriority === 'All Priorities' || d.customer_priority === shipmentPriority;

    // For FTL/LTL, let's assume if weight > 2000 it's FTL, else LTL for this demo
    const isFTL = d.order_weight_kg > 2000;
    const matchesMode = shipmentMode === 'All Modes' || (shipmentMode === 'FTL' ? isFTL : !isFTL);

    return matchesCarrier && matchesMode && matchesPriority;
  });

  const uniqueCarriers = Array.from(new Set(shipments.map(s => s.carrier))).filter(Boolean);
  const uniqueModes = Array.from(new Set(shipments.map(s => s.mode))).filter(Boolean);
  const uniqueWeights = Array.from(new Set(shipments.map(s => s.weight_class))).filter(Boolean);

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
          orders: dataset.slice(0, 5)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 text-slate-900 font-sans flex overflow-x-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:sticky inset-y-0 left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 shadow-xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 ring-4 ring-blue-50">
              <Zap size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">LOCO</h1>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Master Optimizer</p>
            </div>
          </div>

          <nav className="flex-1 space-y-3">
            <NavItem
              active={activeTab === 'dashboard'}
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              icon={LayoutDashboard}
              label="Dashboard"
            />
            <NavItem
              active={activeTab === 'consolidation'}
              onClick={() => { setActiveTab('consolidation'); setIsSidebarOpen(false); }}
              icon={Layers}
              label="Consolidation Agent"
            />
            <NavItem
              active={activeTab === 'shipments'}
              onClick={() => { setActiveTab('shipments'); setIsSidebarOpen(false); }}
              icon={Package}
              label="Shipments Overview"
            />
            <NavItem
              active={activeTab === 'ai'}
              onClick={() => { setActiveTab('ai'); setIsSidebarOpen(false); }}
              icon={Activity}
              label="AI Suggestions"
              tag="Upcoming"
            />
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100">
            <button
              onClick={() => alert('Logged out!')}
              className="w-full flex items-center gap-3 p-4 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 font-bold group"
            >
              <LogOut size={22} className="text-slate-400 group-hover:text-rose-600" />
              <span className="text-sm tracking-tight">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full relative overflow-x-hidden">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 lg:px-10 h-20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu size={22} />
            </button>
            <h2 className="text-2xl font-bold text-slate-900">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-blue-50 text-blue-600 p-2.5 rounded-xl hover:bg-blue-100 transition-colors shadow-sm">
              <Package size={22} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-[1700px] mx-auto p-4 md:p-8 lg:p-10 space-y-6 md:space-y-8">
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* 6 KPI Line */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {processedKPIs.map((kpi, index) => (
                    <KPICard key={index} kpi={kpi} index={index} />
                  ))}
                </div>

                {/* Graphical Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 min-h-[400px]">
                    <LineChartCard />
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-300/50 flex flex-col justify-center min-h-[300px] lg:min-h-full">
                    <div className="relative z-10">
                      <h3 className="text-2xl md:text-3xl font-black mb-3 leading-tight text-white">Automate Your Logistics</h3>
                      <p className="text-blue-100 text-base mb-8 max-w-[320px] leading-relaxed">Run the consolidation engine to find hidden savings in your route data.</p>
                      <button
                        onClick={() => setActiveTab('consolidation')}
                        className="bg-white text-blue-600 px-8 py-3.5 rounded-xl text-base font-bold shadow-xl hover:shadow-2xl hover:bg-blue-50 hover:-translate-y-0.5 transition-all flex items-center gap-2 w-fit"
                      >
                        Process Now
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <Layers size={180} className="absolute -bottom-12 -right-12 opacity-10 rotate-12 hidden md:block" />
                  </div>
                </div>

                {/* Order Overview Section */}
                <section className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">Order Intelligence Overview</h3>
                    <div className="text-sm font-semibold text-slate-600 bg-white px-5 py-2.5 rounded-full border-2 border-slate-200 shadow-sm w-fit">
                      Dataset Size: <strong className="text-blue-600">{dataset.length}</strong> Orders
                    </div>
                  </div>
                  <OrderOverview data={dataset} />
                </section>

                {/* Pending Optimization Queue Section */}
                <section className="pb-12">
                  <PendingOptimizationQueue data={dataset} />
                </section>
              </motion.div>
            )}

            {activeTab === 'consolidation' && (
              <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="flex items-end justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Consolidation Engine</h2>
                    <p className="text-slate-500 mt-1">Identify shipping efficiency opportunities using our n8n agent.</p>
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
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-20 text-center"
                      >
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 border-4 border-white shadow-inner">
                          <Box size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to Process</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg">
                          Processing <strong>{dataset.length}</strong> orders for geographic and route-based consolidation.
                        </p>
                        <button
                          onClick={handleRunAgent}
                          className="group bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-xl shadow-blue-200 transform hover:-translate-y-1 transition-all flex items-center gap-3 mx-auto text-lg"
                        >
                          Start Consolidation Agent
                          <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </motion.div>
                    )}

                    {isProcessing && (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl border border-blue-50 p-12 relative overflow-hidden"
                      >
                        <div className="max-w-2xl mx-auto space-y-12 relative z-10 text-center">
                          <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Zap className="text-blue-600 animate-pulse" size={32} />
                            </div>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Agent is Optimizing</h3>
                          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 space-y-6 text-left">
                            <LoadingStep label="Geographic Cluster Identification" active={loadingStep === 1} completed={loadingStep > 1} />
                            <LoadingStep label="Carrier Rate Multi-Point Analysis" active={loadingStep === 2} completed={loadingStep > 2} />
                            <LoadingStep label="Final Shipment Plan Generation" active={loadingStep === 3} completed={loadingStep > 3} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {shipments.length > 0 && !isProcessing && (
                      <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-sm font-bold border border-emerald-100 shadow-sm">
                            <CheckCircle2 size={18} />
                            Found {shipments.length} Consolidation Strategies
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                              <button onClick={() => setViewType('cards')} className={`p-2 rounded-lg transition-all ${viewType === 'cards' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>
                                <LayoutDashboard size={18} />
                              </button>
                              <button onClick={() => setViewType('table')} className={`p-2 rounded-lg transition-all ${viewType === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>
                                <Table size={18} />
                              </button>
                            </div>
                            <button onClick={() => setShipments([])} className="bg-white border border-slate-200 p-2 rounded-xl text-slate-500 hover:text-blue-600 transition-all shadow-sm">
                              <RotateCcw size={18} />
                            </button>
                          </div>
                        </div>

                        {viewType === 'cards' ? (
                          <div className="space-y-8">
                            {filteredShipments.slice(0, visibleCount).map((shipment, idx) => (
                              <ShipmentDetail key={shipment.id || idx} shipment={shipment} />
                            ))}
                            {visibleCount < filteredShipments.length && (
                              <button onClick={() => setVisibleCount(c => c + 3)} className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:border-blue-300 hover:text-blue-600 transition-all">
                                View More Results ({filteredShipments.length - visibleCount})
                              </button>
                            )}
                          </div>
                        ) : (
                          <ShipmentTable shipments={filteredShipments} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>
            )}

            {activeTab === 'shipments' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Shipments Overview</h2>
                    <p className="text-slate-500 text-lg">Manage your logistics flow and consolidation opportunities.</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-full text-sm font-bold border border-emerald-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Data Feed: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px] relative">
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={shipmentPriority}
                      onChange={(e) => setShipmentPriority(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer capitalize"
                    >
                      <option>All Priorities</option>
                      {allPriorities.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px] relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={shipmentCarrier}
                      onChange={(e) => setShipmentCarrier(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer"
                    >
                      <option>All Carriers</option>
                      {allShipmentCarriers.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px] relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={shipmentMode}
                      onChange={(e) => setShipmentMode(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer"
                    >
                      <option>All Modes</option>
                      <option value="FTL">FTL (Full Truck Load)</option>
                      <option value="LTL">LTL (Less Than Truckload)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => { setShipmentCarrier('All Carriers'); setShipmentMode('All Modes'); setShipmentPriority('All Priorities'); }}
                    className="bg-white border-2 border-slate-200 text-slate-700 font-bold px-8 py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>
                </div>

                {/* Shipments List */}
                <div className="space-y-4">
                  {filteredDataset.slice(0, 15).map((d, i) => {
                    const baseCost = d.distance_km * d.carrier_cost_per_km;
                    const consolidatedCost = baseCost * 0.85; // Mocking savings
                    const savings = baseCost - consolidatedCost;
                    const utilization = d.overall_truck_utilization_percent;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-center gap-6"
                      >
                        <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                          <Truck size={28} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">SHIP-2026-{3000 + i}</h4>
                          <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                              {Math.floor(Math.random() * 5) + 1} ORDERS CONSOLIDATED
                            </p>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <p className="text-blue-600/70 font-bold text-xs uppercase tracking-widest">
                              {d.quantity + 120} Total Units
                            </p>
                          </div>
                        </div>

                        <div className="hidden lg:flex flex-col items-end px-6 border-r border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Base Cost</p>
                          <p className="text-base font-bold text-slate-400 line-through">${baseCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>

                        <div className="flex flex-col items-end px-6 border-r border-slate-100">
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Consolidated</p>
                          <p className="text-xl font-black text-slate-900">${consolidatedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>

                        <div className="flex flex-col items-center px-6 border-r border-slate-100">
                          <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-black border border-emerald-100 flex items-center gap-1">
                            SAVINGS ${savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            <TrendingUp size={14} />
                          </div>
                        </div>

                        <div className="w-48 hidden xl:block px-6">
                          <div className="flex justify-between items-end mb-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Utilization</p>
                            <p className={`text-sm font-black ${utilization > 80 ? 'text-emerald-600' : utilization > 50 ? 'text-amber-500' : 'text-rose-500'}`}>{utilization}%</p>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${utilization}%` }}
                              className={`h-full rounded-full ${utilization > 80 ? 'bg-emerald-500' : utilization > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            />
                          </div>
                        </div>

                        <button className="bg-rose-50 text-rose-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 border border-rose-100 shadow-sm ml-auto transform group-hover:scale-105">
                          <Bell size={14} />
                          Send Alert
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-20 text-center">
                <div className="w-20 h-20 bg-violet-50 text-violet-600 rounded-3xl flex items-center justify-center mb-6 border-2 border-violet-100 italic font-black text-2xl">
                  AI
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Predictive AI Suggestions</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8 text-lg">We're building an AI that predicts market rate fluctuations and suggests pre-booking slots.</p>
                <div className="px-6 py-2 bg-slate-200 rounded-full text-xs font-bold text-slate-600 uppercase tracking-widest">Available Q3 2026</div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const NavItem = ({ active, icon: Icon, label, onClick, tag }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${active ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}`}
  >
    <div className="flex items-center gap-3">
      <Icon size={22} className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} strokeWidth={2} />
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </div>
    {tag ? (
      <span className={`text-[10px] px-2 py-1 rounded-md ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'} font-bold uppercase tracking-wide`}>{tag}</span>
    ) : (
      active && <ChevronRight size={18} strokeWidth={2.5} className="text-blue-600" />
    )}
  </button>
);
