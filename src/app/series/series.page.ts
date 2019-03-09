import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';
import { RestApiService } from '../rest-api.service';
import { Movie } from "../../models/movies";
import { Serie } from "../../models/series";
import { Router } from '@angular/router';

@Component({
  selector: 'app-series',
  templateUrl: './series.page.html',
  styleUrls: ['./series.page.scss'],
})
export class SeriesPage implements OnInit {
	@ViewChild('mySearchbar') searchbar: IonSearchbar;
	serielist: Serie[] = new Array();
  constructor(public api: RestApiService, public router: Router) { }

  ngOnInit() {
    for (let i = 0; i < 30; i++)
	{
		this.api.getData()
		.subscribe(res => {
			if(res["Type"] == "series")
			{
				if(this.serielist.length < 5) {
					console.log(res);
					this.serielist.push(new Serie(res));
				}
			}
		});
	}
  }

  async onInput() {
		if(this.searchbar.value.length >= 3)
		{
			this.serielist = [];
			this.api.getDataFromName(this.searchbar.value, "series")
				.subscribe(res => {
					if(res["Response"] == "True")
					{
						res["Search"].forEach(element => {
							console.log(element);
							if(element["Type"] == "series")
							{
								let serie = new Serie(element);
								serie.PosterPoster = this.api.getPoster(serie.IMDbIndex);
								this.serielist.push(serie);
							}
						});
						this.serielist.sort((a, b) => a.Year - b.Year);
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

	getImgUrl(serie: Serie) {
		serie.PosterPoster = serie.posterURL ? serie.posterURL : '../assets/No_image_available.svg';
	}

}
