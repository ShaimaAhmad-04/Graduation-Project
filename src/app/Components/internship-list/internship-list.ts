import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Internship } from '../../interfaces/iInternship';
import { InternshipService } from './internship';
import { InternshipCardComponent } from '../internship-card/internship-card';
import { internship_location } from '../../ENUMs/internship-location';

@Component({
  selector: 'app-internship-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InternshipCardComponent],
  templateUrl: './internship-list.html',
  styleUrls: ['./internship-list.css']
})
export class InternshipListComponent implements OnInit {

  internships$!: Observable<Internship[]>;
  searchQuery = '';
  selectedLocation = -1;
  selectedType = 'All Types';

  locations = [
    { label: 'All Locations', value: -1 },
    { label: 'On-Site', value: internship_location.on_site },
    { label: 'Remote', value: internship_location.remote },
    { label: 'Hybrid', value: internship_location.hyprid },
  ];

  types = ['All Types', 'Paid', 'Unpaid'];

  constructor(private internshipService: InternshipService) {}

  ngOnInit(): void {
    this.internships$ = this.internshipService.getFiltered();
  }

  onSearch(): void { this.internshipService.setSearch(this.searchQuery); }
  onLocationChange(): void { this.internshipService.setLocation(this.selectedLocation); }
  onTypeChange(): void { this.internshipService.setType(this.selectedType); }
}