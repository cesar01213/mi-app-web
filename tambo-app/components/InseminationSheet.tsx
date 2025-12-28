"use client";

import { X, Calendar, Clock, Pipette, Activity, Info, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { Cow, Evento } from '@/types';
import { format, parseISO, addHours, isBefore, startOfToday, setHours } from 'date-fns';
import { useStore } from '@/context/StoreContext';

interface Props {
    cow: Cow;
    event: Evento;
    isOpen: boolean;
    onClose: () => void;
}

export default function InseminationSheet({ cow, event, isOpen, onClose }: Props) {
    const { calculateMetrics } = useStore();
    if (!isOpen) return null;

    const metrics = calculateMetrics(cow.id);
    const detectionTime = parseISO(event.fecha);

    // Regla AM/PM:
    // Si celo AM -> IA PM (hoy)
    // Si celo PM -> IA AM (mañana)
    const isAM = detectionTime.getHours() < 12;
    const windowStart = isAM ? "17:00 hs (Hoy)" : "06:00 hs (Mañana)";
    const windowEnd = isAM ? "21:00 hs (Hoy)" : "10:00 hs (Mañana)";

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10">

                {/* HEADER TÉCNICO */}
                <div className="bg-indigo-900 p-6 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 bg-white/10 p-2 rounded-xl text-white/70">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <Pipette className="w-6 h-6 text-indigo-400" />
                        <h3 className="text-xl font-black tracking-tighter uppercase italic">Hoja de Inseminación</h3>
                    </div>
                    <div className="flex items-end gap-4 mt-4">
                        <div className="bg-white/10 px-6 py-3 rounded-3xl border border-white/20">
                            <p className="text-[9px] font-black uppercase text-indigo-300 leading-none mb-1">Animal</p>
                            <h4 className="text-4xl font-black italic tracking-tighter">#{cow.id}</h4>
                        </div>
                        <div className="pb-1">
                            <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">{cow.raza} • {cow.categoria}</p>
                            <p className="text-sm font-bold opacity-80">RP: {cow.rp || 'S/N'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* ESTADO REPRODUCTIVO ACTUAL */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Días en Leche</p>
                            <p className="text-2xl font-black text-slate-900">{metrics.del} d</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Partos Totales</p>
                            <p className="text-2xl font-black text-slate-900">{cow.partosTotales}</p>
                        </div>
                    </div>

                    {/* DETECCIÓN DE CELO */}
                    <div className="bg-amber-50 border-2 border-amber-100 p-5 rounded-[2.5rem] flex items-start gap-4">
                        <div className="bg-amber-500 p-3 rounded-2xl text-white">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-amber-800 font-black uppercase text-xs tracking-widest mb-1">Celo Detectado</p>
                            <p className="text-slate-900 font-bold text-lg leading-tight">
                                {format(detectionTime, "dd MMM")} a las {format(detectionTime, "HH:mm")} hs
                            </p>
                        </div>
                    </div>

                    {/* RECOMENDACIÓN TÉCNICA (AM/PM) */}
                    <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2.5rem]">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-emerald-600" />
                            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Ventana de Servicio Óptima</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-emerald-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Desde</span>
                                <span className="text-lg font-black text-emerald-700">{windowStart}</span>
                            </div>
                            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-emerald-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Hasta</span>
                                <span className="text-lg font-black text-emerald-700">{windowEnd}</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-bold text-center mt-4 italic">
                            * Siguiendo la regla de las 12 horas (AM/PM).
                        </p>
                    </div>

                    {/* RECOMENDACIÓN DE SEMEN */}
                    <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 bg-indigo-500 w-24 h-24 rounded-full opacity-20 blur-2xl"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Sugerencia de Semen</h4>
                        </div>
                        <p className="text-lg font-bold leading-tight">
                            {cow.raza === 'Jersey' ? 'Usar Semen Jersey Sexado' : cow.raza === 'Holando' ? 'Usar Semen Holando Convencional' : 'Semen Carne / Angus'}
                        </p>
                    </div>

                </div>

                {/* BOTÓN DE IMPRESIÓN/CIERRE */}
                <div className="p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                    >
                        Cerrar Hoja Técnica
                    </button>
                </div>
            </div>
        </div>
    );
}
