"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, Droplet, Search, Calendar, Inbox, ClipboardList, Thermometer, ChevronRight, Mic, Users, TrendingDown, Baby, Settings, Filter, PlusSquare, Tag, ShieldAlert, HeartPulse, Lock, Unlock, Trash2, RotateCcw, Pipette, Clock, FileText } from 'lucide-react';
import FabMenu from '@/components/FabMenu';
import AddCowModal from '@/components/AddCowModal';
import AddEventModal from '@/components/AddEventModal';
import VoiceAssistant from '@/components/VoiceAssistant';
import BulkLoader from '@/components/BulkLoader';
import InseminationSheet from '@/components/InseminationSheet';
import { useStore } from '@/context/StoreContext';
import { format, parseISO, isAfter, differenceInHours } from 'date-fns';

export default function Home() {
  const { cows, events, getAlerts, getMedicalSummary, getGroups, isLocked, toggleLock, clearAllData, getActiveHeats } = useStore();
  const [showAddCow, setShowAddCow] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showBulkLoader, setShowBulkLoader] = useState(false);
  const [voiceData, setVoiceData] = useState<any>(null);
  const [selectedHeat, setSelectedHeat] = useState<{ cow: any, event: any } | null>(null);

  const [activeTab, setActiveTab] = useState<'todo' | 'secas' | 'asecar' | 'parto' | 'sanidad'>('todo');
  const [filterRaza, setFilterRaza] = useState<string | null>(null);

  const alertas = getAlerts();
  const medical = getMedicalSummary();
  const groups = getGroups();
  const activeHeats = getActiveHeats();

  const stats = {
    enOrdeñe: groups.lactancia.length,
    secas: groups.secas.length,
    total: cows.length
  };

  // Identificar vacas que han tenido mastitis históricamente
  const vacasConHistorialSanitario = useMemo(() => {
    const ids = new Set(events.filter(e => e.tipo === 'sanidad').map(e => e.cowId));
    return cows.filter(c => ids.has(c.id));
  }, [events, cows]);

  const currentList = useMemo(() => {
    let base = cows;
    if (activeTab === 'secas') base = groups.secas;
    if (activeTab === 'asecar') base = groups.aSecar;
    if (activeTab === 'parto') base = groups.proximasParto;
    if (activeTab === 'sanidad') base = vacasConHistorialSanitario;

    if (filterRaza) {
      base = base.filter(c => c.raza === filterRaza);
    }
    return base;
  }, [activeTab, filterRaza, groups, cows, vacasConHistorialSanitario]);

  const handleVoiceCommand = (data: any) => {
    setVoiceData(data);
    setShowAddEvent(true);
  };

  const handleClearAll = () => {
    if (isLocked) return;
    if (confirm("🚨 ¿BORRAR TODO EL RODEO? Esta acción eliminará permanentemente TODAS las vacas y eventos registrados.")) {
      clearAllData();
      alert("✓ Base de datos vaciada.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 pb-32 font-sans overflow-x-hidden">
      {/* HEADER: SEGURO Y TÍTULO */}
      <header className="bg-slate-900 text-white p-6 rounded-b-[3rem] shadow-2xl relative">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic leading-none">TAMBO<span className="text-indigo-400">PRO</span></h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-1 opacity-70">Operaciones en Tiempo Real</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleLock}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all active:scale-95 shadow-lg border-2 ${isLocked ? 'bg-emerald-600 border-white/20 text-white' : 'bg-indigo-600 border-white/40 text-white shadow-indigo-900/40'}`}
            >
              {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              <span className="text-[11px] font-black uppercase tracking-widest">{isLocked ? 'Seguro' : 'Abierto'}</span>
            </button>
            {!isLocked && (
              <button
                onClick={() => setShowBulkLoader(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-900/20 animate-in zoom-in-50 duration-200"
              >
                <PlusSquare className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Carga Masiva</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center">
            <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Censo Total</p>
            <p className="text-2xl font-black">{stats.total}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center">
            <p className="text-[9px] text-slate-400 font-black uppercase mb-1">En Ordeñe</p>
            <p className="text-2xl font-black text-emerald-400">{stats.enOrdeñe}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center">
            <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Vacas Secas</p>
            <p className="text-2xl font-black text-amber-400">{stats.secas}</p>
          </div>
        </div>
      </header>

      <div className="p-5 space-y-8 mt-2">

        {/* MONITOR DE INSEMINACIÓN (CELOS ACTIVOS) */}
        {activeHeats.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Pipette className="w-5 h-5 text-indigo-600" />
                Monitor de Inseminación
              </h2>
              <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">{activeHeats.length} CELOS</span>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-2 snap-x px-1 no-scrollbar">
              {activeHeats.map(({ cow, event }) => {
                const date = parseISO(event.fecha);
                const isAM = date.getHours() < 12;
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedHeat({ cow, event })}
                    className="min-w-[280px] snap-center text-left"
                  >
                    <div className="bg-white p-5 rounded-[2.5rem] border-4 border-indigo-50 shadow-xl shadow-indigo-900/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white py-1 px-4 rounded-bl-2xl font-black text-[9px] uppercase tracking-tighter">
                        Celo: {format(date, 'HH:mm')} hs
                      </div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase leading-none mb-1">Vaca en Celo</p>
                          <h4 className="text-3xl font-black text-slate-900 tracking-tighter">#{cow.id}</h4>
                        </div>
                        <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 mt-2">
                          <Activity className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-[9px] font-black text-emerald-700 uppercase leading-none mb-1">Inseminar:</p>
                          <p className="font-black text-emerald-800 text-sm">
                            {isAM ? 'Esta Tarde (PM)' : 'Mañana Temprano (AM)'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase text-indigo-600 tracking-widest pl-1">
                        <span>Abrir Hoja Técnica</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* MODO MANTENIMIENTO: SOLO SI EL SEGURO ESTÁ QUITADO */}
        {!isLocked && (
          <section className="bg-white p-6 rounded-[2.5rem] border-4 border-slate-200 shadow-xl shadow-slate-900/5 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-800 p-3 rounded-2xl text-white">
                <Settings className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-slate-800 font-black uppercase text-xs tracking-[0.2em]">Configuración de Base de Datos</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Estado: Edición Habilitada (Azul)</p>
              </div>
            </div>

            <button
              onClick={handleClearAll}
              className="w-full bg-slate-100 text-slate-500 border-2 border-slate-200 p-5 rounded-3xl font-black text-sm uppercase flex items-center justify-center gap-4 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
            >
              <Trash2 className="w-6 h-6" />
              Limpiar rodeo completo
            </button>
            <p className="text-center text-[9px] font-bold text-slate-400 uppercase mt-4 tracking-tighter italic">
              * Esta zona permite resetear todos los datos de la aplicación.
            </p>
          </section>
        )}

        {/* MONITOR SANITARIO ACTIVO */}
        {medical.enTratamiento > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="text-xs font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                Monitor Sanitario (Al Tacho)
              </h2>
              <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">{medical.enTratamiento} VACAS</span>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-2 snap-x px-1 no-scrollbar">
              {medical.vacasAlTacho.map(id => {
                const treat = events.find(e => e.cowId === id && e.tipo === 'sanidad' && e.fechaLiberacion && isAfter(parseISO(e.fechaLiberacion), new Date()));
                return (
                  <Link href={`/cows/${id}`} key={id} className="min-w-[260px] snap-center">
                    <div className="bg-white p-5 rounded-[2.5rem] border-4 border-red-50 shadow-xl shadow-red-900/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-red-600 text-white py-1 px-4 rounded-bl-2xl font-black text-[9px] uppercase">Retiro Activo</div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase leading-none mb-1">Animal</p>
                          <h4 className="text-3xl font-black text-slate-900 tracking-tighter">#{id}</h4>
                        </div>
                        <div className="bg-red-100 p-3 rounded-2xl text-red-600 mt-2">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Liberación de Leche:</p>
                        <p className="font-black text-red-600 text-lg tracking-tight">
                          {treat?.fechaLiberacion ? format(parseISO(treat.fechaLiberacion), 'dd MMM, yyyy') : 'Calcular...'}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase text-indigo-600 tracking-widest pl-1">
                        <span>Ver Historial Mastitis</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* FILTROS TÉCNICOS POR ESTADO */}
        <section className="space-y-4">
          <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2 px-1">
            {[
              { id: 'todo', label: 'Todo el Rodeo', icon: <Users className="w-4 h-4" /> },
              { id: 'sanidad', label: 'Sanidad', icon: <HeartPulse className="w-4 h-4" />, count: vacasConHistorialSanitario.length },
              { id: 'asecar', label: 'A Secar', icon: <TrendingDown className="w-4 h-4" />, count: groups.aSecar.length },
              { id: 'parto', label: 'Próx. Parto', icon: <Baby className="w-4 h-4" />, count: groups.proximasParto.length },
              { id: 'secas', label: 'Secas', icon: <Filter className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                    flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase transition-all shadow-sm
                    ${activeTab === tab.id ? 'bg-slate-900 text-white scale-105' : 'bg-white text-slate-400 border border-slate-200'}
                  `}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-md ml-1 ${tab.id === 'sanidad' ? 'bg-red-500' : ''}`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-3">
            {currentList.slice(0, 15).map(cow => (
              <Link href={`/cows/${cow.id}`} key={cow.id}>
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white ${cow.raza === 'Jersey' ? 'bg-amber-600' : cow.raza === 'Holando' ? 'bg-slate-800' : 'bg-indigo-600'}`}>
                      {cow.id}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 tracking-tight leading-none">VACA #{cow.id}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{cow.raza} • {cow.estado}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {cow.fpp ? (
                      <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                        <p className="text-[9px] font-black text-indigo-800 uppercase leading-none mb-0.5 text-center">Parto</p>
                        <p className="text-xs font-black text-indigo-600 opacity-80">{format(parseISO(cow.fpp), 'dd MMM')}</p>
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {currentList.length === 0 && (
              <div className="bg-white/50 p-12 rounded-[2.5rem] border-4 border-dashed border-slate-200 text-center">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-50" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rodeo sin registros en este grupo</p>
              </div>
            )}
          </div>
        </section>

        {/* ALERTAS PRODUCTIVAS */}
        {alertas.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">Alertas Técnicas</h2>
            <div className="space-y-4">
              {alertas.map(al => (
                <Link href={al.link} key={al.id}>
                  <div className={`bg-white p-5 rounded-[2.5rem] shadow-sm border-2 flex items-center gap-4 transition-all active:scale-[0.98] ${al.tipo === 'urgente' ? 'border-red-50' : 'border-slate-50'}`}>
                    <div className={`p-4 rounded-2xl ${al.tipo === 'urgente' ? 'bg-red-600' : 'bg-indigo-600'} text-white`}>
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-900 leading-tight text-lg tracking-tight">{al.mensaje}</p>
                      <p className={`text-[10px] font-black uppercase mt-1 tracking-widest ${al.tipo === 'urgente' ? 'text-red-500' : 'text-indigo-600'}`}>{al.accion}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <VoiceAssistant onProcessCommand={handleVoiceCommand} />
      <FabMenu onAddCow={() => setShowAddCow(true)} onAddEvent={() => setShowAddEvent(true)} />

      <AddCowModal isOpen={showAddCow} onClose={() => setShowAddCow(false)} />
      <AddEventModal isOpen={showAddEvent} onClose={() => setShowAddEvent(false)} initialData={voiceData} />
      <BulkLoader isOpen={showBulkLoader} onClose={() => setShowBulkLoader(false)} />
      {selectedHeat && (
        <InseminationSheet
          cow={selectedHeat.cow}
          event={selectedHeat.event}
          isOpen={!!selectedHeat}
          onClose={() => setSelectedHeat(null)}
        />
      )}

      {/* DOCK BAR NAVIGATION */}
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-2xl border-t border-slate-200 px-8 py-5 flex justify-between items-center z-40 rounded-t-[3rem] shadow-2xl">
        <Activity className="w-7 h-7 text-indigo-600" />
        <Link href="/"> <Users className="w-7 h-7 text-slate-300" /> </Link>
        <ClipboardList className="w-7 h-7 text-slate-300" />
        <Settings className="w-7 h-7 text-slate-300" />
      </nav>
    </main>
  );
}
