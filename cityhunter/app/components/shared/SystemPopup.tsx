"use client";

import React from 'react';
import { usePopup } from '../../context/PopupContext';

export default function SystemPopup() {
    const { popupState, closePopup } = usePopup();
    const { isOpen, title, message, variant, isConfirm, onConfirm, confirmText, cancelText, isLoading } = popupState;

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            icon: 'fa-triangle-exclamation',
            iconColor: 'text-red-500',
            btn: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
        },
        warning: {
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            icon: 'fa-circle-exclamation',
            iconColor: 'text-orange-500',
            btn: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
        },
        info: {
            bg: 'bg-accent/10',
            border: 'border-accent/20',
            icon: 'fa-circle-info',
            iconColor: 'text-accent',
            btn: 'bg-accent hover:bg-accent/90 text-black shadow-accent/20'
        },
        success: {
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            icon: 'fa-circle-check',
            iconColor: 'text-green-500',
            btn: 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
        }
    };

    const style = variantStyles[variant];

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        if (!isLoading) closePopup();
    };

    const handleCancel = () => {
        closePopup();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface border border-divider/10 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${style.bg} ${style.iconColor} border ${style.border}`}>
                        <i className={`fa-solid ${style.icon} text-2xl`}></i>
                    </div>
                    
                    <h3 className="text-xl font-bold text-primary mb-2 tracking-tight uppercase italic">{title}</h3>
                    <p className="text-secondary text-sm mb-8 font-mono leading-relaxed">{message}</p>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${style.btn} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading && <i className="fa-solid fa-spinner fa-spin"></i>}
                            {isConfirm ? (confirmText || 'PROCEED') : 'OK, UNDERSTOOD'}
                        </button>
                        
                        {isConfirm && (
                            <button 
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="w-full py-3 text-xs font-bold text-secondary hover:text-primary transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelText || 'ABORT'}
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Decorative scanning line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-accent/20 animate-scan pointer-events-none"></div>
            </div>
        </div>
    );
}
