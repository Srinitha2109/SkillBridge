// import { Component, signal, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { DataService } from '../../../core/services/data.service';
// import { AuthService } from '../../../core/services/auth.service';

// @Component({
//   selector: 'app-client-requests',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <div class="space-y-8">
//       <div class="flex justify-between items-center">
//         <h2 class="text-2xl font-bold text-slate-800">My Purchase Orders</h2>
//         <button (click)="showForm.set(true)" class="btn-primary flex items-center gap-2">
//           <span>+</span> Raise PO
//         </button>
//       </div>

//       <!-- New Request Form Modal -->
//       <div *ngIf="showForm()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//         <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
//           <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//              <h3 class="text-xl font-bold text-slate-800">Raise Purchase Order</h3>
//              <button (click)="showForm.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
//           </div>
//           <form (ngSubmit)="submitRequest()" #requestForm="ngForm" class="p-8 space-y-6">
//             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div class="md:col-span-2">
//                 <label class="block text-sm font-medium text-slate-700 mb-1">Client Company Name</label>
//                 <input type="text" name="company" [(ngModel)]="newRequest.company" required placeholder="e.g., Tech Corp">
//               </div>
//               <div>
//                 <label class="block text-sm font-medium text-slate-700 mb-1">Technology</label>
//                 <input type="text" name="technology" [(ngModel)]="newRequest.technology" required placeholder="e.g., Angular 21">
//               </div>
//               <div>
//                 <label class="block text-sm font-medium text-slate-700 mb-1">Duration (hours/days)</label>
//                 <input type="text" name="duration" [(ngModel)]="newRequest.duration" required placeholder="e.g., 40 hours">
//               </div>
//               <div>
//                 <label class="block text-sm font-medium text-slate-700 mb-1">Total Cost (₹)</label>
//                 <input type="number" name="budget" [(ngModel)]="newRequest.budget" required placeholder="50000">
//               </div>
//               <div>
//                 <label class="block text-sm font-medium text-slate-700 mb-1">Mode of Training</label>
//                 <select name="mode" [(ngModel)]="newRequest.mode" required class="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500">
//                    <option value="Online">Online</option>
//                    <option value="Offline">Offline</option>
//                    <option value="Hybrid">Hybrid</option>
//                 </select>
//               </div>
//               <div class="md:col-span-2">
//                 <label class="block text-sm font-medium text-slate-700 mb-1">PO Number (from client)</label>
//                 <input type="text" name="poNumber" [(ngModel)]="newRequest.poNumber" required placeholder="e.g., PO-12345">
//               </div>
//             </div>

//             <div class="flex gap-4 pt-4">
//               <button type="button" (click)="showForm.set(false)" class="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
//                 Cancel
//               </button>
//               <button type="submit" [disabled]="!requestForm.form.valid" class="flex-1 btn-primary">
//                 {{ submitting() ? 'Submitting...' : 'Raise PO' }}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       <!-- Requests Table -->
//       <div class="backdrop-blur-md bg-white/70 rounded-2xl shadow-sm border border-white/30 overflow-hidden">
//         <table class="w-full text-left border-collapse">
//           <thead>
//             <tr class="bg-slate-50/50">
//               <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
//               <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Technology</th>
//               <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
//               <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Budget</th>
//             </tr>
//           </thead>
//           <tbody class="divide-y divide-slate-100 uppercase text-[11px] font-bold">
//             <tr *ngFor="let req of requests()" class="hover:bg-white/50 transition-colors">
//               <td class="px-6 py-4 text-slate-800">{{ req.title }}</td>
//               <td class="px-6 py-4"><span class="px-2 py-1 bg-slate-100 rounded-lg">{{ req.technology }}</span></td>
//               <td class="px-6 py-4">
//                 <span [class]="getStatusClass(req.status)" class="px-2 py-1 rounded-full text-[10px] tracking-widest uppercase">
//                   {{ req.status }}
//                 </span>
//               </td>
//               <td class="px-6 py-4 text-right text-slate-900">₹{{ req.budget }}</td>
//             </tr>
//           </tbody>
//         </table>
//         <div *ngIf="requests().length === 0" class="py-20 text-center">
//            <p class="text-slate-400">You haven't raised any training requests yet.</p>
//         </div>
//       </div>
//     </div>
//   `
// })
// export class ClientRequestsComponent implements OnInit {
//   requests = signal<any[]>([]);
//   showForm = signal(false);
//   submitting = signal(false);

