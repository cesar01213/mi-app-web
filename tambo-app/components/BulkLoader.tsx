"use client";

import { useState } from 'react';
import { X, Clipboard, FileText, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Cow } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function BulkLoader({ isOpen, onClose }: Props) {
    const { bulkAddCows } = useStore();
    const [text, setText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [preview, setPreview] = useState<Cow[]>([]);
    const [step, setStep] = useState<1 | 2>(1); // 1: Input, 2: Preview

    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.txt')) {
            setError('Por ahora solo se admiten archivos .txt');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setText(content);
            setError(null);
        };
        reader.readAsText(file);
    };

    const handleProcessText = () => {
        setIsProcessing(true);
        // Simulación de IA / Regex para extraer caravanas
        setTimeout(() => {
            const lines = text.split(/[\n,;]+/).map(l => l.trim()).filter(l => l.length > 0);
            const extractedCows: Cow[] = lines.map(line => {
                // Intentar detectar ID y Raza (ej: "405 Holando")
                const match = line.match(/^(\d+)\s*(.*)$/);
                return {
                    id: match ? match[1] : line,
                    rp: '',
                    raza: (match && (match[2] as any)) ? (match[2] as any) : 'Holando',
                    categoria: 'Vaca',
                    fechaNacimiento: new Date().toISOString(),
                    estado: 'Lactancia',
                    estadoRepro: 'Vacía',
                    partosTotales: 0,
                    diasPreñez: 0
                };
            });
            setPreview(extractedCows);
            setIsProcessing(false);
            setStep(2);
        }, 1000);
    };

    const handleConfirm = () => {
        bulkAddCows(preview);
        onClose();
        setStep(1);
        setText('');
        setPreview([]);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black tracking-tighter uppercase">Carga Masiva IA</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Importación de Base de Datos</p>
                    </div>
                    <button onClick={onClose} className="bg-slate-800 p-2 rounded-xl text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100 flex gap-4 items-start">
                                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-black text-indigo-900 text-sm">Pega tu lista aquí</p>
                                    <p className="text-[11px] text-indigo-700 font-medium">Puedes copiar de Excel o WhatsApp. <br />Ej: "405 Holando, 406 Jersey..."</p>
                                </div>
                            </div>

                            <textarea
                                className="w-full h-48 p-4 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="Escribe o pega aquí la lista de caravanas..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={handleProcessText}
                                    disabled={!text || isProcessing}
                                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clipboard className="w-5 h-5 " />}
                                    Procesar Lista
                                </button>
                                <button className="bg-white border-2 border-slate-100 text-slate-400 p-4 rounded-2xl relative hover:bg-slate-50 transition-colors">
                                    <Upload className="w-6 h-6" />
                                    <input
                                        type="file"
                                        accept=".txt"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileUpload}
                                    />
                                </button>
                            </div>
                            {error && (
                                <p className="text-center text-[10px] text-red-500 font-black uppercase tracking-tighter">
                                    {error}
                                </p>
                            )}
                            <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-tighter">O sube un archivo (.txt) para procesar</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="flex items-center gap-2 px-1">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <h4 className="font-black text-slate-900 uppercase">Vista Previa ({preview.length} vacas)</h4>
                            </div>

                            <div className="bg-slate-50 rounded-3xl overflow-hidden border-2 border-slate-100 max-h-64 overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-900 text-white text-[10px] font-black uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Caravana</th>
                                            <th className="px-4 py-3">Raza</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {preview.map((v, i) => (
                                            <tr key={i} className="bg-white">
                                                <td className="px-4 py-3 font-black text-slate-900">#{v.id}</td>
                                                <td className="px-4 py-3 font-bold text-slate-500 uppercase">{v.raza}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase text-sm transition-all"
                                >
                                    Corregir
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl shadow-emerald-100 active:scale-95 transition-all"
                                >
                                    Confirmar Importación
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
