import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import { useNavigate, useLocation } from 'react-router-dom';

function SearchBox() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [query, setQuery] = useState('');

    const submitHandler = (e) => {
        e.preventDefault();
        navigate(query ? `/search/?query=${query}` : `/search`);
    };

    // Check if the current path is for sign-in or sign-up
    const isAuthPage = ['/signin', '/signup'].includes(pathname);

    // If on auth pages, return null to not render the SearchBox
    if (isAuthPage) return null;

    return (
        <div className='search-box me-auto' style={{ width: "30rem" }}>
        <Form onSubmit={submitHandler} >
            <InputGroup>
                <FormControl
                    type='text'
                    name='q'
                    id='q'
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SEARCH PRODUCTS..."
                    aria-label='Search Products'
                    aria-describedby='button-search'
                />
                <Button
                    variant='outline-primary'
                    type='submit'
                    id='button-search'
                >
                    <i className='fas fa-search' />
                </Button>
            </InputGroup>
        </Form>
        </div>
    );
}

export default SearchBox;
