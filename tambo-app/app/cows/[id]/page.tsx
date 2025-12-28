"use client";

import { use, useState, useMemo } from 'react';
import { ArrowLeft, AlertTriangle, Baby, Calendar, Syringe, ClipboardCheck, History, Trash2, ShieldAlert, Inbox, Droplet, Activity, Info, HeartPulse, LineChart, Hash, Dna, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { format, parseISO, isAfter } from 'date-fns';

export default function CowDetail({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const { getCow, getCowEvents, deleteCow, deleteEvent, calculateMetrics, isLocked } = useStore();

    const [activeTab, setActiveTab] = useState<'info' | 'repro' | 'salud' | 'prod'>('info');

    const cow = getCow(id);
    const events = getCowEvents(id);
    const metrics = calculateMetrics(id);

    if (!cow) return (
        <div className="p-10 text-center space-y-4">
            <Inbox className="w-16 h-16 text-slate-200 mx-auto" />
            <p className="text-slate-500 font-black uppercase">Vaca no encontrada</p>
            <Link href="/" className="inline-block bg-slate-900 text-white px-6 py-3 rounded-2xl font-black">VOLVER AL INICIO</Link>
        </div>
    );

    const handleDeleteCow = () => {
        if (isLocked) {
            alert("⚠️ El SEGURO está puesto. Desactívalo en el Inicio para poder eliminar animales.");
            return;
        }
        if (confirm(`¿Estás seguro de eliminar definitivamente a la vaca #${cow.id}? Se borrará todo su historial.`)) {
            deleteCow(cow.id);
            router.push('/');
        }
    };

    // Clasificación de eventos para pestañas
    const reproEvents = events.filter(e => ['celo', 'inseminacion', 'parto', 'tacto'].includes(e.tipo));
    const healthEvents = events.filter(e => e.tipo === 'sanidad');
    const prodEvents = events.filter(e => e.tipo === 'controlLechero');

    const isAlTacho = events.some(e => e.tipo === 'sanidad' && e.fechaLiberacion && isAfter(parseISO(e.fechaLiberacion), new Date()));

    return (
        <main className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* HEADER TÉCNICO */}
            <div className="bg-slate-900 text-white p-6 pb-20 rounded-b-[3rem] shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/" className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="text-center">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Ficha Digital</h2>
                        <h1 className="text-3xl font-black italic tracking-tighter">VACA #{cow.id}</h1>
                    </div>
                    <button onClick={handleDeleteCow} className="p-3 bg-red-600/20 text-red-500 rounded-2xl border border-red-500/30">
                        <Trash2 className="w-6 h-6" />
                    </button>
                </div>

                {/* INDICADORES CLAVE */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Días en Leche (DEL)</p>
                        <p className="text-2xl font-black text-emerald-400">{metrics.del}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Estado Repro</p>
                        <p className="text-lg font-black text-indigo-400 leading-none mt-1">{cow.estadoRepro}</p>
                    </div>
                </div>

                {/* ALERTA SANITARIA FLOTANTE */}
                {isAlTacho && (
                    <div className="absolute -bottom-6 left-6 right-6 bg-red-600 p-4 rounded-3xl shadow-xl flex items-center gap-4 border-4 border-red-500 animate-bounce-subtle">
                        <ShieldAlert className="w-8 h-8 text-white" />
                        <div>
                            <p className="text-[10px] font-black text-red-200 uppercase">Bloqueo de Ordeñe Activo</p>
                            <p className="text-sm font-black text-white leading-none">NO ENVIAR A TANQUE</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5 mt-8 space-y-6">

                {/* NAVEGACIÓN DE PESTAÑAS */}
                <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-slate-200 overflow-x-auto no-scrollbar gap-1">
                    {[
                        { id: 'info', label: 'Tapa', icon: <FileText className="w-4 h-4" /> },
                        { id: 'repro', label: 'Repro', icon: <Activity className="w-4 h-4" /> },
                        { id: 'salud', label: 'Clínica', icon: <HeartPulse className="w-4 h-4" /> },
                        { id: 'prod', label: 'Leche', icon: <Droplet className="w-4 h-4" /> }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === t.id ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* CONTENIDO PESTAÑA: TAPA (DATOS FIJOS) */}
                {activeTab === 'info' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">RP</p>
                                    <p className="text-lg font-black text-slate-900">{cow.rp || 'S/N'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Categoría</p>
                                    <p className="text-lg font-black text-slate-900">{cow.categoria}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Raza</p>
                                    <p className="text-lg font-black text-slate-900">{cow.raza}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Edad (Meses)</p>
                                    <p className="text-lg font-black text-slate-900">{metrics.edadMeses} m</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Dna className="w-4 h-4" /> Genealogía
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                        <span className="text-[10px] font-black text-indigo-900 uppercase">Padre (Toro)</span>
                                        <span className="font-bold text-indigo-700">#{cow.padre || '--'}</span>
                                    </div>
                                    <div className="flex justify-between bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                                        <span className="text-[10px] font-black text-pink-900 uppercase">Madre</span>
                                        <span className="font-bold text-pink-700">#{cow.madre || '--'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO PESTAÑA: REPRODUCCIÓN */}
                {activeTab === 'repro' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="bg-indigo-900 text-white p-6 rounded-[2.5rem] shadow-xl">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[9px] font-black text-indigo-300 uppercase">Días Abierta</p>
                                    <p className="text-2xl font-black">{metrics.diasAbierta} d</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-indigo-300 uppercase">Partos Totales</p>
                                    <p className="text-2xl font-black">{cow.partosTotales}</p>
                                </div>
                            </div>
                            {cow.fpp && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase">Fecha Prob. Parto:</p>
                                    <p className="text-xl font-black">{format(parseISO(cow.fpp), 'dd MMM, yyyy')}</p>
                                </div>
                            )}
                        </div>

                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mt-6">Historial de Ciclos</h4>
                        <div className="space-y-3">
                            {reproEvents.map(e => (
                                <div key={e.id} className="bg-white p-5 rounded-[2rem] border border-slate-200 flex gap-4">
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        {e.tipo === 'parto' ? <Baby className="w-6 h-6 text-indigo-600" /> : <Calendar className="w-6 h-6 text-slate-400" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{format(parseISO(e.fecha), 'dd/MM/yyyy')}</p>
                                        <p className="font-black text-slate-900 uppercase leading-tight">{e.tipo === 'tacto' ? `Tacto: ${e.resultadoTacto}` : e.tipo}</p>
                                        {e.detalle && <p className="text-[11px] text-slate-500 mt-1 italic">{e.detalle}</p>}
                                    </div>
                                </div>
                            ))}
                            {reproEvents.length === 0 && <p className="text-center text-[10px] font-black text-slate-400 uppercase py-10">Sin registros reproductivos</p>}
                        </div>
                    </div>
                )}

                {/* CONTENIDO PESTAÑA: CLÍNICA */}
                {activeTab === 'salud' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2.5rem]">
                            <h4 className="text-xs font-black text-red-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <History className="w-5 h-5" /> Historial Clínico
                            </h4>
                            <div className="space-y-4">
                                {healthEvents.map(e => (
                                    <div key={e.id} className="bg-white p-5 rounded-3xl border border-red-100 relative shadow-sm">
                                        <button
                                            onClick={() => {
                                                if (isLocked) {
                                                    alert("⚠️ SEGURO PUESTO. No se pueden borrar eventos.");
                                                } else {
                                                    deleteEvent(e.id);
                                                }
                                            }}
                                            className="absolute top-4 right-4 text-slate-300 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <p className="text-[10px] font-black text-red-600 uppercase mb-1">{format(parseISO(e.fecha), 'dd MMM, yyyy')}</p>
                                        <p className="font-bold text-slate-900 leading-tight">Mastitis • {e.detalle}</p>
                                        <div className="mt-3 flex gap-2">
                                            <span className="bg-slate-100 text-[9px] font-black px-2 py-1 rounded text-slate-600 uppercase">Grado {e.gradoMastitis}</span>
                                            <span className="bg-slate-100 text-[9px] font-black px-2 py-1 rounded text-slate-600 uppercase">Cuartos: {e.cuartos?.join(',')}</span>
                                        </div>
                                    </div>
                                ))}
                                {healthEvents.length === 0 && (
                                    <div className="text-center py-10">
                                        <ShieldAlert className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Excelente: Sin historial de enfermedades</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO PESTAÑA: PRODUCCIÓN */}
                {activeTab === 'prod' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 bg-emerald-50 w-32 h-32 rounded-full opacity-50 blur-3xl"></div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <LineChart className="w-5 h-5 text-emerald-600" /> Control Lechero
                            </h4>

                            <div className="space-y-4">
                                {prodEvents.map(e => (
                                    <div key={e.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                        <div className="bg-emerald-600 p-3 rounded-2xl text-white">
                                            <Droplet className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase">{format(parseISO(e.fecha), 'dd/MM/yyyy')}</p>
                                            <p className="text-xl font-black text-slate-900 leading-none">{e.litros} Lts</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase">G: {e.grasa}%</p>
                                            <p className="text-[10px] font-bold text-indigo-600 uppercase">P: {e.proteina}%</p>
                                        </div>
                                    </div>
                                ))}
                                {prodEvents.length === 0 && (
                                    <div className="text-center py-12">
                                        <Inbox className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Sin controles lecheros registrados</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* FOOTER BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-4 border-t border-slate-200 flex justify-center gap-4 z-50">
                <Link href="/" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl tracking-widest">Cerrar Ficha</Link>
            </div>
        </main>
    );
}
