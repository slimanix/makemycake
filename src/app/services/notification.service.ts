import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  showSuccess(message: string, title: string = 'Success') {
    this.toastr.success(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true
    });
  }

  showError(message: string, title: string = 'Error') {
    this.toastr.error(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true
    });
  }

  showInfo(message: string, title: string = 'Info') {
    this.toastr.info(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true
    });
  }

  showWarning(message: string, title: string = 'Warning') {
    this.toastr.warning(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true
    });
  }
} 