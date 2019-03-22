import { File } from '@ionic-native/file/ngx';
import { Component, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { RestApiService } from '../rest-api.service';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import 'csvtojson';
import 'json2csv';

declare var cordova:any;

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
  no_image: string = '../assets/No_image_available.svg';
  choosenFile: string;
  private permissions: AndroidPermissions = new AndroidPermissions();

  constructor(public api: RestApiService, public router: Router, public alertController: AlertController, 
    private fileChooser: FileChooser, public platform: Platform, public transfer: FileTransfer, public filepath: FilePath,
    private socialSharing: SocialSharing) { }

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
      let temp = [];
      for(let i = 0; i < this.localstorage.length; i++) {
        let value = this.localstorage.getItem(this.localstorage.key(i));
        if(value != "")
          temp.push(value);
      }
      data += "[" + temp + "]";
      if(source == "dom" || source == "windows" || source == "core") {
        const a = document.createElement('a');
        a.href = data;
        a.download = 'favorites.json';
        document.getElementById('download').appendChild(a);
        a.click();
      }
      else if (source == "android" || source == "cordova"){
        const jsonFile = new File();
        this.permissions.checkPermission(this.permissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then((response) => {
              if (response.hasPermission === true) {
                const fileTransfer: FileTransferObject = this.transfer.create();
                fileTransfer.download(data, jsonFile.externalRootDirectory + '/Download/favorites.json');
        }
      });
      }
    });
  }

  writeCSVFile() {
    let array = new Array();
    for(let i = 0; i < this.localstorage.length; i++) {
      array.push(JSON.parse(this.localstorage.getItem(this.localstorage.key(i))));
    }

    const csv = require("json2csv").parse(array);
    const data = 'data:text/csv;charser=utf8,' + csv;

    this.platform.ready().then((source) => {
      if(source == "dom" || source == "windows" || source == "core") {
        const a = document.createElement('a');
        a.href = data;
        a.download = 'favorites.csv';
        document.getElementById('download').appendChild(a);
        a.click();
      }
      else if (source == "android" || source == "cordova"){
        const csvFile = new File();
        this.permissions.checkPermission(this.permissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then((response) => {
              if (response.hasPermission === true) {
                const fileTransfer: FileTransferObject = this.transfer.create();
                fileTransfer.download(data, csvFile.externalRootDirectory + '/Download/favorites.csv');
                }
          });
        }
      });
    }

  async importFavorites() {
    let csvtojsonV2=require("csvtojson");
    const file = new File();

    await this.platform.ready().then((source) => {      
      if (source == "android" || source == "cordova"){
        this.fileChooser.open()
        .then((uri) => {
            this.filepath.resolveNativePath(uri).then((path)=>{
              let temp = path.split("/");
              let filename = temp.pop();
              path = temp.join("/");

              this.localstorage.clear();

              if(filename.endsWith(".json")) {
                file.readAsText(path, filename).then((content: string) => {
                  let data = JSON.parse(content);
                  data.forEach(element => {
                    this.localstorage.setItem(element["IMDbIndex"], JSON.stringify(element));
                  });
                }).catch(err=>console.log(err));
              }
              else if(filename.endsWith(".csv")) {
                file.readAsText(path, filename).then((res) => { 
                  csvtojsonV2().fromString(res).then((jsonObj) => {
                    jsonObj.forEach(element => {
                      this.localstorage.setItem(element["IMDbIndex"], JSON.stringify(element));
                    });
                });
              });
              }
              this.ionViewWillEnter();
            });
          });
      }
      else {
        const input = document.getElementById('myInput');
        input.click();
        input.addEventListener("input", (() => {
          console.log(this.choosenFile);
          this.filepath.resolveNativePath(this.choosenFile).then((path)=>{
            let temp = path.split("/");
            let filename = temp.pop();
            path = temp.join("/");
            if(filename.endsWith(".json")) {
              file.readAsText(path, filename).then((content: string) => {
                let data = JSON.parse(content);
                data.forEach(element => {
                  this.localstorage.setItem(element["IMDbIndex"], JSON.stringify(element));
                });
              }).catch(err=>console.log(err));
            }
            else if(filename.endsWith(".csv")) {
              file.readAsText(path, filename).then((res) => { 
                csvtojsonV2().fromString(res).then((jsonObj) => {
                  jsonObj.forEach(element => {
                    this.localstorage.setItem(element["IMDbIndex"], JSON.stringify(element));
                  });
              });
            });
            }
            this.ionViewWillEnter();
          });
        }));
      }
    }).catch(e => console.log(e));
  }

  downloadPoster(item: JSON) {
    this.platform.ready().then((source) => {
      if(source == "dom" || source == "windows" || source == "core") {
        window.open(item["PosterPoster"]);
      }
      else if (source == "android" || source == "cordova"){
        const posterLocation = item["PosterPoster"];
        const posterImage = new File();
      
        this.permissions.checkPermission(this.permissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then((response) => {
            if (response.hasPermission === true) {
              const fileTransfer: FileTransferObject = this.transfer.create();
              fileTransfer.download(posterLocation, posterImage.externalRootDirectory + '/Download/Poster_'+item["Title"]+'.jpg');
              }
        });
        }
      });
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
            this.ionViewWillEnter();
          }
        }
      ]
    });
    await alert.present();
  }

  shareList() {
    let data = 'data:text/json;charset=utf8,';
    let temp = [];
    let file = new File();
    for(let i = 0; i < this.localstorage.length; i++) {
      let value = this.localstorage.getItem(this.localstorage.key(i));
      if(value != "")
        temp.push(value);
    }
    data += "[" + temp + "]";
    this.permissions.requestPermissions([this.permissions.PERMISSION.WRITE_EXTERNAL_STORAGE, this.permissions.PERMISSION.READ_EXTERNAL_STORAGE]).then((response) => {
      if (response.hasPermission === true) {
        const fileTransfer: FileTransferObject = this.transfer.create();
        fileTransfer.download(data, file.externalCacheDirectory  + 'favorites.json').then((favoriteFile) => {
          console.log(favoriteFile.nativeURL)
          this.socialSharing.shareWithOptions({
            message:'Check my favorites movies and series !',
            subject:"Movie Finder",
            files: favoriteFile.nativeURL,
          }).finally(() => { file.removeFile(file.externalCacheDirectory , 'favorites.json') });
        });
        }
      });
  }
}
