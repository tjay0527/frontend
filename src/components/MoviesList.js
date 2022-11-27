//display the full list of movies broken into pages of up to 20 movies per page, and will enable filtering on title and rating.
//useState => maintain the state even after re-render
//useEffect => if the dependency changes, put the functionality into stack and executes after next render happens
//it won't execute immediately aftet the changed of the dependency. 
//react component only do the rendering
import React, { useState, useEffect, useCallback } from 'react';
import MovieDataService from "../services/movies";
import { Link } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import "./MoviesList.css";
import { BsStar, BsStarFill } from "react-icons/bs";

const MoviesList = ({
    user,
    favorites,
    addFavorite,
    deleteFavorite
}) => {// equals to = function(props)
    //The useState hook is used to set and access state that needs to persist across component updates, 
    //and to ensure that the componet does update when its state changes. 
    //Any values that this applies to should be set using the useState setter.
    //When a component has state need to be tracked of, apart from its parent
    
    //movies is the state variable, setMovies is the setter for the state
    //creating a state called movie, initialize with an empty array
    const [movies, setMovies] = useState([]);
    const [searchTitle, setSearchTitle] = useState("");
    const [searchRating, setSearchRating] = useState("") ;
    const [ratings, setRatings] = useState( ["All Ratings"]);
    const [currentPage, setCurrentPage] = useState(0);
    const [entriesPerPage, setEntriesPerPage] = useState(0);
    const [currentSearchMode, setCurrentSearchMode] = useState("") ;

    // useCallback to define functions which should
    // only be created once and will be dependencies for useEffect.
    // this fun calls the getRatings method of the MovieDataService to get a list of the possible ratings
    const retrieveRatings = useCallback(() => {
        MovieDataService.getRatings()
            .then (response => {
                setRatings ( ["All Ratings"].concat(response.data))
            })
            .catch(e => {
                console.log(e);
            });
    }, []);//empty array as the sec argument indicates this fucntion doesn't have any dependencies.

    //This function retrieves a list of movies from the MovieDataService. It does have a dependency, the state value currentPage which determines which set of 20 movies it will retrieve.
    const retrieveMovies = useCallback(() => {
        setCurrentSearchMode("");
        MovieDataService.getAll(currentPage)
            .then (response => {
                setMovies(response.data.movies);
                setCurrentPage(response.data.page);
                setEntriesPerPage(response.data.entries_per_page);
            })
            .catch(e => {
              console.log(e);
            });
    }, [currentPage]);


    //interdependencies. Both findByTitle and findByRating depend on find among other dependencies.
    const find = useCallback((query, by) => {
        MovieDataService.find (query, by, currentPage)
            .then(response => {
                setMovies(response.data.movies) ;
            })
            .catch(e => {
                console.log(e);
            });
    }, [currentPage]);

    const findByTitle = useCallback(() => {
        setCurrentSearchMode("findByTitle");
        find(searchTitle, "title");
    }, [find, searchTitle]);
    
    const findByRating = useCallback(() => {
        setCurrentSearchMode("findByRating");
        if(searchRating === "All Ratings"){
            retrieveMovies();
        } else{
            find(searchRating, "rated");
        }
    }, [find, searchRating, retrieveMovies]);

    //carries out the functionality necessary when a new page of movies is displayed
    const retrieveNextPage = useCallback(() => {
        if (currentSearchMode === "findByTitle"){
            findByTitle();
        } else if (currentSearchMode === "findByRating") {
            findByRating();
        } else {
            retrieveMovies();
        }
    }, [currentSearchMode, findByTitle, findByRating, retrieveMovies]);

    // Use effect to carry out side effect functionality
    // retrieve the ratings. happens only once because the depenency will never change.
    //Everything other than render should be put in the useEffect
    useEffect(() => {
        retrieveRatings();
    }, [retrieveRatings]);

    //Triggered by the dependency currentPage which will change when user navigates thru the site.
    //when search mode changes, set the current page to 0
    useEffect(() => {
        setCurrentPage(0);
    },[currentSearchMode]);//setter doesn't need to go in the dependency array

    // Retrieve the next page if currentPage value changes
    useEffect(() => {
        retrieveNextPage();
    }, [currentPage, retrieveNextPage]);

    // Other functions that are not depended on by useEffect
    // Both functions will be called directly by events in the UI.
    // When the value of the search fields title or rating changes, these functions will be called.
    const onChangeSearchTitle = e => {
        const searchTitle = e.target.value;
        setSearchTitle(searchTitle);
    }
    const onChangeSearchRating = e => {
        const searchRating = e.target.value;
        setSearchRating(searchRating);
    }
    //below function executes everytime when re-render is required
    return (
        <div className="App">
            <Container className="main-container">
                <Form>
                    <Row>
                        <Col>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Search by title"
                                value= {searchTitle}
                                onChange={onChangeSearchTitle}
                            />
                        </Form.Group>
                        <Button
                            variant="primary"
                            type="button"
                            onClick={findByTitle}
                        >
                            Search
                        </Button>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Control
                                //creates a drop-down selection, from option element in rating array
                                    as="select"
                                    onChange={onChangeSearchRating}
                                >
                                    {
                                        ratings.map((rating, i) =>{
                                            return (
                                                <option value={rating}
                                                key={i}>
                                                    {rating}
                                                </option>
                                            )
                                        })
                                    }
                                </Form.Control>
                            </Form.Group>
                            <Button
                                variant="primary"
                                type="button"
                                onClick={findByRating}
                            >
                                Search
                            </Button>
                        </Col>
                    </Row>
                </Form>
                <Row className="movieRow">
                    {movies.map((movie) => {/* for each movie in movies, return the below stuff. Takes each element and creates a new list*/
                        return(
                            <Col key={movie._id}>
                                <Card className="moviesListCard">
                                { user && ( //only displayed if logged in
                                    favorites.includes(movie._id) ?
                                    <BsStarFill className="star starFill" onClick={() => {
                                        deleteFavorite(movie._id);
                                        // console.log(`deleteFavorite: ${movie._id}`);
                                    }}/>
                                    :
                                    <BsStar className="star starEmpty" onClick={() => {
                                        addFavorite(movie._id);
                                        // console.log(`addFavorite: ${movie._id}`);
                                    }}/>
                                )}
                                <Card.Img
                                    className="smallPoster"
                                    src={movie.poster+"/100px180"}
                                    onError={({ currentTarget }) => {
                                        currentTarget.onerror = null;
                                        currentTarget.src ="/images/NoPosterAvailable.jpeg"
                                    }}
                                />
                                    <Card.Body>
                                        <Card.Title> {movie.title}</Card.Title>
                                        <Card.Text>
                                            Rating: {movie.rated}
                                        </Card.Text>
                                        <Card.Text>
                                            {movie.plot}
                                        </Card.Text>
                                        <Link to={"/movies/"+movie._id}>
                                            View Reviews
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
                <br />
                Showing page: {currentPage + 1}
                <Button
                    variant="link"
                    onClick={() => { setCurrentPage(currentPage+1)}}
                >
                    Get next {entriesPerPage} resulsts
                </Button>
            </Container>
        </div>
    )
}

export default MoviesList;