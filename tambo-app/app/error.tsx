"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Algo salió mal</h2>
            <p className="text-slate-600 mb-6 max-w-md">
                Ocurrió un error inesperado en la aplicación. Revisa la consola o intenta recargar.
            </p>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100 mb-6 text-left w-full max-w-md overflow-auto">
                <p className="font-mono text-xs text-red-500 break-words">
                    {error.message}
                </p>
            </div>

            <button
                onClick={() => reset()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full"
            >
                Intentar de nuevo
            </button>
        </div>
    );
}
