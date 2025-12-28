"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cow, Evento, Alerta } from '@/types';
import { isAfter, parseISO, differenceInDays, addDays, differenceInMonths, format } from 'date-fns';

interface StoreState {
    cows: Cow[];
    events: Evento[];
    addCow: (cow: Cow) => void;
    bulkAddCows: (newCows: Cow[]) => void;
    deleteCow: (id: string) => void;
    addEvent: (event: Evento) => void;
    deleteEvent: (id: number) => void;
    getAlerts: () => Alerta[];
    getCow: (id: string) => Cow | undefined;
    getCowEvents: (id: string) => Evento[];
    getMedicalSummary: () => { enTratamiento: number; vacasAlTacho: string[] };
    getGroups: () => {
        secas: Cow[];
        lactancia: Cow[];
        aSecar: Cow[];
        proximasParto: Cow[];
        porRaza: Record<string, Cow[]>;
    };
    calculateMetrics: (cowId: string) => {
        del: number; // Días en Leche
        diasAbierta: number;
        edadMeses: number;
    };
    getActiveHeats: () => { cow: Cow; event: Evento }[];
    isLocked: boolean;
    toggleLock: () => void;
    clearAllData: () => void;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [cows, setCows] = useState<Cow[]>([]);
    const [events, setEvents] = useState<Evento[]>([]);
    const [isLocked, setIsLocked] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Cargar datos al iniciar
    useEffect(() => {
        const savedCows = localStorage.getItem('tambo_cows');
        const savedEvents = localStorage.getItem('tambo_events');
        const savedLock = localStorage.getItem('tambo_locked');

        if (savedCows) setCows(JSON.parse(savedCows));
        if (savedEvents) setEvents(JSON.parse(savedEvents));
        if (savedLock !== null) setIsLocked(JSON.parse(savedLock));

        setInitialized(true);
    }, []);

    // Guardar datos al cambiar
    useEffect(() => {
        if (initialized) {
            localStorage.setItem('tambo_cows', JSON.stringify(cows));
            localStorage.setItem('tambo_events', JSON.stringify(events));
            localStorage.setItem('tambo_locked', JSON.stringify(isLocked));
        }
    }, [cows, events, isLocked, initialized]);

    const addCow = (cow: Cow) => {
        setCows(prev => [...prev.filter(c => c.id !== cow.id), {
            ...cow,
            estadoRepro: cow.estadoRepro || 'Vacía',
            partosTotales: cow.partosTotales || 0
        }]);
    };

    const bulkAddCows = (newCows: Cow[]) => {
        setCows(prev => {
            const existingIds = new Set(newCows.map(c => c.id));
            const filteredPrev = prev.filter(c => !existingIds.has(c.id));
            const processed = newCows.map(c => ({
                ...c,
                estadoRepro: c.estadoRepro || 'Vacía',
                partosTotales: c.partosTotales || 0
            }));
            return [...filteredPrev, ...processed];
        });
    };

    const deleteCow = (id: string) => {
        setCows(prev => prev.filter(c => c.id !== id));
        setEvents(prev => prev.filter(e => e.cowId !== id));
    };

    const addEvent = (event: Evento) => {
        setEvents(prev => [event, ...prev]);

        // INTELLIGENCE: Auto-actualización de estados según el tipo de evento
        setCows(prevCows => prevCows.map(cow => {
            if (cow.id !== event.cowId) return cow;

            let updatedCow = { ...cow };

            if (event.tipo === 'inseminacion') {
                updatedCow.estadoRepro = 'Inseminada';
                updatedCow.fpp = addDays(parseISO(event.fecha), 283).toISOString();
            }

            if (event.tipo === 'tacto') {
                if (event.resultadoTacto === 'Preñada') {
                    updatedCow.estadoRepro = 'Preñada';
                    updatedCow.diasPreñez = event.mesesGestacion ? event.mesesGestacion * 30 : cow.diasPreñez;
                } else {
                    updatedCow.estadoRepro = 'Vacía';
                    updatedCow.fpp = undefined;
                    updatedCow.diasPreñez = 0;
                }
            }

            if (event.tipo === 'parto') {
                updatedCow.estadoRepro = 'Vacía';
                updatedCow.estado = 'Lactancia';
                updatedCow.ultimoParto = event.fecha;
                updatedCow.partosTotales = (updatedCow.partosTotales || 0) + 1;
                updatedCow.fpp = undefined;
                updatedCow.diasPreñez = 0;
            }

            if (event.tipo === 'celo' && cow.estadoRepro === 'Preñada') {
                // Si hay celo en una preñada, posible aborto o error de tacto
                updatedCow.estadoRepro = 'Vacía';
            }

            return updatedCow;
        }));
    };

    const deleteEvent = (id: number) => {
        setEvents(prev => prev.filter(e => e.id !== id));
    };

    const getCow = (id: string) => cows.find(c => c.id === id);
    const getCowEvents = (id: string) => events.filter(e => e.cowId === id);

