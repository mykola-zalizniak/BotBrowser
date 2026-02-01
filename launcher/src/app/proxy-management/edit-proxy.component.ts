import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { v4 as uuidv4 } from 'uuid';
import { ProxyTypes, type Proxy, type ProxyType } from '../data/proxy';
import { ProxyParserService } from '../shared/proxy-parser.service';
import { ProxyService } from '../shared/proxy.service';

@Component({
    selector: 'app-edit-proxy',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
    ],
    templateUrl: './edit-proxy.component.html',
    styleUrl: './edit-proxy.component.scss',
})
export class EditProxyComponent {
    readonly #proxyService = inject(ProxyService);
    readonly #proxyParser = inject(ProxyParserService);
    readonly #dialogRef = inject(MatDialogRef<EditProxyComponent>);
    readonly #injectedData = inject<Proxy | undefined>(MAT_DIALOG_DATA);
    readonly #formBuilder = inject(FormBuilder);

    readonly isEdit = !!this.#injectedData;
    readonly proxyTypes = ProxyTypes;

    quickParseInput = '';
    parseError = '';
    parseSuccess = false;

    readonly formGroup = this.#formBuilder.group({
        name: this.#injectedData?.name || '',
        type: (this.#injectedData?.type || 'http') as ProxyType,
        host: this.#injectedData?.host || '',
        port: this.#injectedData?.port || 8080,
        username: this.#injectedData?.username || '',
        password: this.#injectedData?.password || '',
    });

    onQuickParseInput(): void {
        this.parseError = '';
        this.parseSuccess = false;

        if (!this.quickParseInput.trim()) {
            return;
        }

        const result = this.#proxyParser.parse(this.quickParseInput);
        if (result) {
            this.formGroup.patchValue({
                type: result.type,
                host: result.host,
                port: result.port,
                username: result.username || '',
                password: result.password || '',
            });

            // Auto-generate name if empty
            if (!this.formGroup.value.name) {
                this.formGroup.patchValue({
                    name: `${result.host}:${result.port}`,
                });
            }

            this.parseSuccess = true;
        } else {
            this.parseError = 'Could not parse proxy string';
        }
    }

    async onConfirmClick(): Promise<void> {
        if (!this.formGroup.valid) return;

        const proxy: Proxy = {
            id: this.#injectedData?.id || uuidv4(),
            name: this.formGroup.value.name || '',
            type: (this.formGroup.value.type as ProxyType) || 'http',
            host: this.formGroup.value.host || '',
            port: this.formGroup.value.port || 8080,
            username: this.formGroup.value.username || undefined,
            password: this.formGroup.value.password || undefined,
        };

        if (this.isEdit) {
            await this.#proxyService.updateProxy(proxy);
        } else {
            await this.#proxyService.addProxy(proxy);
        }

        this.#dialogRef.close();
    }
}
