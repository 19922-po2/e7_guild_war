import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('e7_gw');

  data: any;
  units = ["Abigail", "Apocalypse Ravi", "Boss Arunka", "School Nurse Yulha", "Frieren", "Genesis Ras", "Elvira", "Twisted Eidolon Kayron", "Shooting Star Achates"];
  selectedUnit1: string = "";
  selectedUnit2: string = "";
  selectedUnit3: string = "";
  solution: any = null;

  constructor(private dataService: DataService, private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    console.log("Print:");
    this.dataService.loadData().subscribe(jsonData => {
      this.data = jsonData;
    });
  }

  clear() {
    this.selectedUnit1 = "";
    this.selectedUnit2 = "";
    this.selectedUnit3 = "";
    this.solution = null;
  }

  search() {
    this.solution = this.searchSolution();
    console.log("search:", this.solution);
  }

  searchSolution() {
    const searchTargets = [this.selectedUnit1, this.selectedUnit2, this.selectedUnit3].map(t => t.toLowerCase());

    const uniqueTargets = new Set(searchTargets);
    if (uniqueTargets.size !== 3) { return "none"; }

    return this.data.find((entry: { target: any[]; }) => {
      if (!Array.isArray(entry.target)) return false;

      const entryTargets = entry.target.map(t => t.toLowerCase());

      //return searchTargets.every(t => entryTargets.includes(t));
      return [...uniqueTargets].every(t => entryTargets.includes(t));
    }) || "none";
  }

  onSelectedUnit1Change(unit1: string) {
    this.selectedUnit1 = unit1;
  }
  onSelectedUnit2Change(unit2: string) {
    this.selectedUnit2 = unit2;
  }
  onSelectedUnit3Change(unit3: string) {
    this.selectedUnit3 = unit3;
  }
  getUnitImageUrl(name: string) {
    return `https://epic7db.com/images/heroes/${name.toLowerCase()}.webp`
  }
  getArtiImageUrl(name: string) {
    return `https://epic7db.com/images/artifacts/${name.toLowerCase()}.webp`
  }
  getSanitizedVideo(url: string) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
