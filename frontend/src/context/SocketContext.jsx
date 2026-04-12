// src/context/SocketContext.jsx
// Connexion Socket.io partagée dans toute l'app

import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Connexion directe au backend (Socket.io ne passe pas bien par le proxy Vite WS)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    newSocket.on('connect', () => {
      console.log('🔌 Socket connecté:', newSocket.id)
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Socket déconnecté')
      setConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

// Hook pratique
export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket doit être utilisé dans SocketProvider')
  return context
}
