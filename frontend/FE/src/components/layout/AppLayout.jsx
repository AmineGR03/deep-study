// import Navbar from './Navbar'
// import Sidebar from './Sidebar'

// // Wrapper utilisé pour toutes les pages connectées
// // Structure : Navbar en haut + Sidebar à gauche + contenu à droite
// export default function AppLayout({ children }) {
//   return (
//     <div className="min-h-screen bg-dark-900">
      
//       {/* Barre du haut fixe */}
//       <Navbar />

//       <div className="flex pt-16">
//         {/* Sidebar fixe à gauche */}
//         <Sidebar />

//         {/* Contenu principal */}
//         <main className="flex-1 ml-60 p-8 min-h-[calc(100vh-4rem)]">
//           {children}
//         </main>
//       </div>

//     </div>
//   )
// }

import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true) // ouverte par défaut

  function toggleSidebar() {
    setSidebarOpen(prev => !prev)
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen">

      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Contenu décalé quand sidebar ouverte sur desktop */}
        <main className={`
          flex-1 p-8 min-h-[calc(100vh-4rem)]
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-0'}
        `}>
          {children}
        </main>
      </div>

    </div>
  )
}