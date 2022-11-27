import React, { useState } from 'react';
import MovieDataService from "../services/movies";
import { useNavigate, useParams} from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

import { useLocation } from "react-router-dom";

const AddReview = ({ user }) => {
    const navigate = useNavigate()// send the user back to the movie page after review submitted
    let params = useParams();
    let location = useLocation();// state for accessing current review
    // creating a new review or editing an existing review
    let editing = location.state !== null ? true : false;
    // initialReview State will have a different value 
    // if we're editing an existing review
    let initialReviewState = location.state !== null ? location.state.currentReview : "";
    const [review, setReview] = useState(initialReviewState);// create review obj

    // whenever the review's text changes(submited), updates the review state using setReview
    const onChangeReview = e => {
        
        const actualReview = e.target.value;
        console.log(actualReview);
        setReview(actualReview);
    }

    // put data together and send to movies service to be submitted to the backend
    // editing false => new reivews
    const saveReview = () => {
        var data = {
            review: review,
            name: user.name,
            user_id: user.googleId,
            movie_id: params.id, // get movie id from url
            
        }
        if(editing) {
            // Handle case where an existing review is being updated
            data.review_id = initialReviewState._id
            MovieDataService.editReview(data)
                .then(response => {
                    navigate("/movies/"+params.id)
                })
                .catch(e => {
                    console.log(e);
                })
        } else {
            MovieDataService.createReview(data)
                .then(response => {
                    navigate("/movies/"+params.id)
                })
                .catch(e => {
                    console.log(e);
                });
        }
    }
    
    return (
        <Container className="main-container">
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>{ editing ? "Edit" : "Create"}</Form.Label>
                    <Form.Control
                        as="textarea"
                        type="text"
                        required
                        review={ review }
                        onChange={ onChangeReview }
                        defaultValue={ editing ? initialReviewState.review : "" }
                    />
                </Form.Group>
                    <Button variant="primary" onClick={ saveReview }>
                        Submit
                    </Button>
            </Form>
        </Container>
    )
}

export default AddReview;