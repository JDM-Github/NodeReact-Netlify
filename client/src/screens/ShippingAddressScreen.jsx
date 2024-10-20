import { Button, TextField } from '@mui/material';
import React, { useContext, useEffect, useReducer, useState } from 'react'
import {Helmet} from 'react-helmet-async'
import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import {Store} from '../Store'
import {useNavigate, useParams } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


function reducer(state, action){
    switch(action.type){
      case 'FETCH_REQUEST':
        return {...state, loading: true, error: ''};
      case 'FETCH_SUCCESS':
        return{...state, loading: false, order: action.payload, error: ''};
      case 'FETCH_FAIL':
          return {...state, loading: false, error: action.payload};  
    
      default:
        return state;
    }
  }

function ShippingAddressScreen () {
    const navigate = useNavigate();
    const {state, dispatch: ctxDispatch} = useContext(Store);
    const { userInfo, cart: {shippingAddress}} = state;
    const params = useParams();
    const { id: orderId } = params;

    const [{loading, error, order, successPay, loadingPay}, dispatch] = useReducer(reducer, {
        loading: true,
        order: {},
        error: '',
        
      });

      const handleChange = (event) => {
        // For requiring characters for address input
        const newValue = event.target.value.replace(/[^a-zA-Z0-9 ,.#]/g, '');
        setAddress(newValue);
      };

      const handleLastName = (event) => {
        // For Requiring letters only characters 
        const newValue = event.target.value.replace(/[^a-zA-Z ]/g, '');
        setLastName(newValue);
      };

      const handleFullName = (event) => {
        // For Requiring letters only characters 
        const newValue = event.target.value.replace(/[^a-zA-Z ]/g, '');
        setFullName(newValue);
      };

      const handlePhoneNumber = (event) => {
        // For Requiring letters only characters 
        const digits = event.target.value.replace(/[^0-9 ]/g, '');
        const newValue = digits.slice(0, 11);
        setPostalCode(newValue);
      };

    const [fullName, setFullName] = useState(shippingAddress.fullName || userInfo.name);
    // const [firstName, setFirstName] = useState(shippingAddress.firstName || '');
     const [LastName, setLastName] = useState(shippingAddress.LastName || userInfo.lastname)
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    
    useEffect(() => {
        if (!userInfo) {
            navigate('/signin?redirect=/shipping');
        }
    }, [userInfo, navigate])
    
    const submitHandler = (e) => {
        e.preventDefault();

        ctxDispatch({
            type: 'SAVE_SHIPPING_ADDRESS',
            payload: {
                // firstName,
                 LastName,
                fullName,
                address,
                city,
                postalCode,
                
            }
        });
        localStorage.setItem(
            'shippingAddress',
            JSON.stringify({
                // firstName,
                 LastName,
                fullName,
                address,
                city,
                postalCode,
                
            })
        );
        navigate('/payment');
    }
  return (
    <div>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>
      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
      <h1 className='my-3'>Shipping Address</h1>
      <Form onSubmit={submitHandler}> 
        <Form.Group className="mb-3" controlId='fullName' style={{display:"flex", width:"36rem", alignItems:"stretch", flexDirection:"row", gap:"10px"}}>
            
           
            <TextField
            sx={{display: "flex", width: '50%'}}
            label="First Name"
            required
            value={fullName}
            onChange={handleFullName}
            helperText="Letters Only" // Optional helper text
            error={fullName.length > 0 && !/^[a-zA-Z ]+$/.test(fullName)} 
            fullWidth 
            />
            <TextField
            sx={{display: "flex", width:'50%' }}
            label="Surname"
            required
            value={LastName}
            onChange={handleLastName}
            helperText="Letters Only" // Optional helper text
            error={LastName.length > 0 && !/^[a-zA-Z ]+$/.test(LastName)} 
            fullWidth 
            />
          


            {/* <TextField 
                sx={{display: "flex", width: "50%" }}
                    label="First Name" 
                        variant="outlined" 
                            value={fullName}
                                required
                                    onChange={(e) => setFullName(e.target.value)}/>
            <TextField 
                sx={{display: "flex", width: "50%"}}
                    label="Surname" 
                        variant="outlined" 
                            value={LastName}
                                required
                                    onChange={(e) => setLastName(e.target.value)}/> */}
            
            
        </Form.Group>
        
        <Form.Group className="mb-3" controlId='address'>
        <TextField
            label="House Number/Purok/Sitio/Village/Subdivision"
            value={address}
            required
            onChange={handleChange}
            helperText="Enter: a-z A-Z 0-9 ,.#" // Optional helper text
            error={address.length > 0 && !/^[a-zA-Z0-9 ,.#]+$/.test(address)} // Display error if non-letter characters are present
            fullWidth // Optional: Set full width for better layout
            />

            {/* <TextField 
                sx={{display: "flex"}}
                    label="House Number/Purok/Sitio/Village/Subdivision" 
                        variant="outlined" 
                            value={address}
                                required
                                    onChange={(e) => setAddress(e.target.value)}/> */}
        </Form.Group>
        <Form.Group className="mb-3" controlId='city'>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Barangay</InputLabel>
                <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={city}
            label="Barangay"
            onChange={(e) => setCity(e.target.value)}
            required
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200, // Limit the height of the dropdown list
                },
              },
            }}
            sx={{ fontSize: '14px' }} // Adjust font size
        >
                            
                        <MenuItem value='Bagong Kalsada'>Bagong Kalsada</MenuItem>
                        <MenuItem value='Banadero'>Banadero</MenuItem>
                        <MenuItem value='Barandal'>Barandal</MenuItem>
                        <MenuItem value='Batino'>Batino</MenuItem>
                        <MenuItem value='Bucal'>Bucal</MenuItem>
                        <MenuItem value='Bunggo'>Bunggo</MenuItem>
                        <MenuItem value='Halang'>Halang</MenuItem>
                        <MenuItem value='Hornalan'>Hornalan</MenuItem>
                        <MenuItem value='Lawa'>Lawa</MenuItem>
                        <MenuItem value='Lecheria'>Lecheria</MenuItem>
                        <MenuItem value='Lingga'>Lingga</MenuItem>
                        <MenuItem value='Makiling'>Makiling</MenuItem>
                        <MenuItem value='Majada Out'>Majada Out</MenuItem>
                        <MenuItem value='Mayapa'>Mayapa</MenuItem>
                        <MenuItem value='Milagrosa'>Milagrosa</MenuItem>
                        <MenuItem value='Paciano Rizal'>Paciano Rizal</MenuItem>
                        <MenuItem value='Palingon'>Palingon</MenuItem>
                        <MenuItem value='Parian'>Parian</MenuItem>
                        <MenuItem value='Real'>Real</MenuItem>
                        <MenuItem value='Saimsim'>Saimsim</MenuItem>
                        <MenuItem value='Sampiruhan'>Sampiruhan</MenuItem>
                        <MenuItem value='San Cristobal'>San Cristobal</MenuItem>
                        <MenuItem value='San Juan'>San Juan</MenuItem>
                        <MenuItem value='Sirang Lupa'>Sirang Lupa</MenuItem>
                        <MenuItem value='Tulo'>Tulo</MenuItem>
                        <MenuItem value='Turbina'>Turbina</MenuItem>
                        <MenuItem value='Uno'>Uno</MenuItem>

                    </Select>
            </FormControl>
        </Form.Group>

        <Form.Group className="mb-3" controlId='postalCode'>
            <TextField 
            sx={{ display: "flex", '& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button': { 'webkitAppearance': 'none', margin: 0 }}}
                    label="Phone Number" 
                        variant="outlined" 
                            value={postalCode}
                                type="Tel"
                                    required
                                        onChange={handlePhoneNumber}
                                            />
        </Form.Group>
        
        {/* <Form.Group className="mb-3" controlId='country'>    InputProps={{ inputProps: { maxLength: 11 } }}
            <TextField 
                sx={{display: "flex"}}
                    label="Country" 

                        variant="outlined" 
                            value={country}
                                required
                                    onChange={(e) => setCountry(e.target.value)}/>
        </Form.Group> */}
        <div className="mb-3">
        <Button 
            type='submit' 
              variant="outlined"
                sx={{border: "none", backgroundColor:"#f0c040", color:"black"}}>
                  Continue</Button>
        </div>
      </Form>
      </div>
    </div>
  )
}

export default ShippingAddressScreen;
