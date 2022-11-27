import axios from "axios";

class FavoriteDAOService{
    // favorite
    getFavorite(id){
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/movies/favorites/${id}`);
    }

    updateFavorite(data){
        return axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/v1/movies/favorites`, data);
    }
}
export default new FavoriteDAOService();