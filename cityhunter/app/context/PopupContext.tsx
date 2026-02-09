"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type PopupVariant = 'danger' | 'warning' | 'info' | 'success';

interface PopupState {
    isOpen: boolean;
    title: string;
    message: string;
    variant: PopupVariant;
    isConfirm: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

interface PopupContextType {
    showAlert: (title: string, message: string, variant?: PopupVariant) => void;
    showConfirm: (
        title: string, 
        message: string, 
        onConfirm: () => void, 
        variant?: PopupVariant,
        confirmText?: string,
        cancelText?: string
    ) => void;
    setPopupLoading: (loading: boolean) => void;
    closePopup: () => void;
    popupState: PopupState;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

const INITIAL_STATE: PopupState = {
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    isConfirm: false
};

export function PopupProvider({ children }: { children: ReactNode }) {
    const [popupState, setPopupState] = useState<PopupState>(INITIAL_STATE);

    const showAlert = useCallback((title: string, message: string, variant: PopupVariant = 'info') => {
        setPopupState({
            isOpen: true,
            title,
            message,
            variant,
            isConfirm: false
        });
    }, []);

    const showConfirm = useCallback((
        title: string, 
        message: string, 
        onConfirm: () => void, 
        variant: PopupVariant = 'warning',
        confirmText: string = 'Confirm',
        cancelText: string = 'Cancel'
    ) => {
        setPopupState({
            isOpen: true,
            title,
            message,
            variant,
            isConfirm: true,
            onConfirm,
            confirmText,
            cancelText
        });
    }, []);

    const setPopupLoading = useCallback((loading: boolean) => {
        setPopupState(prev => ({ ...prev, isLoading: loading }));
    }, []);

    const closePopup = useCallback(() => {
        setPopupState(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <PopupContext.Provider value={{ showAlert, showConfirm, setPopupLoading, closePopup, popupState }}>
            {children}
        </PopupContext.Provider>
    );
}

export function usePopup() {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider');
    }
    return context;
}
