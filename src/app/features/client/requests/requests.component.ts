import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">My Purchase Orders</h2>
        <button (click)="showForm.set(true)" class="btn-primary flex items-center gap-2">
          <span>+</span> Raise PO
        </button>
      </div>

      <!-- New Request Form Modal -->
      <div *ngIf="showForm()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 class="text-xl font-bold text-slate-800">Raise Purchase Order</h3>
             <button (click)="showForm.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
          </div>
          <form (ngSubmit)="submitRequest()" #requestForm="ngForm" class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1">Client Company Name</label>
                <input type="text" name="company" [(ngModel)]="newRequest.company" required placeholder="e.g., Tech Corp">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Technology</label>
                <input type="text" name="technology" [(ngModel)]="newRequest.technology" required placeholder="e.g., Angular 21">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Duration (hours/days)</label>
                <input type="text" name="duration" [(ngModel)]="newRequest.duration" required placeholder="e.g., 40 hours">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Total Cost (₹)</label>
                <input type="number" name="budget" [(ngModel)]="newRequest.budget" required placeholder="50000">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Mode of Training</label>
                <select name="mode" [(ngModel)]="newRequest.mode" required class="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500">
                   <option value="Online">Online</option>
                   <option value="Offline">Offline</option>
                   <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1">PO Number (from client)</label>
                <input type="text" name="poNumber" [(ngModel)]="newRequest.poNumber" required placeholder="e.g., PO-12345">
              </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button type="button" (click)="showForm.set(false)" class="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button type="submit" [disabled]="!requestForm.form.valid" class="flex-1 btn-primary">
                {{ submitting() ? 'Submitting...' : 'Raise PO' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="backdrop-blur-md bg-white/70 rounded-2xl shadow-sm border border-white/30 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Technology</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Budget</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 uppercase text-[11px] font-bold">
            <tr *ngFor="let req of requests()" class="hover:bg-white/50 transition-colors">
              <td class="px-6 py-4 text-slate-800">{{ req.title }}</td>
              <td class="px-6 py-4"><span class="px-2 py-1 bg-slate-100 rounded-lg">{{ req.technology }}</span></td>
              <td class="px-6 py-4">
                <span [class]="getStatusClass(req.status)" class="px-2 py-1 rounded-full text-[10px] tracking-widest uppercase">
                  {{ req.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-slate-900">₹{{ req.budget }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="requests().length === 0" class="py-20 text-center">
           <p class="text-slate-400">You haven't raised any training requests yet.</p>
        </div>
      </div>
    </div>
  `
})
export class ClientRequestsComponent implements OnInit {
  requests = signal<any[]>([]);
  showForm = signal(false);
  submitting = signal(false);

  newRequest = {
    company: '',
    technology: '',
    duration: '',
    budget: 0,
    mode: 'Online',
    poNumber: ''
  };

  constructor(private data: DataService, private auth: AuthService) { }

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.data.get<any[]>('trainings').subscribe(data => {
      const clientId = (this.auth.currentUser() as any)?.companyId || this.auth.currentUser()?.id;
      this.requests.set(data.filter(r => r.clientId === clientId));
    });
  }

  submitRequest() {
    this.submitting.set(true);
    const userId = this.auth.currentUser()?.id;
    const clientId = (this.auth.currentUser() as any)?.companyId || userId;

    const payload = {
      ...this.newRequest,
      title: `${this.newRequest.company} - ${this.newRequest.technology}`,
      clientId,
      status: 'Requested',
      clientPO: { filename: `PO_${this.newRequest.poNumber}.pdf`, status: 'Uploaded', poNumber: this.newRequest.poNumber },
      trainerId: null,
      trainerPO: null,
      clientInvoice: null,
      trainerInvoice: null,
      timestamp: new Date().toISOString()
    };

    this.data.post<any>('trainings', payload).subscribe(() => {
      // Log Audit
      this.data.post('auditLogs', {
        timestamp: new Date().toISOString(),
        userId,
        action: 'RAISE_REQUEST',
        details: `Client raised request for ${payload.title}`
      }).subscribe();

      this.showForm.set(false);
      this.submitting.set(false);
      this.loadRequests();
      this.resetForm();
    });
  }

  resetForm() {
    this.newRequest = { company: '', technology: '', duration: '', budget: 0, mode: 'Online', poNumber: '' };
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Requested': return 'bg-amber-100 text-amber-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
