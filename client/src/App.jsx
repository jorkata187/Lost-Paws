import { Routes, Route } from 'react-router'

import './App.css'

import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Home from './components/home/Home'
import Login from './components/login/Login'
import Register from './components/register/Register'
import PawsCreate from './components/paws-create/PawsCreate'
import PawsEdit from './components/paws-edit/PawsEdit'
import PawsDetails from './components/paws-details/PawsDetails'
import PawsList from './components/paws-list/PawsList'
import About from './components/about/About'

function App() {

	return (
		<>
			<Header />

			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />
				<Route path='/paws/create' element={<PawsCreate />} />
				<Route path='/paws/:pawId/details' element={<PawsDetails />} />
				<Route path='/paws/:pawId/edit' element={<PawsEdit />} />
				<Route path='/paws' element={<PawsList />} />
				<Route path='/about' element={<About />} />
			</Routes>

			<Footer />
		</>
	)
}

export default App
