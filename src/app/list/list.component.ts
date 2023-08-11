import { Component, OnInit } from '@angular/core';
import { Ghost, ListService } from '../list-service.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { Observable, of, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { GoogleChartInterface } from 'ng2-google-charts';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
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
    { name: 'Ghost Orb' }
  ];
  speeds = [
    { name: 'Slow' },
    { name: 'Normal' },
    { name: 'Fast' }
  ];

  ghosts: Ghost[] = [];
  autocompleteNames!: Observable<string[]>;

  formGroup = this.formBuilder.group({
    search: [''],
    evidence: this.formBuilder.array(
      this.evidences.map(() => new FormControl(false))
    ),
    speed: this.formBuilder.array(
      this.speeds.map(() => new FormControl(false))
    )
  });

  filteredGhosts$: Observable<Ghost[]> = of([]);

  constructor(
    private listService: ListService,
    private formBuilder: FormBuilder
  ) { }

  evidenceChart: GoogleChartInterface = {
    chartType: 'ColumnChart',
    dataTable: [
      ['Evidence', 'Frequency']
    ],
    options: {
      title: 'Evidence Frequency',
      chartArea: { width: '50%' },
      hAxis: { title: 'Evidence', minValue: 0 },
      vAxis: {
        title: 'Frequency',
        ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      },
      height: 600,
      colors:['#673ab7']
    }
  };

  ngOnInit(): void {
    this.listService.getGhosts().subscribe((ghosts: Ghost[]) => {
      this.ghosts = ghosts;
      this.prepareEvidenceChartData();
    });

    this.autocompleteNames = this.formGroup
      .get('search')!
      .valueChanges.pipe(
        startWith(''),
        map(value => {
          if (typeof value === 'string') {
            return value;
          } else {
            return '';
          }
        }),
        map((value: string) => this._filter(value))
      );
    this.filteredGhosts$ = combineLatest([
      this.listService.getGhosts(),
      this.formGroup.controls.search.valueChanges.pipe(startWith('')),
      this.formGroup.controls.evidence.valueChanges.pipe(startWith([])),
      this.formGroup.controls.speed.valueChanges.pipe(startWith([]))
    ]).pipe(
      map(([allGhosts, search, evidence, speed]) => {
        return this.filterGhosts(
          {
            search: search,
            evidence: evidence,
            speed: speed
          },
          allGhosts
        );
      })
    );
  }

  private filterGhosts(
    filters:
      | Partial<{
        search: string | null;
        evidence: (boolean | null)[];
        speed: (boolean | null)[];
      }>
      | { search: string; evidence: never[]; speed: never[]; },
    allGhosts: Ghost[]
  ) {
    const selectedEvidenceNames: string[] = filters.evidence!
      .map((selected, index) =>
        selected ? this.evidences[index].name : null
      )
      .filter(name => name !== null) as string[];
    const selectedSpeedNames: string[] = filters.speed!
      .map((selected, index) =>
        selected ? this.speeds[index].name : null
      )
      .filter(name => name !== null) as string[];

    return allGhosts.filter((ghost: Ghost) => {
      return (
        ghost.name.toLowerCase().includes(filters.search!.toLowerCase()) &&
        selectedEvidenceNames.every(evidenceName =>
          ghost.evidence.$values.some(evidence => evidence.name === evidenceName)
        ) &&
        selectedSpeedNames.every(speedName =>
          ghost.speed.$values.some(speed => speed.name === speedName)
        )
      );
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.ghosts
      .map(ghost => ghost.name)
      .filter(option => option.toLowerCase().includes(filterValue));
  }

  private prepareEvidenceChartData() {
    const evidenceCount: EvidenceCount = {};

    // Count evidence occurrences
    this.ghosts.forEach(ghost => {
      ghost.evidence.$values.forEach(evidence => {
        if (evidenceCount[evidence.name]) {
          evidenceCount[evidence.name]++;
        } else {
          evidenceCount[evidence.name] = 1;
        }
      });
    });

    // Prepare data for Google Chart
    const evidenceChartData = Object.entries(evidenceCount).map(([evidence, count]) => [evidence, Number(count)]);

    // Update the evidenceChart data
    this.evidenceChart = {
      ...this.evidenceChart,
      dataTable: [
        ['Evidence', 'Frequency'],
        ...evidenceChartData
      ]
    };
  }
  showChart = true;

  toggleChart() {
    this.showChart = !this.showChart;
  }
}
interface EvidenceCount {
  [evidenceName: string]: number;
}




    // old aproach as reference

 // this.formGroup.valueChanges.pipe(
      //   startWith({ search: '', evidence: [], speed: [] }),
      //   // map((value) => value as { search: string; evidence: boolean[]; speed: boolean[] })
      // ),


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



