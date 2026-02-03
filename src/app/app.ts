import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, HttpClientModule, FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    AsyncPipe,],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('e7_gw');
  // -build for github pages-
  // ng b --output-path docs --base-href /e7_guild_war/
  // -copy files from browser to docs folder-
  // copy docs\browser\*.* docs\

  data: any;
  units = [];
  selectedUnit1: string = "";
  selectedUnit2: string = "";
  selectedUnit3: string = "";
  solution: any = null;
  isLoading = signal(false);
  id = "1aAIq86-QbH_3wBFETPTfyEgoX3XqGLIm_ENvAdvM8ks"
  guid = "290342333";
  parsedData: any[] = [];
  nameMappingIds = "1tvpvLpc-x54JaEu7XY0QdGVLQ7zFBfFgLlgFtpYw1GQ";
  nameMappingGuid = "0";
  unitNameMap: Map<string, string> = new Map();
  artiNameMap: Map<string, string> = new Map();

  myControl1 = new FormControl('');
  myControl2 = new FormControl('');
  myControl3 = new FormControl('');
  filteredOptions1: Observable<string[]>;
  filteredOptions2: Observable<string[]>;
  filteredOptions3: Observable<string[]>;

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.units.filter((option: any) => option.toLowerCase().includes(filterValue));
  }

  constructor(private _sanitizer: DomSanitizer, private http: HttpClient) {
    this.filteredOptions1 = this.myControl1.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.filteredOptions2 = this.myControl2.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.filteredOptions3 = this.myControl3.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  ngOnInit() {
    this.isLoading.set(true);
    this.http.get(`https://docs.google.com/spreadsheets/d/${this.id}/export?format=csv&gid=${this.guid}`, { responseType: 'text' })
      .subscribe(data => {
        this.parsedData = this.parseCSV(data);
        this.data = this.parseComps(this.parsedData);
        this.units = Array.from(new Set(this.data.flatMap((d: any) => d.targets)));
        setTimeout(() => {
          this.isLoading.set(false);
        }, 2000);
      });
    this.http.get(`https://docs.google.com/spreadsheets/d/${this.nameMappingIds}/export?format=csv&gid=${this.nameMappingGuid}`, { responseType: 'text' })
      .subscribe(data => {
        data.trim().split("\n").forEach(line => {
          const [heroName, heroSlug, , artifactName, artifactSlug] = line.split(",").map(v => v?.trim());

          if (heroName && heroSlug) {
            this.unitNameMap.set(heroName.toLowerCase(), heroSlug);
          }

          if (artifactName && artifactSlug) {
            this.artiNameMap.set(artifactName.toLowerCase(), artifactSlug);
          }
        });
      });
  }

  clear() {
    this.myControl1.setValue("");
    this.myControl2.setValue("");
    this.myControl3.setValue("");
    this.selectedUnit1 = "";
    this.selectedUnit2 = "";
    this.selectedUnit3 = "";
    this.solution = null;
  }

  clearUnit1() {
    this.myControl1.setValue("");
    this.selectedUnit1 = "";
  }

  clearUnit2() {
    this.myControl2.setValue("");
    this.selectedUnit2 = "";
  }

  clearUnit3() {
    this.myControl3.setValue("");
    this.selectedUnit3 = "";
  }
  search() {
    this.solution = this.searchSolution();
  }

  searchSolution() {
    const searchTargets = [
      this.myControl1.value || "",
      this.myControl2.value || "",
      this.myControl3.value || ""
    ].map(t => t.toLowerCase());

    const uniqueTargets = new Set(searchTargets);
    if (uniqueTargets.size !== 3) { return "none"; }

    //console.log("data:", this.data);

    return this.data.find((entry: { targets: any[]; }) => {
      if (!Array.isArray(entry.targets)) return false;

      const entryTargets = entry.targets.map(t => t.toLowerCase());

      return [...uniqueTargets].every(t => entryTargets.includes(t));
    }) || "none";
  }

  onSelectedUnit1Change(unit1: string) {
    this.selectedUnit1 = this.myControl1.value || "";
  }

  onSelectedUnit2Change(unit2: string) {
    this.selectedUnit2 = this.myControl2.value || "";
  }

  onSelectedUnit3Change(unit3: string) {
    this.selectedUnit3 = this.myControl3.value || "";
  }

  getUnitImageUrl(name: string) {
    return `https://epic7db.com/images/heroes/${this.getUrlUnitName(name.toLowerCase())}.webp`
  }

  getArtiImageUrl(name: string) {
    return `https://epic7db.com/images/artifacts/${this.getUrlArtiName(name.toLowerCase())}.webp`
  }

  getSanitizedBuild(url: string) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getSanitizedVideo(url: string) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/);
    const videoId = match ? match[1] : '';

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return this._sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getUrlUnitName(name: string) {
    return this.unitNameMap.get(name.toLowerCase()) ?? name;
  }

  getUrlArtiName(name: string) {
    return this.artiNameMap.get(name.toLowerCase()) ?? name;
  }

  csvToStrings(csvText: string): string[] {
    return csvText
      .split(/,{2,}/)
      .map(s => s.replace(/\r?\n/g, ' ').trim())
      .filter(s => s.length > 0);
  }

  splitIntoBlocks(tokens: string[]): string[][] {
    const blocks: string[][] = [];
    const codeRE = /^\s*D\d{3,4}\s*$/;
    let current: string[] = [];

    for (const t of tokens) {
      const v = (t || '').trim();
      if (!v) continue;
      if (codeRE.test(v)) {
        if (current.length) blocks.push(current);
        current = [v];
      } else {
        if (current.length === 0) {
          continue;
        }
        current.push(v);
      }
    }
    if (current.length) blocks.push(current);
    return blocks;
  }

  parseCSV(csvText: string) {
    const tokens = this.csvToStrings(csvText);
    return this.splitIntoBlocks(tokens);
  }

  parseComps(arr: string | any[]) {
    const marker = "- example";
    let result: any[] = [];

    for (const block of arr) {
      const idx1 = block[3].indexOf(marker);
      const idx2 = block[7].indexOf(marker);
      const idx3 = block[10].indexOf(marker);

      result.push({
        code: block[0],
        targets: block[1].split(" / ").map((t: string) => t.trim()),
        strat: block[4].replace(/^"-/, '-'),
        units: [
          {
            name: block[5],
            arti: block[6],
            info: block[3].slice(0, idx1).trim().replace(/^"-/, '-'),
            build: block[3].slice(idx1).trim().match(/https:\/\/\S+/)?.[0].slice(0, -1) || "",
          },
          {
            name: block[8],
            arti: block[9],
            info: block[7].slice(0, idx2).trim().replace(/^"-/, '-'),
            build: block[7].slice(idx2).trim().match(/https:\/\/\S+/)?.[0].slice(0, -1) || "",
          },
          {
            name: block[12],
            arti: block.length === 15 ? block[14] : block[13],
            info: block[10].slice(0, idx3).trim().replace(/^"-/, '-'),
            build: block[10].slice(idx3).trim().match(/https:\/\/\S+/)?.[0].slice(0, -1) || "",
          },
        ],
        video: block.length === 15 ? block[13] : "",
      });
    }
    return result;
  }
}
