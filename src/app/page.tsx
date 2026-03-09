'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, FileVideo, FileImage, LayoutDashboard, History, Settings, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState('');
  const [account, setAccount] = useState('');
  const [instructions, setInstructions] = useState('');

  // Edit Modal State
  const [editRecord, setEditRecord] = useState<any>(null);
  const [editFields, setEditFields] = useState({ caption: '', hashtags: '', cta: '', status: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/airtable');
      if (res.data.success) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch records', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'library') {
      fetchRecords();
    }
  }, [activeTab]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !platform || !account) {
      alert("Please provide the file, platform, and account name. These are compulsory.");
      return;
    }

    if (file.size > 4.4 * 1024 * 1024) {
      alert("⚠️ File Too Large!\n\nThe current Dashboard is hosted on a Free Vercel Server, which has a strict 4.5MB upload limit per request.\n\nPlease upload a compressed image or upgrade the server plan for large video files.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('Upload Image or Video', file);
    formData.append('Platform Target', platform);
    formData.append('Account Name', account);
    if (instructions) formData.append('Instructions', instructions);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert("Upload successful! AI processing started.");
        setFile(null); setPlatform(''); setAccount(''); setInstructions('');
        setActiveTab('library');
      } else {
        alert("Upload failed. Try again.");
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert("An error occurred during upload.");
    }
    setUploading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ready to post': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-teal-100 text-teal-800';
      case 'needs review': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleEditClick = (record: any) => {
    setEditRecord(record);
    setEditFields({
      caption: record.fields?.Caption || '',
      hashtags: record.fields?.Hashtags || '',
      cta: record.fields?.CTA || '',
      status: record.fields?.Status || 'Draft',
    });
  };

  const saveEdits = async () => {
    if (!editRecord) return;
    setIsSaving(true);
    try {
      const res = await axios.patch('/api/airtable', {
        id: editRecord.id,
        fields: {
          Caption: editFields.caption,
          Hashtags: editFields.hashtags,
          CTA: editFields.cta,
          Status: editFields.status
        }
      });
      if (res.data.success) {
        alert("Content saved successfully!");
        setEditRecord(null);
        fetchRecords(); // Refresh the table
      }
    } catch (err) {
      console.error('Failed to save edits', err);
      alert("Error saving edits");
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-md p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">
          Social AI Hub
        </h1>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${activeTab === 'upload' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <UploadCloud size={20} /> New Upload
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${activeTab === 'library' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} /> Content Library
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${activeTab === 'history' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <History size={20} /> History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings size={20} /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">

        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Media for AI Analysis</h2>

            <form onSubmit={handleUpload} className="flex flex-col gap-6">

              {/* File Dropzone */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition duration-200 cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                {!file ? (
                  <>
                    <UploadCloud size={40} className="text-blue-500 mb-4" />
                    <p className="text-gray-600 font-medium">Drag & drop your file here</p>
                    <p className="text-sm text-gray-400 mt-2">or click to browse</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    {file.type.includes('video') ? <FileVideo size={40} className="text-green-500 mb-2" /> : <FileImage size={40} className="text-purple-500 mb-2" />}
                    <p className="font-semibold text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                )}
              </div>

              {/* Compulsory Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Platform Selection *</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    required
                  >
                    <option value="">Select Platform...</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Account Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. @mybusiness"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Custom AI Instructions (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Tell the AI what tone to use, specific tags, or CTA..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : 'Upload & Generate AI Content'}
              </button>

            </form>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800">Content Library</h2>
              <button onClick={fetchRecords} className="text-blue-600 hover:text-blue-800 font-medium">
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 text-sm font-semibold text-gray-600">Media</th>
                      <th className="p-4 text-sm font-semibold text-gray-600">Platform</th>
                      <th className="p-4 text-sm font-semibold text-gray-600">Generated Caption</th>
                      <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="p-4 text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" /> Loading from Airtable...</td></tr>
                    ) : records.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-500">No content found. Please upload a file.</td></tr>
                    ) : (
                      records.map((record, idx) => (
                        <tr key={record.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="p-4 text-sm text-gray-800 font-medium">{record.fields?.['File Name'] || 'Video Upload'}</td>
                          <td className="p-4 text-sm text-gray-600">{record.fields?.['Platform'] || 'Unknown'}</td>
                          <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{record.fields?.['Caption'] || 'Processing...'}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.fields?.Status)}`}>
                              {record.fields?.Status || 'Draft'}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleEditClick(record)}
                              className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-medium transition"
                            >
                              Review & Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'history' || activeTab === 'settings') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Pending Feature</h2>
            <p>This module is currently awaiting social API approval to be fully connected.</p>
          </div>
        )}

        {/* Edit Modal */}
        {editRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 flex flex-col gap-6 relative">
              <button
                onClick={() => setEditRecord(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold text-xl"
              >✕</button>

              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">
                Review & Edit Content
              </h2>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-500">Video / Image Link:</span>
                <a href={editRecord.fields?.['Drive Link']} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all text-sm">
                  {editRecord.fields?.['Drive Link'] || 'No preview available'}
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Caption</label>
                <textarea
                  rows={4}
                  value={editFields.caption}
                  onChange={(e) => setEditFields({ ...editFields, caption: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full text-black"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Hashtags</label>
                <textarea
                  rows={2}
                  value={editFields.hashtags}
                  onChange={(e) => setEditFields({ ...editFields, hashtags: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full text-black"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Call to Action (CTA)</label>
                <input
                  type="text"
                  value={editFields.cta}
                  onChange={(e) => setEditFields({ ...editFields, cta: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full text-black"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Approval Status</label>
                <select
                  value={editFields.status}
                  onChange={(e) => setEditFields({ ...editFields, status: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full text-black"
                >
                  <option value="Draft">Draft</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Ready to Post">Ready to Post (Approve)</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>

              <div className="flex gap-4 justify-end border-t pt-4">
                <button
                  onClick={() => setEditRecord(null)}
                  className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdits}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="animate-spin" size={16} />}
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
