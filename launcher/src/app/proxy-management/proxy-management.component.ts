import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, type AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import type { Proxy } from '../data/proxy';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { ProxyService } from '../shared/proxy.service';
import { StopPropagationDirective } from '../shared/stop-propagation.directive';
import { BulkImportProxyComponent } from './bulk-import-proxy.component';
import { EditProxyComponent } from './edit-proxy.component';

@Component({
    selector: 'app-proxy-management',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatMenuModule,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        MatToolbarModule,
        MatIconModule,
        MatProgressBarModule,
        StopPropagationDirective,
    ],
    templateUrl: './proxy-management.component.html',
    styleUrl: './proxy-management.component.scss',
})
export class ProxyManagementComponent implements AfterViewInit {
    readonly #proxyService = inject(ProxyService);
    readonly #dialog = inject(MatDialog);

    readonly displayedColumns = ['select', 'name', 'type', 'host', 'username'];
    readonly dataSource = new MatTableDataSource<Proxy>([]);
    readonly selection = new SelectionModel<Proxy>(true, []);

    loading = false;

    @ViewChild(MatSort) set sort(sort: MatSort) {
        if (sort) {
            this.dataSource.sort = sort;
        }
    }

    constructor() {
        this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
            switch (sortHeaderId) {
                case 'name':
                    return data.name ?? '';
                case 'type':
                    return data.type ?? '';
                case 'host':
                    return data.host ?? '';
                case 'username':
                    return data.username ?? '';
                default:
                    return '';
            }
        };
    }

    async ngAfterViewInit(): Promise<void> {
        await this.refreshProxies();
    }

    formatAddress(proxy: Proxy): string {
        return `${proxy.host}:${proxy.port}`;
    }

    async refreshProxies(): Promise<void> {
        this.loading = true;
        try {
            const proxies = await this.#proxyService.getAllProxies();
            const selectedIds = this.selection.selected.map((p) => p.id);
            this.dataSource.data = proxies;
            this.selection.clear();
            this.selection.select(...proxies.filter((p) => selectedIds.includes(p.id)));
        } finally {
            this.loading = false;
        }
    }

    newProxy(): void {
        this.#dialog
            .open(EditProxyComponent)
            .afterClosed()
            .subscribe(() => {
                this.refreshProxies().catch(console.error);
            });
    }

    bulkImportProxies(): void {
        this.#dialog
            .open(BulkImportProxyComponent)
            .afterClosed()
            .subscribe(() => {
                this.refreshProxies().catch(console.error);
            });
    }

    editProxy(proxy: Proxy): void {
        this.#dialog
            .open(EditProxyComponent, { data: proxy })
            .afterClosed()
            .subscribe(() => {
                this.refreshProxies().catch(console.error);
            });
    }

    editSelectedProxy(): void {
        if (this.selection.selected.length !== 1) return;
        this.editProxy(this.selection.selected[0]!);
    }

    deleteProxy(proxy: Proxy): void {
        this.#dialog
            .open(ConfirmDialogComponent, {
                data: { message: `Are you sure you want to delete proxy "${proxy.name}"?` },
            })
            .afterClosed()
            .subscribe(async (result: boolean) => {
                if (!result) return;
                await this.#proxyService.deleteProxy(proxy.id);
                await this.refreshProxies();
            });
    }

    deleteProxies(): void {
        if (this.selection.selected.length === 0) return;
        this.#dialog
            .open(ConfirmDialogComponent, {
                data: { message: 'Are you sure you want to delete the selected proxies?' },
            })
            .afterClosed()
            .subscribe(async (result: boolean) => {
                if (!result) return;
                await this.#proxyService.deleteProxies(this.selection.selected.map((p) => p.id));
                await this.refreshProxies();
            });
    }

    toggleSelectProxy(proxy: Proxy): void {
        this.selection.toggle(proxy);
    }

    get isAllSelected(): boolean {
        return this.selection.selected.length === this.dataSource.data.length;
    }

    toggleAllRows(): void {
        if (this.isAllSelected) {
            this.selection.clear();
        } else {
            this.selection.select(...this.dataSource.data);
        }
    }

    checkboxLabel(row?: Proxy): string {
        if (!row) {
            return `${this.isAllSelected ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
    }
}
