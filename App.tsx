import React, { useState, useEffect } from 'react';

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
  }
];

export default function App() {
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    try {
      const saved = localStorage.getItem('med_inventory_data');
      return saved ? JSON.parse(saved) : INITIAL_SAMPLES;
    } catch (e) {
      return INITIAL_SAMPLES;
    }
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

  useEffect(() => {
    try {
      localStorage.setItem('med_inventory_data', JSON.stringify(medicines));
    } catch (e) {
      console.error(e);
    }
  }, [medicines]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) {
      alert('Please enter Medicine Name and Expiry Date');
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
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this medicine entry?')) {
      setMedicines(medicines.filter(m => m.id !== id));
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(medicines, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `medicine_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          
          // Handle both raw array or object wrappers if any exist
          const targetArray = Array.isArray(parsed) ? parsed : parsed.medicines || parsed.data;
          
          if (Array.isArray(targetArray)) {
            setMedicines(targetArray);
            alert('Backup restored successfully!');
          } else {
            alert('Could not find a valid medicine list inside this JSON file.');
          }
        } catch (err) {
          alert('Invalid backup file format.');
        }
      };
    }
  };

  const filteredMedicines = medicines.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-4 font-sans max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-emerald-400">💊 Medicine Inventory</h1>
          <p className="text-xs text-slate-400">Expiry & Stock Manager</p>
        </div>
        <div className="flex gap-2 text-xs">
          <button type="button" onClick={exportJSON} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded font-semibold cursor-pointer">
            Export JSON
          </button>
          <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded font-semibold cursor-pointer border border-slate-700">
            Import JSON
            <input type="file" accept=".json,application/json" onChange={importJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={handleSaveMedicine} className="bg-[#131b2e] p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
        <h2 className="font-bold text-sm text-white border-b border-slate-800 pb-2">+ Add Medicine</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-slate-400 block mb-1">Medicine Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Paracetamol" className="w-full bg-[#0b0f19] border border-slate-800 rounded px-2.5 py-2 text-white" />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Expiry Date *</label>
            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="w-full bg-[#0b0f19] border border-slate-800 rounded px-2.5 py-2 text-white" />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Batch / Lot #</label>
            <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} placeholder="e.g. LOT-102" className="w-full bg-[#0b0f19] border border-slate-800 rounded px-2.5 py-2 text-white" />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" className="w-full bg-[#0b0f19] border border-slate-800 rounded px-2.5 py-2 text-white" />
          </div>
        </div>

        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded transition cursor-pointer">
          Save Medicine
        </button>
      </form>

      {/* Inventory List */}
      <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800 space-y-3">
        <input 
          type="text" 
          placeholder="Search items or batch numbers..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0b0f19] border border-slate-800 rounded px-3 py-2 text-xs text-white"
        />

        <div className="space-y-2">
          {filteredMedicines.map(item => (
            <div key={item.id} className="p-3 bg-[#0b0f19] border border-slate-800 rounded-lg flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-white text-sm">{item.name}</p>
                <p className="text-slate-400">Batch: {item.batchNumber || 'N/A'} | Expiry: <span className="text-emerald-400 font-semibold">{item.expiryDate}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-200">{item.quantity} {item.unit}</span>
                <button type="button" onClick={() => handleDelete(item.id)} className="text-rose-400 hover:text-rose-300 font-bold px-2 py-1 cursor-pointer">
                  ✕
                </button>
              </div>
            </div>
          ))}
          {filteredMedicines.length === 0 && (
            <p className="text-center text-slate-500 py-4 text-xs">No matching medicines found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
