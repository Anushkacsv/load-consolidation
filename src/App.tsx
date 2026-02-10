import React, { useState } from 'react';
import { LayoutDashboard, Truck, DollarSign, Scale, RotateCcw, Clock, Leaf, TrendingUp, Box, Layers, ArrowRight, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
}

// --- Mock Data ---

const kpis: KPI[] = [
  { label: 'Truck Utilization', value: '87%', change: '+2.4%', trend: 'up', icon: Truck, color: 'text-blue-600' },
  { label: 'Logistics Cost / Shipment', value: '$1,240', change: '-5.1%', trend: 'down', icon: DollarSign, color: 'text-emerald-600' },
  { label: 'Cost per Ton/Mile', value: '$0.42', change: '-1.2%', trend: 'down', icon: Scale, color: 'text-indigo-600' },
  { label: 'Return Trip Utilization', value: '64%', change: '+8.0%', trend: 'up', icon: RotateCcw, color: 'text-violet-600' },
  { label: 'On-Time Delivery', value: '98.2%', change: '+0.5%', trend: 'up', icon: Clock, color: 'text-teal-600' },
  { label: 'CO2 Intensity', value: '2.1 kg', change: '-3.4%', trend: 'down', icon: Leaf, color: 'text-green-600' },
  { label: 'Potential Savings', value: '$12.5k', change: 'Total pending', trend: 'neutral', icon: TrendingUp, color: 'text-amber-600' },
];

const mockShipmentResult: Shipment = {
  id: 'SHIP-1',
  type: 'Consolidated Shipment',
  mode: 'FTL',
  carrier: 'Blue Dart',
  reason: 'Lowest cost eligible carrier with sufficient capacity',
  sensitivity: 'Standard Handling',
  weight_class: 'Heavy Freight',
  pallet_class: 'Moderate Pallet Density',
  urgency: 'Standard Delivery',
  consolidation_reason: 'Eligible for consolidation',
  orders: ['ORD-3001', 'ORD-3045', 'ORD-3112'],
  savings: '$450.00 (12%)',
  ops_message: `DISPATCH INSTRUCTION

Shipment ID: SHIP-1
Shipment Type: Consolidated Shipment

Carrier: Blue Dart
Transport Mode: FTL

Reason:
- Lowest cost eligible carrier with sufficient capacity

Action Required:
Please arrange vehicle and proceed with dispatch as per standard process.`
};

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
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          kpi.trend === 'up' && kpi.label !== 'CO2 Intensity' && kpi.label !== 'Logistics Cost / Shipment' && kpi.label !== 'Cost per Ton/Mile' ? 'bg-green-100 text-green-700' :
          kpi.trend === 'down' && (kpi.label === 'CO2 Intensity' || kpi.label === 'Logistics Cost / Shipment' || kpi.label === 'Cost per Ton/Mile') ? 'bg-green-100 text-green-700' :
          kpi.trend === 'neutral' ? 'bg-slate-100 text-slate-600' :
          'bg-red-100 text-red-700'
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
            <Clock size={14} /> Created just now
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{shipment.type}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-semibold">Projected Savings</p>
          <p className="text-lg font-bold text-emerald-600">{shipment.savings}</p>
        </div>
        <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Export PDF
        </button>
      </div>
    </div>

    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Key Details */}
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
            Consolidation Logic
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-1 bg-blue-500 rounded-full h-full min-h-[2rem]"></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Carrier Selection Reason</p>
                <p className="text-sm text-slate-700">{shipment.reason}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1 bg-emerald-500 rounded-full h-full min-h-[2rem]"></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Status</p>
                <p className="text-sm text-slate-700">{shipment.consolidation_reason}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Package size={16} className="text-slate-500" />
            Included Orders
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

      {/* Right Column: Ops Message */}
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

const LoadingStep = ({ label, active, completed }: { label: string; active: boolean; completed: boolean }) => (
  <div className={`flex items-center gap-3 transition-opacity duration-300 ${active || completed ? 'opacity-100' : 'opacity-30'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 transition-colors duration-300 ${
      completed ? 'bg-emerald-500 border-emerald-500 text-white' :
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
  const [result, setResult] = useState<Shipment | null>(null);

  const handleRunAgent = () => {
    setIsProcessing(true);
    setResult(null);
    setLoadingStep(1);

    // Simulate agent steps
    setTimeout(() => setLoadingStep(2), 1500); // Step 2: Optimizing
    setTimeout(() => setLoadingStep(3), 3000); // Step 3: Calculating
    setTimeout(() => {
      setIsProcessing(false);
      setResult(mockShipmentResult);
      setLoadingStep(0);
    }, 4500);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => (
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

          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {!result && !isProcessing && (
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
                    There are <strong>124</strong> pending orders eligible for processing. The agent will analyze weight, route, and delivery windows to suggest optimal shipments.
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
                   {/* Background scanning effect */}
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
                       <p className="text-slate-500"> analyzing 124 orders for consolidation...</p>
                     </div>
                     
                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner space-y-4">
                       <LoadingStep label="Analyzing Pending Orders & Route Compatibility" active={loadingStep === 1} completed={loadingStep > 1} />
                       <LoadingStep label="Querying Carrier Rates & Capacity Constraints" active={loadingStep === 2} completed={loadingStep > 2} />
                       <LoadingStep label="Generating Shipment Manifests & Ops Instructions" active={loadingStep === 3} completed={loadingStep > 3} />
                     </div>
                   </div>
                </motion.div>
              )}

              {result && (
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
                       Optimization Complete
                     </div>
                     <button 
                      onClick={() => setResult(null)}
                      className="text-slate-400 hover:text-blue-600 text-sm font-medium flex items-center gap-1 transition-colors"
                     >
                       <RotateCcw size={14} />
                       Clear & Run Again
                     </button>
                   </div>
                   
                   <ShipmentDetail shipment={result} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
