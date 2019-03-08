import { File } from '@ionic-native/file/ngx';
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Episode } from 'src/models/episode';
import { Movie } from 'src/models/movies';
import { Saison } from 'src/models/seasons';
import { Serie } from 'src/models/series';
import { RestApiService } from '../rest-api.service';
import { Storage } from '@ionic/storage';
import { FileChooser } from '@ionic-native/file-chooser/ngx';

@Component({
  selector: 'app-favoris',
  templateUrl: './favoris.page.html',
  styleUrls: ['./favoris.page.scss'],
})
export class FavorisPage implements OnInit {
  favorites = [];
  type: string;
  movie: Movie;
  serie: Serie;
  episode: Episode;
  saison: Saison;
  poster: string;

  constructor(public api: RestApiService, public router: Router, public alertController: AlertController, private storage: Storage, private fileChooser: FileChooser) { }

  ngOnInit() {
    this.storage.keys().then(keys => {
      keys.forEach(key => {
        console.log(key);
        this.storage.get(key).then((value) => {
          switch (value["Type"])
          {
            case "movie":
            {
              console.log('movie')
              this.movie = value;
              this.movie.PosterPoster = this.api.getPoster(this.movie.IMDbIndex);
              //this.favorites.push(this.movie);
              this.favorites.push(this.movie);
              break;
            }
            case "series":
            {
              console.log('series')
              this.serie = value;
              this.serie.PosterPoster = this.api.getPoster(this.serie.IMDbIndex);
              //this.favorites.push(this.serie);
              return this.serie;
            }
            case "episode":
            {
              console.log('episode')
              this.episode = value;
              if(this.episode.PosterPoster == undefined)
                this.episode.PosterPoster = this.episode.posterURL;
              //this.favorites.push(this.episode);
              return this.episode;
            }
            default:
            {
              console.log('defauklt')
              this.saison = value;
              //this.favorites.push(this.saison);
              return this.saison;
            }
          }
        });
      });
    });
  }

  getImgUrl(id: string) {
    switch(id){
      case "movie":
      {
        this.movie.PosterPoster = this.movie.PosterPoster?this.movie.posterURL:'../assets/No_image_available.svg';
        break;
      }
      case "series":
      {
        this.serie.PosterPoster = this.serie.PosterPoster?this.serie.posterURL:'../assets/No_image_available.svg';
        break;
      }
      case "episode":
      {
        this.episode.PosterPoster = this.episode.PosterPoster?this.episode.posterURL:'../assets/No_image_available.svg';
        break;
      }
      case "season":
      {
        this.saison.PosterPoster = '../assets/No_image_available.svg';
        break;
      }
    }
  }


  getFavorite(id: string): boolean {
    let favorite = false;
    this.storage.get(id).then(res => {
      if(res) {
        favorite = true;
      }
      else {
        favorite = false;
      }
    });
    return favorite;
  }

  setFavorite(isFav: boolean, id: string, target: any) {
    if(!isFav)
    {
      this.storage.set(id, target);
    }
    else
    {
      this.storage.remove(id);
    }
    this.storage.keys().then((res) => { console.log(res)});
  }

  onItemClick(id: string) {
    this.router.navigate(['/detail', { id }]);
  }


  async presentAlertRadio() {
    const alert = await this.alertController.create({
      header: "Format d'export",
      inputs: [
        {
          name: 'JSONRadio',
          type: 'radio',
          label: 'JSON',
          value: 'json',
          checked: true
        },
        {
          name: 'csvRadio',
          type: 'radio',
          label: 'CSV',
          value: 'csv'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data: string) => {
            if(data == 'csv')
            {
              this.writeCSVFile();
            }
            else
            {
              this.writeJSONFile();
            }
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }

  writeJSONFile() {
    let temp = this.storage.forEach(() => {}).then(res => temp = res);
    const data = 'data:text/json;charser=utf8,' + temp;
    const jsonFile = new File();
    jsonFile.createFile(jsonFile.externalRootDirectory, 'favorites.json', true);
    jsonFile.writeFile(jsonFile.externalRootDirectory, 'favorites.json', data);
    //const a = document.createElement('a');
    //a.href = data;
    //a.download = 'favorites.json';
    //document.getElementById('download').appendChild(a);
    //a.click();
 }

  writeCSVFile() {
    let csv = "";
      let array = new Array();
      for(let i = 0; i < this.storage.length.length; i++) {
        let res = JSON.parse(this.storage[i]);
        array.push(res);
      };
      csv = ConvertToCSV(array);
      console.log(csv);
      const data = 'data:text/csv;charser=utf8,' + csv;
      const a = document.createElement('a');
      a.href = data;
      a.download = 'favorites.csv';
      document.getElementById('download').appendChild(a);
      a.click();

    function ConvertToCSV(objArray) {
      var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
      var str = '';

      for (var i = 0; i < array.length; i++) {
          var line = '';
          for (var index in array[i]) {
              if (line != '') {
                line += array[i][index];
                line += ';';
              }
          }

          str += line + '\r\n';
      }

      return str;
    }
  }

  importFavorites(file: File) {
    this.fileChooser.open()
    .then(uri => file.readAsText(uri, 'favorites.json').then(res => {this.storage = JSON.parse(res);}))
    .catch(e => console.log(e));
  }

}
