import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import {
  cold,
  getTestScheduler,
} from 'jasmine-marbles';
import { of } from 'rxjs';
import { APP_DATA_SERVICES_MAP } from 'src/config/app-config.interface';

import { getBitstreamModuleRoute } from '../../app-routing-paths';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { Bitstream } from '../../core/shared/bitstream.model';
import { Item } from '../../core/shared/item.model';
import { ItemRequest } from '../../core/shared/item-request.model';
import { URLCombiner } from '../../core/url-combiner/url-combiner';
import { getItemModuleRoute } from '../../item-page/item-page-routing-paths';
import { ActivatedRouteStub } from '../testing/active-router.stub';
import { RouterLinkDirectiveStub } from '../testing/router-link-directive.stub';
import { FileDownloadLinkComponent } from './file-download-link.component';

describe('FileDownloadLinkComponent', () => {
  let component: FileDownloadLinkComponent;
  let fixture: ComponentFixture<FileDownloadLinkComponent>;

  let scheduler;
  let authorizationService: AuthorizationDataService;

  let bitstream: Bitstream;
  let item: Item;
  let storeMock: any;

  const itemRequestStub = Object.assign(new ItemRequest(), {
    token: 'item-request-token',
    requestName: 'requester name',
    accessToken: 'abc123',
    acceptRequest: true,
    accessExpired: false,
    allfiles: true,
  });

  function init() {
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: cold('-a', { a: true }),
    });
    bitstream = Object.assign(new Bitstream(), {
      uuid: 'bitstreamUuid',
      _links: {
        self: { href: 'obj-selflink' },
      },
    });
    item = Object.assign(new Item(), {
      uuid: 'itemUuid',
      _links: {
        self: { href: 'obj-selflink' },
      },
    });
    storeMock = jasmine.createSpyObj('store', {
      dispatch: jasmine.createSpy('dispatch'),
      select: jasmine.createSpy('select'),
      pipe: of(true),
    });
  }

  function initTestbed(itemRequest = null) {
    const activatedRoute = new ActivatedRouteStub({}, { itemRequest: itemRequest });
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        FileDownloadLinkComponent,
      ],
      providers: [
        RouterLinkDirectiveStub,
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Store, useValue: storeMock },
        { provide: APP_DATA_SERVICES_MAP, useValue: {} },
      ],
    })
      .overrideComponent(FileDownloadLinkComponent, {
        remove: { imports: [RouterLink] },
        add: { imports: [RouterLinkDirectiveStub] },
      })
      .compileComponents();
  }

  describe('init', () => {
    describe('getBitstreamPath', () => {



      describe('when the user has download rights', () => {
        beforeEach(waitForAsync(() => {
          scheduler = getTestScheduler();
          init();
          initTestbed();
        }));

        beforeEach(() => {
          fixture = TestBed.createComponent(FileDownloadLinkComponent);
          component = fixture.componentInstance;
          component.bitstream = bitstream;
          component.item = item;
          fixture.detectChanges();
        });
        it('should return the bitstreamPath based on the input bitstream', () => {
          expect(component.bitstreamPath$).toBeObservable(cold('-a', { a: { routerLink: new URLCombiner(getBitstreamModuleRoute(), bitstream.uuid, 'download').toString(), queryParams: {} } }));
          expect(component.canDownload$).toBeObservable(cold('--a', { a: true }));

        });
        it('should init the component', () => {
          scheduler.flush();
          fixture.detectChanges();
          const link = fixture.debugElement.query(By.css('a'));
          expect(link.injector.get(RouterLinkDirectiveStub).routerLink).toContain(new URLCombiner(getBitstreamModuleRoute(), bitstream.uuid, 'download').toString());
          const lock = fixture.debugElement.query(By.css('.fa-lock'));
          expect(lock).toBeNull();
        });
      });

      describe('when the user has no download rights but has the right to request a copy', () => {
        beforeEach(waitForAsync(() => {
          scheduler = getTestScheduler();
          init();
          (authorizationService.isAuthorized as jasmine.Spy).and.callFake((featureId, object) => {
            if (featureId === FeatureID.CanDownload) {
              return cold('-a', { a: false });
            }
            return cold('-a', { a: true });
          });
          initTestbed();
        }));
        beforeEach(() => {
          fixture = TestBed.createComponent(FileDownloadLinkComponent);
          component = fixture.componentInstance;
          component.item = item;
          component.bitstream = bitstream;
          fixture.detectChanges();
        });
        it('should return the bitstreamPath based on the input bitstream', () => {
          expect(component.bitstreamPath$).toBeObservable(cold('-a', { a: { routerLink: new URLCombiner(getItemModuleRoute(), item.uuid, 'request-a-copy').toString(), queryParams: { bitstream: bitstream.uuid } } }));
          expect(component.canDownload$).toBeObservable(cold('--a', { a: false }));

        });
        it('should init the component', () => {
          scheduler.flush();
          fixture.detectChanges();
          const link = fixture.debugElement.query(By.css('a'));
          expect(link.injector.get(RouterLinkDirectiveStub).routerLink).toContain(new URLCombiner(getItemModuleRoute(), item.uuid, 'request-a-copy').toString());
          const lock = fixture.debugElement.query(By.css('.fa-lock')).nativeElement;
          expect(lock).toBeTruthy();
        });
      });

      describe('when the user has no download rights and no request a copy rights', () => {
        beforeEach(waitForAsync(() => {
          scheduler = getTestScheduler();
          init();
          (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(cold('-a', { a: false }));
          initTestbed();
        }));
        beforeEach(() => {
          fixture = TestBed.createComponent(FileDownloadLinkComponent);
          component = fixture.componentInstance;
          component.bitstream = bitstream;
          component.item = item;
          fixture.detectChanges();
        });
        it('should return the bitstreamPath based on the input bitstream', () => {
          expect(component.bitstreamPath$).toBeObservable(cold('-a', { a: { routerLink: new URLCombiner(getBitstreamModuleRoute(), bitstream.uuid, 'download').toString(), queryParams: {} } }));
          expect(component.canDownload$).toBeObservable(cold('--a', { a: false }));

        });
        it('should init the component and show the locked icon', () => {
          scheduler.flush();
          fixture.detectChanges();
          const link = fixture.debugElement.query(By.css('a'));
          expect(link.injector.get(RouterLinkDirectiveStub).routerLink).toContain(new URLCombiner(getBitstreamModuleRoute(), bitstream.uuid, 'download').toString());
          const lock = fixture.debugElement.query(By.css('.fa-lock')).nativeElement;
          expect(lock).toBeTruthy();
        });
      });

      describe('when the user has no (normal) download rights and request a copy rights via access token', () => {
        beforeEach(waitForAsync(() => {
          scheduler = getTestScheduler();
          init();
          (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(cold('-a', { a: false }));
          initTestbed(itemRequestStub);
        }));
        beforeEach(() => {
          fixture = TestBed.createComponent(FileDownloadLinkComponent);
          component = fixture.componentInstance;
          component.bitstream = bitstream;
          component.item = item;
          fixture.detectChanges();
        });
        it('should return the bitstreamPath based on the access token and request-a-copy path', () => {
          expect(component.bitstreamPath$).toBeObservable(cold('-a', { a: { routerLink: new URLCombiner(getBitstreamModuleRoute(), bitstream.uuid, 'download').toString(), queryParams: { accessToken: 'abc123' } } }));
          expect(component.canDownload$).toBeObservable(cold('--a', { a: false }));

        });
        it('should init the component and show an open lock', () => {
          scheduler.flush();
          fixture.detectChanges();
          const link = fixture.debugElement.query(By.css('a'));
          expect(link.injector.get(RouterLinkDirectiveStub).routerLink).toContain(new URLCombiner(getBitstreamModuleRoute(), bitstream.uuid, 'download').toString());
          const lock = fixture.debugElement.query(By.css('.fa-lock-open')).nativeElement;
          expect(lock).toBeTruthy();
        });
      });
    });
  });
});
