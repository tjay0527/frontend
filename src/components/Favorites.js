import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import update from 'immutability-helper'
import { useCallback, useEffect, useReducer, useState } from 'react'
import { DnDCard } from './DnDCard.js'
import MovieDataService from '../services/movies';
import FavoriteDAOService from '../services/favorites'
const Favorites = ({user, favorites, setFavorites, saveFavorite, emptyFavorite}) =>{
    const [cards, setCards] = useState([]);
    const [newFavorite, setNewFavorite] = useState([]);
    const [saveFavToDB, setSaveFavToDB] = useState(false);
    const [firstLoad, setFirstLoad] = useState(favorites.length !== 0 ? true :false);
  
    const style = {
        width: '500px',
        margin: '1em',
    }
    

    // update firstLoad flag for dertermining if we need to load local movie cards
    useEffect(() => {
      if(!firstLoad ){
        setFirstLoad(window.localStorage.getItem('localFirstLoad'));
      }
    }, [])
    useEffect(() =>{
      window.localStorage.setItem('localFirstLoad', firstLoad);
    }, [firstLoad]);

    // save favortes for restoring after refreshing page
    useEffect(() => {
      const localCards = window.localStorage.getItem('localCards');
      if(localCards !== null && !firstLoad&& !emptyFavorite) {
        setCards(JSON.parse(localCards));
      }
    }, []);
    useEffect(() => {
      window.localStorage.setItem('localCards', JSON.stringify(cards));
    }, [cards]);

    // save favorites list when card dragged
    // useEffect(() => {
    //   const localFavs = window.localStorage.getItem('localFavorites');
    //   if(localFavs !== null && !firstLoad&& !emptyFavorite) {
    //     setFavorites(JSON.parse(localFavs));
    //   }
    // }, []);
    // useEffect(() => {
    //   setNewFavorite(favorites)
    //   window.localStorage.setItem('localFavorites', JSON.stringify(newFavorite));
    // }, [favorites]);

    
    //save the favorite order of each card in the DB
    useEffect(() => {
      if(saveFavToDB === true) {
          setFavorites([]);
          cards.map((card, i) => {
          setFavorites((favorites) => [...favorites, {
              rank: i,
              movieId: card.id
              }])
          })
          saveFavorite();
          setSaveFavToDB(false);//disable untill the next time cards are moved
      }
    }, [cards, setFavorites, saveFavorite])
    
    //defind moveCard method used in the DnDCard.js
    const moveCard = useCallback((dragIndex, hoverIndex) => {
      //move cards so we allow save favorite changes to DB
      // saveFavorite();
      setSaveFavToDB(true);
      setCards((prevCards) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex]],
          ],
        }),
      )
    }, [])

    //define renderCard method used in the DnDCard.js
    const renderCard = useCallback((card, index) => {
      return (
        <DnDCard
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          moveCard={moveCard}
          poster={card.poster}
        />
      )
    }, [moveCard])

    //show favorites list
    const retrieveMovies = useCallback(() => {
      // if(user && (!favorites || favorites.length === 0)){
      //     setFavorites(FavoriteDAOService.getFavorite(user.googleId));
      // }
      favorites.map(favorite => {
        MovieDataService.getMovieById(favorite.movieId).then(response => {
            setCards((cards) => ([...cards, {
                id: response.data._id,
                text: response.data.title,
                index: favorite.rank,
                poster: response.data.poster
            }]))
        }).then(
          console.log("before sort")
        ).then(
          cards.sort((f1, f2) => f1.index > f2.index ? 1 : -1)
        ).then(
          console.log("set and sort")
        )
        .catch(e => {
            console.log(e);
        });
      });
     
      setFirstLoad(false);
    }, []);
    //call retrieveMovies
    useEffect(() => {
      if (user){// only fetch favorites in db when user exists
        retrieveMovies();
      }
    },[user, retrieveMovies]);
    
    return (
        <div class="favoritesContainer container">
            <div class="favoritesPanel">
                Drag your favorites to rank them
            </div>
            <div style={ style }>
                <DndProvider backend={HTML5Backend}>
                    <div>
                      {cards.map((card, i) => renderCard(card, i)).sort((f1, f2) => f1.id - f2.id)}
                    </div>
                </DndProvider>
            </div>
        </div>
    )
}
export default Favorites;