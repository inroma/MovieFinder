import { File } from '@ionic-native/file/ngx';
import { Component, OnInit, PlatformRef } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
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

  constructor(public api: RestApiService, public router: Router, public alertController: AlertController, 
    private fileChooser: FileChooser, public platform: Platform) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.favorites = new Array();
    for(let i = 0; i < this.localstorage.length; i++) {
      const element = JSON.parse(this.localstorage.getItem(this.localstorage.key(i)));
      console.log(element);
      switch (element["Type"]) {
        case "movie":
          const movie = element;
          movie.PosterPoster = this.api.getPoster(movie.IMDbIndex);
          this.favorites.push(movie);
          break;
        case "series":
          const serie = element;
          serie.PosterPoster = this.api.getPoster(serie.IMDbIndex);
          this.favorites.push(serie);
          break;
        case "episode":
          const episode = element;
          episode.PosterPoster = this.api.getPoster(episode.IMDbIndex);
          this.favorites.push(episode);
          break;
        default:
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
    this.platform.ready().then((source) => { 
      let data = 'data:text/json;charser=utf8,';
      for(let i; i < this.localstorage.length; i++) {
        data += this.localstorage.getItem(this.localstorage.key(i));
      }
      if(source == "cordova" || source == "windows" || source == "core") {
        const a = document.createElement('a');
        a.href = data;
        a.download = 'favorites.json';
        document.getElementById('download').appendChild(a);
        a.click();
      }
      else {
        const jsonFile = new File();
        jsonFile.writeFile(jsonFile.externalRootDirectory, 'favorites.json', data, {replace: true});
      }
    });
  }

  writeCSVFile() {
    let csv = "";
    let array = new Array();
    for(let i; i < this.localstorage.length; i++) {
      array.push(this.localstorage.getItem(this.localstorage.key(i)));
    }
    csv = ConvertToCSV(array);
    const data = 'data:text/csv;charser=utf8,' + csv;
    this.platform.ready().then((source) => {      
      if(source == "cordova" || source == "windows" || source == "core") {
        const a = document.createElement('a');
        a.href = data;
        a.download = 'favorites.csv';
        document.getElementById('download').appendChild(a);
        a.click();
      }
      else {
        const csvFile = new File();
        csvFile.writeFile(csvFile.externalRootDirectory, 'favorites.csv', data, {replace: true});
      }
    });

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
      .then((uri) => {
        console.log(uri);
        if(uri.endsWith(".json")) {
          file.readAsDataURL(uri, 'favorites.json').then((res) => { this.localstorage = JSON.parse(res); });
        }
        else if(uri.endsWith(".csv")) {
          file.readAsDataURL(uri, 'favorites.csv').then((res) => { this.localstorage = JSON.parse(res) });
        }
      })
      .catch(e => console.log(e));
  }

  async deleteFavorites() {
    const alert = await this.alertController.create({
      header: "Suppression des favoris",
      message: "Voulez-vous vraiment supprimer les favoris ?",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Ok',
          handler: () => {
            localStorage.clear();
          }
        }
      ]
    });
    await alert.present();
  }

}
