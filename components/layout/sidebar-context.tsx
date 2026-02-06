"use client"

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from "react"

interface SidebarContextType {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebarState() {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebarState must be used within a SidebarProvider")
    }
    return context
}
