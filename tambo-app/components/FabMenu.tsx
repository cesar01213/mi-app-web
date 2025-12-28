"use client";

import { useState } from 'react';
import { Plus, Syringe, Baby, CalendarPlus } from 'lucide-react';

import { useStore } from '@/context/StoreContext';

interface Props {
    onAddCow: () => void;
    onAddEvent: () => void;
}

export default function FabMenu({ onAddCow, onAddEvent }: Props) {
    const { isLocked } = useStore();
    const [open, setOpen] = useState(false);

    if (isLocked) return null;

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
            {open && (
                <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <button
                        onClick={() => { onAddEvent(); setOpen(false); }}
                        className="bg-white text-slate-700 p-3 rounded-full shadow-lg border border-slate-100 flex items-center gap-3 pr-5 hover:bg-slate-50 transition-colors"
                    >
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            <CalendarPlus className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm">Evento / Celo</span>
                    </button>

                    <button
                        onClick={() => { onAddCow(); setOpen(false); }}
                        className="bg-white text-slate-700 p-3 rounded-full shadow-lg border border-slate-100 flex items-center gap-3 pr-5 hover:bg-slate-50 transition-colors"
                    >
                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                            <Baby className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm">Nueva Vaca</span>
                    </button>
                </div>
            )}

            <button
                onClick={() => setOpen(!open)}
                className={`
          p-4 rounded-full shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center
          ${open ? 'bg-red-500 rotate-45' : 'bg-indigo-600'}
          text-white
        `}
            >
                <Plus className="w-8 h-8" />
            </button>
        </div>
    );
}
