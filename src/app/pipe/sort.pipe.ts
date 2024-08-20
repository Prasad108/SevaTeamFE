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

    // Handle nested properties (e.g., "assignment.createdAt")
    const keys = key.split('.');

    return array.slice().sort((a, b) => {
      let aValue = a;
      let bValue = b;

      for (const k of keys) {
        aValue = aValue[k];
        bValue = bValue[k];
      }

      return aValue.localeCompare(bValue);
    });
  }

}
