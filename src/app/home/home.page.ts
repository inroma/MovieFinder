import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSearchbar, AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { RestApiService } from '../rest-api.service';
import { Movie } from "../../models/movies";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
	@ViewChild('mySearchbar') searchbar: IonSearchbar;
	hidden = false;
	movielist: Movie[] = new Array();
	constructor(public api: RestApiService, public loadingController: LoadingController, public router: Router,
		public alertController: AlertController) {}

	ngOnInit() {}

	async ionViewWillEnter() {
		this.movielist = new Array();
    let loadingEnded = false;
		const loading = await this.loadingController.create({
			message: 'Loading',
			duration: 5000
		});
		loading.present().then(() => {
			for (let i = 0; i < 30; i++) {
				this.api.getData()
				.subscribe(res => {
					if(res["Type"] == "movie")
					{
						if(this.movielist.length < 5) {
							let temp = new Movie(res)
							this.getImgUrl(temp);
							this.movielist.push(temp);
							loading.dismiss();
						}
					}
				});
			}
			loadingEnded = true;
		});
		if(this.movielist.length < 1 && loadingEnded){
			const alert = await this.alertController.create({
				header: "Aucune donnée",
				message: "Liste de films vide, merci de recharger la page ultérieurement.",
				buttons: [
					{
						text: 'Ok'
					}
				]
			});
			loading.dismiss();
			await alert.present();
		}
	}

	async onInput() {
		if(this.searchbar.value.length >= 3)
		{
			this.movielist = [];
			this.api.getDataFromName(this.searchbar.value, "movie")
				.subscribe(res => {
					if(res["Response"] == "True")
					{
						res["Search"].forEach(element => {
							console.log(element);
							if(element["Type"])
							{
								let movie = new Movie(element);
								movie.PosterPoster = this.api.getPoster(movie.IMDbIndex);
								this.movielist.push(movie);
							}
						});
						this.movielist.sort((a, b) => a.Year - b.Year);
					}
					else
					{
						console.log("Wrong response");
					}
				});
		}	
	}

	cardClick(id: string) {
		this.router.navigate(['/detail', { id }]);
	}

	async getData() {
	  const loading = await this.loadingController.create({
			message: 'Loading',
			duration: 5000
		});
		loading.present();
	  await loading.present();
	  this.api.getData()
	    .subscribe(res => {
				console.log(res);
				if(res["Type"] == "movie")
				{
					this.movielist.push(new Movie(res));
				}
	      loading.dismiss();
	    }, err => {
	      console.log(err);
				loading.dismiss();
	    });
	}

	getImgUrl(movie: Movie) {
		movie.PosterPoster = movie.posterURL ? movie.posterURL : '../assets/No_image_available.svg';
	}
}