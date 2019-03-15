import { HttpClient } from '@angular/common/http';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { File } from '@ionic-native/file/ngx';
import { Component, OnInit } from '@angular/core';
import { Movie } from 'src/models/movies';
import { Serie } from 'src/models/series';
import { ActivatedRoute, Router } from '@angular/router';
import { RestApiService } from '../rest-api.service';
import { Platform } from '@ionic/angular';
import { Saison } from 'src/models/seasons';
import { Episode } from 'src/models/episode';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';

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
  no_image: string = '../assets/No_image_available.svg';
  permissions: AndroidPermissions = new AndroidPermissions();

  constructor(public platform: Platform,private activatedRoute: ActivatedRoute, public api: RestApiService, 
    public router: Router, public fileTransfer: FileTransfer){}

  ngOnInit()
  {
    this.activatedRoute.paramMap.subscribe(
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
      let paramSaison: string;
      let paramSeasonNumber: string;
      this.activatedRoute.paramMap.subscribe(
        (params) => {
          paramSaison = params.get('saison');
          paramSeasonNumber = params.get('seasonNumber');
        }
      );
      this.api.getDataFromTitle(paramSaison, paramSeasonNumber).subscribe((res) => {
        this.saison = new Saison(res);
        this.api.getDataFromName(paramSaison, 'series').subscribe((res) => {
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
    this.isFavorite = this.getFavorite(this.id);
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
        this.movie.PosterPoster = this.movie.posterURL?this.movie.posterURL:this.no_image;
        break;
      case "series":
        this.serie.PosterPoster = this.serie.posterURL?this.serie.posterURL:this.no_image;
        break;
      case "episode":
        this.episode.PosterPoster = this.episode.posterURL?this.episode.posterURL:this.no_image;
        break;
      case "season":
        this.saison.PosterPoster = this.no_image;
        break;
    }
  }

  getFavorite(id: string): boolean {
    let favorite = false;
    if(this.localstorage.getItem(id))
    {
      favorite = true;
    }
    return favorite;
  }

  setFavorite(isFav: boolean, item: JSON) {
    if(!isFav)
    {
      this.localstorage.setItem(item["IMDbIndex"], JSON.stringify(item));
      console.log(this.localstorage.getItem(item["IMDbIndex"]));
    }
    else
    {
      this.localstorage.removeItem(item["IMDbIndex"]);
    }
    this.isFavorite = this.getFavorite(item["IMDbIndex"]);
  }

  downloadPoster(item: JSON) {
    this.platform.ready().then((source) => {
      if(source == "dom" || source == "windows" || source == "core") {
        const a = document.createElement('a');
        a.href = item["PosterPoster"];
        a.download = 'Poster'+item["Title"]+'.jpg';
        document.getElementById('download').appendChild(a);
        a.click();
      }
      else if (source == "android" || source == "cordova"){
        const posterLocation = item["PosterPoster"];
        const posterImage = new File();
      
        this.permissions.checkPermission(this.permissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then((response) => {
            if (response.hasPermission === true) {
              const fileTransfer: FileTransferObject = this.fileTransfer.create();
              fileTransfer.download(posterLocation, posterImage.externalRootDirectory + '/Download/Poster_'+item["Title"]+'.jpg');
              }
        });
        }
      });
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
