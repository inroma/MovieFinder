import { File } from '@ionic-native/file/ngx';
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Episode } from 'src/models/episode';
import { Movie } from 'src/models/movies';
import { Saison } from 'src/models/seasons';
import { Serie } from 'src/models/series';
import { RestApiService } from '../rest-api.service';
import { FileChooser } from '@ionic-native/file-chooser/ngx';

@Component({
  selector: 'app-favoris',
  templateUrl: './favoris.page.html',
  styleUrls: ['./favoris.page.scss'],
})
export class FavorisPage implements OnInit {
  localstorage = window.localStorage;
  favorites = [];
  type: string;
  poster: string;

  constructor(public api: RestApiService, public router: Router, public alertController: AlertController, private fileChooser: FileChooser) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.favorites = new Array();
    for(let i = 0; i < this.localstorage.length; i++) {
      const element = JSON.parse(this.localstorage.getItem(this.localstorage.key(i)));
      console.log(element);
      switch (element["Type"]) {
        case "movie":
            console.log('movie')
            const movie = element;
            movie.PosterPoster = this.api.getPoster(movie.IMDbIndex);
            this.favorites.push(movie);
            break;
        case "series":
            console.log('series')
            const serie = element;
            serie.PosterPoster = this.api.getPoster(serie.IMDbIndex);
            this.favorites.push(serie);
            break;
        case "episode":
            console.log('episode')
            const episode = element;
            episode.PosterPoster = this.api.getPoster(episode.IMDbIndex);
            this.favorites.push(episode);
            break;
        default:
            console.log('default')
            const saison = element;
            this.favorites.push(saison);
            break;
        }
      }
  }

  getImgUrl(element) {
    let no_image: string = "../assets/No_image_available.svg"
    switch (element["Type"]) {
      case "season":
        element.PosterPoster = no_image;
        break;
      default:
        console.log(element.PosterPoster);
        console.log(element.posterURL);
        element.PosterPoster = element.posterURL ? element.posterURL : no_image;
        break;
    }
  }


  getFavorite(item: JSON): boolean {
    let favorite = true;
    if (this.localstorage.getItem(item["IMDbIndex"])) {
        favorite = true;
      }
      else
      {
        favorite = false;
      }
    return favorite;
  }

  setFavorite(isFav: boolean, target: JSON) {
    if (!isFav) {
      this.localstorage.setItem(target["IMDbIndex"], JSON.stringify(target));
    }
    else {
      this.localstorage.removeItem(target["IMDbIndex"]);
    }
    console.log(JSON.parse(this.localstorage.getItem(target["IMDbIndex"])));
  }

  onItemClick(item : JSON) {
    console.log(item);
    const id = item["IMDbIndex"];
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
            if (data == 'csv') {
              this.writeCSVFile();
            }
            else {
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
    let data = 'data:text/json;charser=utf8,';
    for(let i = 0; this.localstorage.length; i++) {
      const element = this.localstorage.getItem(this.localstorage.key(i));
      data += element;
    }
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
    for (let i = 0; i < this.localstorage.length; i++) {
      const element = this.localstorage.getItem(this.localstorage.key(i));
      array.push(JSON.parse(element));
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
      .then(uri => file.readAsText(uri, 'favorites.json').then(res => { this.localstorage = JSON.parse(res); }))
      .catch(e => console.log(e));
  }

}
