import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';

const API_URL = "http://www.omdbapi.com/?apikey=75522b56";
const POSTER_API_URL = "http://img.omdbapi.com/?apikey=75522b56";

@Injectable({
  providedIn: 'root'
})
export class RestApiService {

  constructor(private http: HttpClient) { }

	private dbValue: Number;
	getData(): Observable<HttpResponse<any>> {
		do
			this.dbValue = Math.floor(1000000 + Math.random() * 9000000)
		while(this.dbValue > 2404827)
		return this.http.get<any>(API_URL + '&i=tt' + this.dbValue + "&plot=short");
	}

	getDataFromId(id: string): Observable<HttpResponse<any>> {
		return this.http.get<any>(API_URL + '&i=' + id + "&plot=full");
	}

	getSeasonsFromSerieId(id: string, seasonNumber :number): Observable<HttpResponse<any>> {
		return this.http.get<any>(API_URL + '&i=' + id + "&Season=" + seasonNumber);
	}

	getDataFromName(input: string, type: string): Observable<any> {
		return this.http.get(API_URL + '&s=' + input + "&type=" + type);
	}

	getDataFromTitle(title: string, seasonNumber: string) {
		return this.http.get<any>(API_URL + '&t=' + title + "&Season=" + seasonNumber);
	}

	getPoster(index: string): any {
		return POSTER_API_URL + '&i=' + index + "&h=9000";
	}
}
