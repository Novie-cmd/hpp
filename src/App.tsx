import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Package, 
  ChefHat, 
  Zap, 
  TrendingUp, 
  ChevronRight,
  ChevronDown,
  Info,
  Save,
  Download,
  UtensilsCrossed
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CostItem, LaborItem, OverheadItem, HPPState } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function App() {
  console.log('App rendering...');
  const [state, setState] = useState<HPPState>({
    productName: 'Produk Baru',
    yield: 1,
    ingredients: [],
    packaging: [],
    labor: [],
    overhead: [],
    margin: 30,
  });

  const [activeTab, setActiveTab] = useState<'ingredients' | 'packaging' | 'labor' | 'overhead' | 'summary'>('ingredients');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hpp_calculator_state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('hpp_calculator_state', JSON.stringify(state));
  }, [state]);

  const totals = useMemo(() => {
    const ingredientsTotal = state.ingredients.reduce((acc, item) => acc + item.total, 0);
    const packagingTotal = state.packaging.reduce((acc, item) => acc + item.total, 0);
    const laborTotal = state.labor.reduce((acc, item) => acc + item.total, 0);
    const overheadTotal = state.overhead.reduce((acc, item) => acc + item.cost, 0);
    
    const totalBatchCost = ingredientsTotal + packagingTotal + laborTotal + overheadTotal;
    const hppPerUnit = state.yield > 0 ? totalBatchCost / state.yield : 0;
    const suggestedPrice = hppPerUnit * (1 + state.margin / 100);
    const profitPerUnit = suggestedPrice - hppPerUnit;

    return {
      ingredients: ingredientsTotal,
      packaging: packagingTotal,
      labor: laborTotal,
      overhead: overheadTotal,
      totalBatch: totalBatchCost,
      hppPerUnit,
      suggestedPrice,
      profitPerUnit
    };
  }, [state]);

  const chartData = [
    { name: 'Bahan Baku', value: totals.ingredients },
    { name: 'Kemasan', value: totals.packaging },
    { name: 'Tenaga Kerja', value: totals.labor },
    { name: 'Overhead', value: totals.overhead },
  ].filter(item => item.value > 0);

  const addItem = (type: 'ingredients' | 'packaging') => {
    const newItem: CostItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      quantity: 0,
      unit: 'gr',
      pricePerUnit: 0,
      total: 0,
    };
    setState(prev => ({ ...prev, [type]: [...prev[type], newItem] }));
  };

  const addLabor = () => {
    const newItem: LaborItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      rate: 0,
      time: 1,
      total: 0,
    };
    setState(prev => ({ ...prev, labor: [...prev.labor, newItem] }));
  };

  const addOverhead = () => {
    const newItem: OverheadItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      cost: 0,
    };
    setState(prev => ({ ...prev, overhead: [...prev.overhead, newItem] }));
  };

  const removeItem = (type: keyof HPPState, id: string) => {
    setState(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).filter((item: any) => item.id !== id)
    }));
  };

  const updateItem = (type: 'ingredients' | 'packaging', id: string, field: keyof CostItem, value: any) => {
    setState(prev => ({
      ...prev,
      [type]: prev[type].map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'pricePerUnit') {
            updated.total = updated.quantity * updated.pricePerUnit;
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const updateLabor = (id: string, field: keyof LaborItem, value: any) => {
    setState(prev => ({
      ...prev,
      labor: prev.labor.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'rate' || field === 'time') {
            updated.total = updated.rate * updated.time;
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const updateOverhead = (id: string, field: keyof OverheadItem, value: any) => {
    setState(prev => ({
      ...prev,
      overhead: prev.overhead.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <UtensilsCrossed size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Kalkulator HPP Kuliner</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Professional Food Costing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print / Export PDF"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href",     dataStr);
                downloadAnchorNode.setAttribute("download", `HPP_${state.productName.replace(/\s+/g, '_')}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Save Data"
            >
              <Save size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Product Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Produk</label>
                  <input 
                    type="text" 
                    value={state.productName}
                    onChange={(e) => setState(prev => ({ ...prev, productName: e.target.value }))}
                    className="w-full text-2xl font-semibold bg-transparent border-b-2 border-transparent focus:border-emerald-500 outline-none transition-all py-1"
                    placeholder="Contoh: Brownies Panggang"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hasil Produksi (Yield)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={state.yield}
                      onChange={(e) => setState(prev => ({ ...prev, yield: Number(e.target.value) }))}
                      className="w-24 text-2xl font-semibold bg-transparent border-b-2 border-transparent focus:border-emerald-500 outline-none transition-all py-1"
                    />
                    <span className="text-gray-400 font-medium">pcs / porsi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl w-fit">
              {[
                { id: 'ingredients', label: 'Bahan Baku', icon: Calculator },
                { id: 'packaging', label: 'Kemasan', icon: Package },
                { id: 'labor', label: 'Tenaga Kerja', icon: ChefHat },
                { id: 'overhead', label: 'Overhead', icon: Zap },
                { id: 'summary', label: 'Ringkasan', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                    activeTab === tab.id 
                      ? "bg-white text-emerald-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'ingredients' && (
                  <motion.div 
                    key="ingredients"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        Bahan Baku
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {state.ingredients.length} item
                        </span>
                      </h2>
                      <button 
                        onClick={() => addItem('ingredients')}
                        className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus size={16} /> Tambah Bahan
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Bahan</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-24 text-center">Qty</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-24 text-center">Satuan</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-40 text-right">Harga/Satuan</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-40 text-right">Total</th>
                            <th className="px-6 py-4 w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {state.ingredients.map((item) => (
                            <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3">
                                <input 
                                  type="text" 
                                  value={item.name}
                                  onChange={(e) => updateItem('ingredients', item.id, 'name', e.target.value)}
                                  className="w-full bg-transparent outline-none font-medium"
                                  placeholder="Nama bahan..."
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="number" 
                                  value={item.quantity}
                                  onChange={(e) => updateItem('ingredients', item.id, 'quantity', Number(e.target.value))}
                                  className="w-full bg-transparent outline-none text-center font-mono"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <select 
                                  value={item.unit}
                                  onChange={(e) => updateItem('ingredients', item.id, 'unit', e.target.value)}
                                  className="w-full bg-transparent outline-none text-center text-sm text-gray-500"
                                >
                                  <option value="gr">gr</option>
                                  <option value="kg">kg</option>
                                  <option value="ml">ml</option>
                                  <option value="lt">lt</option>
                                  <option value="pcs">pcs</option>
                                  <option value="butir">butir</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <input 
                                  type="number" 
                                  value={item.pricePerUnit}
                                  onChange={(e) => updateItem('ingredients', item.id, 'pricePerUnit', Number(e.target.value))}
                                  className="w-full bg-transparent outline-none text-right font-mono"
                                />
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-600">
                                {formatCurrency(item.total)}
                              </td>
                              <td className="px-6 py-3 text-right">
                                <button 
                                  onClick={() => removeItem('ingredients', item.id)}
                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {state.ingredients.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                Belum ada bahan baku. Klik "Tambah Bahan" untuk memulai.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {state.ingredients.length > 0 && (
                          <tfoot>
                            <tr className="bg-emerald-50/50">
                              <td colSpan={4} className="px-6 py-4 text-sm font-bold text-emerald-800 text-right">Total Bahan Baku</td>
                              <td className="px-4 py-4 text-right font-black text-emerald-800 text-lg">
                                {formatCurrency(totals.ingredients)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'packaging' && (
                  <motion.div 
                    key="packaging"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        Kemasan & Label
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {state.packaging.length} item
                        </span>
                      </h2>
                      <button 
                        onClick={() => addItem('packaging')}
                        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus size={16} /> Tambah Kemasan
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Kemasan</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-24 text-center">Qty</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-40 text-right">Harga/Pcs</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-40 text-right">Total</th>
                            <th className="px-6 py-4 w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {state.packaging.map((item) => (
                            <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3">
                                <input 
                                  type="text" 
                                  value={item.name}
                                  onChange={(e) => updateItem('packaging', item.id, 'name', e.target.value)}
                                  className="w-full bg-transparent outline-none font-medium"
                                  placeholder="Contoh: Box Brownies..."
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="number" 
                                  value={item.quantity}
                                  onChange={(e) => updateItem('packaging', item.id, 'quantity', Number(e.target.value))}
                                  className="w-full bg-transparent outline-none text-center font-mono"
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <input 
                                  type="number" 
                                  value={item.pricePerUnit}
                                  onChange={(e) => updateItem('packaging', item.id, 'pricePerUnit', Number(e.target.value))}
                                  className="w-full bg-transparent outline-none text-right font-mono"
                                />
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-blue-600">
                                {formatCurrency(item.total)}
                              </td>
                              <td className="px-6 py-3 text-right">
                                <button 
                                  onClick={() => removeItem('packaging', item.id)}
                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {state.packaging.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                Belum ada data kemasan.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {state.packaging.length > 0 && (
                          <tfoot>
                            <tr className="bg-blue-50/50">
                              <td colSpan={3} className="px-6 py-4 text-sm font-bold text-blue-800 text-right">Total Kemasan</td>
                              <td className="px-4 py-4 text-right font-black text-blue-800 text-lg">
                                {formatCurrency(totals.packaging)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'labor' && (
                  <motion.div 
                    key="labor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        Tenaga Kerja Langsung
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {state.labor.length} orang
                        </span>
                      </h2>
                      <button 
                        onClick={addLabor}
                        className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus size={16} /> Tambah Tenaga Kerja
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nama / Posisi</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-40 text-right">Upah / Jam</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-24 text-center">Jam Kerja</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-40 text-right">Total</th>
                            <th className="px-6 py-4 w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {state.labor.map((item) => (
                            <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3">
                                <input 
                                  type="text" 
                                  value={item.name}
                                  onChange={(e) => updateLabor(item.id, 'name', e.target.value)}
                                  className="w-full bg-transparent outline-none font-medium"
                                  placeholder="Contoh: Tukang Masak..."
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <input 
                                  type="number" 
                                  value={item.rate}
                                  onChange={(e) => updateLabor(item.id, 'rate', Number(e.target.value))}
                                  className="w-full bg-transparent outline-none text-right font-mono"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="number" 
                                  value={item.time}
                                  onChange={(e) => updateLabor(item.id, 'time', Number(e.target.value))}
                                  className="w-full bg-transparent outline-none text-center font-mono"
                                />
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-amber-600">
                                {formatCurrency(item.total)}
                              </td>
                              <td className="px-6 py-3 text-right">
                                <button 
                                  onClick={() => removeItem('labor', item.id)}
                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {state.labor.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                Belum ada data tenaga kerja.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {state.labor.length > 0 && (
                          <tfoot>
                            <tr className="bg-amber-50/50">
                              <td colSpan={3} className="px-6 py-4 text-sm font-bold text-amber-800 text-right">Total Tenaga Kerja</td>
                              <td className="px-4 py-4 text-right font-black text-amber-800 text-lg">
                                {formatCurrency(totals.labor)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'overhead' && (
                  <motion.div 
                    key="overhead"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        Biaya Overhead
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {state.overhead.length} item
                        </span>
                      </h2>
                      <button 
                        onClick={addOverhead}
                        className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus size={16} /> Tambah Overhead
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Keterangan</th>
                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-40 text-right">Biaya (per Batch)</th>
                            <th className="px-6 py-4 w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {state.overhead.map((item) => (
                            <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3">
                                <input 
                                  type="text" 
                                  value={item.name}
                                  onChange={(e) => updateOverhead(item.id, 'name', e.target.value)}
                                  className="w-full bg-transparent outline-none font-medium"
                                  placeholder="Contoh: Gas, Listrik, Air..."
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <input 
                                  type="number" 
                                  value={item.cost}
                                  onChange={(e) => updateOverhead(item.id, 'cost', Number(e.target.value))}
                                  className="w-full bg-transparent outline-none text-right font-mono"
                                />
                              </td>
                              <td className="px-6 py-3 text-right">
                                <button 
                                  onClick={() => removeItem('overhead', item.id)}
                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {state.overhead.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                                Belum ada data overhead.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {state.overhead.length > 0 && (
                          <tfoot>
                            <tr className="bg-red-50/50">
                              <td className="px-6 py-4 text-sm font-bold text-red-800 text-right">Total Overhead</td>
                              <td className="px-4 py-4 text-right font-black text-red-800 text-lg">
                                {formatCurrency(totals.overhead)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'summary' && (
                  <motion.div 
                    key="summary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cost Breakdown */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6">Distribusi Biaya</h3>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              />
                              <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Pricing Strategy */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold">Strategi Harga</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">HPP per Unit</span>
                            <span className="font-bold">{formatCurrency(totals.hppPerUnit)}</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 font-medium">Margin Keuntungan (%)</span>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  value={state.margin}
                                  onChange={(e) => setState(prev => ({ ...prev, margin: Number(e.target.value) }))}
                                  className="w-16 text-right font-bold text-emerald-600 bg-emerald-50 rounded px-2 py-1 outline-none"
                                />
                                <span className="text-emerald-600 font-bold">%</span>
                              </div>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="300" 
                              value={state.margin}
                              onChange={(e) => setState(prev => ({ ...prev, margin: Number(e.target.value) }))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                          </div>

                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-lg font-bold">Harga Jual Disarankan</span>
                            <span className="text-2xl font-black text-emerald-600">{formatCurrency(totals.suggestedPrice)}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500 italic">
                            <span>Laba per Unit</span>
                            <span className="font-semibold text-emerald-700">+{formatCurrency(totals.profitPerUnit)}</span>
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                          <Info size={20} className="text-amber-600 shrink-0" />
                          <p className="text-xs text-amber-800 leading-relaxed">
                            Harga jual di atas adalah perhitungan matematis berdasarkan margin. Pastikan juga mempertimbangkan harga kompetitor di pasar.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Full Summary Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-bold">Rincian Akhir Produksi</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Biaya Batch</p>
                          <p className="text-2xl font-black">{formatCurrency(totals.totalBatch)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Produksi</p>
                          <p className="text-2xl font-black">{state.yield} <span className="text-sm font-normal text-gray-400">pcs</span></p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">HPP per Unit</p>
                          <p className="text-2xl font-black text-emerald-600">{formatCurrency(totals.hppPerUnit)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-[#1A1A1A] text-white rounded-2xl p-6 shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6">Ringkasan Cepat</h3>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">HPP per Unit</p>
                      <p className="text-3xl font-black text-emerald-400">{formatCurrency(totals.hppPerUnit)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs text-gray-400">Total Batch</p>
                      <p className="text-lg font-bold">{formatCurrency(totals.totalBatch)}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Bahan Baku</span>
                      <span className="font-mono">{formatCurrency(totals.ingredients)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Kemasan</span>
                      <span className="font-mono">{formatCurrency(totals.packaging)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tenaga Kerja</span>
                      <span className="font-mono">{formatCurrency(totals.labor)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Overhead</span>
                      <span className="font-mono">{formatCurrency(totals.overhead)}</span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={() => setActiveTab('summary')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
                    >
                      Lihat Detail Harga
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Info size={16} className="text-emerald-600" />
                  Tips Food Costing
                </h4>
                <ul className="space-y-3 text-xs text-gray-600 leading-relaxed">
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                    Idealnya, biaya bahan baku (Food Cost) berkisar antara 25% - 35% dari harga jual.
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                    Jangan lupa menghitung biaya penyusutan alat jika produksi skala besar.
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                    Selalu update harga bahan baku secara berkala karena harga pasar fluktuatif.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <UtensilsCrossed size={18} />
            <span className="text-sm font-medium">Kalkulator HPP Kuliner &copy; 2024</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">Panduan</a>
            <a href="#" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
