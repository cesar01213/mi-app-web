"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Calendar, Clock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utilitario para combinar clases (opcional si no se tiene lib/utils)
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface Recomendacion {
    accion: string;
    rangoHorario: string;
    fechaSugerida: Date | null;
    colorClase: string; // Tailwind class
    prioridad: 'urgente' | 'atencion' | 'normal';
}

export default function ReproductionCalculator() {
    const [fechaCelo, setFechaCelo] = useState<string>('');
    const [recomendacion, setRecomendacion] = useState<Recomendacion | null>(null);

    const calcular = (valor: string) => {
        setFechaCelo(valor);

        if (!valor) {
            setRecomendacion(null);
            return;
        }

        const fecha = new Date(valor);
        if (isNaN(fecha.getTime())) return;

        const hora = fecha.getHours();

        // REGLA AM-PM
        if (hora < 12) {
            // CASO AM: Detectado a la mañana -> Inseminar ESTA TARDE
            const sugerida = new Date(fecha);
            sugerida.setHours(18, 0, 0, 0); // 18:00 Hoy

            setRecomendacion({
                accion: "Inseminar HOY a la Tarde",
                rangoHorario: "18:00 - 20:00 hs",
                fechaSugerida: sugerida,
                colorClase: "bg-orange-500",
                prioridad: 'urgente'
            });
        } else {
            // CASO PM: Detectado a la tarde -> Inseminar MAÑANA a la MAÑANA
            const sugerida = new Date(fecha);
            sugerida.setDate(sugerida.getDate() + 1); // Mañana
            sugerida.setHours(6, 0, 0, 0); // 06:00

            setRecomendacion({
                accion: "Inseminar MAÑANA a la Mañana",
                rangoHorario: "06:00 - 08:00 hs",
                fechaSugerida: sugerida,
                colorClase: "bg-blue-600",
                prioridad: 'atencion'
            });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Calculadora Reprod. (AM-PM)
                </h3>
            </div>

            <div className="p-5">
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                        ¿Cuándo vio el celo?
                    </label>
                    <input
                        type="datetime-local"
                        value={fechaCelo}
                        onChange={(e) => calcular(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                    />
                </div>

                {recomendacion && (
                    <div className={cn(
                        "p-4 rounded-lg text-white shadow-md transition-all animate-in fade-in slide-in-from-bottom-2",
                        recomendacion.colorClase
                    )}>
                        <div className="flex items-start gap-3">
                            {recomendacion.prioridad === 'urgente' ? (
                                <AlertTriangle className="w-6 h-6 mt-0.5 flex-shrink-0 animate-pulse" />
                            ) : (
                                <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                            )}

                            <div>
                                <p className="font-extrabold text-lg leading-tight mb-1">
                                    {recomendacion.accion}
                                </p>
                                <p className="font-medium opacity-90 mb-3 text-sm">
                                    Horario sugerido: {recomendacion.rangoHorario}
                                </p>

                                {recomendacion.fechaSugerida && (
                                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-semibold">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {format(recomendacion.fechaSugerida, "EEEE d 'de' MMMM, HH:mm'hs'", { locale: es })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!recomendacion && !fechaCelo && (
                    <div className="text-center p-4 text-slate-400 text-sm">
                        Seleccione fecha y hora para calcular turno
                    </div>
                )}
            </div>
        </div>
    );
}
