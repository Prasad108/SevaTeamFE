import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { EventVolunteerAssignment } from 'src/app/services/event-volunteer-assignment.service';
import { Slot } from 'src/app/services/event.service';

@Component({
  selector: 'app-edit-volunteer-modal',
  templateUrl: './edit-volunteer-modal.component.html',
  styleUrls: ['./edit-volunteer-modal.component.scss']
})
export class EditVolunteerModalComponent implements OnInit {
  @Input() assignment!: EventVolunteerAssignment;
  @Input() eventSlots: Slot[] = [];
  @Output() saveAssignment = new EventEmitter<EventVolunteerAssignment>();

  adminApprovalStatusOptions = ['waiting', 'approved', 'rejected'];
  selectedSlots: { [slotId: string]: boolean } = {};
  
  constructor(private modalController: ModalController, private alertController: AlertController) {}
  
  ngOnInit() {
    // Initialize selected slots
    this.assignment.slotsSelected.forEach(slotId => {
      this.selectedSlots[slotId] = true;
    });
  }
  
  close() {
    this.modalController.dismiss();
  }
  
  save() {
    const selectedSlots = Object.keys(this.selectedSlots).filter(slotId => this.selectedSlots[slotId]);
  
    if (selectedSlots.length === 0) {
      this.showAlert('Error', 'Please select at least one slot.');
      return;
    }
  
    const updatedAssignment: EventVolunteerAssignment = {
      ...this.assignment,
      slotsSelected: selectedSlots
    };

    // Emit the updated assignment
    this.saveAssignment.emit(updatedAssignment);
  
    this.modalController.dismiss(updatedAssignment);
  }
  
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
