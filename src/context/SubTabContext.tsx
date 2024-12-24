// src/context/SubTabContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AppServices, { Configuration, ProgramType } from '../services/api.services';

type DataType = Configuration[] | ProgramType[];

interface SubTabContextProps {
  activeSubTab: string;
  setActiveSubTab: (subtab: string) => void;
  data: DataType | null;
  loading: boolean;
  error: string | null;
}

const SubTabContext = createContext<SubTabContextProps | undefined>(undefined);

export const useSubTabContext = () => {
  const context = useContext(SubTabContext);
  if (!context) {
    throw new Error('useSubTabContext باید در داخل یک SubTabProvider استفاده شود');
  }
  return context;
};

interface SubTabProviderProps {
  children: ReactNode;
}

export const SubTabProvider: React.FC<SubTabProviderProps> = ({ children }) => {
  const [activeSubTab, setActiveSubTab] = useState<string>('Configurations');
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (subtab: string) => {
    setError(null);
    try {
      let response: DataType;
      if (subtab === 'Configurations') {
        response = await AppServices.getAllConfiguration();
      } else if (subtab === 'ProgramTypes') {
        response = await AppServices.getAllProgramType();
      } else {
        response = [];
      }
      setData(response);
    } catch (err) {
      console.error(err);
      setError('مشکلی در دریافت داده‌ها رخ داده است.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    fetchData(activeSubTab);
  }, [activeSubTab]);

  return (
    <SubTabContext.Provider value={{ activeSubTab, setActiveSubTab, data, loading, error }}>
      {children}
    </SubTabContext.Provider>
  );
};