    const calculateMetrics = (cowId: string) => {
        const cow = getCow(cowId);
        const hoy = new Date();
        if (!cow) return { del: 0, diasAbierta: 0, edadMeses: 0 };

        const del = cow.ultimoParto ? differenceInDays(hoy, parseISO(cow.ultimoParto)) : 0;

        let diasAbierta = 0;
        if (cow.ultimoParto) {
            if (cow.estadoRepro === 'Preñada') {
                // Si está preñada, buscamos el evento de inseminación/servicio que la preñó
                const services = events.filter(e => e.cowId === cowId && e.tipo === 'inseminacion');
                if (services.length > 0) {
                    const lastService = parseISO(services[0].fecha);
                    diasAbierta = differenceInDays(lastService, parseISO(cow.ultimoParto));
                }
            } else {
                // Si sigue vacía, son los DEL actuales
                diasAbierta = del;
            }
        }

        const edadMeses = differenceInMonths(hoy, parseISO(cow.fechaNacimiento));

        return { del, diasAbierta, edadMeses };
    };

    const getMedicalSummary = () => {
        const hoy = new Date();
        const vacasAlTachoSet = new Set<string>();
        events.forEach(e => {
            if (e.tipo === 'sanidad' && e.fechaLiberacion) {
                if (isAfter(parseISO(e.fechaLiberacion), hoy)) {
                    vacasAlTachoSet.add(e.cowId);
                }
            }
        });
        return { enTratamiento: vacasAlTachoSet.size, vacasAlTacho: Array.from(vacasAlTachoSet) };
    };

    const getGroups = () => {
        const hoy = new Date();
        const groups = {
            secas: [] as Cow[],
            lactancia: [] as Cow[],
            aSecar: [] as Cow[],
            proximasParto: [] as Cow[],
            porRaza: {} as Record<string, Cow[]>,
        };

        cows.forEach(cow => {
            if (cow.estado === 'Seca') groups.secas.push(cow);
            if (cow.estado === 'Lactancia') groups.lactancia.push(cow);
            if (!groups.porRaza[cow.raza]) groups.porRaza[cow.raza] = [];
            groups.porRaza[cow.raza].push(cow);

            if (cow.fpp) {
                const fppDate = parseISO(cow.fpp);
                const diasAlParto = differenceInDays(fppDate, hoy);
                if (diasAlParto >= 0 && diasAlParto <= 15) groups.proximasParto.push(cow);
                const fechaSecadoSugerida = addDays(fppDate, -60);
                const diasAlSecado = differenceInDays(fechaSecadoSugerida, hoy);
                if (diasAlSecado >= -7 && diasAlSecado <= 15 && cow.estado === 'Lactancia') groups.aSecar.push(cow);
            }
        });
        return groups;
    };

    const getAlerts = (): Alerta[] => {
        const alertas: Alerta[] = [];
        const hoy = new Date();

        // 1. Alertas de Retiro de Leche
        events.forEach(e => {
            if (e.tipo === 'sanidad' && e.fechaLiberacion) {
                const lib = parseISO(e.fechaLiberacion);
                if (isAfter(lib, hoy)) {
                    alertas.push({
                        id: `retiro-${e.id}`,
                        tipo: 'urgente',
                        mensaje: `Vaca ${e.cowId} - ORDEÑAR AL TACHO`,
                        accion: `Liberación: ${format(lib, 'dd/MM')}`,
                        link: `/cows/${e.cowId}`
                    });
                }
            }
        });

        // 2. Alertas Reproductivas (Celo, Repetición, DEL alto)
        cows.forEach(cow => {
            const metrics = calculateMetrics(cow.id);
            if (metrics.del > 300 && cow.estadoRepro !== 'Preñada' && cow.estado === 'Lactancia') {
                alertas.push({
                    id: `del-alto-${cow.id}`,
                    tipo: 'urgente',
                    mensaje: `Vaca ${cow.id} - DEL CRÍTICO (${metrics.del} días)`,
                    accion: 'REVISAR POR QUÉ NO PREÑA',
                    link: `/cows/${cow.id}`
                });
            }
        });

        return alertas.slice(0, 10);
    };

    const getActiveHeats = () => {
        const hoy = new Date();
        const activeHeats: { cow: Cow; event: Evento }[] = [];

        events.forEach(e => {
            if (e.tipo === 'celo') {
                const eventDate = parseISO(e.fecha);
                const diffHours = Math.abs(differenceInDays(hoy, eventDate) * 24);
                // Si es en las últimas 24 horas y la vaca no fue inseminada después de este celo
                if (differenceInDays(hoy, eventDate) < 1) {
                    const cow = getCow(e.cowId);
                    if (cow && cow.estadoRepro !== 'Inseminada' && cow.estadoRepro !== 'Preñada') {
                        activeHeats.push({ cow, event: e });
                    }
                }
            }
        });
        return activeHeats;
    };

    const toggleLock = () => setIsLocked(!isLocked);

    const clearAllData = () => {
        if (isLocked) return;
        setCows([]);
        setEvents([]);
    };

    return (
        <StoreContext.Provider value={{
            cows, events, addCow, bulkAddCows, deleteCow, addEvent, deleteEvent,
            getAlerts, getCow, getCowEvents, getMedicalSummary, getGroups,
            calculateMetrics, getActiveHeats, isLocked, toggleLock, clearAllData
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) throw new Error('useStore must be used within a StoreProvider');
    return context;
}
