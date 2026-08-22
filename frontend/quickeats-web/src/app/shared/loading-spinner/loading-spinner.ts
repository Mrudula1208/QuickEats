import { Component, input } from '@angular/core';
// Controls the shared Loading Spinner.
// Shows a small animated spinner while data is being loaded.

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss'
})
export class LoadingSpinnerComponent {

  // Optional message shown below the spinner.
  // Example: "Loading restaurants..."
  message = input<string>('');

}
