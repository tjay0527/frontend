import React, { useState, useEffect } from 'react';
import MovieDataService from '../services/movies';
import { json, Navigate, useParams } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import moment from 'moment';
import "./Movie.css";
import { Link } from 'react-router-dom';

const Movie = ({ user }) => {
    //will get the paramater from the route automatically
    //path={"/movies/:id/"}, get the id from path
    let params = useParams();

    const [movie, setMovie] = useState({
        id:null,
        title: "",
        rated: "",
        reviews:[],
        poster: "",
        plot: ""

    });

    //defined in the useEffect cuz it not shared by any other code
    useEffect(() => {
        const getMovie = id => {
            //implement getMovie
            MovieDataService.getMovieById(id)
                .then(response => {
                    setMovie(response.data);
                })
        }
        getMovie(params.id)
    }, [params.id]);

    // delete review fun which is called when the delete btn is clicked
    const deleteReview = (reviewId, index) => {
        var data = {
            review_id: reviewId,
            user_id: user.googleId
        }

        MovieDataService.deleteReview(data)
            .then(response => {
                setMovie((prevState) => {
                    prevState.reviews.splice(index, 1);
                    return ({
                        ...prevState
                    })
                });
            })
            .catch(e => {
                console.log(e);
            });
        console.log(movie.reviews);
    }

    return (
        <div>
            <Container>
                <Row>
                    <Col>
                    <div className="poster">
                    <Image
                        className="bigPicture"
                        src={movie.poster+"/100px180"}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null;// prevents looping
                            currentTarget.src ="/images/NoPosterAvailable.jpeg"
                        }}
                        fluid />
                        </div>
                    </Col>
                    <Col>
                        <Card>
                            <Card.Header as="h5">{movie.title}</Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    {movie.plot}
                                </Card.Text>
                                { 
                                    user && //only if user has value, create and display the Add Review Link
                                    <Link to={"/movies/" + params.id + "/review"}>
                                        Add Review
                                    </Link>
                                }
                            </Card.Body>
                        </Card>
                        <h2>Reviews</h2>
                        <br></br>
                        { movie.reviews.map((review, index) => {
                            return (
                                <div className="d-flex">
                                    <div className="flex-shrink-0 reviewsText">
                                        <h5>{review.name + " reviewed on "} { moment(review.date).format("Do MMMM YYYY") }</h5>
                                        <p className="review">{review.review}</p>
                                        { user && user.googleId === review.user_id && //if the user's googleid matches the review's user_id
                                            //Edit and Delete will be displayed
                                            <Row>
                                                <Col>
                                                    <Link to={{
                                                        pathname: "/movies/"+params.id+"/review"
                                                    }}
                                                    state = {{
                                                        currentReview: review
                                                    }}>
                                                        Edit
                                                    </Link>
                                                </Col>
                                                <Col>
                                                    {/* TODO: Implement delete behavior */}
                                                    <Button variabnt="link" onClick={ () => 
                                                    {
                                                        deleteReview(review._id, index);
                                                        
                                                    }}>
                                                        Delete
                                                    </Button>
                                                </Col>
                                            </Row>
                                        }
                                    </div>
                                </div>
                            )
                        })}
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Movie;