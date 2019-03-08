export class Episode {

    Title :string;
    Year :number;
    Rated :string;
    Released :string;
    Season :number;
    Episode :number;
    Runtime: string;
    Genre : string;
    Director :string;
    Actors :string;
    Plot :string;
    Language :string;
    Country :string;
    Awards :string;
    posterURL :string;
    Ratings :Array<string>;
    Metascore :string;
    imdbRating :number;
    imdbVotes :number;
    IMDbIndex :string;
    seriesID :string;
    Type :string;
    PosterPoster: string;

    constructor(res) {
        this.Title = res["Title"];
        this.Year = res["Year"];
        this.Rated = res["Rated"];
        this.Released = res["Released"];
        this.Season = res["Season"];
        this.Episode = res["Episode"];
        this.Runtime = res["Runtime"];
        this.Genre = res["Genre"];
        this.Director = res["Director"];
        this.Actors = res["Actors"];
        this.Plot = res["Plot"];
        this.Language = res["Language"];
        this.Country = res["Country"];
        this.Awards = res["Awards"];
        this.posterURL = res["Poster"];
        this.Ratings = res["Ratings"];
        this.Metascore = res["Metascore"];
        this.imdbRating = res["imdbRating"];
        this.imdbVotes = res["imdbVotes"];
        this.IMDbIndex = res["imdbID"];
        this.seriesID = res["seriesID"];
        this.Type = res["Type"];
    }
}