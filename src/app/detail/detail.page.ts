import { Storage } from '@ionic/storage';
import { Component, OnInit } from '@angular/core';
import { Movie } from 'src/models/movies';
import { Serie } from 'src/models/series';
import { ActivatedRoute, Router } from '@angular/router';
import { RestApiService } from '../rest-api.service';
import { NavController } from '@ionic/angular';
import { Saison } from 'src/models/seasons';
import { Episode } from 'src/models/episode';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  localstorage = window.localStorage;
  id: string;
  title : string;
  type: string;
  movie: Movie;
  serie: Serie;
  saisonlist: Saison[] = new Array();
  episode: Episode;
  saison: Saison;
  showLevel1 = null;
  isFavorite: boolean = false;
  target: any;

  constructor(private thisRoute: ActivatedRoute, public api: RestApiService, public router: Router){}

  ngOnInit()
  {
    this.thisRoute.paramMap.subscribe(
      (params) => {
        this.id = params.get('id');
      }
    );
    if(this.id) {
      this.api.getDataFromId(this.id)
      .subscribe(res => {
        if(res["Response"] == "True")
        {
          switch(res["Type"])
          {
            case "movie":
            {
              this.movie = new Movie(res);
              this.movie.PosterPoster = this.api.getPoster(this.movie.IMDbIndex);
              this.title = this.movie.Title;
              this.target = this.movie;
              break;
            }
            case ("series"):
            {
              this.serie = new Serie(res);
              this.serie.PosterPoster = this.api.getPoster(this.serie.IMDbIndex);
              this.title = this.serie.Title;
              this.target = this.serie;
              for(let i = 1; i < this.serie.seasons+1; i++)
              {
                this.api.getSeasonsFromSerieId(this.serie.IMDbIndex, i).subscribe(saison => {
                  if(saison["Response"] == "True")
                  {
                    this.saisonlist.push(new Saison(saison));
                    this.saisonlist.sort((a, b) => a.Season - b.Season);
                  }
                });
              }
              break;
            }
            case ("episode"):
            {
              this.episode = new Episode(res);
              this.episode.PosterPoster = this.api.getPoster(this.episode.IMDbIndex);
              this.title = this.episode.Title;
              this.target = this.episode;
              this.api.getDataFromId(this.episode.seriesID).subscribe(serie => {
                if(serie["Response"] == "True")
                {
                  this.serie = new Serie(serie);
                  console.log("Série :", this.serie);
                }
              });
              this.api.getSeasonsFromSerieId(this.episode.seriesID, this.episode.Season).subscribe(saison => {
                if(saison["Response"] == "True")
                {
                  this.saisonlist.push(new Saison(saison));
                  console.log(this.saisonlist);
                }
              });
              break;
            }
          }
        }
        this.type = res["Type"];
        console.log(this.movie);
        console.log(this.serie);
        console.log(this.episode);
      });
    }
    else {
      this.api.getDataFromTitle(this.thisRoute.snapshot.paramMap.get('saison'), this.thisRoute.snapshot.paramMap.get('seasonNumber')).subscribe((res) => {
        this.saison = new Saison(res);
        this.api.getDataFromName(this.thisRoute.snapshot.paramMap.get('saison'), 'series').subscribe((res) => {
          this.saison.PosterPoster = this.api.getPoster(res["Search"][0]["imdbID"]);
        });
        this.title = this.saison.Title;
        this.target = this.saison;
        this.type = this.saison.Type;
        this.saison.Episodes.forEach(episode => {
          this.api.getDataFromId(episode.IMDbIndex).subscribe((res) => {
            episode.posterURL = res["Poster"];
            episode.seriesID = res["seriesID"];
          })
        })
        
        console.log(this.saison.Episodes[0])

      });
    }
    this.isFavorite = this.getFavorite();
  }

  onItemClick(id :string) {
    this.router.navigate(['/detail', { id }]);
  }

  onSeasonClick(serieTitle: string, seasonNumber: string) {
    this.router.navigate(['/detail', { saison: serieTitle,seasonNumber}]);
  }

  getImgUrl(type: string) {
    switch(type){
      case "movie":
        this.movie.PosterPoster = this.movie.posterURL?this.movie.posterURL:'../assets/No_image_available.svg';
        break;
      case "series":
        this.serie.PosterPoster = this.serie.posterURL?this.serie.posterURL:'../assets/No_image_available.svg';
        break;
      case "episode":
        this.episode.PosterPoster = this.episode.posterURL?this.episode.posterURL:'../assets/No_image_available.svg';
        break;
    }
  }

  getFavorite(): boolean {
    let favorite = false;
    if(this.localstorage.getItem(this.id))
    {
      favorite = true;
    }
    return favorite;
  }

  setFavorite(isFav: boolean) {
    if(!isFav)
    {
      this.localstorage.setItem(this.id, JSON.stringify(this.target));
      console.log(this.localstorage.getItem(this.id));
    }
    else
    {
      this.localstorage.removeItem(this.id);
    }
    this.isFavorite = this.getFavorite();
  }

  toggleLevel1(idx) {
    if (this.isLevel1Shown(idx)) {
      this.showLevel1 = null;
    } else {
      this.showLevel1 = idx;
    }
  };
  isLevel1Shown(idx) {
    return this.showLevel1 === idx;
  };

}
