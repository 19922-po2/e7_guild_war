// Example service (TypeScript)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SheetsService {
    constructor(private http: HttpClient) { }

    getSheetAsObjects(spreadsheetId: string, range: string, apiKey: string) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
        return this.http.get<{ values: string[][] }>(url).pipe(
            map(res => {
                const rows = res.values || [];
                if (rows.length === 0) return [];
                const headers = rows[0];
                return rows.slice(1).map(row => {
                    const obj: any = {};
                    headers.forEach((h, i) => (obj[h] = row[i] ?? ''));
                    return obj;
                });
            })
        );
    }
}