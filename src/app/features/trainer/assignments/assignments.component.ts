import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
   selector: 'app-trainer-assignments',
   standalone: true,
   imports: [CommonModule, FormsModule],
   template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">My Assignments</h2>
        <div class="flex gap-2">
           <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase">
             {{ pendingPOs().length }} Pending POs
           </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div *ngFor="let training of myAssignments()" class="glass-card p-6 flex flex-col justify-between">
            <div>
               <div class="flex justify-between items-start mb-4">
                  <div>
                     <span [class]="getStatusClass(training.status)" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {{ training.status }}
                     </span>
                     <h3 class="text-xl font-bold text-slate-800 mt-2">{{ training.title }}</h3>
                     <p class="text-sm text-slate-500 font-medium">{{ training.technology }}</p>
                  </div>
                  <div class="text-right">
                     <p class="text-[10px] text-slate-400 font-bold uppercase">Budget</p>
                     <p class="text-lg font-bold text-slate-800">₹{{ training.budget }}</p>
                  </div>
               </div>

               <div class="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-6">
                  <div>
                     <p class="text-[10px] text-slate-400 font-bold uppercase">Client</p>
                     <p class="text-sm font-bold text-slate-700">{{ getClientName(training.clientId) }}</p>
                  </div>
                  <div>
                     <p class="text-[10px] text-slate-400 font-bold uppercase">Preferred Date</p>
                     <p class="text-sm font-bold text-slate-700">{{ training.preferredDates | date:'mediumDate' }}</p>
                  </div>
               </div>
            </div>

            <div class="space-y-3">
               <!-- PO Acceptance Flow -->
               <div *ngIf="training.status === 'Trainer Assigned'" class="p-4 bg-primary-50 rounded-xl border border-primary-100">
                  <div class="flex items-center gap-3 mb-3">
                     <span class="text-xl">📄</span>
                     <div class="flex-1">
                        <p class="text-xs font-bold text-primary-700">Detailed Trainer PO Received</p>
                        <p class="text-[10px] text-primary-600">{{ training.trainerPO?.filename }}</p>
                     </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 mb-4 bg-white/50 p-3 rounded-lg border border-primary-100/50">
                     <div class="text-[9px]">
                        <p class="text-slate-400 font-bold uppercase">Model</p>
                        <p class="font-bold text-slate-700">{{ training.trainerPO?.paymentModel }}</p>
                     </div>
                     <div class="text-[9px]">
                        <p class="text-slate-400 font-bold uppercase">Rate</p>
                        <p class="font-bold text-slate-700">₹{{ training.trainerPO?.rate }}</p>
                     </div>
                     <div class="text-[9px] col-span-2 border-t border-primary-100 pt-1 mt-1">
                        <p class="text-slate-400 font-bold uppercase">Total Payable</p>
                        <p class="font-bold text-primary-700">₹{{ training.trainerPO?.totalPayable }}</p>
                     </div>
                  </div>
                  <div class="flex gap-2">
                     <button (click)="updateStatus(training, 'Active')" class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-all">
                        Accept PO & Start
                     </button>
                     <button class="px-4 py-2 bg-white text-slate-600 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all">
                        Reject
                     </button>
                  </div>
               </div>

               <!-- Delivery Flow -->
               <div *ngIf="training.status === 'Active'" class="flex gap-2">
                  <button (click)="updateStatus(training, 'Completed')" class="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
                     Mark as Completed ✅
                  </button>
               </div>

                <!-- Completed Flow -->
               <div *ngIf="training.status === 'Completed' && !training.trainerInvoice" class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p class="text-xs text-slate-500 mb-3">Training delivered! Please upload your invoice.</p>
                  <button (click)="openInvoiceModal(training)" class="w-full px-4 py-2 bg-white text-slate-800 rounded-lg text-xs font-bold border border-slate-200 hover:border-primary-400 hover:text-primary-600 transition-all">
                     Upload Detailed Invoice 📤
                  </button>
               </div>
               
               <div *ngIf="training.trainerInvoice" class="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <span class="text-[10px] font-bold text-green-700">INVOICE UPLOADED</span>
                  <span class="text-[10px] text-green-600 uppercase">{{ training.trainerInvoice.status }}</span>
               </div>
            </div>
         </div>
         
         <div *ngIf="myAssignments().length === 0" class="col-span-full py-24 text-center bg-white/40 rounded-3xl border-2 border-dashed border-slate-200">
            <div class="text-5xl mb-6">🏜️</div>
            <h3 class="text-xl font-bold text-slate-800">No requests right now</h3>
            <p class="text-slate-500 mt-2 max-w-sm mx-auto">Once an administrator assigns you a training request, it will appear here for your review and acceptance.</p>
         </div>
      </div>

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
export class TrainerAssignmentsComponent implements OnInit {
   trainings = signal<any[]>([]);
   clients = signal<any[]>([]);

   myAssignments = computed(() => this.trainings().filter(t => t.trainerId === this.auth.currentUser()?.id));
   pendingPOs = computed(() => this.myAssignments().filter(t => t.status === 'Trainer Assigned'));

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

   updateStatus(training: any, status: string) {
      const updated = { ...training, status };
      if (status === 'Active') updated.trainerPO.status = 'Accepted';

      this.data.put('trainings', updated).subscribe(() => {
         this.data.post('auditLogs', {
            timestamp: new Date().toISOString(),
            userId: this.auth.currentUser()?.id,
            action: status === 'Active' ? 'ACCEPT_PO' : 'MARK_COMPLETED',
            details: `${this.auth.currentUser()?.name} ${status === 'Active' ? 'accepted PO for' : 'completed'} ${training.title}`
         }).subscribe();

         this.loadData();
      });
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

   getStatusClass(status: string) {
      switch (status) {
         case 'Active': return 'bg-green-100 text-green-700';
         case 'Trainer Assigned': return 'bg-indigo-100 text-indigo-700';
         case 'Completed': return 'bg-blue-100 text-blue-700';
         default: return 'bg-slate-100 text-slate-700';
      }
   }
}
