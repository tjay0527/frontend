// import logo from './logo.svg';
import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Login from "./components/Login";
import Logout from "./components/Logout";
import MoviesList from "./components/MoviesList";
import Movie from "./components/Movie";
import Favorites from './components/Favorites';
import AddReview from './components/AddReview';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import FavoriteDAOService from './services/favorites';
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [allowFavoritesDBWrite, setAllowFavoritesDBWrite] = useState(false);
  // [] bracket array destructuring, {} bracket obj destructuring
  const [user, setUser] = useState(null);
  //both MoviesList and favorites page need the favorites so declare in the App.js
  const [favorites, setFavorites] = useState([]);
  const [favoritesTmp, setFavoritesTmp] = useState([]);
  const [emptyFavorite, setEmptyFavorite] = useState(false);//if true means favorite list is deleted to 0

  const addFavorite = (movieId) => {
    setFavorites((favorites) => [...favorites, {
      movieId: movieId,
      rank: favorites.length === 0 ? 0 : favorites[favorites.length - 1].rank + 1
    }]);//append new new id to the current array
    setFavoritesTmp([...favoritesTmp, movieId]);
    setAllowFavoritesDBWrite(true);
    setEmptyFavorite(favorites.length !== 0 ? true :false);
  }

  const deleteFavorite = (movieId) => {
    setFavorites(favorites.filter(f => f.movieId !== movieId)) ;
    setFavoritesTmp(favoritesTmp.filter(f => f !== movieId));
    setAllowFavoritesDBWrite(true);
    setEmptyFavorite(favorites.length !== 0 ? true :false);
  }
  
  /*
    This is for session management. It will check the browser's localStorage to determine whether the JWT from Google APIs has been stored there, and it will check the JWT's expiration date. If the JWT exists and is not yet expired, then it will set the user according to the data in that JWT (so, the currently logged-in user). If the JWT is expired then it will replace the JWT in localStorage with a null value.
  */
  useEffect(() => {
    let loginData = JSON.parse(localStorage.getItem("login"));
    if (loginData) {
      let loginExp = loginData.exp;
      let now = Date.now()/1000;
      if (now < loginExp) {
        // Not expired
        setUser(loginData);
      } else {
        // Expired
        localStorage.setItem("login", null);
      }
    }
  }, []);// empty list dependency means no objects update will trigger this. only run once


  // update favorite
  const saveFavorite = useCallback(() => {
    var data = {
      _id:user.googleId,
      favorites:favorites
    }
    favorites.map(function(f){
      console.log(`data for dao: id:${f.movieId}, rank:${f.rank}`);
    })
    FavoriteDAOService.updateFavorite(data);
  }, [favorites, user]);

  useEffect(() => {
    // only update favorite if the allowFavoritesDBWrite is true
    if (user && allowFavoritesDBWrite){
      saveFavorite();
      //set flag to false in case refreshing will clear db
      setAllowFavoritesDBWrite(false);
    }
  },[favorites, saveFavorite]);

  //fetch favorites according to user Id and set to Favofites
  const fetchFavorite = useCallback(() => {
    FavoriteDAOService.getFavorite(user.googleId)
      .then (response => {
          setFavorites(response.data.favorites);
          response.data.favorites.map(favorites => {
            setFavoritesTmp((favoritesTmp) => [...favoritesTmp, favorites.movieId]);
          })
      })
      .catch(e => {
        console.log(e);
      });
  }, [user]);

  useEffect(() => {
    if (user){// only fetch favorites in db when user exists
      fetchFavorite();
    }
  },[user, fetchFavorite]);

  return (// a react conponent's return value must be a single DOM element
    //JSX 
    <GoogleOAuthProvider clientId={clientId}>
    <div className="App">
      <Navbar bg="primary" expand="lg" sticky="top" variant="dark">
        <Container className="container-fluid">
        <Navbar.Brand className="brand" href="/">
        <img src="/images/movies-logo.png" alt="movies logo" className="moviesLogo"/>
         MOVIE TIME
         </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link as={Link} to={"/movies"}>
              Movies
            </Nav.Link>
            {
              user ? 
              <Nav.Link as={Link} to={"/favorites"}>
                Favorites
              </Nav.Link>
              :
              null
            }
            
          </Nav>
        </Navbar.Collapse>
        {/* { console.log(`user in app.js: ${user}`)} */}
        { user ? (
                <Logout setUser={setUser} />
              ) : (
                <Login setUser={setUser} />
              )}
        </Container>
      </Navbar>
    
    <Routes>
      <Route exact path={"/"} element={//first and second point to the same element
        <MoviesList //put the movielist component here
          user={ user }// params get passed in in the MovieList component
          addFavorite={ addFavorite }
          deleteFavorite={ deleteFavorite }
          favorites={ favoritesTmp }
        />}
        />
      <Route exact path={"/movies"} element={
        <MoviesList
          user={ user }
          addFavorite={ addFavorite }
          deleteFavorite={ deleteFavorite }
          favorites={ favoritesTmp }
        />}
        />
      <Route path={"/movies/:id/"} element={
        <Movie user={ user }/>}
        />
      <Route path={"/movies/:id/review"} element={//page for editing review
        <AddReview user={ user } /> }
        />
      <Route exact path={'/favorites'} element={
          <Favorites 
            user={ user }
            favorites={ favorites.sort((f1, f2) => f1.rank > f2.rank ? 1 : -1) }
            setFavorites={ setFavorites }
            saveFavorite={ saveFavorite }
            emptyFavorite={ emptyFavorite}
          />
        }/>
    </Routes>
    </div>
    </GoogleOAuthProvider>
  );
}


export default App;
