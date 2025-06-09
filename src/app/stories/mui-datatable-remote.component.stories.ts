// mui-datatable-remote.component.stories.ts
import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { delay, Observable, of } from 'rxjs';
import { RemoteDatatableComponent } from '../mui-datatable';
import { DataService } from '../mui-datatable';
import { ELEMENT_DATA, PeriodicElement } from './fixture';

// prettier-ignore
@Injectable()
class PeriodicElementService extends DataService<PeriodicElement> {

  getList(): Observable<PeriodicElement[]> {
    return of(ELEMENT_DATA).pipe(delay(1000));
  }

  add(item: PeriodicElement): Observable<PeriodicElement> {
    throw new Error('Method not implemented.');
  }

  update(item: PeriodicElement): Observable<PeriodicElement> {
    throw new Error('Method not implemented.');
  }

  remove(id: number): Observable<number> {
    throw new Error('Method not implemented.');
  }
}

const meta: Meta<RemoteDatatableComponent<PeriodicElement>> = {
  title: 'Remote MUI Datatable',
  component: RemoteDatatableComponent,
  decorators: [
    moduleMetadata({
      providers: [{ provide: DataService, useClass: PeriodicElementService }],
    }),
  ],
};

export default meta;
type Story = StoryObj<RemoteDatatableComponent<PeriodicElement>>;

export const Default: Story = {
  args: {
    title: 'Example Remote Material Datatable',
    options: {
      jumpToPage: true,
    },
    columns: [
      { name: 'name', label: 'Name', options: { validators: Validators.required } },
      { name: 'position', label: 'Position', options: { display: true } },
      { name: 'weight', label: 'Weight', options: { display: true } },
      { name: 'symbol', label: 'Symbol', options: { display: true } },
      { name: 'description', label: 'Description', options: { display: false } },
    ],
  },
};
