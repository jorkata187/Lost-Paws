import { Routes, Route } from 'react-router'
import './App.css'

import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Home from './components/home/Home'

function App() {

	return (
		<>
			<Header />

			<Routes>
				<Route path='/' element={<Home />} />
			</Routes>

			<Footer />
		</>
	)
}

export default App
