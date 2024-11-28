import LectureDisplay from '@/model/lectures/lectureDoc';
import React, { createContext, useContext, useState } from 'react';

// type
import AvailableLangs = LectureDisplay.AvailableLangs;

interface LangContextType {
    lang: AvailableLangs;
    setLang: React.Dispatch<React.SetStateAction<AvailableLangs>>;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<AvailableLangs>('english');

    return (
        <LangContext.Provider value={{ lang, setLang }}>
            {children}
        </LangContext.Provider>
    );
};

export const useLang = () => {
    const context = useContext(LangContext);
    if (!context) {
        throw new Error('useLang must be used within a LangProvider');
    }
    return context;
};