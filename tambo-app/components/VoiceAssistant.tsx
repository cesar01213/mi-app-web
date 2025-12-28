"use client";

import { useState, useRef } from 'react';
import { Mic, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';

import { useStore } from '@/context/StoreContext';

interface Props {
    onProcessCommand: (data: any) => void;
}

export default function VoiceAssistant({ onProcessCommand }: Props) {
    const { isLocked } = useStore();
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    if (isLocked) return null;

    const startListening = () => {
        setIsListening(true);
        setTranscript('');
        // Simulamos captura de audio
        timerRef.current = setTimeout(() => {
            setTranscript("La vaca 100 tiene mastitis grado 2 en el cuarto PI...");
        }, 2000);
    };

    const stopListening = () => {
        setIsListening(false);
        if (timerRef.current) clearTimeout(timerRef.current);

        if (transcript) {
            processWithAI(transcript);
        }
    };

    const processWithAI = async (text: string) => {
        setIsProcessing(true);
        // Simulación de llamada a OpenAI GPT-4o-mini para extraer entidades
        setTimeout(() => {
            setIsProcessing(false);
            const extractedData = {
                cowId: "100",
                tipo: "sanidad",
                grado: 2,
                cuartos: ["PI"],
                medicamento: "Cefalexina (Mastitis)",
                diasRetiro: 4
            };
            onProcessCommand(extractedData);
            setIsOpen(false);
        }, 1500);
    };

    return (
        <>
            {/* BOTÓN FLOTANTE DE VOZ */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 border-4 border-white"
            >
                <Mic className="w-6 h-6" />
            </button>

            {/* PANEL DEL ASISTENTE */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">
                        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                                <h3 className="font-black italic text-lg tracking-tighter">VOICE ASSISTANT IA</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 flex flex-col items-center text-center space-y-6">
                            {isProcessing ? (
                                <div className="flex flex-col items-center gap-4 py-8">
                                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                                    <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Procesando con IA...</p>
                                </div>
                            ) : (
                                <>
                                    <div className={`
                           relative p-10 rounded-full transition-all duration-500
                           ${isListening ? 'bg-red-100 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'bg-slate-100 shadow-xl'}
                        `}>
                                        <button
                                            onMouseDown={startListening}
                                            onMouseUp={stopListening}
                                            onTouchStart={startListening}
                                            onTouchEnd={stopListening}
                                            className={`
                                 p-8 rounded-full transition-all outline-none border-none
                                 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-indigo-600 text-white'}
                              `}
                                        >
                                            <Mic className="w-10 h-10" />
                                        </button>
                                        {isListening && (
                                            <div className="absolute -inset-2 border-2 border-red-500 rounded-full animate-ping opacity-20"></div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-black text-slate-900 text-xl tracking-tight">
                                            {isListening ? 'Te escucho...' : 'Mantén presionado'}
                                        </p>
                                        <p className="text-slate-500 text-sm font-medium mt-1">
                                            "La vaca 40 celo hoy" o "Vaca 10 mastitis AD"
                                        </p>
                                    </div>
                                </>
                            )}

                            {transcript && !isProcessing && (
                                <div className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Dictado Escuchado:</p>
                                    <p className="font-bold text-slate-700 italic">"{transcript}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
