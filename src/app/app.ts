import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('e7_gw');

  data: any;
  units = [];
  selectedUnit1: string = "";
  selectedUnit2: string = "";
  selectedUnit3: string = "";
  solution: any = null;
  id = "1aAIq86-QbH_3wBFETPTfyEgoX3XqGLIm_ENvAdvM8ks"
  guid = "290342333";
  parsedData: any[] = [];

  constructor(private _sanitizer: DomSanitizer, private http: HttpClient) { }

  ngOnInit() {
    this.http.get(`https://docs.google.com/spreadsheets/d/${this.id}/export?format=csv&gid=${this.guid}`, { responseType: 'text' })
      .subscribe(data => {
        this.parsedData = this.parseCSV(data);
        this.data = this.parseComps(this.parsedData);
        //console.log(this.parseComps(this.parsedData));
        this.units = Array.from(new Set(this.data.flatMap((d: any) => d.targets)));
        //console.log("targets: ", new Set(this.data.flatMap((d: any) => d.targets)));
      });
  }

  clear() {
    this.selectedUnit1 = "";
    this.selectedUnit2 = "";
    this.selectedUnit3 = "";
    this.solution = null;
  }

  search() {
    //console.log("searching for:", this.selectedUnit1, this.selectedUnit2, this.selectedUnit3);
    this.solution = this.searchSolution();
    //console.log("search:", this.solution);
  }

  searchSolution() {
    const searchTargets = [this.selectedUnit1, this.selectedUnit2, this.selectedUnit3].map(t => t.toLowerCase());

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
    this.selectedUnit1 = unit1;
  }
  onSelectedUnit2Change(unit2: string) {
    this.selectedUnit2 = unit2;
  }
  onSelectedUnit3Change(unit3: string) {
    this.selectedUnit3 = unit3;
  }
  getUnitImageUrl(name: string) {
    return `https://epic7db.com/images/heroes/${this.getUrlUnitName(name.toLowerCase())}.webp`
  }
  getArtiImageUrl(name: string) {
    return `https://epic7db.com/images/artifacts/${this.getUrlArtiName(name.toLowerCase())}.webp`
  }
  getSanitizedVideo(url: string) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(this.getEmbedUrl(url));
  }
  getSanitizedBuild(url: string) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  getEmbedUrl(url: string) {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  }

  getUrlUnitName(name: string) {
    console.log("getUrlUnitName:", name);
    const map = new Map([
      ["apoc", "apocalypse-ravi"],
      ["barunka", "boss-arunka"],
      ["ml yulha", "school-nurse-yulha"],
      ["gras", "genesis-ras"],
      ["frieren", "frieren"],
      ["harsetti", "harsetti"],
      ["setsuka", "setsuka"],
      ["bbk", "blood-blade-karin"],
      ["lady", "lady-of-the-scales"],
      ["lady of the scales", "lady-of-the-scales"],
      ["bwa", "bystander-hwayoung"],
      ["leira", "lone-wolf-peira"],
      ["rinak", "rinak"],
      ["tekron", "twisted-eidolon-kayron"],
      ["dark achates", "shooting-star-achates"],
      ["belian", "belian"],
      ["elvira", "elvira"],
      ["aram", "aram"],
      ["elynav", "empyrean-ilynav"],
      ["hecate", "hecate"],
      ["young senya", "young-senya"],
      ["festive eda", "festive-eda"],
      ["benimaru", "benimaru"],
      ["bdom", "moon-bunny-dominiel"],
      ["moona", "new-moon-luna"],
      ["mort", "mort"],
      ["shoux", "urban-shadow-choux"],
      ["ruele", "ruele-of-light"],
      ["singie", "sinful-angelica"],
      ["elynav", "empyrean-ilynav"],
    ]);

    return map.get(name.toLowerCase()) ?? name;
  }

  getUrlArtiName(name: string) {
    const map = new Map([
      ["war horn", "war-horn"],
      ["queen's whistle", "queens-whistle"],
      ["shepherd of the hollow", "shepherd-of-the-hollow"],
      ["3f", "3f"],
      ["bastion of hope", "bastion-of-hope"],
      ["touch of rekos", "touch-of-rekos"],
      ["rise of a monarch", "rise-of-a-monarch"],
      ["a precious connection", "a-precious-connection"],
      ["tagehel's ancient book", "tagehels-ancient-book"],
      ["uberius' tooth", "uberius-tooth"],
      ["proof of friendship", "proof-of-friendship"],
      ["benimaru's tachi", "benimarus-tachi"],
      ["proof of valor", "proof-of-valor"],
      ["aurius", "aurius"],
      ["sweet miracle", "sweet-miracle"],
      ["adamant shield", "adamant-shield"],
      ["prophetic candlestick", "prophetic-candlestick"],
      ["a symbol of unity", "a-symbol-of-unity"],
      ["beguiling wings", "beguiling-wings"],
    ]);

    return map.get(name.toLowerCase()) ?? name;
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
          // skip items before the first code
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
    //console.log("parseComps:", arr);
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
