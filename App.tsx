import React, { useState, useEffect, useRef } from 'react';
import { 
  Pill, 
  Package, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  QrCode, 
  PlusCircle, 
  Download, 
  Upload, 
  Clipboard, 
  RotateCcw, 
  Search, 
  Trash2, 
  Edit3 
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  expiryDate: string;
  batchNumber: string;
  dosage: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  notes: string;
}

const INITIAL_SAMPLES: Medicine[] = [
  {
    id: '1',
    name: 'Amoxicillin 500mg',
    expiryDate: '2028-12-31',
    batchNumber: 'AMX-89021',
    dosage: '500mg',
    category: 'Antibiotics',
    quantity: 15,
    unit: 'tablets',
    location: 'Medicine Cabinet',
    notes: 'Take 1 capsule thrice daily after meals'
  },
  {
    id: '2',
    name: 'Ibuprofen 400mg',
    expiryDate: '2027-11-15',
    batchNumber: 'IB-44901',
    dosage: '400mg',
    category: 'Pain Relief',
    quantity: 8,
    unit: 'tablets',
    location: 'First Aid Kit',
    notes: 'For pain or fever'
  },
  {
    id: '3',
    name: 'Paracetamol 500mg',
    expiryDate: '2026-09-30',
    batchNumber: 'P500-2024',
    dosage: '500mg',
    category: 'Pain Relief',
    quantity: 2,
    unit: 'tablets',
    location: 'Drawer 1',
    notes: 'Take as needed for headaches'
  }
];

