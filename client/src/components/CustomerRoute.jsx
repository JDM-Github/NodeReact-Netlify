import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Store } from '../Store';

function CustomerRoute({
  children,
  restrictedPaths = [
    '/cart',
    '/',
    '/product/:slug',
    '/shipping',
    '/payment',
    '/placeorder',
    '/search',
    '/services'
  ]
}) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const location = useLocation();

  const isRestrictedPath = restrictedPaths.some(path => {
    return path === location.pathname ||
           (path.includes(':slug') && location.pathname.includes('/product/'));
  });

  // // Redirect logic
  // if (!userInfo && isRestrictedPath) {
  //   return <Navigate to="/signin" state={{ from: location }} />;
  // }

  if (userInfo && userInfo.isAdmin && isRestrictedPath) {
    return <Navigate to="/admin/dashboard" />;
  }

  if (userInfo && userInfo.isRider && isRestrictedPath) {
    return <Navigate to="/admin/orders" />;
  }

  return children; 
}

export default CustomerRoute;
