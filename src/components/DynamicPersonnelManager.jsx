import React, { useState, useRef } from 'react';
import { UserPlus, Search, ShieldCheck, ShieldAlert, Camera, Upload, Trash2, CheckCircle, Lock, Cpu, Sparkles, X } from 'lucide-react';
import { extractFaceVectorFromElement } from '../utils/faceIntelligence';
import { audioAlerts } from '../utils/AudioAlertManager';

export default function DynamicPersonnelManager({ personnelList, setPersonnelList }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClearance, setFilterClearance] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    rank: 'Perimeter Security Officer',
    clearance: 'Level 3 - Operational',
    department: 'Base Defense Force',
    photoUrl: '',
    accessAreas: ['Sector Alpha', 'Sector Bravo']
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [computedVector, setComputedVector] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle Photo File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setPreviewImage(dataUrl);
      setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
      await processImageVector(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Start Webcam for instant photo capture
  const startWebcamCapture = async () => {
    try {
      setWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Webcam capture error:", err);
      alert("Unable to access webcam for capture.");
      setWebcamActive(false);
    }
  };

  // Snap photo from webcam
  const captureWebcamSnapshot = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');

    // Stop webcam
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setWebcamActive(false);

    setPreviewImage(dataUrl);
    setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
    await processImageVector(dataUrl);
  };

  // Compute Feature Vector from image
  const processImageVector = async (imgSrc) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgSrc;
    img.onload = async () => {
      const vec = await extractFaceVectorFromElement(img);
      setComputedVector(vec);
      setIsProcessing(false);
      audioAlerts.playAuthMatch();
    };
  };

  // Save new personnel profile
  const handleSubmitPersonnel = (e) => {
    e.preventDefault();
    if (!formData.name || (!formData.photoUrl && !previewImage)) {
      alert("Please provide personnel name and photograph.");
      return;
    }

    const newId = `AUTH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPerson = {
      id: newId,
      name: formData.name,
      rank: formData.rank,
      clearance: formData.clearance,
      department: formData.department,
      registeredAt: new Date().toISOString(),
      status: "Active",
      photoUrl: previewImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      featureVector: computedVector || [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
      accessAreas: formData.accessAreas
    };

    setPersonnelList([newPerson, ...personnelList]);
    audioAlerts.playAuthMatch();
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rank: 'Perimeter Security Officer',
      clearance: 'Level 3 - Operational',
      department: 'Base Defense Force',
      photoUrl: '',
      accessAreas: ['Sector Alpha', 'Sector Bravo']
    });
    setPreviewImage(null);
    setComputedVector(null);
    setWebcamActive(false);
  };

  const toggleStatus = (id) => {
    audioAlerts.playClick();
    setPersonnelList(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Active' ? 'Revoked' : 'Active';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const deletePersonnel = (id) => {
    if (confirm("Are you sure you want to revoke and delete this authorized personnel profile?")) {
      audioAlerts.playClick();
      setPersonnelList(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredPersonnel = personnelList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.rank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClearance = filterClearance === 'ALL' || p.clearance.startsWith(filterClearance);
    return matchesSearch && matchesClearance;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header & Onboarding Trigger */}
      <div className="hud-panel p-5 rounded-xl border border-cyan-900/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-orbitron text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            AUTHORIZED PERSONNEL REGISTRATION
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Dynamic Zero-Dataset Enrollment: Instantly register authorized individuals with photo & access credentials.
          </p>
        </div>

        <button
          onClick={() => { audioAlerts.playClick(); setIsModalOpen(true); }}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold tracking-wider flex items-center space-x-2 shadow-lg shadow-cyan-950/60 border border-cyan-400/40 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>REGISTER NEW PERSONNEL</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search personnel by name, ID, or rank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">CLEARANCE:</span>
          <select
            value={filterClearance}
            onChange={(e) => setFilterClearance(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">ALL LEVELS</option>
            <option value="Level 5">LEVEL 5 - TOP SECRET</option>
            <option value="Level 4">LEVEL 4 - RESTRICTED</option>
            <option value="Level 3">LEVEL 3 - OPERATIONAL</option>
          </select>
        </div>
      </div>

      {/* Personnel Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredPersonnel.map((person) => (
          <div
            key={person.id}
            className={`hud-panel rounded-xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] ${
              person.status === 'Active'
                ? 'border-cyan-900/60 hover:border-cyan-500/80 shadow-lg shadow-cyan-950/20'
                : 'border-red-900/50 bg-red-950/20 opacity-75'
            }`}
          >
            {/* Card Top Banner */}
            <div className="relative h-44 overflow-hidden bg-slate-900">
              <img
                src={person.photoUrl}
                alt={person.name}
                className="w-full h-full object-cover filter contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d131d] via-transparent to-transparent"></div>

              {/* Status Badge */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider flex items-center space-x-1 backdrop-blur-md bg-black/60 border border-slate-700">
                <span className={`w-2 h-2 rounded-full ${person.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
                <span className={person.status === 'Active' ? 'text-emerald-300' : 'text-red-400'}>{person.status.toUpperCase()}</span>
              </div>

              {/* ID Tag */}
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-700">
                {person.id}
              </div>
            </div>

            {/* Card Content Body */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-base font-bold font-orbitron text-slate-100">{person.name}</h3>
                <p className="text-xs font-mono text-cyan-400">{person.rank}</p>
                <p className="text-[11px] font-mono text-slate-400">{person.department}</p>
              </div>

              <div className="space-y-1 text-[11px] font-mono border-t border-slate-800/80 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">CLEARANCE:</span>
                  <span className="text-amber-400 font-bold">{person.clearance}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">ENROLLED:</span>
                  <span className="text-slate-300">{new Date(person.registeredAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Vector Feature Hash Badge */}
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono space-y-1">
                <div className="text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-cyan-400" /> FEATURE VECTOR:</span>
                  <span className="text-emerald-400 font-bold">EXTRACTED (8D)</span>
                </div>
                <div className="text-slate-500 truncate">
                  [{person.featureVector.slice(0, 4).map(n => n.toFixed(2)).join(', ')}...]
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                <button
                  onClick={() => toggleStatus(person.id)}
                  className={`px-3 py-1 rounded font-semibold transition-all ${
                    person.status === 'Active'
                      ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/60'
                      : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  {person.status === 'Active' ? 'REVOKE ACCESS' : 'ACTIVATE ACCESS'}
                </button>

                <button
                  onClick={() => deletePersonnel(person.id)}
                  className="p-1.5 rounded bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-800/60 transition-colors"
                  title="Delete Personnel Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="hud-panel p-6 rounded-2xl border-2 border-cyan-500/50 max-w-xl w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-cyan-900/50 pb-3">
              <h2 className="text-lg font-bold font-orbitron text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                DYNAMIC PERSONNEL ONBOARDING
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPersonnel} className="space-y-4 text-xs font-mono">
              {/* Photo Input Selector */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">1. PERSONNEL PHOTOGRAPH (REQUIRED FOR AI ENROLLMENT)</label>
                
                {webcamActive ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-cyan-500">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                    </div>
                    <button
                      type="button"
                      onClick={captureWebcamSnapshot}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" /> SNAP PHOTO & EXTRACT VECTOR
                    </button>
                  </div>
                ) : previewImage ? (
                  <div className="relative w-36 h-36 rounded-lg overflow-hidden border-2 border-cyan-400 mx-auto">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPreviewImage(null); setComputedVector(null); }}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-lg flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-cyan-400" />
                      <span>UPLOAD PHOTO FILE</span>
                    </button>

                    <button
                      type="button"
                      onClick={startWebcamCapture}
                      className="p-4 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-lg flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-emerald-300 transition-colors"
                    >
                      <Camera className="w-6 h-6 text-emerald-400" />
                      <span>WEBCAM SNAPSHOT</span>
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {isProcessing && (
                  <div className="p-2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center space-x-2 animate-pulse">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>EXTRACTING FACIAL FEATURE VECTOR...</span>
                  </div>
                )}

                {computedVector && (
                  <div className="p-2 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Feature Vector Extracted (8D)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">READY</span>
                  </div>
                )}
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Major Ethan Vance"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">RANK / ROLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Security Patrol Officer"
                    value={formData.rank}
                    onChange={(e) => setFormData(prev => ({ ...prev, rank: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">CLEARANCE LEVEL</label>
                  <select
                    value={formData.clearance}
                    onChange={(e) => setFormData(prev => ({ ...prev, clearance: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-cyan-300 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Level 5 - Top Secret">LEVEL 5 - TOP SECRET</option>
                    <option value="Level 4 - Restricted">LEVEL 4 - RESTRICTED</option>
                    <option value="Level 3 - Operational">LEVEL 3 - OPERATIONAL</option>
                    <option value="Level 2 - General Staff">LEVEL 2 - GENERAL STAFF</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">DEPARTMENT</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={!computedVector}
                  className="px-5 py-2 rounded bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>COMPLETE ENROLLMENT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