//   newRequest = {
//     company: '',
//     technology: '',
//     duration: '',
//     budget: 0,
//     mode: 'Online',
//     poNumber: ''
//   };

//   constructor(private data: DataService, private auth: AuthService) { }

//   ngOnInit() {
//     this.loadRequests();
//   }

//   loadRequests() {
//     this.data.get<any[]>('trainings').subscribe(data => {
//       const clientId = (this.auth.currentUser() as any)?.companyId || this.auth.currentUser()?.id;
//       this.requests.set(data.filter(r => r.clientId === clientId));
//     });
//   }

//   submitRequest() {
//     this.submitting.set(true);
//     const userId = this.auth.currentUser()?.id;
//     const clientId = (this.auth.currentUser() as any)?.companyId || userId;

//     const payload = {
//       ...this.newRequest,
//       title: `${this.newRequest.company} - ${this.newRequest.technology}`,
//       clientId,
//       status: 'Requested',
//       clientPO: { filename: `PO_${this.newRequest.poNumber}.pdf`, status: 'Uploaded', poNumber: this.newRequest.poNumber },
//       trainerId: null,
//       trainerPO: null,
//       clientInvoice: null,
//       trainerInvoice: null,
//       timestamp: new Date().toISOString()
//     };

//     this.data.post<any>('trainings', payload).subscribe(() => {
//       // Log Audit
//       this.data.post('auditLogs', {
//         timestamp: new Date().toISOString(),
//         userId,
//         action: 'RAISE_REQUEST',
//         details: `Client raised request for ${payload.title}`
//       }).subscribe();

//       this.showForm.set(false);
//       this.submitting.set(false);
//       this.loadRequests();
//       this.resetForm();
//     });
//   }

//   resetForm() {
//     this.newRequest = { company: '', technology: '', duration: '', budget: 0, mode: 'Online', poNumber: '' };
//   }

