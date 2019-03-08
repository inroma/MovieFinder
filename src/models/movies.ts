export class Movie
{
	public Title: string;
	public Year: number;	//Rated
	public releaseDate: Date;	//Released
	public ageRating: number;	//Rated
	public posterURL: string;
	public description: string; //Plot
	public genre: string;
	public Runtime: string;
	public director: string;	//Producteur
	public actors: string;
	public nominations: string;
	public IMDbRating: number;
	public IMDbVotes: number;
	public website: string;
	public IMDbIndex: string;
    public PosterPoster: string;
	public Type: string;

	constructor(res: any)
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
		this.Runtime = res["Runtime"];
		this.director = res["Director"];
		this.actors = res["Actors"];
		this.nominations = res["Awards"];
		this.IMDbRating = res["imdbRating"];
		this.IMDbVotes = res["imdbVotes"];
		this.website = res["Website"];
		this.IMDbIndex = res["imdbID"];
		this.Type = res["Type"];
	}
}