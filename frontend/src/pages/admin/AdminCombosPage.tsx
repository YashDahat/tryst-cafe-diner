import { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { ColDef } from 'ag-grid-community';
import { AdminDataGrid } from '@/components/admin/AdminDataGrid';
import { type RowAction } from '@/components/admin/RowActionsCell';
import { BulkUploadDialog } from '@/components/admin/BulkUploadDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminCombos, useUpdateCombo } from '@/hooks/trystHooks';
import { trystService, type ComboView } from '@/services/trystService';

const DAYS = /^(MON|TUE|WED|THU|FRI|SAT|SUN)(-(MON|TUE|WED|THU|FRI|SAT|SUN)|(,(MON|TUE|WED|THU|FRI|SAT|SUN))*)$/;

export default function AdminCombosPage() {
  const { data } = useAdminCombos();
  const update = useUpdateCombo();
  const [edit, setEdit] = useState<ComboView | null>(null);
  const [label, setLabel] = useState('');
  const [days, setDays] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [aud, setAud] = useState('');
  const open = (c: ComboView) => { setEdit(c); setLabel(c.label); setDays(c.days); setFrom(c.availableFrom.slice(0, 5)); setTo(c.availableTo.slice(0, 5)); setAud(c.audience ?? ''); };
  const errors: string[] = [];
  if (!label.trim()) errors.push('Label is required.');
  if (!DAYS.test(days.trim().toUpperCase())) errors.push('Days like MON-FRI or SAT,SUN.');
  if (!from || !to || to <= from) errors.push('End time must be after the start time.');
  const canSave = errors.length === 0 && !update.isPending;

  const cols: ColDef<ComboView>[] = [
    { field: 'name', headerName: 'Combo', flex: 2 },
    { field: 'label', headerName: 'Label', flex: 1 },
    { field: 'days', headerName: 'Days', width: 120 },
    { field: 'availableFrom', headerName: 'From', width: 100 },
    { field: 'availableTo', headerName: 'To', width: 100 },
    { field: 'price', headerName: 'Price (Rs)', width: 120 },
    { field: 'availableNow', headerName: 'On now', width: 110 },
  ];
  const actions: RowAction<ComboView>[] = [{ label: 'Edit window', icon: Pencil, onClick: open }];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Combo windows</h1><p className="text-sm text-muted-foreground">When each combo is on offer (India time). Change prices under Products.</p></div>
        <BulkUploadDialog title="Bulk upload combo windows" columns={['productSlug', 'label', 'days', 'availableFrom', 'availableTo', 'audience']} sampleRow={['desk-break-combo', 'Desk Break', 'MON-FRI', '12:00', '15:00', 'Offices']} templateName="combo-windows-template.csv" onUpload={(f) => trystService.bulkCombos(f)} />
      </div>
      <AdminDataGrid<ComboView> rowData={data ?? []} columnDefs={cols} actions={actions} emptyMessage="No combos." />
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.name}</DialogTitle></DialogHeader>
          {errors.length > 0 && <div role="alert" className="border border-destructive p-2 text-sm text-destructive">{errors.join(' ')}</div>}
          <label className="text-sm font-medium" htmlFor="cl">Label</label><Input id="cl" value={label} onChange={(e) => setLabel(e.target.value)} className={!label.trim() ? 'border-destructive' : ''} />
          <label className="text-sm font-medium" htmlFor="cd">Days</label><Input id="cd" value={days} onChange={(e) => setDays(e.target.value)} className={!DAYS.test(days.trim().toUpperCase()) ? 'border-destructive' : ''} />
          <div className="flex gap-3"><div className="flex-1"><label className="text-sm font-medium" htmlFor="cf">From</label><Input id="cf" type="time" value={from} onChange={(e) => setFrom(e.target.value)} /></div><div className="flex-1"><label className="text-sm font-medium" htmlFor="ct">To</label><Input id="ct" type="time" value={to} onChange={(e) => setTo(e.target.value)} /></div></div>
          <label className="text-sm font-medium" htmlFor="ca">Audience</label><Input id="ca" value={aud} onChange={(e) => setAud(e.target.value)} />
          <Button disabled={!canSave} onClick={() => edit && update.mutate({ id: edit.id, label: label.trim(), days: days.trim().toUpperCase(), availableFrom: from, availableTo: to, audience: aud }, { onSuccess: () => setEdit(null) })}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