//   getStatusClass(status: string) {
//     switch (status) {
//       case 'Active': return 'bg-green-100 text-green-700';
//       case 'Requested': return 'bg-amber-100 text-amber-700';
//       case 'Completed': return 'bg-blue-100 text-blue-700';
//       default: return 'bg-slate-100 text-slate-700';
//     }
//   }
// }


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
        <button (click)="openForm()" class="btn-primary flex items-center gap-2">
          <span>+</span> Raise PO
        </button>
      </div>

      <!-- New Request Form Modal -->
      <div *ngIf="showForm()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 backdrop-blur-md">
             <div>
                <h3 class="text-xl font-bold text-slate-800">Raise Purchase Order</h3>
                <p class="text-sm text-slate-400">Values marked with * are required</p>
             </div>
             <button (click)="showForm.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
          </div>
          
          <form (ngSubmit)="submitRequest()" #requestForm="ngForm" class="p-8 space-y-8">
            
            <!-- Contact Details Section -->
            <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
               <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Client Details
               </h4>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                    <input type="text" name="company" [(ngModel)]="newRequest.company" [readonly]="!!newRequest.company" 
                           class="w-full bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200 rounded-xl focus:ring-0">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                    <input type="text" name="clientName" [value]="currentUser()?.name" readonly 
                           class="w-full bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200 rounded-xl focus:ring-0">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input type="email" name="email" [value]="currentUser()?.email" readonly 
                           class="w-full bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200 rounded-xl focus:ring-0">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Phone Number <span class="text-red-500">*</span></label>
                    <input type="tel" name="phone" [(ngModel)]="newRequest.phone" required placeholder="+91 98765 43210" 
                           class="w-full border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500">
                  </div>
               </div>
            </div>

            <!-- Request Details Section -->
            <div class="space-y-4">
               <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Training Requirements
               </h4>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Technology / Topic <span class="text-red-500">*</span></label>
                    <input type="text" name="technology" [(ngModel)]="newRequest.technology" required placeholder="e.g., Advanced Angular" 
                           class="w-full border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Duration <span class="text-red-500">*</span></label>
                    <input type="text" name="duration" [(ngModel)]="newRequest.duration" required placeholder="e.g., 40 Hours / 5 Days" 
                           class="w-full border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Proposed Start Date <span class="text-red-500">*</span></label>
                    <input type="date" name="startDate" [(ngModel)]="newRequest.startDate" required 
                           class="w-full border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Batch Size (Approx) <span class="text-red-500">*</span></label>
                    <input type="number" name="batchSize" [(ngModel)]="newRequest.batchSize" required placeholder="e.g., 25" 
                           class="w-full border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 font-mono">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Training Mode <span class="text-red-500">*</span></label>
                    <select name="mode" [(ngModel)]="newRequest.mode" required class="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500">
                       <option value="Online">Online</option>
                       <option value="Offline">Classroom / Offline</option>
                       <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div *ngIf="newRequest.mode !== 'Online'">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Location <span class="text-red-500">*</span></label>
                    <input type="text" name="location" [(ngModel)]="newRequest.location" [required]="newRequest.mode !== 'Online'" placeholder="e.g., Chennai Office" 
                           class="w-full border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Proposed Budget (₹) <span class="text-red-500">*</span></label>
                    <input type="number" name="budget" [(ngModel)]="newRequest.budget" required min="1" placeholder="0.00" 
                           class="w-full border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 font-mono">
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-slate-700 mb-1">System Generated PO Number</label>
                    <div class="flex items-center gap-3">
                       <input type="text" name="poNumber" [(ngModel)]="newRequest.poNumber" readonly 
                              class="flex-1 bg-slate-100 text-slate-600 font-mono font-bold tracking-wider border-slate-200 rounded-xl focus:ring-0">
                       <span class="text-xs text-slate-400 italic">Auto-generated</span>
                    </div>
                  </div>
               </div>
            </div>

            <div class="flex gap-4 pt-6 border-t border-slate-100">
              <button type="button" (click)="showForm.set(false)" class="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                Cancel Request
              </button>
              <button type="submit" [disabled]="!requestForm.form.valid || submitting()" class="flex-1 btn-primary py-4 shadow-xl shadow-primary-200">
                {{ submitting() ? 'Creating Purchase Order...' : 'Confirm & Raise PO' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Requests Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let req of requests()" class="group relative bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-100 transition-all duration-500 flex flex-col min-h-[340px]">
           
           <!-- Hover Overlay Detail Card -->
           <div class="absolute inset-x-0 bottom-0 bg-slate-900/95 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 p-8 flex flex-col justify-center text-white min-h-[70%]">
              <h4 class="text-primary-400 font-bold uppercase tracking-widest text-[10px] mb-6">Full Specifications</h4>
              <div class="space-y-5">
                 <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">📅</div>
                    <div>
                       <label class="block text-slate-500 text-[10px] uppercase font-bold tracking-tight">Proposed Start</label>
                      
                    </div>
                 </div>
                 <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">⏱️</div>
                    <div>
                       <label class="block text-slate-500 text-[10px] uppercase font-bold tracking-tight">Training Duration</label>
                       <p class="text-sm font-bold">{{ req.duration }}</p>
                    </div>
                 </div>
                 <div *ngIf="req.mode !== 'Online'" class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">📍</div>
                    <div>
                       <label class="block text-slate-500 text-[10px] uppercase font-bold tracking-tight">Training Venue</label>
                       <p class="text-sm font-bold">{{ req.location }}</p>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Content -->
           <div class="p-8 pb-4 relative z-10">
              <div class="flex justify-between items-start mb-6">
                 <div>
                   <p class="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">{{ req.clientPO?.poNumber }}</p>
                   <h3 class="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">{{ req.technology }}</h3>
                 </div>
                 <span [class]="getStatusClass(req.status)" class="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                   {{ req.status }}
                 </span>
              </div>
              
              <div class="flex items-center gap-4 mb-8">
                 <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 transition-colors group-hover:bg-white group-hover:border-slate-200">
                    <span class="w-2.5 h-2.5 rounded-full" [class]="req.mode === 'Online' ? 'bg-indigo-500 shadow-md shadow-indigo-200' : 'bg-emerald-500 shadow-md shadow-emerald-200'"></span>
                    <span class="text-xs font-black text-slate-600 uppercase tracking-tighter">{{ req.mode }}</span>
                 </div>
                 <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 transition-colors group-hover:bg-white group-hover:border-slate-200">
                    <span class="text-sm">👥</span>
                    <span class="text-xs font-black text-slate-600 uppercase tracking-tighter">{{ req.batchSize || '0' }} PAX</span>
                 </div>
              </div>
           </div>

           <!-- Footer -->
           <div class="mt-auto p-8 pt-0 relative z-10 flex justify-between items-end">
              <div>
                 <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Purchase Order Budget</p>
                 <p class="text-3xl font-black text-slate-900 tracking-tight transition-all duration-300 group-hover:scale-105 origin-left">₹{{ req.budget | number }}</p>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary-600 group-hover:border-primary-600 group-hover:text-white group-hover:rotate-6 transition-all shadow-sm">
                 <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
           </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="requests().length === 0" class="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
           <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">📄</div>
           <h3 class="text-slate-800 font-black mb-3 text-2xl tracking-tight">No Active Orders</h3>
           <p class="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">Your purchase order history is currently empty. Start by raising a new request above.</p>
        </div>
      </div>
    </div>
  `
})
export class ClientRequestsComponent implements OnInit {
  requests = signal<any[]>([]);
  showForm = signal(false);
  submitting = signal(false);
  get currentUser() { return this.auth.currentUser; }

  newRequest = {
    company: '',
    phone: '',
    technology: '',
    duration: '',
    startDate: '',
    batchSize: null,
    location: '',
    budget: null,
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

  openForm() {
    // Auto-fill logic
    const user = this.currentUser();
    // Generate PO Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    this.newRequest = {
      company: (user as any)?.company || 'My Company', // Fallback if company not in user object
      phone: '',
      technology: '',
      duration: '',
      startDate: '',
      batchSize: null,
      location: '',
      budget: null,
      mode: 'Online',
      poNumber: `PO-${dateStr}-${randomSuffix}`
    };

    // If we have clients endpoint, we could fetch company name properly but utilizing user object for now
    this.showForm.set(true);
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
      clientPO: {
        filename: `${this.newRequest.poNumber}.pdf`,
        status: 'Uploaded',
        poNumber: this.newRequest.poNumber,
        generatedDate: new Date().toISOString()
      },
      trainerId: null,
      trainerPO: null,
      clientInvoice: null,
      trainerInvoice: null,
      contactDetails: {
        name: this.currentUser()?.name,
        email: this.currentUser()?.email,
        phone: this.newRequest.phone
      },
      timestamp: new Date().toISOString()
    };

    this.data.post<any>('trainings', payload).subscribe(() => {
      // Log Audit
      this.data.post('auditLogs', {
        timestamp: new Date().toISOString(),
        userId,
        action: 'RAISE_REQUEST',
        details: `Client raised PO ${this.newRequest.poNumber} for ${this.newRequest.technology}`
      }).subscribe();

      this.showForm.set(false);
      this.submitting.set(false);
      this.loadRequests();
    });
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