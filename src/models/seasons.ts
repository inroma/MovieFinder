import { Episode } from './episode';

export class Saison {
    Title :string;
    Season :number;
    Type: string;
    totalSeasons :number;
    Episodes : Episode[] = new Array();
    PosterPoster: string;

    constructor (res) {
        if(res["Response"] == "True")
        {
            this.Title = res["Title"];
            this.Season = res["Season"];
            this.Type = "season";
            this.totalSeasons = res["totalSeasons"];
            res["Episodes"].forEach(episode => {
                this.Episodes.push(new Episode(episode));
            });
        }
    }
}