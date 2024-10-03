import { IAdvertisement, ISiteSettings } from '@/constants/database';
import axios from 'axios';
import React, { Dispatch, SetStateAction, createContext, useEffect, useState } from 'react';

export interface INavData {
  site: ISiteSettings | null;
  advertise?: IAdvertisement[];
}

const useNav = () => {
  const [navData, setNavData] = useState<INavData>({ site: null, advertise: [] })
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/settings/header');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        setNavData(result.navData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

  return {
    navData,
    loading,
  }
}

export const UIContext = createContext({} as ReturnType<typeof useNav>);

UIContext.displayName = "UI";

export const UIContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UIContext.Provider value={useNav()} >
      {children}
    </UIContext.Provider>
  )
}