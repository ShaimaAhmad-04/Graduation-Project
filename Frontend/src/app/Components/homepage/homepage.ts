import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Reveal } from '../../Directives/reveal';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterModule, Reveal],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css'
})
export class Homepage {}