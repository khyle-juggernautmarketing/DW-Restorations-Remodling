import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SocialProof from './components/SocialProof'
import Footer from './components/Footer'
import SeoSchema from './components/SeoSchema'
import ThankYou from './pages/ThankYou'

function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <SocialProof />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen overflow-x-hidden bg-slate-50 supports-[min-height:100dvh]:min-h-dvh">
        <SeoSchema />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
