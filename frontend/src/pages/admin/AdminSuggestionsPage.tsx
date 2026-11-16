import { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { ColDef } from 'ag-grid-community';
import { AdminDataGrid } from '@/components/admin/AdminDataGrid';
import { type RowAction } from '@/components/admin/RowActionsCell';
import { BulkUploadDialog } from '@/components/admin/BulkUploadDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminIdeas, useUpdateIdea } from '@/hooks/trystHooks';
import { trystService, type Idea, type IdeaStatus } from '@/services/trystService';

export default function AdminSuggestionsPage() {
  const { data } = useAdminIdeas();
  const update = useUpdateIdea();
  const [edit, setEdit] = useState<Idea | null>(null);
  const [status, setStatus] = useState<IdeaStatus>('NEW');
  const [note, setNote] = useState('');
  const [pub, setPub] = useState(false);
  const open = (i: Idea) => { setEdit(i); setStatus(i.status); setNote(i.publicNote ?? ''); setPub(i.showPublic); };
  const err = note.length > 300 ? 'Public note is limited to 300 characters.' : pub && status === 'NEW' ? 'Only Planned or Done ideas can be shown publicly.' : '';
  const canSave = !err && !update.isPending;

  const cols: ColDef<Idea>[] = [
    { field: 'title', headerName: 'Idea', flex: 2 },
    { field: 'category', headerName: 'About', width: 110 },
    { field: 'body', headerName: 'Details', flex: 3 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'showPublic', headerName: 'Public', width: 100 },
    { field: 'createdAt', headerName: 'Received', width: 170, valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleString('en-IN') : '') },
  ];
  const actions: RowAction<Idea>[] = [{ label: 'Update status', icon: Pencil, onClick: open }];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ideas from guests</h1>
        <BulkUploadDialog title="Bulk upload ideas" columns={['title', 'body', 'category', 'status']} sampleRow={['Add masala chai', 'Would love chai with the pastas', 'Menu', 'NEW']} templateName="ideas-template.csv" onUpload={(f) => trystService.bulkIdeas(f)} />
      </div>
      <AdminDataGrid<Idea> rowData={data ?? []} columnDefs={cols} actions={actions} emptyMessage="No ideas yet." />
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.title}</DialogTitle></DialogHeader>
          {err && <div role="alert" className="border border-destructive p-2 text-sm text-destructive">{err}</div>}
          <p className="text-sm">{edit?.body}</p>
          <label className="text-sm font-medium" htmlFor="st">Status</label>
          <select id="st" value={status} onChange={(e) => setStatus(e.target.value as IdeaStatus)} className="h-10 border border-input bg-background px-2"><option value="NEW">New</option><option value="PLANNED">Planned</option><option value="DONE">Done</option></select>
          <label className="text-sm font-medium" htmlFor="nt">Public note</label>
          <textarea id="nt" value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={`border bg-background p-2 ${note.length > 300 ? 'border-destructive' : 'border-input'}`} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} /> Show in "Ideas we acted on"</label>
          <Button disabled={!canSave} onClick={() => edit && update.mutate({ id: edit.id, status, publicNote: note, showPublic: pub }, { onSuccess: () => setEdit(null) })}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
