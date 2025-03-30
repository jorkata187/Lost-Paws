import { Routes, Route } from 'react-router'
import { useState } from 'react';

import './App.css'

import UserContext from './contexts/UserContext';

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
import Logout from './components/logout/Logout';

function App() {
	const [userData, setUserData] = useState({});

	const userLoginHandler = (data) => {
		setUserData(data);
	};

	const userLogoutHandler = () => {
		setUserData({});
	};

	return (
		<UserContext.Provider value={{ ...userData, userLoginHandler, userLogoutHandler }}>
			<Header />

			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />
				<Route path='/logout' element={<Logout />} />
				<Route path='/paws/create' element={<PawsCreate />} />
				<Route path='/paws/:pawId/details' element={<PawsDetails />} />
				<Route path='/paws/:pawId/edit' element={<PawsEdit />} />
				<Route path='/paws' element={<PawsList />} />
				<Route path='/about' element={<About />} />
			</Routes>

			<Footer />
		</UserContext.Provider>
	)
}

export default App
