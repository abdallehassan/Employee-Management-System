import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (softDelete: boolean) => void;
  employeeName: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, employeeName }: ConfirmModalProps) {
  const [softDelete, setSoftDelete] = useState(true);

  if (!isOpen) return null;

  return (
    <div id="confirm-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="confirm-modal-container"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-scale-in"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Confirm Deletion
          </h3>
          <button
            id="confirm-modal-close"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">{employeeName}</span>? This action cannot be easily undone.
          </p>

          {/* Soft Delete Switch / Checkbox */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <label id="soft-delete-label" className="flex items-start gap-3 cursor-pointer">
              <input
                id="soft-delete-checkbox"
                type="checkbox"
                checked={softDelete}
                onChange={(e) => setSoftDelete(e.target.checked)}
                className="mt-1 w-4 h-4 text-rose-600 border-slate-300 rounded-sm focus:ring-rose-500"
              />
              <div className="flex-1">
                <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Soft Delete (Recommended)
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Flags the employee as archived while retaining their records for historical audits, reporting, and dashboard statistics. Uncheck to hard delete from database.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
          <button
            id="confirm-modal-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-modal-delete-btn"
            type="button"
            onClick={() => onConfirm(softDelete)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Employee
          </button>
        </div>
      </div>
    </div>
  );
}
