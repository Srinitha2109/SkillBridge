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
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">My Trainings</h2>
        <div class="flex gap-3">
           <span class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5">
             <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             {{ ongoingTrainings().length }} Ongoing
           </span>
           <span class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase">
             {{ pastTrainings().length }} Completed
           </span>
           <span class="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase">
             {{ pendingPOs().length }} Pending POs
           </span>
        </div>
      </div>

      <!-- Ongoing Trainings Section -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-green-500 rounded-full"></div>
          <h3 class="text-lg font-bold text-slate-800">Ongoing Trainings</h3>
          <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">{{ ongoingTrainings().length }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div *ngFor="let training of ongoingTrainings()" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300">
            <!-- Card Header with Status -->
            <div class="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-white">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span class="text-[10px] font-bold uppercase tracking-wider opacity-90">{{ training.status }}</span>
                  </div>
                  <h4 class="text-lg font-bold">{{ training.title }}</h4>
                  <p class="text-sm opacity-90">{{ training.technology }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] uppercase opacity-75">Your Earnings</p>
                  <p class="text-xl font-bold">₹{{ training.trainerPO?.totalPayable || training.budget | number }}</p>
                </div>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-6">
              <!-- Training Details Grid -->
              <div class="grid grid-cols-2 gap-4 mb-5">
                <div class="bg-slate-50 rounded-xl p-3">
                  <p class="text-[9px] text-slate-400 font-bold uppercase">Company</p>
                  <p class="text-sm font-bold text-slate-800">{{ training.company || getClientName(training.clientId) }}</p>
                </div>
                <div class="bg-slate-50 rounded-xl p-3">
                  <p class="text-[9px] text-slate-400 font-bold uppercase">Mode</p>
                  <p class="text-sm font-bold text-slate-800">{{ training.mode || 'N/A' }}</p>
                </div>
                <div class="bg-slate-50 rounded-xl p-3">
                  <p class="text-[9px] text-slate-400 font-bold uppercase">Duration</p>
                  <p class="text-sm font-bold text-slate-800">{{ training.duration || 'N/A' }} Days</p>
                </div>
                <div class="bg-slate-50 rounded-xl p-3">
                  <p class="text-[9px] text-slate-400 font-bold uppercase">Payment Type</p>
                  <p class="text-sm font-bold text-slate-800">{{ training.paymentType || 'N/A' }}</p>
                </div>
              </div>

              <!-- Schedule Info -->
              <div class="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100 mb-5">
                <div class="flex-1">
                  <p class="text-[9px] text-green-600 font-bold uppercase">Start Date</p>
                  <p class="text-sm font-bold text-green-800">{{ training.startDate ? (training.startDate | date:'mediumDate') : (training.preferredDates | date:'mediumDate') }}</p>
                </div>
                <div class="text-green-300">→</div>
                <div class="flex-1 text-right">
                  <p class="text-[9px] text-green-600 font-bold uppercase">End Date</p>
                  <p class="text-sm font-bold text-green-800">{{ training.endDate ? (training.endDate | date:'mediumDate') : 'TBD' }}</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <!-- PO Acceptance Flow -->
                <div *ngIf="training.status === 'Trainer Assigned'" class="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div class="flex items-center gap-3 mb-3">
                    <span class="text-xl">📄</span>
                    <div class="flex-1">
                      <p class="text-xs font-bold text-indigo-700">Trainer PO Received</p>
                      <p class="text-[10px] text-indigo-600">{{ training.trainerPO?.filename }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-2 mb-4 bg-white/70 p-3 rounded-lg">
                    <div class="text-[9px]">
                      <p class="text-slate-400 font-bold uppercase">Model</p>
                      <p class="font-bold text-slate-700">{{ training.trainerPO?.paymentModel }}</p>
                    </div>
                    <div class="text-[9px]">
                      <p class="text-slate-400 font-bold uppercase">Rate</p>
                      <p class="font-bold text-slate-700">₹{{ training.trainerPO?.rate | number }}</p>
                    </div>
                    <div class="text-[9px]">
                      <p class="text-slate-400 font-bold uppercase">Total</p>
                      <p class="font-bold text-indigo-700">₹{{ training.trainerPO?.totalPayable | number }}</p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="updateStatus(training, 'Active')" class="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all">
                      ✓ Accept PO & Start
                    </button>
                    <button class="px-4 py-2.5 bg-white text-slate-600 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all">
                      Reject
                    </button>
                  </div>
                </div>

                <!-- Mark Complete Flow -->
                <div *ngIf="training.status === 'Active'">
                  <button (click)="updateStatus(training, 'Completed')" class="w-full px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                    <span>✅</span> Mark Training as Completed
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Ongoing -->
          <div *ngIf="ongoingTrainings().length === 0" class="col-span-full py-16 text-center bg-green-50/50 rounded-2xl border-2 border-dashed border-green-200">
            <div class="text-4xl mb-4">🎯</div>
            <h3 class="text-lg font-bold text-slate-800">No Ongoing Trainings</h3>
            <p class="text-slate-500 mt-2 max-w-sm mx-auto text-sm">You don't have any active trainings at the moment. Check below for pending requests.</p>
          </div>
        </div>
      </section>

      <!-- Past Trainings Section -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-blue-500 rounded-full"></div>
          <h3 class="text-lg font-bold text-slate-800">Past Trainings</h3>
          <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{{ pastTrainings().length }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          <div *ngFor="let training of pastTrainings()" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
            <!-- Card Header -->
            <div class="bg-gradient-to-r from-slate-600 to-slate-700 px-5 py-4 text-white">
              <div class="flex justify-between items-start">
                <div>
                  <span [class]="getPastStatusBadge(training.status)" class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {{ training.status }}
                  </span>
                  <h4 class="text-base font-bold mt-2">{{ training.title }}</h4>
                  <p class="text-xs opacity-80">{{ training.technology }}</p>
                </div>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-5">
              <!-- Quick Info -->
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p class="text-[9px] text-slate-400 font-bold uppercase">Company</p>
                  <p class="text-sm font-semibold text-slate-700">{{ training.company || getClientName(training.clientId) }}</p>
                </div>
                <div>
                  <p class="text-[9px] text-slate-400 font-bold uppercase">Duration</p>
                  <p class="text-sm font-semibold text-slate-700">{{ training.duration || 'N/A' }} Days</p>
                </div>
              </div>

              <!-- Dates -->
              <div class="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl mb-4">
                <div>
                  <p class="text-[8px] text-slate-400 font-bold uppercase">Started</p>
                  <p class="text-xs font-bold text-slate-700">{{ training.startDate | date:'MMM d, yyyy' }}</p>
                </div>
                <span class="text-slate-300">→</span>
                <div class="text-right">
                  <p class="text-[8px] text-slate-400 font-bold uppercase">Ended</p>
                  <p class="text-xs font-bold text-slate-700">{{ training.endDate | date:'MMM d, yyyy' }}</p>
                </div>
              </div>

              <!-- Earnings -->
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                <span class="text-xs font-bold text-blue-700">Total Earned</span>
                <span class="text-lg font-black text-blue-700">₹{{ training.trainerPO?.totalPayable || training.budget | number }}</span>
              </div>

              <!-- Invoice Status -->
              <div *ngIf="training.trainerInvoice" class="flex items-center justify-between p-3 rounded-xl" [ngClass]="{
                'bg-green-50 border border-green-100': training.trainerInvoice.status === 'Released',
                'bg-amber-50 border border-amber-100': training.trainerInvoice.status === 'Pending Approval',
                'bg-slate-50 border border-slate-100': training.trainerInvoice.status !== 'Released' && training.trainerInvoice.status !== 'Pending Approval'
              }">
                <span class="text-xs font-bold" [ngClass]="{
                  'text-green-700': training.trainerInvoice.status === 'Released',
                  'text-amber-700': training.trainerInvoice.status === 'Pending Approval',
                  'text-slate-700': training.trainerInvoice.status !== 'Released' && training.trainerInvoice.status !== 'Pending Approval'
                }">Invoice: {{ training.trainerInvoice.status }}</span>
                <span *ngIf="training.trainerInvoice.status === 'Released'" class="text-green-600">✓</span>
                <span *ngIf="training.trainerInvoice.status === 'Pending Approval'" class="text-amber-600">⏳</span>
              </div>

              <!-- Upload Invoice Button -->
              <div *ngIf="training.status === 'Completed' && !training.trainerInvoice" class="mt-3">
                <button (click)="openInvoiceModal(training)" class="w-full px-4 py-2.5 bg-white text-slate-700 rounded-xl text-xs font-bold border-2 border-dashed border-slate-300 hover:border-primary-400 hover:text-primary-600 transition-all flex items-center justify-center gap-2">
                  📤 Upload Invoice
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State for Past -->
          <div *ngIf="pastTrainings().length === 0" class="col-span-full py-16 text-center bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200">
            <div class="text-4xl mb-4">📚</div>
            <h3 class="text-lg font-bold text-slate-800">No Past Trainings Yet</h3>
            <p class="text-slate-500 mt-2 max-w-sm mx-auto text-sm">Once you complete trainings, they will appear here as your training history.</p>
          </div>
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
export class TrainerAssignmentsComponent implements OnInit {
   trainings = signal<any[]>([]);
   clients = signal<any[]>([]);

   myAssignments = computed(() => this.trainings().filter(t => t.trainerId === this.auth.currentUser()?.id));
   pendingPOs = computed(() => this.myAssignments().filter(t => t.status === 'Trainer Assigned'));
   
   // Ongoing trainings - Active or Trainer Assigned (waiting for PO acceptance)
   ongoingTrainings = computed(() => this.myAssignments().filter(t => 
      t.status === 'Active' || t.status === 'Trainer Assigned'
   ));
   
   // Past trainings - Completed, Payment Done, Invoice Generated, etc.
   pastTrainings = computed(() => this.myAssignments().filter(t => 
      !['Active', 'Trainer Assigned'].includes(t.status)
   ));

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

   getPastStatusBadge(status: string): string {
      switch (status) {
         case 'Completed': return 'bg-blue-400/30 text-blue-100';
         case 'Payment Done': return 'bg-green-400/30 text-green-100';
         case 'Invoice Generated': return 'bg-amber-400/30 text-amber-100';
         default: return 'bg-white/20 text-white';
      }
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
