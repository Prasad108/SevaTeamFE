import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';




@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule,IonicModule],
})
export class HomePage {
  items$: Observable<any[]>;

  constructor(private firestore: Firestore) {
    const itemsCollection = collection(firestore, 'centers');
    this.items$ = collectionData(itemsCollection);
    console.log(this.items$);


  }
}
