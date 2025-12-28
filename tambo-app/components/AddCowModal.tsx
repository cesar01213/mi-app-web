"use client";

import { useState } from 'react';
import { X, Save, Calendar, Hash, Tag, Dna, Info } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Raza, Categoria } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddCowModal({ isOpen, onClose }: Props) {
    const { addCow } = useStore();

    // Datos Fijos (Tapa)
    const [caravana, setCaravana] = useState('');
    const [rp, setRp] = useState('');
    const [raza, setRaza] = useState<Raza>('Holando');
    const [categoria, setCategoria] = useState<Categoria>('Vaca');
    const [fechaNac, setFechaNac] = useState(new Date().toISOString().split('T')[0]);
    const [padre, setPadre] = useState('');
    const [madre, setMadre] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!caravana) return;

        addCow({
            id: caravana,
            rp,
            raza,
            categoria,
            fechaNacimiento: new Date(fechaNac).toISOString(),
            padre,
            madre,
            estado: 'Lactancia',
            estadoRepro: 'Vacía',
            partosTotales: 0
        });

        // Reset and close
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setCaravana('');
        setRp('');
        setRaza('Holando');
        setCategoria('Vaca');
        setPadre('');
        setMadre('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-black tracking-tighter uppercase italic">Nueva Ficha Digital</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Alta de Animal en Base de Datos</p>
                    </div>
                    <button onClick={onClose} className="bg-slate-800 p-2 rounded-2xl text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">

                    {/* IDENTIFICACIÓN */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Hash className="w-4 h-4" /> Identificación Fija
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Caravana (O ID único)</label>
                                <input
                                    required
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Ej: 4502"
                                    value={caravana}
                                    onChange={(e) => setCaravana(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">RP (Registro Part.)</label>
                                <input
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Opcional"
                                    value={rp}
                                    onChange={(e) => setRp(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* CLASIFICACIÓN */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Tag className="w-4 h-4" /> Clasificación Técnica
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Raza</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none"
                                    value={raza}
                                    onChange={(e) => setRaza(e.target.value as Raza)}
                                >
                                    <option value="Holando">Holando</option>
                                    <option value="Jersey">Jersey</option>
                                    <option value="Cruza">Cruza</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Categoría</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none"
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value as Categoria)}
                                >
                                    <option value="Ternera">Ternera</option>
                                    <option value="Vaquillona">Vaquillona</option>
                                    <option value="Vaca">Vaca</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Fecha de Nacimiento</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input
                                    type="date"
                                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"
                                    value={fechaNac}
                                    onChange={(e) => setFechaNac(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* GENÉTICA */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Dna className="w-4 h-4" /> Genealogía (Opcional)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                                placeholder="ID Padre"
                                value={padre}
                                onChange={(e) => setPadre(e.target.value)}
                            />
                            <input
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                                placeholder="ID Madre"
                                value={madre}
                                onChange={(e) => setMadre(e.target.value)}
                            />
                        </div>
                    </section>

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black text-lg uppercase shadow-2xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                    >
                        <Save className="w-6 h-6 text-emerald-400" />
                        Crear Registro
                    </button>
                </form>
            </div>
        </div>
    );
}
