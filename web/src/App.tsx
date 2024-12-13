
import LoginDialog from './components/LoginDialog';
import "./bg.css"

const App = () => {
  return (
    <div className='w-full h-full min-h-screen fabric bg-gradient-to-r from-purple-600 via-black to-blue-600'>
      <LoginDialog />
      Hello World
    </div>
  )
}
export default App