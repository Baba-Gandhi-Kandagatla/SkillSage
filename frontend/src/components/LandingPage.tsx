import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Zap, BarChart, MessageSquare, CheckCircle, Star, PlayCircle, Menu, X, BrainCircuit } from 'lucide-react'

const MotionCard = motion(Card)

const images = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
]

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="flex flex-col min-h-screen bg-teal-50">
      <header className="px-4 lg:px-6 h-14 flex items-center fixed w-full bg-teal-700 z-10 shadow-md">
        <div className="flex items-center justify-center">
          <img src="/Logo2.png" alt="Logo" className="h-12 w-28 ml-10" />
          {/* <span className="ml-2 text-2xl font-bold text-white">Skill Sage</span> */}
        </div>
        <button className="ml-auto md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
        <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-14 md:top-0 left-0 right-0 flex-col md:flex-row items-center md:ml-auto gap-4 sm:gap-6 bg-teal-700 md:bg-transparent p-4 md:p-0`}>
          <a className="text-sm font-medium text-white hover:text-amber-400 transition-colors" href="#features" onClick={() => setIsMenuOpen(false)}>
            Features
          </a>
          <a className="text-sm font-medium text-white hover:text-amber-400 transition-colors" href="#about" onClick={() => setIsMenuOpen(false)}>
            About
          </a>
          <a className="text-sm font-medium text-white hover:text-amber-400 transition-colors" href="#demo" onClick={() => setIsMenuOpen(false)}>
            Demo
          </a>
          <a className="text-sm font-medium text-white hover:text-amber-400 transition-colors" href="#testimonials" onClick={() => setIsMenuOpen(false)}>
            Testimonials
          </a>
        </nav>
      </header>
      <main className="flex-1 pt-14">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-teal-600 to-teal-800">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div 
              className="flex flex-col items-center space-y-4 text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-white">
                  Elevate Your Interview Skills with Skill Sage
                </h1>
                <p className="mx-auto max-w-[700px] text-teal-100 md:text-xl">
                  Experience AI-powered interviews that verify your skills, provide instant feedback, and help you upskill on the go.
                </p>
              </div>
              <div className="space-x-4">
                <a href="/">
                  <Button className="bg-amber-500 text-teal-900 hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" size="lg">
                    Start Your Journey
                  </Button>
                </a>
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-teal-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" size="lg">
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-teal-800">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <MotionCard
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-teal-50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="flex flex-col items-center p-6">
                  <BrainCircuit className="h-12 w-12 mb-4 text-amber-500" />
                  <h3 className="text-lg font-bold mb-2 text-teal-800">AI-Powered Interviews</h3>
                  <p className="text-center text-teal-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </CardContent>
              </MotionCard>
              <MotionCard
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-teal-50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="flex flex-col items-center p-6">
                  <CheckCircle className="h-12 w-12 mb-4 text-amber-500" />
                  <h3 className="text-lg font-bold mb-2 text-teal-800">Skill Verification</h3>
                  <p className="text-center text-teal-600">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </CardContent>
              </MotionCard>
              <MotionCard
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-teal-50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="flex flex-col items-center p-6">
                  <BarChart className="h-12 w-12 mb-4 text-amber-500" />
                  <h3 className="text-lg font-bold mb-2 text-teal-800">Real-time Feedback</h3>
                  <p className="text-center text-teal-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </CardContent>
              </MotionCard>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-teal-100">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div 
              className="flex flex-col items-center space-y-4 text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-800">About Skill Sage</h2>
              <p className="mx-auto max-w-[700px] text-teal-700 md:text-xl">
                Skill Sage is revolutionizing the way interviews are conducted and skills are verified. Founded in 2023 by a team of AI experts and HR professionals, our mission is to empower job seekers and help companies find the best talent efficiently. Our AI-powered platform provides a seamless, efficient, and insightful interview experience for both candidates and recruiters.
              </p>
              <Button className="bg-amber-500 text-teal-900 hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" size="lg">
                Learn Our Story
              </Button>
            </motion.div>
          </div>
        </section>

        <section id="demo" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-teal-800">See Skill Sage in Action</h2>
            <div className="flex justify-center">
              <motion.div 
                className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <PlayCircle className="absolute inset-0 m-auto h-16 w-16 text-white opacity-75 hover:opacity-100 cursor-pointer transition-opacity duration-300" />
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="Demo Video Thumbnail" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-teal-50">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-teal-800">Skill Sage in Action</h2>
            <div className="relative w-full max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={images[currentImage]}
                  alt={`Skill Sage Screenshot ${currentImage + 1}`}
                  className="w-full h-auto rounded-xl shadow-2xl"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
              <button
                onClick={prevImage}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-teal-500 bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-300"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-teal-500 bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-300"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-teal-700 text-white">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <MotionCard 
                className="bg-teal-600 shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CardContent className="p-6">
                  <Star className="h-6 w-6 text-amber-400 mb-4" />
                  <p className="italic mb-4">"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."</p>
                  <p className="font-bold">- John Doe, CEO at TechCorp</p>
                </CardContent>
              </MotionCard>
              <MotionCard 
                className="bg-teal-600 shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CardContent className="p-6">
                  <Star className="h-6 w-6 text-amber-400 mb-4" />
                  <p className="italic mb-4">"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</p>
                  <p className="font-bold">- Jane Smith, HR Manager</p>
                </CardContent>
              </MotionCard>
              <MotionCard 
                className="bg-teal-600 shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CardContent className="p-6">
                  <Star className="h-6 w-6 text-amber-400 mb-4" />
                  <p className="italic mb-4">"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."</p>
                  <p className="font-bold">- Alex Johnson, Recent Graduate</p>
                </CardContent>
              </MotionCard>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-teal-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Skill Sage</h3>
              <p className="text-sm">Empowering careers through AI-driven interviews</p>
            </div>
            <nav className="flex gap-4 mb-4 md:mb-0">
              <a className="text-sm hover:text-amber-400 transition-colors" href="#features">Features</a>
              <a className="text-sm hover:text-amber-400 transition-colors" href="#about">About</a>
              <a className="text-sm hover:text-amber-400 transition-colors" href="#demo">Demo</a>
              <a className="text-sm hover:text-amber-400 transition-colors" href="#testimonials">Testimonials</a>
            </nav>
            <div>
              <a href="/">
                <Button className="bg-amber-500 text-teal-900 hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">Start Free Trial</Button>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-teal-600 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">© 2024 Skill Sage. All rights reserved.</p>
            <div className="flex gap-4">
              <a className="text-sm hover:text-amber-400 transition-colors" href="#">Privacy Policy</a>
              <a className="text-sm hover:text-amber-400 transition-colors" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App