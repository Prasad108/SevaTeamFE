import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  standalone: true
})
export class SortPipe implements PipeTransform {

  transform(array: any[], key: string): any[] {
    if (!array || !key) {
      return array;
    }
    return array.slice().sort((a, b) => a[key].localeCompare(b[key]));
  }

}
