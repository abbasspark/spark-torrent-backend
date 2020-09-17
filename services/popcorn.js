const axios = require("axios").default;
const { CustomError } = require("../helpers/errors");

/**
 * @typedef {Object} SearchOptions
 */

/**
 * @typedef {Object} TorrentFile
 */

class POPService {
  /**
   * search movies
   * @param {Object} options - search options
   * https://api.apipop.net/list?sort=seeds&short=1&cb=&quality=720p,1080p,3d&page=1&ver=100.0.0.0.&os=windows&app_id=T4P_ONL
   */
  async search(options) {
    options = Object.assign(
      {
        quality: "720p,1080p,3d",
        page: 1,
        genre: "",
        app_id: "T4P_ONL",
        os: "windows",
        sort: "seeds",
        short: "1",
        ver: "100.0.0.0."
      },
      options
    );

    if (options.query) options.query_term = options.query;
    return this.getMovies(options);
  }

  /**
   * search movies
   * @param {Object} options - search options
   * https://api.apipop.net/shows?cb=0.7984470857026715&sort=seeds&page=1&ver=100.0.0.0.&os=windows&app_id=T4P_ONL
   */
  async searchTVShows(options) {
    options = Object.assign(
      {
        cb: Math.random(),
        sort: "seeds",
        page: 1,
        ver: "100.0.0.0.",
        os: "windows",
        app_id: "T4P_ONL",
        genre: ""
      },
      options
    );

    if (options.query) options.query_term = options.query;
    return this.getMovies(options);
  }

  /**
   * get a list of movies
   * @param {SearchOptions|String} [params]
   * @param {number} [page=1]
   * @return {Promise}
   */
  async getMovies(params, page = 1) {
    if (params && typeof params === "string")
      params = { query_term: params, page };

    const { data } = await axios.get("https://api.apipop.net/list", {
      params
    });

    if (!data)
      throw new CustomError(500, "service error");
       
    return data;
  }

  /**
   * get a list of TVShows
   * @param {SearchOptions|String} [params]
   * @param {number} [page=1]
   * @return {Promise}
   */
  async getTVShows(params, page = 1) {
    if (params && typeof params === "string")
      params = { query_term: params, page };

    const { data } = await axios.get("https://api.apipop.net/shows", {
      params
    });

    if (!data)
      throw new CustomError(500, "service error");
       
    return data;
  }


  /**
   * get a movie by its id
   * @param {string} id - movie imdbid
   * @param {boolean} [details=false] return extra details
   * @return {Promise}
   * https://api.apipop.net/movie?cb=&quality=720p,1080p,3d&page=1&imdb=tt4566758&ver=100.0.0.0.&os=windows&app_id=T4P_ONL
   */
  async getMovie(id) {
   const params = 
        {
          cb:"",
          quality: "720p,1080p,3d",
          page: 1,
          imdb:id,
          ver: "100.0.0.0.",
          os: "windows",
          app_id: "T4P_ONL",
        } ;
  
       const { data } = await axios("https://api.apipop.net/movie", {
        params
      });

      if (!data)
        throw new CustomError(500, "service error");

      return data;
   
  }

  /**
   * get a TVShow by its id
   * @param {string} id - TVShow imdbid
   * @param {boolean} [details=false] return extra details
   * @return {Promise}
   * https://api.apipop.net/show?imdb=tt6470478&ver=100.0.0.0.&os=windows&app_id=T4P_ONL
   */
  async getTVShow(id) {
    const params = 
         {
           imdb:id,
           ver: "100.0.0.0.",
           os: "windows",
           app_id: "T4P_ONL",
         } ;
   
        const { data } = await axios("https://api.apipop.net/show", {
         params
       });
 
       if (!data)
         throw new CustomError(500, "service error");
 
       return data;
    
   }
 

  /**
   * get movie suggestions by its id
   * @param {string} id - movie imdbid
   * @return {Promise<Array>}
   */
  async getMovieSuggestions(id) {
    const movie = await this.getMovie(id);
    const { data } = await axios.get(
      "https://yts.lt/api/v2/movie_suggestions.json",
      {
        params: { movie_id: movie.id }
      }
    );

    if (data.status !== "ok")
      throw new CustomError(500, data.status_message || "yts service error");

    return data.data.movies;
  }

  /**
   * get movie torrents by its imdbid
   * @param {string} id - movie imdbid
   */
  async getMovieTorrents(id) {
    const movie = await this.getMovie(id);
    return movie;
  }

  /**
   * get TVShow torrents by its imdbid
   * @param {string} id - movie imdbid
   */
  async getTVShowTorrents(id) {
    const TVShow = await this.getTVShow(id);
    return TVShow;
  }

  /**
   * select movie torrent file
   * @param {string} id - movie imdbid
   * @param {string} quality - movie quality [720p, 1080p, 2160p, 3D]
   * @param {string} language  - movie language [en, br]
   * @return {TorrentFile} torrent file
   */
  async selectMovieTorrent(id, quality, language) {
    const torrents = await this.getMovieTorrents(id);
    const throwError = () => {
      throw new CustomError(404, "torrent file not found");
    };

    if (torrents.data.length === 0) throwError();

    let data = [];

    // select type
    if (!language) {
      data = torrents.data.items_lang.filter(t => t.language === language);
    } else data = torrents.data.items;

    if (data.length === 0) throwError();

    // select quality
    if (!quality) {
      const qualities = ["3D", "2160p", "1080p", "720p"];
      for (const q of qualities) {
        const exists = data.some(t => t.quality === q);
        if (exists) {
          data = data.filter(t => t.quality === q);
          break;
        }
      }
    } else data = data.filter(t => t.quality === quality);

    // if selected torrent has no data
    if (data.length === 0) throwError();

    // return the first torrent in the list should be the only remaining one
    return data[0];
  }

    /**
   * select TVShow torrent file
   * @param {string} id - TVShow imdbid
   * @param {string} quality - TVShow quality [720p, 1080p, 2160p, 3D]
   * @param {string} language  - TVShow language [en, br]
   * @return {TorrentFile} torrent file
   */
  async selectTVShowTorrent(id, quality, language) {
    const torrents = await this.getTVShowTorrents(id);
    const throwError = () => {
      throw new CustomError(404, "torrent file not found");
    };

    if (torrents.length === 0) throwError();

    let data = [];

    // select type
    if (!language) {
      data = torrents.items_lang.filter(t => t.language === language);
    } else data = torrents.items;

    if (data.length === 0) throwError();

    // select quality
    if (!quality) {
      const qualities = ["3D", "2160p", "1080p", "720p"];
      for (const q of qualities) {
        const exists = data.some(t => t.quality === q);
        if (exists) {
          data = data.filter(t => t.quality === q);
          break;
        }
      }
    } else data = data.filter(t => t.quality === quality);

    // if selected torrent has no data
    if (data.length === 0) throwError();

    // return the first torrent in the list should be the only remaining one
    return data[0];
  }
}

module.exports = new POPService();
