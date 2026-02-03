import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700 overflow-hidden relative">
      <!-- Background Elements -->
      <div class="absolute inset-0 z-0">
         <div class="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent"></div>
         <div class="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-purple-100/30 blur-3xl"></div>
         <div class="absolute top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-3xl"></div>
      </div>

      <!-- Navbar -->
      <nav class="fixed w-full bg-white/70 backdrop-blur-xl border-b border-indigo-50/50 z-50 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-2 group cursor-pointer">
              <div class="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-lg shadow-indigo-200">
                <span class="text-white font-bold text-lg">S</span>
              </div>
              <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">SkillBridge</span>
            </div>
            <div class="flex items-center gap-4">
             
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <main class="relative z-10 pt-32 pb-16 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-indigo-100 rounded-full mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
           <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span class="text-xs font-bold text-slate-600 tracking-wide uppercase">Enterprise Ready <span class="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded ml-1">V2.0</span></span>
        </div>
        
        <h1 class="text-center text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight max-w-5xl mx-auto mb-8">
          The <span class="text-indigo-600 relative inline-block">
             Future
             <svg class="absolute w-full h-2 bottom-0 left-0 text-indigo-200 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
               <path d="M0 10 Q 50 20 100 10" stroke="currentColor" stroke-width="8" fill="none" />
             </svg>
          </span> of Corporate <br>
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">Training Orchestration</span>
        </h1>
        
        <p class="text-center text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Seamlessly connect world-class trainers with forward-thinking enterprises. Automate workflows, manage payments, and scale your learning & development.
        </p>

        <div class="flex items-center justify-center gap-4 w-full">
          <a routerLink="/login" class="group relative px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:translate-y-[-2px] active:translate-y-[1px] duration-200 overflow-hidden">
             <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 w-[200%] animate-gradient"></div>
             <span class="relative flex items-center gap-2">
               Start Your Journey
               <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
             </span>
          </a>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-3 gap-6 lg:gap-8 mt-24 lg:mt-32 w-full">
           <!-- Card 1 -->
           <div class="group p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:bg-white hover:scale-[1.02] transition-all duration-300">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-3 transition-transform">
                 <span class="text-2xl">🚀</span>
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">Rapid Onboarding</h3>
              <p class="text-slate-500 leading-relaxed text-sm">Automated workflows to get trainers and clients integrated in minutes, not days.</p>
           </div>

           <!-- Card 2 -->
           <div class="group p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:bg-white hover:scale-[1.02] transition-all duration-300">
              <div class="w-14 h-14 bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-3 transition-transform">
                 <span class="text-2xl">⚡</span>
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-3 group-hover:text-violet-600 transition-colors">Real-time Analytics</h3>
              <p class="text-slate-500 leading-relaxed text-sm">Dashboard metrics that give you instant visibility into training progress and budget.</p>
           </div>

           <!-- Card 3 -->
           <div class="group p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:bg-white hover:scale-[1.02] transition-all duration-300">
              <div class="w-14 h-14 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-3 transition-transform">
                 <span class="text-2xl">🛡️</span>
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">Secure Payments</h3>
              <p class="text-slate-500 leading-relaxed text-sm">Transparent invoicing and automated payment tracking for complete peace of mind.</p>
           </div>
        </div>
      </main>

      <footer class="relative z-10 border-t border-slate-100 py-8 mt-12 bg-white/50 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 text-center">
           <p class="text-slate-400 text-sm font-medium">© 2026 SkillBridge Inc. • Built for the modern enterprise.</p>
        </div>
      </footer>
    </div>
  `
})
export class LandingPageComponent { }