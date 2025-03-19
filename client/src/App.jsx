import { Routes, Route } from 'react-router'
import './App.css'

import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Home from './components/home/Home'
import Login from './components/login/Login'
import Register from './components/register/Register'

function App() {

	return (
		<>
			<Header />

			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />
			</Routes>

			<Footer />
		</>
	)
}

export default App
