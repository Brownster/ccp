
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function UsageReviewModal({ usageData, onConfirm }) {
  const [open, setOpen] = useState(true);

  const renderSummary = () => {
    return Object.entries(usageData || {}).map(([resource, data]) => (
      <div key={resource} className="mb-3 border-b pb-2">
        <strong>{resource}</strong>
        <ul className="pl-4 list-disc text-sm text-gray-700">
          {Object.entries(data).map(([key, val]) => (
            <li key={key}>
              <code>{key}</code>: {val}
            </li>
          ))}
        </ul>
      </div>
    ));
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review AI Usage Assumptions</DialogTitle>
        </DialogHeader>

        <div className="text-sm mb-4 text-gray-600">
          Based on your answers, here’s what the AI estimated for usage. Please confirm before we apply adjustments:
        </div>

        <div className="bg-gray-50 rounded p-3 mb-4">{renderSummary()}</div>

        <div className="text-sm font-mono bg-black text-green-400 p-3 rounded h-48 overflow-auto mb-4">
          {JSON.stringify(usageData, null, 2)}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => { setOpen(false); onConfirm(true); }} className="bg-green-600 text-white">Confirm & Apply</Button>
          <Button variant="outline" onClick={() => onConfirm(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
