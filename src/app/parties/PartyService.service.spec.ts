/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PartyServiceService } from './PartyService.service';

describe('Service: PartyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PartyServiceService]
    });
  });

  it('should ...', inject([PartyServiceService], (service: PartyServiceService) => {
    expect(service).toBeTruthy();
  }));
});
