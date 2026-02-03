import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
   selector: 'app-trainer-invoices',
   standalone: true,
   imports: [CommonModule, FormsModule],
   template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">My Invoices</h2>
        <div class="flex gap-2">
           <span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold uppercase">
             {{ pendingInvoices().length }} Pending
           </span>
           <span class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase">
             {{ releasedInvoices().length }} Released
           </span>
        </div>
      </div>

      <!-- Pending Invoices Section -->
      <section *ngIf="trainingsNeedingInvoice().length > 0" class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-amber-500 rounded-full"></div>
          <h3 class="text-lg font-bold text-slate-800">Awaiting Invoice Upload</h3>
          <span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{{ trainingsNeedingInvoice().length }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div *ngFor="let training of trainingsNeedingInvoice()" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div class="flex justify-between items-start mb-4">
              <div>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                  Invoice Needed
                </span>
                <h3 class="text-xl font-bold text-slate-800 mt-2">{{ training.title }}</h3>
                <p class="text-sm text-slate-500 font-medium">{{ training.technology }}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-slate-400 font-bold uppercase">Amount</p>
                <p class="text-lg font-bold text-slate-800">₹{{ training.trainerPO?.totalPayable || training.budget | number }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-4">
              <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Client</p>
                <p class="text-sm font-bold text-slate-700">{{ training.company || getClientName(training.clientId) }}</p>
              </div>
              <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Completed On</p>
                <p class="text-sm font-bold text-slate-700">{{ training.endDate | date:'mediumDate' }}</p>
              </div>
            </div>

            <button (click)="openInvoiceModal(training)" class="w-full px-4 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all">
              📤 Upload Invoice
            </button>
          </div>
        </div>
      </section>

      <!-- All Invoices Table -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-primary-500 rounded-full"></div>
          <h3 class="text-lg font-bold text-slate-800">Invoice History</h3>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Training</th>
                <th class="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Invoice</th>
                <th class="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                <th class="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Submitted</th>
                <th class="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let training of trainingsWithInvoice()" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                  <p class="font-bold text-slate-800">{{ training.title }}</p>
                  <p class="text-xs text-slate-500">{{ training.technology }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm font-medium text-slate-700">{{ training.trainerInvoice?.filename }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="font-bold text-slate-800">₹{{ training.trainerInvoice?.amountClaimed | number }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm text-slate-600">{{ training.trainerInvoice?.submittedAt | date:'mediumDate' }}</p>
                </td>
                <td class="px-6 py-4">
                  <span [class]="getInvoiceStatusClass(training.trainerInvoice?.status)" class="text-[10px] px-3 py-1 rounded-full font-bold uppercase">
                    {{ training.trainerInvoice?.status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="trainingsWithInvoice().length === 0">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="text-4xl mb-4">📄</div>
                  <p class="text-slate-500">No invoices submitted yet</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Invoice Upload Modal -->
      <div *ngIf="showInvoiceModal()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
           <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 class="text-xl font-bold text-slate-800">Submit Invoice</h3>
              <button (click)="showInvoiceModal.set(false)" class="text-slate-400 hover:text-slate-600">✕</button>
           </div>
           <form (ngSubmit)="submitDetailedInvoice()" #invoiceForm="ngForm" class="p-8 space-y-5">
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <p class="text-[10px] text-slate-400 font-bold uppercase">Reference PO</p>
                 <p class="text-sm font-bold text-slate-800">{{ selectedTraining()?.trainerPO?.filename }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Hours Completed</label>
                    <input type="number" name="hours" [(ngModel)]="invoiceData.hoursCompleted" required class="w-full text-sm rounded-lg border-slate-200">
                 </div>
                 <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Amount Claimed</label>
                    <input type="number" name="amount" [(ngModel)]="invoiceData.amountClaimed" required class="w-full text-sm rounded-lg border-slate-200">
                 </div>
              </div>

              <div class="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <p class="text-xs font-bold text-slate-500 uppercase">Bank Details</p>
                 <input type="text" name="bank" [(ngModel)]="invoiceData.bankName" required placeholder="Bank Name" class="w-full text-xs rounded-lg border-slate-200">
                 <input type="text" name="account" [(ngModel)]="invoiceData.accountNumber" required placeholder="Account Number" class="w-full text-xs rounded-lg border-slate-200">
                 <input type="text" name="ifsc" [(ngModel)]="invoiceData.ifscCode" required placeholder="IFSC Code" class="w-full text-xs rounded-lg border-slate-200">
              </div>

              <div class="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                 <span class="text-xl">📄</span>
                 <p class="text-[10px] text-slate-500 mt-1">Invoice Document (PDF) Simulated</p>
              </div>

              <div class="flex gap-4 pt-4">
                 <button type="button" (click)="showInvoiceModal.set(false)" class="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">
                    Cancel
                 </button>
                 <button type="submit" [disabled]="!invoiceForm.form.valid" class="flex-1 btn-primary">
                    Submit Payout Request
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  `
})
export class TrainerInvoicesComponent implements OnInit {
   trainings = signal<any[]>([]);
   clients = signal<any[]>([]);

   myTrainings = computed(() => this.trainings().filter(t => t.trainerId === this.auth.currentUser()?.id));
   trainingsWithInvoice = computed(() => this.myTrainings().filter(t => t.trainerInvoice));
   trainingsNeedingInvoice = computed(() => this.myTrainings().filter(t => t.status === 'Completed' && !t.trainerInvoice));
   pendingInvoices = computed(() => this.trainingsWithInvoice().filter(t => t.trainerInvoice?.status === 'Pending Approval'));
   releasedInvoices = computed(() => this.trainingsWithInvoice().filter(t => t.trainerInvoice?.status === 'Released'));

   showInvoiceModal = signal(false);
   selectedTraining = signal<any>(null);
   invoiceData = {
      hoursCompleted: 0,
      amountClaimed: 0,
      bankName: '',
      accountNumber: '',
      ifscCode: ''
   };

   constructor(private data: DataService, private auth: AuthService) { }

   ngOnInit() {
      this.loadData();
   }

   loadData() {
      this.data.get<any[]>('trainings').subscribe(d => this.trainings.set(d));
      this.data.get<any[]>('clients').subscribe(d => this.clients.set(d));
   }

   getClientName(id: string) {
      return this.clients().find(c => c.id === id)?.name || 'Direct Client';
   }

   getInvoiceStatusClass(status: string) {
      switch (status) {
         case 'Released': return 'bg-green-100 text-green-700';
         case 'Pending Approval': return 'bg-amber-100 text-amber-700';
         case 'Approved': return 'bg-blue-100 text-blue-700';
         default: return 'bg-slate-100 text-slate-700';
      }
   }

   openInvoiceModal(training: any) {
      this.selectedTraining.set(training);
      this.invoiceData.amountClaimed = training.trainerPO?.totalPayable || training.budget;
      this.showInvoiceModal.set(true);
   }

   submitDetailedInvoice() {
      if (!this.selectedTraining()) return;

      const updated = {
         ...this.selectedTraining(),
         trainerInvoice: {
            ...this.invoiceData,
            filename: `INV_${this.auth.currentUser()?.id}_${this.selectedTraining().id}.pdf`,
            status: 'Pending Approval',
            submittedAt: new Date().toISOString()
         }
      };

      this.data.put('trainings', updated).subscribe(() => {
         this.showInvoiceModal.set(false);
         this.loadData();
      });
   }
}
