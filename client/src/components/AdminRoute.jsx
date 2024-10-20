import React, { useContext } from 'react'
import {Navigate} from 'react-router-dom';
import { Store } from '../Store';

export default function AdminRoute ({children}) {
		const {state}    = useContext(Store);
		const {userInfo} =  state;

	return (
		userInfo.isAdmin || userInfo.isRider 
		// true
			? children
			: <Navigate to="/signin"/> 
	)
	
}
