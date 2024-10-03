import React from 'react'
import { MyContextProvider } from './MyContextProvider'
import { UIContextProvider } from './UIContextProvider';

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UIContextProvider>
      <MyContextProvider>
        {children}
      </MyContextProvider>
    </UIContextProvider>
  )
}