import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSearchbar } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { RestApiService } from '../rest-api.service';
import { Movie } from "../../models/movies";
import { Serie } from "../../models/series";
import { DetailPage } from '../detail/detail.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
	@ViewChild('mySearchbar') searchbar: IonSearchbar;

	movielist: Movie[] = new Array();
	constructor(public api: RestApiService, public loadingController: LoadingController, public router: Router) {}

	ngOnInit() {}

	async ionViewWillEnter() {
		const loading = await this.loadingController.create({
			message: 'Loading',
			duration: 15
		});
		loading.present();
		for (let i = 0; i < 30; i++)
		{
			this.api.getData()
			.subscribe(res => {
				if(res["Type"] == "movie")
				{
					if(this.movielist.length < 5) {
						console.log(res);
						this.movielist.push(new Movie(res));
						loading.dismiss();
					}
				}
			});
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
			duration: 15
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