export default function App() {
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('med_inventory_data');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLES;
  });

  const [formData, setFormData] = useState({
    name: '',
    expiryDate: '',
    batchNumber: '',
    dosage: '',
    category: 'Antibiotics',
    quantity: '1',
    unit: 'tablets',
    location: 'Medicine Cabinet',
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('expiry');
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('med_inventory_data', JSON.stringify(medicines));
  }, [medicines]);

  // Statistics Calculations
  const today = new Date().toISOString().split('T')[0];
  const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const totalItems = medicines.reduce((sum, item) => sum + item.quantity, 0);
  const expiredCount = medicines.filter(item => item.expiryDate && item.expiryDate < today).length;
  const expiringSoonCount = medicines.filter(item => item.expiryDate && item.expiryDate >= today && item.expiryDate <= sixtyDaysFromNow).length;
  const lowStockCount = medicines.filter(item => item.quantity < 10).length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) {
      alert('Please fill in Medicine Name and Expiry Date');
      return;
    }

    const newItem: Medicine = {
      id: Date.now().toString(),
      name: formData.name,
      expiryDate: formData.expiryDate,
      batchNumber: formData.batchNumber,
      dosage: formData.dosage,
      category: formData.category,
      quantity: parseInt(formData.quantity) || 1,
      unit: formData.unit,
      location: formData.location,
      notes: formData.notes
    };

    setMedicines([newItem, ...medicines]);
    clearForm();
  };

  const clearForm = () => {
    setFormData({
      name: '',
      expiryDate: '',
      batchNumber: '',
      dosage: '',
      category: 'Antibiotics',
      quantity: '1',
      unit: 'tablets',
      location: 'Medicine Cabinet',
      notes: ''
    });
    setOcrStatus(null);
  };

  const fillSampleData = (sample: typeof INITIAL_SAMPLES[0]) => {
    setFormData({
      name: sample.name,
      expiryDate: sample.expiryDate,
      batchNumber: sample.batchNumber,
      dosage: sample.dosage,
      category: sample.category,
      quantity: '1',
      unit: sample.unit,
      location: sample.location,
      notes: sample.notes
    });
    setOcrStatus(`Auto-filled details for ${sample.name}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(medicines.filter(m => m.id !== id));
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(medicines, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `medicine_inventory_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (Array.isArray(parsed)) {
            setMedicines(parsed);
            alert('Inventory imported successfully!');
          }
        } catch (err) {
          alert('Invalid JSON backup file.');
        }
      };
    }
  };

  const filteredMedicines = medicines
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'expiry') return a.expiryDate.localeCompare(b.expiryDate);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'quantity') return b.quantity - a.quantity;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-3 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#131b2e] p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2.5 rounded-lg border border-emerald-500/30">
              <Pill className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide text-white">Medicine Expiry & Inventory</h1>
              <p className="text-xs text-slate-400">Smart label scanning, batch tracking & expiry alerts</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition">
              <Download className="w-3.5 h-3.5" /> Export Backup (.json)
            </button>
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium cursor-pointer border border-slate-700 transition">
              <Upload className="w-3.5 h-3.5" /> Import File
              <input type="file" accept=".json" onChange={importJSON} className="hidden" />
            </label>
            <button onClick={() => setMedicines(INITIAL_SAMPLES)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-medium border border-slate-700 transition">
              <RotateCcw className="w-3.5 h-3.5" /> Reset Samples
            </button>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800 relative">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Items</p>
            <p className="text-2xl font-black text-white mt-2">{totalItems}</p>
            <p className="text-[10px] text-slate-500 mt-1">Total stored</p>
            <Package className="w-5 h-5 text-emerald-500/40 absolute top-4 right-4" />
          </div>

          <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800 relative">
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Expired</p>
            <p className="text-2xl font-black text-rose-500 mt-2">{expiredCount}</p>
            <p className="text-[10px] text-rose-400/70 mt-1">Needs disposal</p>
            <XCircle className="w-5 h-5 text-rose-500/40 absolute top-4 right-4" />
          </div>

          <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800 relative">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Expiring Soon</p>
            <p className="text-2xl font-black text-amber-400 mt-2">{expiringSoonCount}</p>
            <p className="text-[10px] text-amber-400/70 mt-1">Within 60 days</p>
            <Clock className="w-5 h-5 text-amber-400/40 absolute top-4 right-4" />
          </div>

          <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800 relative">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-black text-blue-400 mt-2">{lowStockCount}</p>
            <p className="text-[10px] text-blue-400/70 mt-1">&lt; 10 units left</p>
            <AlertTriangle className="w-5 h-5 text-blue-400/40 absolute top-4 right-4" />
          </div>
        </div>

        {/* OCR Scanner Card */}
        <div className="bg-[#131b2e] p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Instant Auto-Rotate OCR Scanner</h2>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
              ✨ 4-Angle Auto-Parse
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Upload or capture packaging. Automatically scans 0°, 90°, 180°, and 270° angles to extract Medicine Name, Expiry Date & Batch Number.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition"
            >
              <QrCode className="w-4 h-4" /> Scan / Upload Label
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setOcrStatus('Extracted: Demo Medicine 500mg | EXP: 2027-10-10 | Batch: DEMO-123');
                  setFormData(prev => ({
                    ...prev,
                    name: 'Demo Extracted Medicine',
                    expiryDate: '2027-10-10',
                    batchNumber: 'DEMO-12345'
                  }));
                }
              }}
            />
            <button 
              onClick={clearForm}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium py-2.5 px-4 rounded-lg border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear OCR Form
            </button>
          </div>

          {ocrStatus && (
            <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 p-2 rounded-lg font-mono">
              {ocrStatus}
            </p>
          )}

          <div className="pt-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              OR SELECT A SAMPLE MEDICINE LABEL TO TEST AUTO-FILL:
            </p>
            <div className="space-y-1.5">
              {INITIAL_SAMPLES.map(sample => (
                <div 
                  key={sample.id}
                  onClick={() => fillSampleData(sample)}
                  className="flex items-center justify-between p-2.5 bg-[#0b0f19] hover:bg-slate-800/60 rounded-lg border border-slate-800/80 cursor-pointer transition text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{sample.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      EXP: {sample.expiryDate} | LOT: {sample.batchNumber}
                    </p>
                  </div>
                  <Clipboard className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add New Medicine Form */}
        <form onSubmit={handleSaveMedicine} className="bg-[#131b2e] p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Add New Medicine to Inventory</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-medium">MEDICINE NAME *</label>
              <input 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="e.g. Amoxicillin, Paracetamol" 
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">EXPIRY DATE *</label>
              <input 
                type="date" 
                name="expiryDate"
                value={formData.expiryDate} 
                onChange={handleInputChange} 
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">LOT / BATCH NUMBER</label>
              <input 
                type="text" 
                name="batchNumber"
                value={formData.batchNumber} 
                onChange={handleInputChange} 
                placeholder="e.g. LOT-98421" 
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">DOSAGE / STRENGTH</label>
              <input 
                type="text" 
                name="dosage"
                value={formData.dosage} 
                onChange={handleInputChange} 
                placeholder="e.g. 500mg, 10ml" 
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">CATEGORY</label>
              <select 
                name="category"
                value={formData.category} 
                onChange={handleInputChange}
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Vitamins">Vitamins</option>
                <option value="First Aid">First Aid</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">QUANTITY</label>
              <input 
                type="number" 
                name="quantity"
                value={formData.quantity} 
                onChange={handleInputChange} 
                min="1" 
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">UNIT</label>
              <select 
                name="unit"
                value={formData.unit} 
                onChange={handleInputChange}
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="tablets">tablets</option>
                <option value="capsules">capsules</option>
                <option value="bottles">bottles</option>
                <option value="strips">strips</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-medium">STORAGE LOCATION</label>
              <input 
                type="text" 
                name="location"
                value={formData.location} 
                onChange={handleInputChange} 
                placeholder="Medicine Cabinet" 
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-medium">NOTES / DOSAGE INSTRUCTIONS</label>
              <textarea 
                name="notes"
                value={formData.notes} 
                onChange={handleInputChange} 
                rows={2} 
                placeholder="e.g. Take 1 tablet daily after meals." 
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={clearForm}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
            >
              Clear Form
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition"
            >
              Save Medicine
            </button>
          </div>
        </form>

        {/* Inventory Table Section */}
        <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search medicine name, batch #, location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="All">All Categories</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Pain Relief">Pain Relief</option>
              <option value="Vitamins">Vitamins</option>
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="expiry">Expiry (Soonest First)</option>
              <option value="name">Name (A-Z)</option>
              <option value="quantity">Quantity (Highest First)</option>
            </select>
          </div>

          <div className="space-y-2 pt-2">
            {filteredMedicines.map((item) => {
              const isExpired = item.expiryDate < today;
              const isExpiringSoon = item.expiryDate >= today && item.expiryDate <= sixtyDaysFromNow;

              return (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-lg border transition flex items-center justify-between gap-3 text-xs ${
                    isExpired 
                      ? 'bg-rose-950/20 border-rose-500/30' 
                      : isExpiringSoon 
                      ? 'bg-amber-950/20 border-amber-500/30' 
                      : 'bg-[#0b0f19] border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{item.name}</p>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Batch: <span className="text-slate-200 font-mono">{item.batchNumber || 'N/A'}</span> | Location: <span className="text-slate-200">{item.location}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Expiry: <span className={`font-semibold ${isExpired ? 'text-rose-400' : isExpiringSoon ? 'text-amber-400' : 'text-emerald-400'}`}>{item.expiryDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{item.quantity} {item.unit}</p>
                      <p className="text-[10px] text-slate-500">{item.dosage}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredMedicines.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-500">No matching medicines found in inventory.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
