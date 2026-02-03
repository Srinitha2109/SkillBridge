import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Training Management</h2>
        <div class="flex gap-2">
           <span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold uppercase tabular-nums">
             {{ pendingRequests().length }} Requests
           </span>
        </div>
      </div>

      <div class="backdrop-blur-md bg-white/70 rounded-2xl shadow-sm border border-white/30 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Training</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trainer</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-[11px] font-bold">
            <tr *ngFor="let training of trainings()" class="hover:bg-white/50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800">{{ training.title }}</div>
                <div class="text-[10px] text-slate-400 font-normal uppercase mt-0.5">{{ training.technology }}</div>
              </td>
              <td class="px-6 py-4 text-slate-600">
                {{ getClientName(training.clientId) }}
              </td>
              <td class="px-6 py-4">
                <div *ngIf="training.trainerId" class="text-primary-600">
                  {{ getTrainerName(training.trainerId) }}
                </div>
                <div *ngIf="!training.trainerId" class="text-amber-500 italic">
                  Not Assigned
                </div>
              </td>
              <td class="px-6 py-4">
                <span [class]="getStatusClass(training.status)" class="px-2 py-1 rounded-full text-[10px] tracking-widest uppercase">
                  {{ training.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  *ngIf="!training.trainerId" 
                  (click)="openAssignModal(training)"
                  class="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-all text-[10px] uppercase font-bold"
                >
                  Assign Trainer
                </button>
                <div class="flex justify-end gap-2">
                  
                   <button 
                     *ngIf="training.status === 'Active'"
                     (click)="markCompleted(training)"
                     class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-[9px] uppercase font-bold"
                   >
                     Complete Training
                   </button>
                   <button 
                     *ngIf="training.status === 'Completed' && !training.clientInvoice"
                     (click)="generateInvoice(training)"
                     class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-[9px] uppercase font-bold shadow-md shadow-indigo-100"
                   >
                     Generate Invoice 
                   </button>
                   
                   
                   <button (click)="openTracker(training)" class="text-slate-400 hover:text-slate-600 transition-colors">👁️</button>
                   <button (click)="deleteTraining(training.id)" class="text-slate-400 hover:text-red-500 transition-colors">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="trainings().length === 0" class="py-20 text-center">
           <p class="text-slate-400">No training requests found.</p>
        </div>
      </div>

      <!-- Training Tracker Modal -->
      <div *ngIf="showTrackerModal()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
          <!-- Fixed Header -->
          <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
             <div>
                <h3 class="text-xl font-bold text-slate-800">Training Progress Tracker</h3>
                <p class="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">Tracking: {{ selectedTraining()?.title }}</p>
             </div>
             <button (click)="showTrackerModal.set(false)" class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all">✕</button>
          </div>
          
          <!-- Scrollable Content -->
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
             <!-- Visual Timeline -->
             <div class="relative px-4">
                <div class="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                
                <div class="space-y-10 relative">
                   <div *ngFor="let step of trackerSteps; let i = index" class="flex items-start gap-10">
                      <div [class]="getStepCircleClass(step.status)" class="w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-md z-10 transition-all duration-500 shrink-0">
                      </div>
                      <div class="flex-1 pt-1">
                         <h4 [class]="isStepActive(step.status) ? 'text-slate-800' : 'text-slate-400'" class="font-bold text-base">{{ step.label }}</h4>
                         <p class="text-xs text-slate-500 mt-0.5">{{ step.desc }}</p>
                         <div *ngIf="isStepCompleted(step.status)" class="mt-2 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span class="text-[9px] font-bold text-green-600 uppercase">Completed</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div class="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
                <div class="flex items-center gap-3">
                   <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-sm"></div>
                   <div>
                      <p class="text-[9px] text-slate-500 font-bold uppercase">Client</p>
                      <p class="text-xs font-bold text-slate-700">{{ getClientName(selectedTraining()?.clientId) }}</p>
                   </div>
                </div>
                <div *ngIf="selectedTraining()?.trainerId" class="flex items-center gap-3">
                   <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-sm"></div>
                   <div>
                      <p class="text-[9px] text-slate-500 font-bold uppercase">Trainer</p>
                      <p class="text-xs font-bold text-slate-700">{{ getTrainerName(selectedTraining()?.trainerId) }}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Assign Trainer & Map PO Modal -->
      <div *ngIf="showAssignModal()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 class="text-xl font-bold text-slate-800">Map PO & Assign Trainer</h3>
             <button (click)="showAssignModal.set(false)" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-6">
               <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Client PO Details</p>
                  <h4 class="text-lg font-bold text-slate-800">{{ selectedTraining()?.company }}</h4>
                  <p class="text-sm text-slate-600">{{ selectedTraining()?.technology }} - {{ selectedTraining()?.duration }}</p>
                  <p class="text-sm font-bold text-primary-600 mt-1">₹{{ selectedTraining()?.budget }} (Client Budget)</p>
               </div>

                  <div class="space-y-4">
                  <div class="flex justify-between items-center">
                     <h5 class="text-xs font-bold text-slate-500 uppercase">Select Trainer</h5>
                     <span *ngIf="!hasMatches()" class="text-[9px] text-amber-500 font-bold uppercase">No exact match found - showing all</span>
                  </div>
                  <div class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                     <div *ngFor="let trainer of filteredTrainers()" 
                          (click)="selectedTrainerId.set(trainer.id)"
                          [class]="selectedTrainerId() === trainer.id ? 'border-primary-500 bg-primary-50' : 'border-slate-100 hover:border-slate-300'"
                          class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between">
                        <div class="flex items-center gap-3">
                           <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">👨‍🏫</div>
                           <div>
                              <h5 class="font-bold text-slate-800 text-sm">{{ trainer.name }}</h5>
                              <p class="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[120px]">{{ trainer.techStack.join(', ') }}</p>
                           </div>
                        </div>
                        <div class="text-[10px] text-amber-500 font-bold">★ {{ trainer.rating }}</div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="space-y-6">
               <h5 class="text-xs font-bold text-slate-500 uppercase">Enrollment & Trainer PO Details</h5>
               
               <div class="grid grid-cols-2 gap-4">
                  <div>
                     <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date</label>
                     <input type="date" [(ngModel)]="enrollmentDetails.startDate" class="w-full text-xs rounded-lg border-slate-200">
                  </div>
                  <div>
                     <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date</label>
                     <input type="date" [(ngModel)]="enrollmentDetails.endDate" class="w-full text-xs rounded-lg border-slate-200">
                  </div>
                  <div>
                     <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Model</label>
                     <select [(ngModel)]="enrollmentDetails.paymentModel" class="w-full text-xs rounded-lg border-slate-200">
                        <option value="Per Hour">Per Hour</option>
                        <option value="Per Batch">Per Batch</option>
                        <option value="Fixed">Fixed</option>
                     </select>
                  </div>
                  <div>
                     <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trainer Rate (₹)</label>
                     <input type="number" [(ngModel)]="enrollmentDetails.rate" class="w-full text-xs rounded-lg border-slate-200">
                  </div>
               </div>

               <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div class="flex justify-between items-center mb-1">
                     <span class="text-[10px] text-indigo-600 font-bold uppercase">Total Payable to Trainer</span>
                     <span class="text-sm font-black text-indigo-700">₹{{ calculateTotalPayable() }}</span>
                  </div>
                  <p class="text-[10px] text-indigo-400">Profit Margin: ₹{{ (selectedTraining()?.budget || 0) - calculateTotalPayable() }}</p>
               </div>

               <div class="flex gap-4 pt-4">
                  <button (click)="showAssignModal.set(false)" class="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm">
                    Cancel
                  </button>
                  <button (click)="assignTrainer()" [disabled]="!selectedTrainerId() || !enrollmentDetails.startDate || !enrollmentDetails.rate" class="flex-1 btn-primary text-sm py-2">
                    Generate Trainer PO
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminEnrollmentsComponent implements OnInit {
  trainings = signal<any[]>([]);
  trainers = signal<any[]>([]);
  clients = signal<any[]>([]);

  showAssignModal = signal(false);
  showTrackerModal = signal(false);
  selectedTraining = signal<any>(null);
  selectedTrainerId = signal<string | null>(null);

  enrollmentDetails = {
    startDate: '',
    endDate: '',
    paymentType: 'Net 30',
    paymentModel: 'Fixed',
    rate: 0
  };

  trackerSteps = [
    { status: 'Requested', label: 'Requested', desc: 'Client raised training request' },
    { status: 'Trainer Assigned', label: 'Assigned', desc: 'Admin assigned a trainer' },
    { status: 'Active', label: 'In Progress', desc: 'Training is currently being delivered' },
    { status: 'Completed', label: 'Delivered', desc: 'Trainer marked training as completed' },
    { status: 'Invoice Generated', label: 'Billed', desc: 'Admin generated client invoice' },
    { status: 'Payment Done', label: 'Paid', desc: 'Client confirmed payment' }
  ];

  pendingRequests = computed(() => this.trainings().filter(t => t.status === 'Requested'));

  filteredTrainers = computed(() => {
    if (!this.selectedTraining()) return this.trainers();
    const tech = (this.selectedTraining().technology || '').toLowerCase();
    const matched = this.trainers().filter(t =>
      t.techStack.some((ts: string) => ts.toLowerCase().includes(tech)) ||
      tech.includes(t.techStack[0].toLowerCase())
    );
    return matched.length > 0 ? matched : this.trainers();
  });

  hasMatches = computed(() => {
    if (!this.selectedTraining()) return true;
    const tech = (this.selectedTraining().technology || '').toLowerCase();
    return this.trainers().some(t =>
      t.techStack.some((ts: string) => ts.toLowerCase().includes(tech)) ||
      tech.includes(t.techStack[0].toLowerCase())
    );
  });

  calculateTotalPayable() {
    // Basic simulation: if duration is like '40 hours', we extract number
    const durationStr = this.selectedTraining()?.duration || '';
    const hoursMatch = durationStr.match(/(\d+)/);
    const duration = hoursMatch ? parseInt(hoursMatch[1]) : 1;

    if (this.enrollmentDetails.paymentModel === 'Per Hour') {
      return duration * this.enrollmentDetails.rate;
    }
    return this.enrollmentDetails.rate;
  }

  constructor(private data: DataService, private auth: AuthService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.data.get<any[]>('trainings').subscribe(d => this.trainings.set(d));
    this.data.get<any[]>('trainers').subscribe(d => this.trainers.set(d));
    this.data.get<any[]>('clients').subscribe(d => this.clients.set(d));
  }

  getClientName(id: string) {
    return this.clients().find(c => c.id === id)?.name || 'Unknown Client';
  }

  getTrainerName(id: string) {
    return this.trainers().find(t => t.id === id)?.name || 'Unknown Trainer';
  }

  openAssignModal(training: any) {
    this.selectedTraining.set(training);
    this.selectedTrainerId.set(null);
    this.showAssignModal.set(true);
  }

  openTracker(training: any) {
    this.selectedTraining.set(training);
    this.showTrackerModal.set(true);
  }

  getStepCircleClass(stepStatus: string) {
    const training = this.selectedTraining();
    if (!training) return 'bg-slate-100 text-slate-300';

    const statusOrder = ['Requested', 'Trainer Assigned', 'Active', 'Completed', 'Invoice Generated', 'Payment Done'];
    const currentIdx = statusOrder.indexOf(training.status);
    const stepIdx = statusOrder.indexOf(stepStatus);

    if (training.status === stepStatus) return 'bg-primary-600 text-white shadow-primary-500/50 scale-110';
    if (stepIdx < currentIdx) return 'bg-green-100 text-green-600';
    return 'bg-slate-50 text-slate-300 border-2 border-slate-100';
  }

  isStepActive(stepStatus: string) {
    return this.selectedTraining()?.status === stepStatus;
  }

  isStepCompleted(stepStatus: string) {
    const statusOrder = ['Requested', 'Trainer Assigned', 'Active', 'Completed', 'Invoice Generated', 'Payment Done'];
    const currentIdx = statusOrder.indexOf(this.selectedTraining()?.status || '');
    const stepIdx = statusOrder.indexOf(stepStatus);
    return stepIdx < currentIdx;
  }

  assignTrainer() {
    if (!this.selectedTrainerId() || !this.selectedTraining()) return;

    const totalPayable = this.calculateTotalPayable();

    const updated = {
      ...this.selectedTraining(),
      trainerId: this.selectedTrainerId(),
      status: 'Trainer Assigned',
      enrollmentId: `ENR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      startDate: this.enrollmentDetails.startDate,
      endDate: this.enrollmentDetails.endDate,
      paymentType: this.enrollmentDetails.paymentType,
      trainerPO: {
        filename: `TPO_${this.selectedTrainerId()}_${this.selectedTraining().id}.pdf`,
        status: 'Generated',
        trainerName: this.getTrainerName(this.selectedTrainerId()!),
        technology: this.selectedTraining().technology,
        paymentModel: this.enrollmentDetails.paymentModel,
        rate: this.enrollmentDetails.rate,
        totalPayable: totalPayable,
        createdAt: new Date().toISOString()
      }
    };

    this.data.put('trainings', updated).subscribe(() => {
      // Audit log
      this.data.post('auditLogs', {
        timestamp: new Date().toISOString(),
        userId: this.auth.currentUser()?.id,
        action: 'ASSIGN_TRAINER',
        details: `Assigned ${this.getTrainerName(updated.trainerId)} to ${updated.title}`
      }).subscribe();

      // Notification to Client
      this.data.post('notifications', {
        userId: updated.clientId, // Assuming user ID matches client ID for demo simplicity or map it
        message: `Trainer has been assigned to your request: ${updated.title}`,
        read: false,
        timestamp: new Date().toISOString()
      }).subscribe();

      this.showAssignModal.set(false);
      this.resetEnrollmentForm();
      this.loadData();
    });
  }

  resetEnrollmentForm() {
    this.enrollmentDetails = {
      startDate: '',
      endDate: '',
      paymentType: 'Net 30',
      paymentModel: 'Fixed',
      rate: 0
    };
  }

  markActive(training: any) {
    const updated = { ...training, status: 'Active' };
    this.data.put('trainings', updated).subscribe(() => this.loadData());
  }

  markCompleted(training: any) {
    const updated = { ...training, status: 'Completed' };
    this.data.put('trainings', updated).subscribe(() => {
      this.data.post('auditLogs', {
        timestamp: new Date().toISOString(),
        userId: this.auth.currentUser()?.id,
        action: 'MARK_COMPLETED',
        details: `Training ${training.title} marked as COMPLETED`
      }).subscribe();
      this.loadData();
    });
  }

  generateInvoice(training: any) {
    const cost = training.budget;
    const gstCount = cost * 0.18;
    const total = cost + gstCount;
    const invoiceNo = `INV-CL-${Math.floor(1000 + Math.random() * 9000)}`;

    const clientInvoice = {
      invoiceNumber: invoiceNo,
      companyName: this.getClientName(training.clientId),
      trainingName: training.title,
      technology: training.technology,
      duration: training.duration || 'N/A',
      startDate: training.startDate,
      endDate: training.endDate,
      cost: cost,
      gst: gstCount,
      totalAmount: total,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      poReference: training.clientPO?.poNumber || training.clientPO?.filename || 'PO_PENDING',
      status: 'Generated'
    };

    const updated = { ...training, clientInvoice, status: 'Invoice Generated' };

    this.data.put('trainings', updated).subscribe(() => {
      this.data.post('auditLogs', {
        timestamp: new Date().toISOString(),
        userId: this.auth.currentUser()?.id,
        action: 'GENERATE_INVOICE',
        details: `Generated client invoice ${invoiceNo} for ${training.title}`
      }).subscribe();

      this.loadData();
    });
  }

  deleteTraining(id: string) {
    if (confirm('Are you sure you want to delete this training request?')) {
      this.data.delete('trainings', id).subscribe(() => this.loadData());
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Requested': return 'bg-amber-100 text-amber-700';
      case 'Trainer Assigned': return 'bg-indigo-100 text-indigo-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
