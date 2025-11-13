import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, Clock, HardDrive, Info } from 'lucide-react';
import {
  exportAllData,
  downloadBackup,
  importData,
  validateBackupFile,
  getBackupStats,
  createAutoBackup,
} from '../utils/dataBackup';
import { toast } from 'sonner@2.0.3';

export const DataBackupManager: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = getBackupStats();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      downloadBackup(data);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({ type: null, message: '' });

    try {
      // Validate file
      const validation = await validateBackupFile(file);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid backup file');
      }

      // Read file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const result = await importData(content);

          if (result.success) {
            setImportStatus({ type: 'success', message: result.message });
            toast.success('Data imported successfully!');
            
            // Prompt to reload
            setTimeout(() => {
              if (window.confirm('Data imported successfully. Reload page to see changes?')) {
                window.location.reload();
              }
            }, 1000);
          } else {
            throw new Error(result.message);
          }
        } catch (error) {
          setImportStatus({
            type: 'error',
            message: (error as Error).message,
          });
          toast.error('Import failed: ' + (error as Error).message);
        } finally {
          setIsImporting(false);
        }
      };

      reader.onerror = () => {
        setImportStatus({ type: 'error', message: 'Failed to read file' });
        setIsImporting(false);
      };

      reader.readAsText(file);
    } catch (error) {
      setImportStatus({ type: 'error', message: (error as Error).message });
      toast.error('Import failed: ' + (error as Error).message);
      setIsImporting(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateBackup = async () => {
    try {
      await createAutoBackup();
      toast.success('Auto backup created successfully!');
    } catch (error) {
      toast.error('Failed to create backup: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 mb-2">Data Backup & Restore</h2>
        <p className="text-gray-600">
          Export your data for safekeeping or import from a previous backup
        </p>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Data Size</p>
              <p className="text-gray-900">{stats.estimatedSize}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Backup</p>
              <p className="text-sm text-gray-900">
                {stats.lastBackup
                  ? new Date(stats.lastBackup).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Auto Backups</p>
              <p className="text-gray-900">{stats.autoBackupCount} stored</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export */}
        <div className="p-6 bg-gradient-to-br from-[#E8A587]/10 to-[#E8A587]/5 border border-[#E8A587]/20 rounded-xl">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-[#E8A587] rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 mb-1">Export Data</h3>
              <p className="text-sm text-gray-600">
                Download all your data as a JSON file
              </p>
            </div>
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full px-4 py-2.5 bg-[#E8A587] text-white rounded-lg hover:bg-[#D4956F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Data
              </>
            )}
          </button>

          <button
            onClick={handleCreateBackup}
            className="w-full mt-2 px-4 py-2 bg-white/50 text-gray-700 rounded-lg hover:bg-white/80 transition-colors text-sm"
          >
            Create Auto Backup
          </button>
        </div>

        {/* Import */}
        <div className="p-6 bg-gradient-to-br from-blue-100/50 to-blue-50/30 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 mb-1">Import Data</h3>
              <p className="text-sm text-gray-600">
                Restore data from a backup file
              </p>
            </div>
          </div>

          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Data
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Import Status */}
      {importStatus.type && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 ${
            importStatus.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm ${
                importStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {importStatus.message}
            </p>
          </div>
        </div>
      )}

      {/* Warning Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-amber-900">
            <strong>Important:</strong> Importing data will replace all current data. 
            Make sure to export your current data first if you want to keep it.
          </p>
        </div>
      </div>

      {/* Best Practices */}
      <div className="p-6 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl">
        <h3 className="text-gray-900 mb-3">Backup Best Practices</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#E8A587] mt-1">•</span>
            <span>Export your data regularly, especially before making major changes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#E8A587] mt-1">•</span>
            <span>Store backup files in a safe location (cloud storage, external drive)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#E8A587] mt-1">•</span>
            <span>Keep multiple backup versions in case you need to restore to an earlier state</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#E8A587] mt-1">•</span>
            <span>Test your backups occasionally by importing them on a test device</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
