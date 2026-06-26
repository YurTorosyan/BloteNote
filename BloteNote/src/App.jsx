import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import HomePage from './pages/HomePage'
import './styles/globals.css'

export default function App() {
  const [screen, setScreen] = useState('splash') // splash | home | game

  const handleSplashDone = () => setScreen('home')
  const handleNewGame    = () => console.log('TODO: navigate to game setup')

  return (
    <>
      {screen === 'splash' && (
        <SplashScreen onDone={handleSplashDone} />
      )}

      {/* HomePage stays mounted after splash so its enter animation plays */}
      <HomePage
        visible={screen === 'home'}
        onNewGame={handleNewGame}
      />
    </>
  )
}
