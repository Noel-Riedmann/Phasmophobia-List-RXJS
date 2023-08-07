import { Component, OnInit } from '@angular/core';
import { ListService, Ghost } from './../list-service.service'
import { FormBuilder, FormGroup } from '@angular/forms';
import { map, startWith, withLatestFrom } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  displayedColumns: string[] = ['Name', 'Evidence', 'Speed', 'SanityThreshold'];
  ghosts: Ghost[] = [];
  formGroup: FormGroup;
  filteredGhosts$: Observable<Ghost[]> = of([]);

  constructor(private listService: ListService, private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      filter: ['']
    });

    const ghostsObservable = this.listService.getGhosts();

    const filterControl = this.formGroup.get('filter');
    if (filterControl) {
      this.filteredGhosts$ = filterControl.valueChanges.pipe(
        startWith(''),
        withLatestFrom(ghostsObservable),
        map(([filterValue, allGhosts]) =>
          allGhosts.filter((ghost: Ghost) =>
            ghost.name.toLowerCase().includes(filterValue.toLowerCase())
          )
        )
      );

      this.filteredGhosts$.subscribe(filteredGhosts => {
        this.ghosts = filteredGhosts;
      });
    }
  }

  ngOnInit(): void {
    this.loadGhosts();
  }

  loadGhosts(): void {
    this.listService.getGhosts().subscribe(
      (ghosts) => {
        this.ghosts = ghosts;
      },
      (error) => {
        console.error('Error loading ghosts:', error);
      }
    );
  }
}
