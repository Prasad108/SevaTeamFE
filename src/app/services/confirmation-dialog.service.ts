import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  constructor(private alertController: AlertController) {}

  async confirmDelete(customMessage?: string, placeholder?: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Confirm Delete',
        cssClass: 'alert-danger-header',
        message: customMessage || 'Do you really want to delete? This action cannot be undone. Type "delete" to confirm.',
        inputs: [
          {
            name: 'confirmation',
            type: 'text',
            placeholder: placeholder || 'Type "delete"',
            cssClass: 'alert-danger-message',
            attributes: {
              autocomplete: 'off', // Disable autocomplete
              autocorrect: 'off', // Disable autocorrect
              autocapitalize: 'off', // Disable autocapitalize
              spellcheck: 'false', // Disable spellcheck
            }
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'cancel-button',
            handler: () => {
              resolve(false);
            },
          },
          {
            text: 'Delete',
            cssClass: 'danger-button',
            handler: () => {
              resolve(true);
            },
          },
        ],
      });
  
      await alert.present();
  
      const inputElement = document.querySelector('ion-alert input') as HTMLInputElement;
      const deleteButton = document.querySelector('ion-alert button.danger-button') as HTMLButtonElement;
  
      if (inputElement && deleteButton) {
        deleteButton.disabled = true;
  
        inputElement.addEventListener('input', (event: any) => {
          const inputValue = event.target.value.toLowerCase().trim();
          deleteButton.disabled = inputValue !== 'delete';
        });
      }
    });
  }
  
}
