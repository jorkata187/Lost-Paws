import { Routes, Route } from 'react-router'

import './App.css'

import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Home from './components/home/Home'
import Login from './components/login/Login'
import Register from './components/register/Register'
import PostCreate from './components/post-create/PostCreate'
import PostEdit from './components/post-edit/PostEdit'

function App() {

	return (
		<>
			<Header />

			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />
				<Route path='/posts/create' element={<PostCreate />} />
				<Route path='/posts/edit' element={<PostEdit />} />
			</Routes>

			<Footer />
		</>
	)
}

export default App
