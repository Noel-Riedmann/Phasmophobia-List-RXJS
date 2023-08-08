import { Component, OnInit } from '@angular/core';
import { ListService, Ghost } from './../list-service.service'
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  displayedColumns: string[] = ['Name', 'Evidence', 'Speed', 'SanityThreshold'];
  evidences = [
    { name: 'EMF-5' },
    { name: 'Spirit Box' },
    { name: 'Ghost Writing' },
    { name: 'D.O.T.S. Projector' },
    { name: 'Freezing Temperatures' },
    { name: 'Fingerprints' },
    { name: 'Ghost Orb' },

  ];
  ghosts: Ghost[] = [];

  formGroup = this.formBuilder.group({
    search: ['', { nonNullable: true }],
    evidence: this.formBuilder.array(
      this.evidences.map(() => new FormControl(false))
    ),
  });




  filteredGhosts$: Observable<Ghost[]> = of([]);

  evidence: FormControl = new FormControl('', { nonNullable: true });


  constructor(private listService: ListService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.filteredGhosts$ = combineLatest([
      this.listService.getGhosts(),
      this.formGroup.valueChanges.pipe(
        startWith({ search: '', evidence: [] }),
        map((value) => value as { search: string; evidence: number[] })
      ),
    ]).pipe(
      map(([allGhosts, filters]) => {
        const selectedEvidenceNames: string[] = filters.evidence
          .map((selected, index) => (selected ? this.evidences[index].name : null))
          .filter((name) => name !== null) as string[];
        return allGhosts.filter((ghost: Ghost) => {
          return (
            ghost.name.toLowerCase().includes(filters.search!.toLowerCase()) &&
            selectedEvidenceNames.every((evidenceName: string) =>
              ghost.evidence.$values.some(
                (evidence) => evidence.name === evidenceName
              )
            )
          );
        });
      })
    );
  }


}


    // old aproach as reference
    // const ghostsObservable = this.listService.getGhosts();

    // const filterControl = this.formGroup.get('filter');
    // if (filterControl) {
    //   this.filteredGhosts$ = filterControl.valueChanges.pipe(
    //     startWith(''),
    //     withLatestFrom(ghostsObservable),
    //     map(([filterValue, allGhosts]) =>
    //       allGhosts.filter((ghost: Ghost) =>
    //         ghost.name.toLowerCase().includes(filterValue.toLowerCase())
    //       )
    //     )
    //   );

    //   this.filteredGhosts$.subscribe(filteredGhosts => {
    //     this.ghosts = filteredGhosts;
    //   });
    // }

    // this.loadGhosts();


    // this.filteredGhosts$ = this.listService.getGhosts().pipe(
    //   withLatestFrom(this.formGroup.valueChanges.pipe(startWith({ search: '' }))),
    //   map(([allGhosts, filters]) =>
    //     allGhosts.filter((ghost: Ghost) => {
    //         return ghost.name.toLowerCase().includes(filters.search!.toLowerCase())
    //     }
    //     )
    //   )
    // )



