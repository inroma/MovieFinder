export class Serie
{
	Title: string;
	Year: number;	//Rated
	releaseDate: Date;	//Released
	ageRating: number;	//Rated
	posterURL: string;
	Runtime: string;
	description: string; //Plot
	genre: string;
	director: string;	//Producteur
	actors: string;
	awards: string;
	IMDbRating: number;
	IMDbVotes: number;
	website: string;
	seasons: number;
	IMDbIndex: string;
	seriesID: string;
	PosterPoster: string;
	Type: string;

	constructor(res)
	{
		if(res["Season"] != "N/A")
		{	
			this.Title = res["Title"];
			this.Year = res["Year"];
			this.releaseDate = res["Released"];
			this.ageRating = res["Rated"];
			if(res["Poster"] != "N/A")
				this.posterURL = res["Poster"];
			if(res["Plot"] != "N/A")
				this.description = res["Plot"];
			this.genre = res["Genre"];
			if(res["Director"] != "N/A")
				this.director = res["Director"];
			this.actors = res["Actors"];
			this.awards = res["Awards"];
			this.IMDbRating = res["imdbRating"];
			this.IMDbVotes = res["imdbVotes"];
			this.website = res["Website"];
			this.Runtime = res["Runtime"];
			this.seasons = res["totalSeasons"];
			this.IMDbIndex = res["imdbID"];
			this.Type = res["Type"];
		}
	}
}