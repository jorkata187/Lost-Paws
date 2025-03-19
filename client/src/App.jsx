import { Routes, Route } from 'react-router'
import './App.css'

import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Home from './components/home/Home'
import Login from './components/login/Login'

function App() {

	return (
		<>
			<Header />

			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/login' element={<Login />} />
			</Routes>

			<Footer />
		</>
	)
}

export default App
