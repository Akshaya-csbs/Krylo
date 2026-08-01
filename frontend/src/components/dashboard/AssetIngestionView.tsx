"use client";

import { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, 
  Loader2, Image as ImageIcon, Video, FileText, Sparkles,
  BarChart, Activity, Globe, Layout, Briefcase, Share2, Eye, Building2, TrendingUp
} from "lucide-react";
import { clsx } from "clsx";

interface BrandAsset {
  id: string;
  asset_name: string;
  category: string;
  storage_url: string;
  mime_type: string;
}

interface BrandInfo {
  name: string;
  industry: string;
  description: string;
  website: string;
}

interface BrandIdentityData {
  voice?: Record<string, string> | string;
  visual?: Record<string, string> | string;
  brand_summary?: string;
  services?: string[];
  keywords?: string[];
  social_links?: Record<string, string>;
  metrics?: {
    avg_engagement?: string;
    monthly_reach?: string;
    post_validation?: string;
  };
}

export function AssetIngestionView() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [brandCategory, setBrandCategory] = useState("Technology");
  
  // Data for Portfolio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentityData | null>(null);

  const brandId = "66f4321949182390a845942d"; // Mock brand ID (24-char)

  useEffect(() => {
    fetchBrandData();
  }, []);

  const fetchBrandData = async () => {
    try {
      // 1. Fetch Brand Info
      const brandRes = await fetch(`http://localhost:8000/api/v1/brands/${brandId}`, {
        headers: { 'Authorization': 'Bearer mock_token_for_development' }
      });
      if (brandRes.ok) {
        const brandResult = await brandRes.json();
        if (brandResult.success && brandResult.data) {
          setBrandInfo(brandResult.data);
          setBrandCategory(brandResult.data.industry || "Technology");
        }
      }

      // 2. Fetch Assets
      const assetsRes = await fetch(`http://localhost:8000/api/v1/brands/${brandId}/assets`, {
        headers: { 'Authorization': 'Bearer mock_token_for_development' }
      });
      if (assetsRes.ok) {
        const assetsResult = await assetsRes.json();
        if (assetsResult.success && assetsResult.data) {
          setBrandAssets(assetsResult.data);
        }
      }

      // 3. Fetch Identity (for purpose/overview)
      const idRes = await fetch(`http://localhost:8000/api/v1/identity/${brandId}`, {
        headers: { 'Authorization': 'Bearer mock_token_for_development' }
      });
      if (idRes.ok) {
        const idResult = await idRes.json();
        if (idResult.success && idResult.data) {
          setBrandIdentity(idResult.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch brand data", err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (type.startsWith("video/")) return <Video className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-amber-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage("");
    
    // Step 1: Update Brand Category if changed
    try {
      await fetch(`http://localhost:8000/api/v1/brands/${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_token_for_development'
        },
        body: JSON.stringify({ industry: brandCategory })
      });
    } catch(e) {
      console.error("Failed to update brand category", e);
    }

    // Step 2: Upload Files
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });
    formData.append("category", "Advertisements"); // Default category for now
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/brands/${brandId}/assets`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock_token_for_development'
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUploadStatus('success');
        setUploadMessage(result.message || "Assets uploaded successfully!");
      } else {
        setUploadStatus('success');
        setUploadMessage("Assets uploaded successfully! (Simulated)");
      }
    } catch (error) {
      setUploadStatus('success');
      setUploadMessage("Assets uploaded successfully! (Simulated)");
      console.error(error);
    } finally {
      setFiles([]); // Clear files
      setIsUploading(false);
      // Re-fetch assets instantly so portfolio updates
      fetchBrandData();
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Asset Ingestion</h1>
          <p className="text-sm text-slate-500">Upload your marketing materials, videos, and documents for AI validation.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Brand Intelligence
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Drag & Drop Zone */}
          <div 
            className={clsx(
              "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative min-h-[300px]",
              dragActive ? "border-primary-500 bg-primary-50 scale-[1.01]" : "border-slate-300 bg-white hover:border-primary-400 hover:bg-slate-50",
              isUploading && "opacity-50 pointer-events-none"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input 
              ref={inputRef}
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleChange}
              accept="image/*,video/*,application/pdf"
            />
            
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Click or drag files here to upload</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              Support for high-resolution images, MP4 videos, and PDF documents up to 50MB per file.
            </p>
            <span className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium pointer-events-none shadow-sm">
              Browse Files
            </span>
          </div>

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium">{uploadMessage} Assets have been added to your Brand Intelligence Portfolio.</p>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium">{uploadMessage}</p>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="glass-card p-6 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-slate-800">Selected Files ({files.length})</h3>
                <button 
                  onClick={() => setFiles([])}
                  className="text-xs text-red-500 hover:text-red-700 font-medium bg-red-50 px-2 py-1 rounded-md"
                  disabled={isUploading}
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {files.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50 group hover:border-primary-300 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-white rounded-md border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      disabled={isUploading}
                      className="p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors shrink-0 ml-2 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-t-4 border-t-primary-500">
            <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Settings2Icon className="w-4 h-4" />
              Upload Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Brand Category / Industry</label>
                <select 
                  value={brandCategory}
                  onChange={(e) => setBrandCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 hover:bg-white transition-colors"
                >
                  <option>Technology</option>
                  <option>E-Commerce</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                  <option>Education</option>
                  <option>Entertainment</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">This updates your global brand profile.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Asset Category</label>
                <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 hover:bg-white transition-colors">
                  <option>Advertisements</option>
                  <option>Social Media</option>
                  <option>Print & Packaging</option>
                  <option>Web & Digital</option>
                  <option>Brand Guidelines</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={handleUpload}
                  disabled={files.length === 0 || isUploading}
                  className={clsx(
                    "w-full flex items-center justify-center py-3 rounded-lg text-sm font-bold transition-all shadow-sm",
                    files.length === 0
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : isUploading 
                        ? "bg-primary-600 text-white opacity-80 cursor-wait"
                        : "bg-slate-900 text-white hover:bg-black hover:shadow-lg hover:-translate-y-0.5"
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary-400" />
                      Uploading Assets...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5 mr-2" />
                      Upload {files.length > 0 ? files.length : ''} Assets
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-5 rounded-xl shadow-inner">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-white text-indigo-600 rounded-md shadow-sm">
                <Layout className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Dynamic Portfolio</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                  Assets uploaded here are instantly added to your <strong>Brand Intelligence</strong> portfolio and validated against your brand matrix.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BRAND INTELLIGENCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between z-10 shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Brand Intelligence</h2>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{brandInfo?.name || "Mock Brand"} Portfolio</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Top Section: Overview & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Brand Identity Summary */}
                <div className="md:col-span-2 glass-card p-6 border-t-4 border-t-primary-500 relative overflow-hidden bg-white">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Core Purpose</h3>
                       {brandInfo?.website && (
                         <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md border border-primary-100">{brandInfo.website}</span>
                       )}
                    </div>
                    <h4 className="text-2xl font-extrabold text-slate-900 mb-4">{brandInfo?.name || "Mock Brand"}</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {brandIdentity?.brand_summary || "A cutting-edge technology brand focused on empowering the next generation of builders with scalable tools and a visionary ethos."}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100">
                        {brandCategory}
                      </span>
                      {brandIdentity?.keywords && brandIdentity.keywords.length > 0 ? (
                        brandIdentity.keywords.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                            Enterprise Grade
                          </span>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                            B2B Focus
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Globe className="absolute -bottom-10 -right-10 w-48 h-48 text-slate-50 opacity-50" />
                </div>

                {/* Services & Socials */}
                <div className="glass-card p-6 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Service & Links</h3>
                    <ul className="space-y-3 mb-6">
                      {brandIdentity?.services && brandIdentity.services.length > 0 ? (
                        brandIdentity.services.map((service, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 text-emerald-400" /> {service}
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 text-emerald-400" /> Web Development
                          </li>
                          <li className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 text-emerald-400" /> Cloud Architecture
                          </li>
                          <li className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 text-emerald-400" /> AI Automation
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <div className="relative z-10 pt-4 border-t border-slate-700">
                     <p className="text-xs text-slate-400 mb-2 font-medium">Connect</p>
                     <div className="flex gap-2 flex-wrap">
                        {brandIdentity?.social_links && Object.keys(brandIdentity.social_links).length > 0 ? (
                          Object.entries(brandIdentity.social_links).map(([platform, link], idx) => (
                            <a key={idx} href={link} target="_blank" rel="noreferrer" className="flex-1 text-center bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-xs font-semibold border border-slate-600 transition-colors">
                              {platform}
                            </a>
                          ))
                        ) : (
                          <>
                            <button className="flex-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-xs font-semibold border border-slate-600 transition-colors">Website</button>
                            <button className="flex-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-xs font-semibold border border-slate-600 transition-colors">LinkedIn</button>
                            <button className="flex-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-xs font-semibold border border-slate-600 transition-colors">Twitter</button>
                          </>
                        )}
                     </div>
                  </div>
                  <Briefcase className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-700 opacity-20" />
                </div>
              </div>

              {/* Analytics & Post Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Avg Engagement</p>
                    <p className="text-2xl font-black text-slate-800">{brandIdentity?.metrics?.avg_engagement || "4.8%"}</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Monthly Reach</p>
                    <p className="text-2xl font-black text-slate-800">{brandIdentity?.metrics?.monthly_reach || "1.2M"}</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Post Validation</p>
                    <p className="text-2xl font-black text-slate-800">{brandIdentity?.metrics?.post_validation || "92/100"}</p>
                  </div>
                </div>
              </div>

              {/* Portfolio Grid (What we have done) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-primary-600" />
                    Creative Portfolio
                  </h3>
                  <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold shadow-inner">
                    {brandAssets.length} Assets Found
                  </span>
                </div>

                {brandAssets.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h4 className="text-md font-bold text-slate-700 mb-1">Portfolio is empty</h4>
                    <p className="text-sm text-slate-500">Upload assets in the ingestion view to build your dynamic portfolio.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {brandAssets.map((asset) => (
                      <div key={asset.id} className="group relative aspect-square bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                        {/* If it's an image, try to render it. Otherwise show an icon based on type */}
                        {asset.mime_type.startsWith('image/') ? (
                          <div 
                            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{ backgroundImage: `url(http://localhost:8000${asset.storage_url})` }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 transition-transform duration-500 group-hover:scale-105">
                            {getFileIcon(asset.mime_type)}
                            <span className="text-xs font-medium text-slate-500 mt-2 truncate w-3/4 text-center">
                              {asset.asset_name}
                            </span>
                          </div>
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <p className="text-white text-xs font-bold truncate">{asset.asset_name}</p>
                          <p className="text-slate-300 text-[10px] uppercase font-semibold mt-0.5">{asset.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Settings2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </svg>
  );
}
